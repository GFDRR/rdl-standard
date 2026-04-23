import json
import os
import pytest
from jsonschema import Draft202012Validator, FormatChecker

def get_example_files():
    """
    Discovery function to find all JSON files within the 'examples' directory.
    """
    example_files = []
    # Search within the 'examples' folder and all subfolders
    for root, dirs, files in os.walk('examples'):
        for file in files:
            if file.endswith('.json'):
                example_files.append(os.path.join(root, file))
    return example_files

# Load the base schema once for the test suite
SCHEMA_PATH = 'schema/rdls_schema.json'
with open(SCHEMA_PATH, 'r') as f:
    schema_data = json.load(f)

# Initialize the validator with the Draft 2020-12 spec (as used in your config)
# and the FormatChecker to validate dates, emails, and IRIs
validator = Draft202012Validator(schema_data, format_checker=FormatChecker())

@pytest.mark.skip(reason="Examples will be updated in a future PR.")
@pytest.mark.parametrize('example_path', get_example_files())
def test_example_validation(example_path):
    """
    Validates a single JSON example against the RDLS schema.
    """
    with open(example_path, 'r') as f:
        try:
            example_instance = json.load(f)
        except json.JSONDecodeError as e:
            pytest.fail(f"Failed to decode JSON in {example_path}: {e}")

    # Collect all validation errors
    errors = sorted(validator.iter_errors(example_instance), key=lambda e: e.path)
    
    if errors:
        error_messages = []
        for error in errors:
            # Format the path to the error for better readability (e.g., properties/hazard/type)
            path = " -> ".join([str(p) for p in error.path]) if error.path else "root"
            error_messages.append(f"[{path}]: {error.message}")
        
        pytest.fail(f"Validation failed for {example_path}:\n" + "\n".join(error_messages))