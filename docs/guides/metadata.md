# How to publish RDLS metadata

This page provides an [overview](#overview) of the process for publishing Risk Data Library Standard (RDLS) metadata and [how-to guides](#how-to-guides) for specific topics.

## Overview

The process for publishing RDLS metadata can be divided into three phases:

- [Prepare your metadata](#prepare-your-metadata)
- [Convert and validate your metadata](#convert-and-validate-your-metadata)
- [Publish your metadata](#publish-your-metadata)

### Prepare your metadata

Data catalog systems typically use [Java Script Object Notation (JSON)](https://www.json.org/) as a data-interchange format so your likely goal is to publish RDLS metadata in JSON format.

Whilst you can *author* RDLS metadata in JSON format, it is difficult and time consuming to author JSON data 'by hand'. Therefore, we provide open source tools that you can use to author RDLS metadata in a more user-friendly spreadsheet format and to convert it to JSON format.

If you are authoring new metadata by hand or converting existing metadata from a spreadsheet, the suggested approach is to [use the RDLS spreadsheet template](#use-the-rdls-spreadsheet-template).

If you are exporting existing metadata from a data catalog or database and you have access to a software developer, the suggested approach is to [export data in JSON format](#export-data-in-json-format).

If your risk datasets use terms from existing taxonomies or classifications, use the [taxonomy mappings](mappings/index.md) to identify the equivalent codes in RDLS.

If you plan to describe the spatial coverage of your risk data using coordinates, you might need to [transform your coordinates to the correct coordinate reference system](#transform-coordinates-between-coordinate-reference-systems).

#### Use the RDLS spreadsheet template

The RDLS spreadsheet template is a tool for authoring RDLS metadata in spreadsheet format.

To download the template and learn how to use it, read its [documentation](https://github.com/GFDRR/rdls-spreadsheet-template#readme).

Once you have entered your metadata using the template, the next step is to [convert it to JSON format and validate it against the RDLS schema](#convert-and-validate-your-metadata).

#### Export data in JSON format

If you plan to export RDLS metadata from an existing system in JSON format, you first need to identify how your existing metadata 'maps' to RDLS - that is, identifying which [data elements](https://en.wikipedia.org/wiki/Data_element) within your system match which RDLS [fields](../reference/schema.md) and [codes](../reference/codelists.md). You then need to implement your mapping in code. JSON is a widely used format so most programming languages and database engines provide support for exporting data in JSON format.

It is strongly suggested that you do not author RDLS metadata in JSON format 'by hand'. However, if you do choose this approach, you ought to use a text editor with support for JSON formatting and validation, such as [Visual Studio Code](https://code.visualstudio.com/docs/languages/json).

In either case, you need to structure and format your data according to the [RDLS schema](../reference/schema.md).

Once you have prepared your RDLS metadata in JSON format, the next step is to [validate it against the RDLS schema](#convert-and-validate-your-metadata).

### Convert and validate your metadata

The [RDLS Convertor](https://metadata.riskdatalibrary.org) is a web-based tool for converting RDLS metadata between spreadsheet and JSON format and for validating it against the RDLS schema. You can submit data to the convertor in either spreadsheet or JSON format.

You ought to regularly use the RDLS Convertor to validate the structure and format of your metadata. This ensures that your metadata is compatible with tools designed to work with RDLS metadata.

If your metadata is in JSON format, you need to [package your RDLS metadata](#package-your-rdls-metadata) before submitting it to the RDLS Convertor.

The RDLS Convertor reports any issues with the structure and format of your metadata. You ought to fix the issues it reports before publishing your metadata.

If you prefer to use command-line tools, you can use [Flatten Tool](https://flatten-tool.readthedocs.io/) to convert RDLS metadata between spreadsheet and JSON format and you can use [Lib CoVE RDLS](https://github.com/GFDRR/rdls-lib-cove) to validate your metadata against the RDLS schema.

Once you've resolved any issues with the structure and format of your data, the next step is to [publish it](#publish-your-metadata).

### Publish your metadata

The steps involved in publishing your RDLS metadata will depend on the specific data catalog or website to which you are adding your risk datasets.

If you are adding data to the World Bank Data Catalog, refer to the [internal guidance for World Bank users](https://github.com/GFDRR/rdl-standard/blob/dev/internal_guide_rdl_on_WBdataCatalog.md).

If you are publishing an access-restricted resource, see [how to publish an access-restricted resource](#publish-an-access-restricted-resource).

## How-to guides

This section contains how-to guides for specific topics. To learn about the process for publishing RDLS metadata, see the [overview](#overview).

### Assign a dataset identifier

You need to assign a unique identifier (`id`) to each dataset for which you are publishing RDLS metadata. The preferred approach is to use a persistent HTTP URI in accordance with Data on the Web Best Practices [\$8.7 Data Identifiers](https://www.w3.org/TR/dwbp/#DataIdentifiers).

If you are authoring RDLS metadata for a dataset that is already uniquely identified by a persistent HTTP URI, you ought to set `id` to the existing HTTP URI for the dataset.

For example, the [GHS-BUILT-S R2023A - GHS built-up surface grid, derived from Sentinel2 composite and Landsat, multitemporal (1975-2030) dataset](http://data.europa.eu/89h/9f06f36f-4b11-47ec-abb0-4f8b7b1d72ea) is identified by the following URI in the publisher's data catalog: http://data.europa.eu/89h/9f06f36f-4b11-47ec-abb0-4f8b7b1d72ea. Therefore, in the RDLS metadata describing the dataset, `id` is set to the existing URI:

```json
{
  "id": "http://data.europa.eu/89h/9f06f36f-4b11-47ec-abb0-4f8b7b1d72ea",
  "title": "GHS-BUILT-S R2023A - GHS built-up surface grid, derived from Sentinel2 composite and Landsat, multitemporal (1975-2030)"
}
```

If you are authoring RDLS metadata for a dataset that is not already uniquely identified by a persistent HTTP URI, you ought to generate a persistent HTTP URI for the dataset. For example, by adding the dataset to a data catalog that assigns persistent HTTP URIs.

Otherwise, if you cannot generate a persistent HTTP URI for a dataset, for example, because you are authoring RDLS metadata before adding the dataset to a data catalog, you ought to set `id` to a globally unique identifier of your choice, such as a version 4 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier). For more information, see [how to generate a universally unique identifier](#generate-a-universally-unique-identifier).

### Generate a universally unique identifier

If you are writing your own software or if you prefer to use the command line, several libraries and tools are available to generate universally unique identifiers (UUIDS), for example:

- Golang - [google/uuid](https://pkg.go.dev/github.com/google/uuid)
- PHP - [ramsey/uuid](https://github.com/ramsey/uuid)
- C++ - [Boost UUID](https://www.boost.org/doc/libs/1_65_0/libs/uuid/uuid.html)
- Linux or C - [libuuid](https://linux.die.net/man/3/libuuid)
- Python - [uuid.py](https://docs.python.org/3/library/uuid.html)
- Java - [java.util.UUID](https://docs.oracle.com/javase/7/docs/api/java/util/UUID.html)
- C# - [System.Guid](https://docs.microsoft.com/en-us/dotnet/api/system.guid)
- JavaScript - [Crypto.randomUUID](https://www.moreonfew.com/how-to-generate-uuid-in-javascript/)
- R - [uuid](https://cran.r-project.org/web/packages/uuid/index.html)

If you prefer to use a graphical user interface, several web-based tools are available, for example [Online UUID Generator](https://www.uuidgenerator.net/).

### Package your RDLS metadata

To package your RDLS metadata, use the structure and format described by the [package schema](../reference/package_schema.md).

### Transform coordinates between coordinate reference systems

Coordinates in RDLS metadata need to be specified using the World Geodetic System 1984 (WGS 84) datum, with longitude and latitude units of decimal degrees. This is equivalent to the coordinate reference system identified by the Open Geospatial Consortium URN urn:ogc:def:crs:OGC::CRS84.

If the coordinates in your data sources are specified in a different CRS, before publishing your RDLS metadata, you first need to transform the coordinates to the correct CRS.

If your data pipeline includes a Geographic Information System such as ArcGIS or QGIS, these tools can transform coordinates from one CRS to another. If you are writing your own software, or if you prefer to use the command line, several libraries and tools are available, for example:

- [PROJ](https://proj.org/) and its associated Python interface ([PYPROJ](https://pyproj4.github.io/pyproj/stable/)) and JavaScript implementation ([PROJ4JS](http://proj4js.org/)) are generic coordinate transformation tools that transform geospatial coordinates from one coordinate reference system (CRS) to another. They include command-line applications and an application programming interface.
- [GDAL](https://gdal.org/) is a translator library for raster and vector geospatial data formats. It also comes with a variety of useful command line utilities for data translation and processing.
- [Apache SIS](https://sis.apache.org/) is a free software, Java language library for developing geospatial applications. SIS provides data structures for geographic features and associated metadata along with methods to manipulate those data structures.

If you prefer to use a graphical user interface, several web-based tools are available, for example:

- [MyGeodata Cloud](https://mygeodata.cloud/cs2cs/)
- [epsg.io](https://epsg.io/transform)

The WSG84 CRS is equivalent to EPSG:4326 with reversed axes so, if it is not supported by your chosen transformation tool, you can instead transform your coordinates to EPSG:4326 and manually order your coordinates in longitude, latitude order.

### Publish an access-restricted resource

If a resource is not available directly from a non-access-restricted URL, you ought to publish the URL of the page that describes the arrangements for obtaining access to the resource in the [`Resource.access_url`](rdls_schema.json,/$defs/Resource,access_url) field.
