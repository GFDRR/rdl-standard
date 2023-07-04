#!/usr/bin/env python3
import click
import csv
import glob
import json
import logging
import os
import requests
import shutil
import subprocess

from collections import OrderedDict
from contextlib import contextmanager
from io import StringIO
from pathlib import Path

basedir = Path(__file__).resolve().parent
codelistdir = basedir / 'codelists'
referencedir = basedir / 'docs' / 'data_model'
schemadir = basedir / 'schema'


def read_lines(filename):
    """Read a file and return a list of lines."""

    with open(filename, 'r') as f:
        return f.readlines()


def write_lines(filename, lines):
    """Write a list of lines to a file."""

    with open(filename, 'w') as f:
        f.writelines(lines)


def csv_load(url, delimiter=','):
    """
    Loads CSV data into a ``csv.DictReader`` from the given URL.
    """
    reader = csv.DictReader(StringIO(get(url).text), delimiter=delimiter)
    return reader


@contextmanager
def csv_dump(path, fieldnames):
    """
    Writes CSV headers to the given path, and yields a ``csv.writer``.
    """
    f = (Path(path)).open('w')
    writer = csv.writer(f, lineterminator='\n')
    writer.writerow(fieldnames)
    try:
        yield writer
    finally:
        f.close()


def get(url):
    """
    GETs a URL and returns the response. Raises an exception if the status code is not successful.
    """
    response = requests.get(url)
    response.raise_for_status()
    response.encoding = response.apparent_encoding
    return response


def json_dump(filename, data):
    """
    Writes JSON data to the given filename.
    """
    with (schemadir / filename).open('w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')


def delete_directory_contents(directory_path):
  """
  Deletes the contents of a directory on disk.
  """
  for filename in os.listdir(directory_path):
    file_path = os.path.join(directory_path, filename)
    try:
        if os.path.isfile(file_path) or os.path.islink(file_path):
            os.unlink(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)
    except Exception as e:
        print('Failed to delete %s. Reason: %s' % (file_path, e))


def json_load(filename, library=json):
    """
    Loads JSON data from the given filename.
    """
    with (schemadir / filename).open() as f:
        return library.load(f)


def get_codelist_references(schema, codelist, parents=None, full_schema=None, defs_path='$defs'):
  """
  Recursively generate a list of JSON pointers that reference a codelist in JSON schema.

  :param schema: The JSON schema
  :codelist: The name of the definition
  :parents: A list of the parents of schema
  :full_schema: The full schema
  :defs_path: The path under which definitions are located in the schema
  """

  references = []

  if parents is None:
    parents = []

  if full_schema is None:
    full_schema = schema

  if 'properties' in schema:
    for key, value in schema['properties'].items():
      if value.get('codelist') == f"{codelist}.csv":
        references.append(parents + [key])
      elif value.get('type') == 'array' and '$ref' in value['items']:
        references.extend(get_codelist_references(full_schema[defs_path][value['items']['$ref'].split('/')[-1]], codelist, parents + [key, '0'], full_schema))
      elif '$ref' in value:
        references.extend(get_codelist_references(full_schema[defs_path][value['$ref'].split('/')[-1]], codelist, parents + [key], full_schema))
      elif 'properties' in value:
          references.extend(get_codelist_references(value, codelist, parents + [key], full_schema))

  if defs_path in schema:
    for key, value in schema[defs_path].items():
      references.extend(get_codelist_references(value, codelist, [key], full_schema))
  
  return references


def generate_codelist_markdown(codelist, type, references, definitions, defs_path):
  """Generate reference markdown for codelist"""

  markdown = ["This codelist is referenced by the following properties:\n\n"]

  for ref in references:   
    # Remove array indices because they do not appear in the HTML anchors generated by the json schema directive
    ref = [part for part in ref if part != '0']
    
    url = 'rdl_schema_0.1.json,'
    
    # Omit nested references
    if ref[0] in definitions and len(ref) == 2:
      url += f'/{defs_path}/'
    elif len(ref) == 1:
      url += ','
    else:
      continue
    
    markdown.append(f"- `{'/'.join(ref)}`\n")

# To be updated with URL once structure of schema reference page is decided
#    url += ','.join(ref)
#    markdown.append(f"- [`{'/'.join(ref)}`]({url})\n")

  markdown.extend([
    "\nThis codelist has the following codes:\n\n"
    "```{csv-table-no-translate}\n",
    ":header-rows: 1\n",
    ":widths: auto\n",
    f":file: ../../codelists/{type}/{codelist}.csv\n",
    "```\n\n"
  ])

  return markdown


