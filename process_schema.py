import json
from pathlib import Path
from referencing import Registry
from referencing.jsonschema import DRAFT202012

def deref_and_merge(obj, registry, path="root"):
    if isinstance(obj, list):
        return [deref_and_merge(item, registry, f"{path}[{i}]") for i, item in enumerate(obj)]
    if not isinstance(obj, dict):
        return obj

    # 1. Standard 2020-12 $ref merging
    if "$ref" in obj:
        ref_uri = obj.pop("$ref")
        resolved = registry.resolver().lookup(ref_uri).contents
        obj = {**resolved, **obj}

    # 2. Recursive call to process children first (so we merge from the bottom up)
    obj = {k: deref_and_merge(v, registry, f"{path}.{k}") for k, v in obj.items()}

    # 3. Handle allOf merging
    if "allOf" in obj and isinstance(obj["allOf"], list):
        new_all_of = []
        if "properties" not in obj:
            obj["properties"] = {}

        for i, item in enumerate(obj["allOf"]):
            current_item_path = f"{path}.allOf[{i}]"
            
            # --- Validation 2: Strict Conditional Check ---
            if "if" in item:
                # Check for any keys that aren't 'if' or 'then'
                extra_keys = set(item.keys()) - {"if", "then"}
                if extra_keys:
                    raise ValueError(
                        f"Validation Error at {current_item_path}: "
                        f"Conditional 'if' found with unauthorized sibling keys: {extra_keys}. "
                        f"Only 'then' is allowed."
                    )
                new_all_of.append(item)
            
            # --- Validation 1: Property Collision Check ---
            elif "properties" in item:
                for prop_name in item["properties"]:
                    if prop_name in obj["properties"]:
                        raise ValueError(
                            f"Validation Error at {path}: "
                            f"Property collision detected for '{prop_name}'. "
                            f"Defined in both parent and allOf item."
                        )
                
                # Merge structural properties
                obj["properties"].update(item["properties"])
                
                # Merge required arrays if they exist
                if "required" in item:
                    current_req = obj.get("required", [])
                    obj["required"] = list(set(current_req) | set(item["required"]))
            
            # Handle item that is just a schema but not a conditional or properties container
            else:
                # Check for collisions with top-level keys before merging
                for k in item:
                    if k in obj and k != "properties": # properties handled above
                         raise ValueError(f"Collision at {path} for key: {k}")
                obj.update(item)

        # Final cleanup
        if new_all_of:
            obj["allOf"] = new_all_of
        else:
            del obj["allOf"]

    return obj

# --- Execution ---
input_path = Path("schema/rdls_schema.json")
try:
    schema = json.loads(input_path.read_text())
    reg = Registry().with_resource(uri="", resource=DRAFT202012.create_resource(schema))

    full_schema = deref_and_merge(schema, reg)

    # Top-level cleanup
    full_schema.pop("$defs", None)
    full_schema.pop("definitions", None)

    output_path = Path("schema/rdls_schema_processed.json")
    output_path.write_text(json.dumps(full_schema, indent=4))
    print(f"Successfully dereferenced and merged to {output_path}")

except ValueError as e:
    print(f"FAILED: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")