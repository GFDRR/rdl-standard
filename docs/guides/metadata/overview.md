# Overview

This page provides an [overview](#overview) of the process for publishing Risk Data Library Standard (RDLS) metadata.

The process for publishing RDLS metadata can be divided into three phases:

- [Prepare your metadata](#prepare-your-metadata)
- [Convert and validate your metadata](#convert-and-validate-your-metadata)
- [Publish your metadata](#publish-your-metadata)

## Prepare your metadata

Data catalog systems typically use [Java Script Object Notation (JSON)](https://www.json.org/) as a data-interchange format so your likely goal is to publish RDLS metadata in JSON format.

Whilst you can *author* RDLS metadata in JSON format, it is difficult and time consuming to author JSON data 'by hand'. Therefore, we provide open source tools that you can use to author RDLS metadata in a more user-friendly spreadsheet format and to convert it to JSON format.

If you are authoring new metadata by hand or converting existing metadata from a spreadsheet, the suggested approach is to [use the RDLS spreadsheet template](#use-the-rdls-spreadsheet-template).

If you are exporting existing metadata from a data catalog or database and you have access to a software developer, the suggested approach is to [export data in JSON format](#export-data-in-json-format).

If your risk datasets use terms from existing taxonomies or classifications, use the [taxonomy mappings](../mappings/index.md) to identify the equivalent codes in RDLS.

If you plan to describe the spatial coverage of your risk data using coordinates, you might need to [transform your coordinates to the correct coordinate reference system](how_to.md#transform-coordinates-between-coordinate-reference-systems).

### Use the RDLS spreadsheet template

The RDLS spreadsheet template is a tool for authoring RDLS metadata in spreadsheet format.

To download the template and learn how to use it, read its [documentation](https://github.com/GFDRR/rdls-spreadsheet-template#readme).

Once you have entered your metadata using the template, the next step is to [convert it to JSON format and validate it against the RDLS schema](#convert-and-validate-your-metadata).

### Export data in JSON format

If you plan to export RDLS metadata from an existing system in JSON format, you first need to identify how your existing metadata 'maps' to RDLS - that is, identifying which [data elements](https://en.wikipedia.org/wiki/Data_element) within your system match which RDLS [fields](../../reference/schema/index.md) and [codes](../../reference/codelists.md). You then need to implement your mapping in code. JSON is a widely used format so most programming languages and database engines provide support for exporting data in JSON format.

It is strongly suggested that you do not author RDLS metadata in JSON format 'by hand'. However, if you do choose this approach, you ought to use a text editor with support for JSON formatting and validation, such as [Visual Studio Code](https://code.visualstudio.com/docs/languages/json).

In either case, you need to structure and format your data according to the [RDLS schema](../../reference/schema/index.md).

Once you have prepared your RDLS metadata in JSON format, the next step is to [validate it against the RDLS schema](#convert-and-validate-your-metadata).

## Convert and validate your metadata

The [RDLS Convertor](https://metadata.riskdatalibrary.org) is a web-based tool for converting RDLS metadata between spreadsheet and JSON format and for validating it against the RDLS schema. You can submit data to the convertor in either spreadsheet or JSON format.

You ought to regularly use the RDLS Convertor to validate the structure and format of your metadata. This ensures that your metadata is compatible with tools designed to work with RDLS metadata.

The RDLS Convertor reports any issues with the structure and format of your metadata. You ought to fix the issues it reports before publishing your metadata.

If you prefer to use command-line tools, you can use [Flatten Tool](https://flatten-tool.readthedocs.io/) to convert RDLS metadata between spreadsheet and JSON format and you can use [Lib CoVE RDLS](https://github.com/GFDRR/rdls-lib-cove) to validate your metadata against the RDLS schema.

Once you've resolved any issues with the structure and format of your data, the next step is to [publish it](#publish-your-metadata).

## Publish your metadata

The steps involved in publishing your RDLS metadata will depend on the specific data catalog or website to which you are adding your risk datasets.

If you are adding data to the World Bank Data Catalog, refer to the [internal guidance for World Bank users](https://github.com/GFDRR/rdl-standard/blob/dev/internal_guide_rdl_on_WBdataCatalog.md).

If you are publishing an access-restricted resource, see [how to publish an access-restricted resource](how_to.md#publish-an-access-restricted-resource).