def update_codelist_docs(schema):
  """Update docs/data_model/codelists.md"""

  if '$defs' in schema:
     defs_path = '$defs'
  elif 'definitions' in schema:
     defs_path = 'definitions'
  else:
    raise KeyError("Schema contains neither $defs nor definitions.")

  # Load codelist reference
  codelist_reference = read_lines(referencedir / 'codelists.md')

  # Get codelist names and types (open or closed) from the codelist directory and get a list of references for each codelist
  codelists = {}

  for path in glob.glob(f"{codelistdir}/*/*.csv"):
      codelist = path.split("/")[-1].split(".")[0]
      codelists[codelist] = {
        "type": path.split("/")[-2],
        "content": [f"### {codelist}\n",],
        "references": get_codelist_references(schema, codelist, defs_path=defs_path)
        }
  
  # Sort codelists alphabetically
  codelists = OrderedDict(sorted(codelists.items()))

  # Preserve content that appears before the generated reference content for each codelist 
  for i in range(0, len(codelist_reference)):
      line = codelist_reference[i]       
      
      if line[:4] == "### ":
          codelist = line[4:-1]
          
          # Drop codelists that don't appear in the codelists directory 
          if codelist in codelists:
              j = i+1
              
              while j < len(codelist_reference) and codelist_reference[j] != "This codelist is referenced by the following properties:\n":
                  codelists[codelist]["content"].append(codelist_reference[j])
                  j += 1

  # Preserve introductory content up to an including the ## Open codelists heading
  codelist_reference = codelist_reference[:codelist_reference.index("## Open codelists\n") + 1]
  codelist_reference.append("\n")

  # Update reference for open and closed codelists
  closed_codelist_reference = ["## Closed codelists\n\n"]
  
  for key, value in codelists.items():
    value['content'].extend(generate_codelist_markdown(key, value['type'], value['references'], schema[defs_path], defs_path))
    if value["type"] == "open":
        codelist_reference.extend(value['content'])
    else:
        closed_codelist_reference.extend(value['content'])
    
  codelist_reference.extend(closed_codelist_reference)

  write_lines(referencedir / 'codelists.md', codelist_reference)


def get_definition_references(schema, defn, parents=None, full_schema=None):
  """
  Recursively generate a list of JSON pointers that reference a definition in JSON schema.

  :param schema: The JSON schema
  :defn: The name of the definition
  :parents: A list of the parents of schema
  :full_schema: The full schema
  """

  references = []

  if parents is None:
    parents = []

  if full_schema is None:
    full_schema = schema

  if 'properties' in schema:
    for key, value in schema['properties'].items():
      if value.get('type') == 'array' and '$ref' in value['items']:
        if value['items']['$ref'] == f"#/$defs/{defn}":
          references.append(parents + [key, '0'])
        else:
          references.extend(get_definition_references(full_schema['$defs'][value['items']['$ref'].split('/')[-1]], defn, parents + [key, '0'], full_schema))
      elif '$ref' in value:
        if value['$ref'] == f"#/$defs/{defn}":
          references.append(parents + [key])
        else:
          references.extend(get_definition_references(full_schema['$defs'][value['$ref'].split('/')[-1]], defn, parents + [key], full_schema))
      elif 'properties' in value:
          references.extend(get_definition_references(value, defn, parents + [key], full_schema))

  if '$defs' in schema:
    for key, value in schema['$defs'].items():
      references.extend(get_definition_references(value, defn, [key], full_schema))
  
  return references


