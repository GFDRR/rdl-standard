#!/usr/bin/env python3
import click
import csv

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


if __name__ == '__main__':
    cli()
