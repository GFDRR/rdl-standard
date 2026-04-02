from jscc.testing.filesystem import walk_json_data
from jscc.schema import is_json_schema
from jscc.testing.util import http_get
import jsonref
import pytest
from jscc.testing.checks import (
    validate_array_items,
    validate_codelist_enum,
    validate_deep_properties,
    validate_items_type,
    validate_letter_case,
    validate_merge_properties,
    validate_metadata_presence,
    validate_null_type,
    validate_object_id,
    validate_ref,
    validate_schema,
)
from jsonschema import FormatChecker
from jsonschema.validators import Draft202012Validator

schemas = [(path, name, data) for path, name, _, data in walk_json_data(top='schema') if is_json_schema(data) and 'rdls_schema_processed.json' not in path]
metaschema = http_get('https://json-schema.org/draft/2020-12/schema').json()

validate_array_items_kwargs = {
    'allow_invalid': {
        '/$defs/Geometry/properties/coordinates/items',  # recursion
    },
}

def validate_metadata_presence_allow_missing(pointer):
    return (
      'start/oneOf' in pointer
      or 'end/oneOf' in pointer
      or pointer.startswith('/anyOf')
      or pointer.startswith('/properties/links')
      or pointer.startswith('/properties/vulnerability/anyOf/')
      or pointer.startswith('/$defs/Location/allOf')
      or pointer.startswith('/$defs/Entity/anyOf/')
      or pointer.startswith('/$defs/Event/properties/occurrence/anyOf/')
      or pointer.startswith('/$defs/Hazard/allOf')
      or pointer.startswith('/$defs/SimpleHazard/allOf')
      or pointer.startswith('/$defs/HazardWithTrigger/allOf')
      or pointer.startswith('/$defs/Measurement/allOf')
      or pointer.startswith('/$defs/codelist_')
      or pointer.startswith('/$defs/conditional_')
      or pointer.startswith('/$defs/Hazard')
      or pointer.startswith('/$defs/HazardWithTrigger')
      or pointer.startswith('/$defs/Resource/anyOf/')
    )

validate_metadata_presence_kwargs = {
    'allow_missing': validate_metadata_presence_allow_missing,
}

def validate_object_id_allow_missing(pointer):
    return (
        '/properties/links' in pointer
        or pointer == '/$defs/Event_set/properties/hazards'
        or pointer == '/properties/hazard/properties/event_sets/items/properties/hazards'
    )

validate_object_id_kwargs = {
    'allow_missing': validate_object_id_allow_missing
}

def validate_codelist_enum_allow_enum(pointer):
    return (
        pointer.startswith('/$defs/conditional_')
    )

validator = Draft202012Validator(Draft202012Validator.META_SCHEMA, format_checker=FormatChecker())

@pytest.mark.parametrize('path,name,data', schemas)
def test_schema_valid(path, name, data):
    validate_json_schema(path, name, data, metaschema)


def validate_json_schema(path, name, data, schema):
    errors = 0

    errors += validate_schema(path, data, validator)
    errors += validate_array_items(path, data, **validate_array_items_kwargs)
    errors += validate_items_type(path, data)

    errors += validate_codelist_enum(path, data, allow_enum=validate_codelist_enum_allow_enum)
    
    errors += validate_merge_properties(path, data)
    errors += validate_ref(path, data)
    errors += validate_metadata_presence(path, data, **validate_metadata_presence_kwargs)
    errors += validate_object_id(path, jsonref.replace_refs(data), **validate_object_id_kwargs)
    errors += validate_null_type(path, data, no_null=True)
    
    # Here, we don't add to `errors`, in order to not count these warnings as errors.
    # validate_deep_properties(path, data)

    assert not errors, 'One or more JSON Schema files are invalid. See warnings below.'
