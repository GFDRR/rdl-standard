"""
Tests of the schema check of the RDLS Metadata Editor (docs/_static/rdls_validator.js).

The check must give the same result as the one that the catalogue applies to each pull
request (python/validator.py in GFDRR/rdl-jkan), which is repeated here.
"""

import copy
import hashlib
import json
import random
import re
import shutil
import subprocess
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator, ValidationError, validators

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / "docs" / "_static"
SCHEMA_PATH = ROOT / "schema" / "rdls_schema.json"
VALIDATOR_PATH = STATIC / "rdls_validator.js"

SCHEMA = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
EXAMPLES = {
    path.relative_to(ROOT).as_posix(): json.loads(path.read_text(encoding="utf-8"))
    for path in sorted((ROOT / "examples").rglob("*.json"))
}

# The keywords that rdls_validator.js applies, and those that do not affect validation
CHECKED_KEYWORDS = {
    "$ref", "type", "enum", "const", "minLength", "maxLength", "pattern", "minimum",
    "maximum", "exclusiveMinimum", "exclusiveMaximum", "minItems", "maxItems",
    "uniqueItems", "prefixItems", "items", "minProperties", "required", "properties",
    "allOf", "anyOf", "oneOf", "not", "if", "then", "else",
}  # fmt: skip
OTHER_KEYWORDS = {
    "$schema", "$id", "$defs", "$comment", "title", "description", "examples", "format",
    "codelist", "openCodelist",
}  # fmt: skip

NODE_SCRIPT = """
const { getSchemaErrors, getTextErrors, describeCatalogueError } = require(process.argv[1]);
const { schema, datasets, checkFormats } = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const results = datasets.map(dataset => [...getSchemaErrors(dataset, schema, checkFormats), ...getTextErrors(dataset)]
    .map(error => ({ path: error.path, text: describeCatalogueError(error) })));
console.log(JSON.stringify(results));
"""


# The rules of the catalogue
def catalogue_properties(validator, properties, instance, schema):
    if not validator.is_type(instance, "object"):
        return
    for name, subschema in properties.items():
        if name in instance:
            if name in ["start", "end"] and "oneOf" in subschema:
                subschema = subschema.copy()
                subschema["anyOf"] = subschema.pop("oneOf")
            yield from validator.descend(
                instance[name], subschema, path=name, schema_path=name
            )


def catalogue_required(validator, required, instance, schema):
    if not validator.is_type(instance, "object"):
        return
    not_required = {"Event": "occurrence", "Hazard": "hazard_process"}
    for name in required:
        if name != not_required.get(schema.get("title")) and name not in instance:
            yield ValidationError(f"{name!r} is a required property")


CATALOGUE_VALIDATOR = validators.extend(
    Draft202012Validator,
    {"properties": catalogue_properties, "required": catalogue_required},
)(SCHEMA)


def run_editor_check(datasets, check_formats=False):
    """The errors that the editor finds in each dataset."""
    node = shutil.which("node")
    if not node:
        pytest.skip("Node.js is not installed")
    result = subprocess.run(
        [node, "-e", NODE_SCRIPT, str(VALIDATOR_PATH)],
        input=json.dumps(
            {"schema": SCHEMA, "datasets": datasets, "checkFormats": check_formats}
        ),
        capture_output=True,
        encoding="utf-8",
        check=True,
    )
    return json.loads(result.stdout)


def sort_paths(paths):
    return sorted((list(path) for path in paths), key=json.dumps)


def list_nodes(value, path=()):
    """The path of each value in a dataset."""
    children = []
    if isinstance(value, dict):
        children = value.items()
    elif isinstance(value, list):
        children = enumerate(value)
    for key, child in children:
        yield (*path, key)
        yield from list_nodes(child, (*path, key))


