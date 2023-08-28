from jscc.testing.checks import get_empty_files, get_misindented_files, get_invalid_json_files
from jscc.testing.util import warn_and_assert

import os


this_dir = os.path.dirname(os.path.realpath(__file__))
absolute_source_schema_dir = this_dir + '/../schema/'
absolute_source_codelist_dir = this_dir + '/../schema/codelists/'


def test_empty():
    """Tests that files (JSON and other files) are not empty."""
    empty_files_paths = [path for path in get_empty_files() if "src/" not in path[0]]
    warn_and_assert(empty_files_paths, "{0} is empty, run: rm {0}", "Files are empty. See warnings below.")


def test_indent():
    """
    Test that JSON files are indented properly.
    Note this test can often fail on problems that are not to do with indents.
    """
    misindented_files_paths = [path for path in get_misindented_files() if "src/" not in path[0]]
    warn_and_assert(
        misindented_files_paths,
        "{0} is not indented as expected",
        "Files are not indented as expected. See warnings below",
    )


def test_invalid_json():
    """Test whether all JSON files can be parsed."""
    warn_and_assert(
        get_invalid_json_files(excluded=('.git', '.ve', '_static', 'build', 'fixtures', "_build")), "{0} is not valid JSON: {1}", "JSON files are invalid. See warnings below."
    )
