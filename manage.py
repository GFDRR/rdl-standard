#!/usr/bin/env python3
import click
import csv
import json
import re
import requests

from pathlib import Path
from lxml import etree
from contextlib import contextmanager


basedir = Path(__file__).resolve().parent

schemadir = basedir / 'schema'
codelistdir = schemadir / 'codelists'


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

def json_dump(filename, data):
    """
    Writes JSON data to the given filename.
    """
    with (schemadir / filename).open('w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')


def json_load(filename, library=json):
    """
    Loads JSON data from the given filename.
    """
    with (schemadir / filename).open() as f:
        return library.load(f)


def get(url):
    """
    GETs a URL and returns the response. Raises an exception if the status code is not successful.
    """
    response = requests.get(url)
    response.raise_for_status()
    response.encoding = response.apparent_encoding
    return response


@click.group()
def cli():
    pass


@cli.command()
@click.argument('filename', type=click.Path(exists=True))
def format_csv(filename):
    """
    Format a CSV file to conform to the requirements of the tests.
    """
    with open(filename, 'r') as f:
        reader = csv.reader(f)
        data = list(reader)
    
    with open(filename, 'w') as f:
        writer = csv.writer(f, lineterminator='\n')
        writer.writerows(data)


@cli.command()
def update_currency():
    """
    Update currency.csv from ISO 4217.
    """
    # https://www.iso.org/iso-4217-currency-codes.html
    # https://www.six-group.com/en/products-services/financial-information/data-standards.html#scrollTo=currency-codes

    # "List One: Current Currency & Funds"
    current_codes = {}
    url = 'https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml'  # noqa: E501
    tree = etree.fromstring(get(url).content)
    for node in tree.xpath('//CcyNtry'):
        match = node.xpath('./Ccy')
        # Entries like Antarctica have no universal currency.
        if match:
            code = node.xpath('./Ccy')[0].text
            title = node.xpath('./CcyNm')[0].text.strip()
            if code not in current_codes:
                current_codes[code] = title
            # We should expect currency titles to be consistent across countries.
            elif current_codes[code] != title:
                raise Exception(f'expected {current_codes[code]}, got {title}')

    # "List Three: Historic Denominations (Currencies & Funds)"
    historic_codes = {}
    url = 'https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-three.xml'  # noqa: E501
    tree = etree.fromstring(get(url).content)
    for node in tree.xpath('//HstrcCcyNtry'):
        code = node.xpath('./Ccy')[0].text
        title = node.xpath('./CcyNm')[0].text.strip()
        valid_until = node.xpath('./WthdrwlDt')[0].text
        # Use ISO8601 interval notation.
        valid_until = re.sub(r'^(\d{4})-(\d{4})$', r'\1/\2', valid_until.replace(' to ', '/'))
        if code not in current_codes:
            if code not in historic_codes:
                historic_codes[code] = {'Title': title, 'Valid Until': valid_until}
            # If the code is historical, use the most recent title and valid date.
            elif valid_until > historic_codes[code]['Valid Until']:
                historic_codes[code] = {'Title': title, 'Valid Until': valid_until}

    with csv_dump('schema/codelists/closed/unit_currency.csv', ['Code', 'Title', 'Valid Until']) as writer:
        for code in sorted(current_codes):
            writer.writerow([code, current_codes[code], None])
        for code in sorted(historic_codes):
            writer.writerow([code, historic_codes[code]['Title'], historic_codes[code]['Valid Until']])

    schema = json_load('rdls_schema.json')
    codes = sorted(list(current_codes) + list(historic_codes))
    schema['$defs']['codelist_unit_currency']['enum'] = codes

    json_dump('rdls_schema.json', schema)


if __name__ == '__main__':
    cli()
