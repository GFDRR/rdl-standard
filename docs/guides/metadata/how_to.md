# How-to guides

This page contains how-to guides for specific topics. To learn about the process for publishing RDLS metadata, see the [overview](#overview).

## Assign a dataset identifier

The [RDLS Metadata Editor](overview.md#author-metadata-using-the-rdls-metadata-editor) assigns dataset identifiers. However, if you are authoring data via another method, you need to assign a unique identifier (`id`) to each dataset for which you are publishing RDLS metadata.

The preferred approach is to use a persistent HTTP URI in accordance with Data on the Web Best Practices [\$8.7 Data Identifiers](https://www.w3.org/TR/dwbp/#DataIdentifiers).

If you are authoring RDLS metadata for a dataset that is already uniquely identified by a persistent HTTP URI, you ought to set `id` to the existing HTTP URI for the dataset.

For example, the [GHS-BUILT-S R2023A - GHS built-up surface grid, derived from Sentinel2 composite and Landsat, multitemporal (1975-2030) dataset](http://data.europa.eu/89h/9f06f36f-4b11-47ec-abb0-4f8b7b1d72ea) is identified by the following URI in the publisher's data catalog: http://data.europa.eu/89h/9f06f36f-4b11-47ec-abb0-4f8b7b1d72ea. Therefore, in the RDLS metadata describing the dataset, `id` is set to the existing URI:

```json
{
  "id": "http://data.europa.eu/89h/9f06f36f-4b11-47ec-abb0-4f8b7b1d72ea",
  "title": "GHS-BUILT-S R2023A - GHS built-up surface grid, derived from Sentinel2 composite and Landsat, multitemporal (1975-2030)"
}
```

If you are authoring RDLS metadata for a dataset that is not already uniquely identified by a persistent HTTP URI, you ought to generate a persistent HTTP URI for the dataset. For example, by adding the dataset to a data catalog that assigns persistent HTTP URIs.

Otherwise, if you cannot generate a persistent HTTP URI for a dataset, for example, because you are authoring RDLS metadata before adding the dataset to a data catalog, you ought to set `id` to a globally unique identifier of your choice, such as a version 4 [Universally Unique Identifier (UUID)](https://en.wikipedia.org/wiki/Universally_unique_identifier).

If you are writing your own software or if you prefer to use the command line, several libraries and tools are available to generate UUIDS, for example:

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

## Transform coordinates between coordinate reference systems

Coordinates in RDLS metadata need to be specified using the World Geodetic System 1984 (WGS 84) datum, with longitude and latitude units of decimal degrees. This is equivalent to the coordinate reference system identified by the Open Geospatial Consortium URN urn:ogc:def:crs:OGC::CRS84.

If the coordinates in your data sources are specified in a different CRS, before publishing your RDLS metadata, you first need to transform the coordinates to the correct CRS.

If your data pipeline includes a Geographic Information System such as ArcGIS or QGIS, these tools can transform coordinates from one CRS to another. If you are writing your own software, or if you prefer to use the command line, several libraries and tools are available, including [PROJ](https://proj.org/).

If you prefer to use a graphical user interface, several web-based tools are available, including [epsg.io](https://epsg.io/transform).

## Publish an access-restricted resource

If a resource is not available directly from a non-access-restricted URL, you ought to publish the URL of the page that describes the arrangements for obtaining access to the resource in the [`Resource.access_url`](rdls_schema_processed.json,/properties/resources/items,access_url) field.

## Describe an API

If a dataset is available via an API, list the API as a separate [`Resource`](../../reference/schema/resource.md) within the [`Dataset`](../../reference/schema/dataset.md) and set the resource's:

- [`.format`](rdls_schema_processed.json,/properties/resources/items,format) to `"API"`
- [`.access_url`](rdls_schema_processed.json,/properties/resources/items,access_url) to the primary documentation URL for the API
- [`.conforms_to`](rdls_schema_processed.json,/properties/resources/items,conforms_to) to the canonical URI for the standard the API conforms to, if applicable. For example, if the API conforms to the OGC API - Features standard, `"http://www.opengis.net/doc/IS/ogcapi-features-1/1.0.1"`.

Leave [`media_type`](rdls_schema_processed.json,/properties/resources/items,media_type) and [`download_url`](rdls_schema_processed.json,/properties/resources/items,download_url) blank and describe list the formats in which the dataset is available as separate resources.

### Describe location-only exposure data

To describe location-only exposure data, such as building point locations, building polygons or road network polylines, set:

- `exposure/category` to an appropriate value from the [`exposure_category` codelist](../../reference/codelists.md#exposure_category), e.g. 'buildings' in the case of building point locations or polygons, or 'infrastructure' in the case of road network polylines.
- `exposure/metrics/dimension` to 'structure', from the [`metric_dimension` codelist](../../reference/codelists.md#metric_dimension).
- `exposure/metrics/measurement/quantity_kind` to an appropriate value from the [`quantity_kind` codelist](../../reference/codelists.md#quantity_kind), e.g. 'area' for building polygons, or 'length' for road network polylines.

```{seealso}

* [Exposure metadata schema](../../reference/schema/exposure.md)

```