def update_schema_docs(schema):
  """Update schema.md"""    

  # Load schema reference
  schema_reference = read_lines(referencedir / 'schema.md')

  # Preserve content that appears before the generated reference content for each component
  components_index = schema_reference.index("## Sub-schemas\n") + 2

  for i in range(components_index, len(schema_reference)):
      if schema_reference[i][:5] == "### ":
          defn = schema_reference[i][5:-1]
          
          # Drop definitions that don't appear in the schema
          if defn in schema["$defs"]:
              schema["$defs"][defn]["content"] = []
              j = i+1

              # while j < len(schema_reference) and not schema_reference[j].startswith("```{admonition}") and schema_reference[j] != 'This component is referenced by the following properties:\n':
              while j < len(schema_reference) and not schema_reference[j].startswith("```{admonition}") and schema_reference[j] != f"`{defn}` is defined as:\n":
                schema["$defs"][defn]["content"].append(schema_reference[j])
                j = j+1

  # Preserve introductory content up to and including the sentence below the ## Sub-schemas heading
  schema_reference = schema_reference[:components_index]
  schema_reference.append("\n")
    
  # Generate standard reference content for each definition
  for defn, definition in schema["$defs"].items():
      definition["content"] = definition.get("content", [])
      
      # Omit Resource definition and string definitions, which will be moved to CSV codelists
      if defn != 'Resource' and definition.get('type') == 'object':

        # Add heading
        definition["content"].insert(0, f"### {defn}\n")
                          
        # Add description
        if 'description' in definition:
          definition["content"].extend([
              f"`{defn}` is defined as:\n\n",
              "```{jsoninclude-quote} ../../schema/rdl_schema_0.1.json\n",
              f":jsonpointer: /$defs/{defn}/description\n",
              "```\n\n"
          ])

        # Add a list of properties that reference this definition
        definition["references"] = get_definition_references(schema, defn)
        definition["content"].append("This component is referenced by the following properties:\n\n")

        for ref in definition["references"]:
            # Remove array indices because they do not appear in the HTML anchors generated by the json schema directive
            ref = [part for part in ref if part != '0']

            # Ideally, these would be relative links - see https://github.com/OpenDataServices/sphinxcontrib-opendataservices/issues/43
            url = 'rdl_schema_0.1.json,'
            
            # Omit nested references
            if ref[0] in schema['$defs'] and len(ref) == 2:
              url += '/$defs/'
            elif len(ref) == 1:
              url += ','
            else:
              continue
      
            url += ','.join(ref)
            definition["content"].append(f"- [`{'/'.join(ref)}`]({url})\n")

        if definition.get('additionalProperties') == False:
          definition["content"].append(f"\nAdditional properties are not permitted within `{defn}` objects.\n")

        # Add schema table
        definition["content"].extend([
            f"\nEach `{defn}` has the following fields:\n\n", 
            "```{jsonschema} ../../schema/rdl_schema_0.1.json\n",
            f":pointer: /$defs/{defn}\n",
            f":collapse: {','.join(definition.get('properties',{}).keys())}\n",
            ":addtargets:\n",
            "```\n\n",
        ])

        schema_reference.extend(definition["content"])     

  write_lines(referencedir / 'schema.md', schema_reference)


@click.group()
def cli():
    pass


@cli.command()
def pre_commit():
    """Update codelist reference documentation and run mdformat
    """

    # Load schema
    schema = json_load('rdl_schema_0.1.json')

    # Update schema.md
    update_schema_docs(schema)

    # Update codelists.md
    update_codelist_docs(schema)

    # Run mdformat
    subprocess.run(['mdformat', 'docs'])

@cli.command()
def update_media_type():
    """
    Update media_type.csv from IANA.

    Ignores deprecated and obsolete media types.
    """
    # https://www.iana.org/assignments/media-types/media-types.xhtml

    # See "Registries included below".
    registries = [
        'application',
        'audio',
        'font',
        'image',
        'message',
        'model',
        'multipart',
        'text',
        'video',
    ]

    with csv_dump('codelists/open/media_type.csv', ['Code', 'Title']) as writer:
        for registry in registries:
            # See "Available Formats" under each heading.
            reader = csv_load(f'https://www.iana.org/assignments/media-types/{registry}.csv')
            for row in reader:
                if ' ' in row['Name']:
                    name, message = row['Name'].split(' ', 1)
                else:
                    name, message = row['Name'], None
                code = f"{registry}/{name}"
                template = row['Template']
                # All messages are expected to be about deprecation and obsoletion.
                if message:
                    logging.warning('%s: %s', message, code)
                # "x-emf" has "image/emf" in its "Template" value (but it is deprecated).
                elif template and template != code:
                    raise Exception(f"expected {code}, got {template}")
                else:
                    writer.writerow([code, name])

        writer.writerow(['offline/print', 'print'])


@cli.command()
@click.pass_context
def update_codelists(ctx):
    """
    Update external codelists
    """
    ctx.invoke(update_media_type)


if __name__ == '__main__':
    cli()
