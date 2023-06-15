import jsonref
import pytest
from jscc.testing.filesystem import walk_json_data
from jscc.schema import is_json_schema
from jscc.testing.util import http_get
from jscc.testing.checks import (validate_array_items, validate_codelist_enum, validate_deep_properties,
                         validate_items_type, validate_letter_case, validate_merge_properties,
                         validate_metadata_presence, validate_null_type, validate_object_id, validate_ref,
                         validate_schema)


schemas = [(path, name, data) for path, name, _, data in walk_json_data(top='schema') if is_json_schema(data)]
metaschema = http_get('https://json-schema.org/draft/2020-12/schema').json()


@pytest.mark.parametrize('path,name,data', schemas)
def test_schema_valid(path, name, data):
    validate_json_schema(path, name, data, metaschema)


def validate_json_schema(path, name, data, schema):
    errors = 0

    errors += validate_schema(path, data, schema)
    errors += validate_array_items(path, data)
    errors += validate_items_type(path, data)
    # Codelist fields are not yet implemented
    # errors += validate_codelist_enum(path, data)
    # RDLS does not use camelCase
    # errors += validate_letter_case(path, data)
    errors += validate_merge_properties(path, data)
    errors += validate_ref(path, data)
    # Titles and descriptions are not yet added
    # errors += validate_metadata_presence(path, data)
    errors += validate_object_id(path, jsonref.replace_refs(data))
    errors += validate_null_type(path, data, no_null=True)
    # RDLS does not disallow deep properties
    # Here, we don't add to `errors`, in order to not count these warnings as errors.
    # validate_deep_properties(path, data)

    assert not errors, 'One or more JSON Schema files are invalid. See warnings below.'
