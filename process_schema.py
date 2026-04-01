import json
from jsonref import replace_refs

def compose_all_of(schema):
    """
    Recursively merges properties defined within allOf arrays into 
    the parent object's properties.
    """
    if not isinstance(schema, dict):
        return schema

    # Process all nested values first (Bottom-up recursion)
    for key, value in schema.items():
        if isinstance(value, dict):
            schema[key] = compose_all_of(value)
        elif isinstance(value, list):
            schema[key] = [compose_all_of(item) for item in value]

    # Handle allOf composition for the current object
    if "allOf" in schema:
        # Ensure base containers exist
        if "properties" not in schema:
            schema["properties"] = {}
        if "required" not in schema:
            schema["required"] = []

        for sub_schema in schema["allOf"]:
            # Merge properties
            if "properties" in sub_schema:
                for key, value in sub_schema["properties"].items():
                    if key in schema["properties"] and schema["properties"][key] != value:
                        print(f"Warning: Overwriting property {key} value {schema['properties'][key]} with value {value}")
                    schema['properties'][key] = value
            
            # Merge required properties
            if "required" in sub_schema:
                combined_req = set(schema["required"]) | set(sub_schema["required"])
                schema["required"] = sorted(combined_req)
            
            # Inherit title
            if "title" not in schema and "title" in sub_schema:
                schema["title"] = sub_schema["title"]
            
            # Inherit description
            if  "description" not in schema and "description" in sub_schema:
                schema["description"] = sub_schema["description"]
        
        schema["allOf"] = [sub_schema for sub_schema in schema["allOf"] if "properties" not in sub_schema]

        if len(schema["allOf"]) == 0:
            schema.pop("allOf")
        
        # Clean up empty containers if nothing was added
        if not schema["properties"]:
            schema.pop("properties")
        if not schema["required"]:
            schema.pop("required")

    return schema
                            

with open('schema/rdls_schema.json', 'r') as f:
    schema = json.load(f)

schema = replace_refs(schema, proxies=False)

schema.pop('$defs', None)

schema = compose_all_of(schema)

with open('schema/rdls_schema_processed.json', 'w') as f:
    json.dump(schema, f, indent=2)
