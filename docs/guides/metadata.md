# How to publish RDLS metadata

Metadata enables datasets to be found by human and machine searches, and so users can easily identify the dataset contents. It is strongly encouraged that any risk dataset being uploaded online has metadata prepared and uploaded with it.

This page provides an overview of the process for publishing Risk Data Library Standard (RDLS) metadata and how-to guides for specific topics.

## Overview

The process for publishing RDLS metadata can be divided into three phases:

- [Prepare your metadata](#prepare-your-metadata)
- [Check your metadata](#check-your-metadata)
- [Publish your metadata](#publish-your-metadata)

### Prepare your metadata

You can prepare RDLS metadata in either spreadsheet format or JSON format.

If you are authoring new metadata by hand or converting existing metadata from a spreadsheet, the suggested approach is to [use the RDLS spreadsheet template](#use-the-rdls-spreadsheet-template).

If you are exporting existing metadata from a data catalog or database and you have access to a software developer, the suggested approach is to [export data in JSON format](#export-data-in-json-format).

If your risk datasets use terms from existing taxonomies or classifications, use the [taxonomy mappings](mappings/index.md) to identify the equivalent codes in RDLS.

#### Use the RDLS spreadsheet template

The RDLS spreadsheet template is a tool to enable publishers to create RDLS metadata in Excel (.xslx) format. The spreadsheet is generated directly from the RDLS JSON schema and can be converted back into JSON format for validation and publication using tools such as the Risk Data Library metadata toolkit.

Guidance on how to use the spreadsheet template can be found in the [README](https://github.com/GFDRR/rdls-spreadsheet-template#readme) section of the spreadsheet template Github repository.

#### Export data in JSON format

The JSON format reflects the structure of the schema, is useful to developers who want to use the data to build web apps, and offers a ‘base’ format that other publication formats can be converted to and from. The JSON format of the standard is at the heart of the RDLS Data Review Toolkit. You should author JSON in the tool of your choice and then use the RDLS Data Review Toolkit to validate your .json files against the RDLS.

### Check your metadata

You ought to regularly use the RDLS Data Review Tool to check the structure and format of your metadata as you generate it. This will help ensure that your metadata is compatible with RDLS tools and is comparable with other RDLS metadata.

If your metadata is in JSON format, you need to [package your RDLS metadata](#package-your-rdls-metadata) before submitting it to the RDLS Data Review Tool.

The Data Review Tool reports any structural issues with your metadata. It validates your metadata against the RDLS schema, checking whether your metadata makes sense and appears in the correct place within the schema.

You ought to use real data for testing, wherever possible. Using fictional data can lead to false positives and missed errors in your data pipeline.
If you don’t yet have enough real data to generate all the necessary metadata, for example the dataset hasn’t been published yet so you don’t have any resource url’s, or the hazard event is ongoing and therefore an end data is not yet available, you should try to collect enough real data for at least one dataset with at least one resource.

If you can't collect enough real data for testing, then you ought to create realistic and coherent test data:

- use real hazards and locations
- use plausible dates and values
- avoid using placeholder values
- avoid setting multiple data elements to the same value.

**Action**: Upload some data to the RDLS Data Review Tool.

### Publish your metadata

#### Publish to an open data catalog

##### Access-restricted data

RDLS metadata may be produced to describe data that is access-restricted. These metadata can still be published to an open data catalog however to advertise the existence of the restricted data.

If there is an unique non-access restricted url for the resource being described this should be given as the `download_url`. If, however, the unique resource url will automatically redirect to e.g. a generic landing page, an access request page or a restriction warning page for users without access rights, this should instead be given as the `access_url`.

#### Publish to an internal or access-restricted catalog

RDLS was designed for data that would be openly published, however it is also suitable for access-restricted data catalogs such as commercial data products or internal catalogs for individual institutions.

If the users who will have access to the catalog will have the same access rights to the datasets being described, you do not need to take any additional steps in preparing your metadata.

If the users who will have access to the catalog will not necessarily have the same access rights to the datasets being described, follow the additional guidance for publishing [access-restricted data](#access-restricted-data) to an open data catalog.

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

### Declare the version of RDLS schema that describes your metadata

To publish RDLS metadata you must declare the version of the RDLS schema used. By declaring the version of the schema used, validation tools can correctly validate the metadata, and users know which schema to refer to when interpreting the metadata.

The `Link` object provides the means to declare the schema version used. Both the JSON schema and the spreadsheet template will automatically populate the `links` array with a `Link` object that provides the canonical url of the current version of the RDLS schema (`href`) and the appropriate [IANA](https://www.iana.org/assignments/link-relations/link-relations.xhtml) code to describe the link between this url and the RDLS metadata being published (`rel`).

### Package your RDLS metadata

RDLS metadata in JSON format must be packaged within a container object prior to publication. A simple [package schema](../reference/package_schema.md) is provided. The package schema can contain RDLS metadata for multiple datasets.

### Transform coordinates between coordinate reference systems

Within your RDLS metadata, you can specify the coordinates of each resource using the `bbox`, `geometry` and `centroid` fields within the `Location` object. All coordinates must be given in the [WGS84 coordinate reference system](https://datatracker.ietf.org/doc/html/rfc7946#section-4) (CRS) as required by GeoJSON. If the coordinates in your data sources are specified in a different CRS, before publishing your RDLS metadata, you first need to transform the coordinates to the correct CRS.

If your data pipeline includes a Geographic Information System such as ArcGIS or QGIS, these tools can transform coordinates from one CRS to another. If you are writing your own software, or if you prefer to use the command line, several libraries and tools are available, for example:

- [PROJ](https://proj.org/) and its associated Python interface (\[PYPROJ\])(https://pyproj4.github.io/pyproj/stable/) and JavaScript implementation ([PROJ4JS](http://proj4js.org/)) are generic coordinate transformation tools that transform geospatial coordinates from one coordinate reference system (CRS) to another. They include command-line applications and an application programming interface.
- [GDAL](https://gdal.org/) is a translator library for raster and vector geospatial data formats. It also comes with a variety of useful command line utilities for data translation and processing.
- [Apache SIS](https://sis.apache.org/) is a free software, Java language library for developing geospatial applications. SIS provides data structures for geographic features and associated metadata along with methods to manipulate those data structures.

If you prefer to use a graphical user interface, several web-based tools are available, for example:

- [MyGeodata Cloud](https://mygeodata.cloud/cs2cs/)
- [epsg.io](https://epsg.io/transform)

The WSG84 CRS is equivalent to EPSG:4326 with reversed axes so, if it is not supported by your chosen transformation tool, you can instead transform your coordinates to EPSG:4326 and manually order your coordinates in longitude, latitude order.
