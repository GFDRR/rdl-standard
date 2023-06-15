import csv
import json
import os
import warnings
from io import StringIO

import pytest
import requests
from jscc.schema import is_codelist
from jscc.testing.checks import get_invalid_csv_files
from jscc.testing.filesystem import walk_csv_data
from jscc.testing.util import warn_and_assert
from jsonschema import FormatChecker
from jsonschema.validators import Draft202012Validator as validator

cwd = os.getcwd()
repo_name = os.path.basename(os.getenv('GITHUB_REPOSITORY', cwd))


def formatwarning(message, category, filename, lineno, line=None):
    return str(message).replace(cwd + os.sep, '')


warnings.formatwarning = formatwarning
pytestmark = pytest.mark.filterwarnings('always')


def test_csv_valid():
    warn_and_assert(get_invalid_csv_files(), '{0} is not valid CSV: {1}',
                    'CSV files are invalid. See warnings below.')


def test_valid():
    """
    Ensures all CSV files are valid: no empty rows or columns, no leading or trailing whitespace in cells, same number
    of cells in each row.
    """
    errors = 0

    for path, name, text, fieldnames, rows in walk_csv_data():
        codelist = is_codelist(fieldnames)
        width = len(fieldnames)
        columns = []

        duplicates = len(fieldnames) - len(set(fieldnames))
        if duplicates:
            errors += 1
            warnings.warn(f'ERROR: {path} has {duplicates} duplicate column headers')

        for row_index, row in enumerate(rows, 2):
            expected = len(row) + duplicates
            if expected != width:
                errors += 1
                warnings.warn(f'ERROR: {path} has {expected} not {width} columns in row {row_index}')
            if not any(row.values()):
                errors += 1
                warnings.warn(f'ERROR: {path} has empty row {row_index}')
            else:
                for col_index, (header, cell) in enumerate(row.items(), 1):
                    if col_index > len(columns):
                        columns.append([])

                    columns[col_index - 1].append(cell)

                    # Extra cells are added to a None columns.
                    if header is None and isinstance(cell, list):
                        cells = cell
                    else:
                        cells = [cell]

                    for cell in cells:
                        if cell is not None and cell != cell.strip():
                            errors += 1
                            warnings.warn(f'ERROR: {path} {header} "{cell}" has leading or trailing whitespace at '
                                          f'{row_index},{col_index}')

        for col_index, column in enumerate(columns, 1):
            if not any(column) and codelist:
                errors += 1
                warnings.warn(f'ERROR: {path} has empty column {col_index}')

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=fieldnames, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)
        expected = output.getvalue()

        if text != expected and repo_name != 'sample-data':
            errors += 1
            warnings.warn(f'ERROR: {path} is improperly formatted (e.g. missing trailing newline, extra quoting '
                          f'characters, non-"\\n" line terminator):\n{text!r}\n{expected!r}')

    assert errors == 0, 'One or more codelist CSV files are invalid. See warnings below.'