def alter(dataset, rng):
    """A copy of a dataset with some values removed or replaced."""
    dataset = copy.deepcopy(dataset)
    for _ in range(rng.randint(1, 3)):
        paths = list(list_nodes(dataset))
        if not paths:
            break
        *parents, key = rng.choice(paths)
        parent = dataset
        for parent_key in parents:
            parent = parent[parent_key]
        action = rng.choice(["remove", "replace", "repeat", "spatial"])
        if action == "remove":
            del parent[key]
        elif action == "repeat" and isinstance(parent[key], list) and parent[key]:
            parent[key].append(copy.deepcopy(parent[key][0]))
        elif action == "spatial" and isinstance(dataset.get("spatial"), dict):
            scales = ["global", "regional", "national", "sub-national", "urban"]
            dataset["spatial"]["scale"] = rng.choice(scales)
            dataset["spatial"]["countries"] = rng.choice(
                [["KEN"], ["KEN", "UGA"], ["KEN", "KEN"], ["XXX"], []]
            )
        else:
            parent[key] = rng.choice(["not a code", "", 12.5, -3, None, True, [], {}])
    return dataset


def list_keywords(schema):
    """The keywords in a schema, without the names of its fields and definitions."""
    if isinstance(schema, list):
        for item in schema:
            yield from list_keywords(item)
    elif isinstance(schema, dict):
        for keyword, value in schema.items():
            yield keyword
            if keyword in ("properties", "$defs"):
                for subschema in value.values():
                    yield from list_keywords(subschema)
            elif keyword not in ("enum", "const", "examples"):
                yield from list_keywords(value)


def test_editor_checks_all_keywords():
    unknown = set(list_keywords(SCHEMA)) - CHECKED_KEYWORDS - OTHER_KEYWORDS
    assert not unknown, f"rdls_validator.js does not check: {sorted(unknown)}"


def test_editor_agrees_with_catalogue():
    rng = random.Random(1)
    datasets = list(EXAMPLES.values())
    assert datasets
    cases = datasets + [alter(rng.choice(datasets), rng) for _ in range(3000)]

    invalid = 0
    for dataset, errors in zip(cases, run_editor_check(cases)):
        expected = sort_paths(
            e.absolute_path for e in CATALOGUE_VALIDATOR.iter_errors(dataset)
        )
        invalid += bool(expected)
        assert sort_paths(e["path"] for e in errors) == expected, (errors, dataset)
    assert 1000 < invalid < len(cases)


@pytest.mark.parametrize("name", EXAMPLES)
def test_editor_accepts_examples(name):
    assert run_editor_check([EXAMPLES[name]]) == [[]]
    assert run_editor_check([EXAMPLES[name]], check_formats=True) == [[]]


def test_editor_describes_errors():
    dataset = copy.deepcopy(next(iter(EXAMPLES.values())))
    dataset["resources"][0]["spatial"] = {"scale": "national"}
    dataset["title"] = "CafÃ©"
    texts = [error["text"] for error in run_editor_check([dataset])[0]]
    assert 'resources 1 › spatial: "countries" is required' in texts
    assert "title: has text with the wrong encoding: …CafÃ©…" in texts
    assert len(texts) == 2


def test_editor_checks_formats():
    dataset = copy.deepcopy(next(iter(EXAMPLES.values())))
    dataset["project"] = {"name": "A project", "url": "www.example.org"}
    dataset["publisher"]["email"] = "not an address"
    dataset["temporal_resolution"] = "Annual"
    dataset["resources"][0]["temporal"] = {"start": "last year", "end": "2024-05"}
    paths = [
        ["project", "url"],
        ["publisher", "email"],
        ["resources", 0, "temporal", "start"],
        ["temporal_resolution"],
    ]
    errors = run_editor_check([dataset], check_formats=True)[0]
    assert sort_paths(error["path"] for error in errors) == sort_paths(paths)
    # As in the catalogue
    assert run_editor_check([dataset]) == [[]]


def test_editor_file_versions():
    """Browsers keep the files for a while: the version in the page changes with the file."""
    html = (STATIC / "RDL_MDE.html").read_text(encoding="utf-8")
    files = re.findall(
        r'(?:src|href)="(RDL_MDE\.css|[\w.]+\.js)(?:\?v=(\w*))?"', html
    )
    assert {name for name, _ in files} == {
        "RDL_MDE.css",
        "RDL_MDE.js",
        "rdls_validator.js",
    }
    for name, version in files:
        content = (STATIC / name).read_bytes().replace(b"\r\n", b"\n")
        expected = hashlib.sha256(content).hexdigest()[:8]
        assert version == expected, (
            f"Write {name}?v={expected} in RDL_MDE.html, as {name} has changed"
        )
