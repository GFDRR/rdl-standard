# Hazard Data Package

The Hazard Data Package is a lightweight format that supports the publication, exchange and use of [hazard data](https://gfdrr.github.io/rdl-docs/keyconcepts.html).

It is part of [the framework of standards](https://gfdrr.github.io/rdl-docs/standards.html) developed and recommended by the [Risk Data Library project](http://riskdatalibrary.org/).

## Status

* Initial Working Draft

## Schema

This specification is also available as a [JSON schema](https://github.com/GFDRR/rdl-standard/blob/main/specs/hazard-data-package/schema.json).

## Language

The key words `MUST`, `MUST NOT`, ``REQUIRED``, `SHALL`, `SHALL NOT`, `SHOULD`, `SHOULD NOT`, `RECOMMENDED`, `MAY`, and `OPTIONAL` in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt)

## Introduction

There are no widely adopted standards to support the consistent publication, exchange and use of risk data. This makes it hard to share, find and reuse data across disaster risk analysis projects.

The [Risk Data Library project](http://riskdatalibrary.org/) project is tackling this issue by developing and recommending a consistent set of open standards for risk data.

Risk data consists of data about hazards, the exposure of people and assets to those hazards and their vulnerability. Analysis of those data allows projects of potential impact that can inform disaster risk management and reduction.

This specification defines a lightweight format for describing Hazard datasets.

It builds on existing open standards to provide a simple, consistent and flexible approach for describing Hazard datasets that include dataset describing the modelled impact of a range of different types of hazards (e.g. floods and wildfires).

## Use cases and scope

This specification is intended to support the following use cases:

* the publication and sharing of hazard data between people, projects and organisations
* describing the contextual data necessary to support the proper interpretation and use hazard data
* supporting the cataloguing, management and archiving of hazard data from multiple sources

The specification aims to make it easy to create and maintain metadata, making it possible to easily turn any collection of hazard data files into a Hazard Data Package.

With this in mind, the specification does not attempt to define a single standard data format for geospatial data. Or enforce a specific approach for organising data files. It does however define some basic metadata which is essential to the exchange of Hazard data.

To further improve data interoperability the Risk Data Library [recommends the adoption of other standards](https://gfdrr.github.io/rdl-docs/standards.html).

## Key concepts

## What is a data package?

A data package is a simple format used to describe and package a dataset.

It consists of two elements:

* a __descriptor__: a file containing the metadata that describes how the data was produced and its important characteristics such as the format, spatial coverage, time of creation, etc
* __resources__: one or more data files that contain the actual data

The descriptor file in a data package is always called `datapackage.json`

A descriptor and its associated resources might be organised into a single directory and sub-directories.
For example:

```
datapackage.json

data/footprints.gpkg
data/footprints.geojson
```

This structure makes it easy to exchange data, e.g. by zipping it into a single archive.

## What is a hazard data package?

A Hazard Data Package is a data package containing data that describes the modelled impact of a physical hazard. Earthquakes, wildfires and floods are all examples of hazards.

A hazard is triggered by an __Event__. An event 

s in a specific location and might take place at a specific time or with recurring frequency (e.g. seasonal flooding).

Related __Events__ that occur in the same location, or within a specific time window are known as an __Event Set__. A Hazard Data Package only contains data about a single __Event Set__.

A hazard will have some impact on the surrounding environment over a geographic area known as its __Footprint__. Different ways of modelling and simulating the impacts of a Hazard will generate different collections of Footprints (a __Footprint Set__) depending on the type and parameters of the simulation.

For a more detailed review of this core model, refer to [the Risk Data Library conceptual model for Hazard Data](https://gfdrr.github.io/rdl-docs/hazard.html).

More specifically then, a Hazard Data Package will consist of:

* a __descriptor__ (`datapackage.json`): that describes the dataset and the event that triggers as a hazard
* __resources__: that describe the geographical footprint of a hazard using an appropriate spatial data format. E.g. GeoTIFF, Shapefile or GeoPackage.

## Hazard Data Package Descriptors

A Hazard Data Package descriptor is an extension of the [Data Package](https://specs.frictionlessdata.io/data-package/)
specification.

This means that any valid Hazard Data Package descriptor will also be a valid Data Package descriptor. This
means that it:

* `MUST` be a valid JSON object
* `MUST` be stored in a file called `datapackage.json`
* `MUST` be contained in a top-level directory, relative to the resources that are part of the package
* `MUST` contain a `resources` property that describes the data resources (see section on "Hazard Data Package Resources")
* `MAY` contain additional metadata properties

To properly describe different Hazard datasets a valid Hazard Data Package descriptor will also
include some additional metadata. This includes

* metadata that describes the individual dataset. Some of these properties are only recommended by the original Data Package specification, but are `REQUIRED` in a Hazard Data Package descriptor
* a description of the Event(s), Hazard and Footprint(s) that are included in the dataset

### Required core metadata

A Hazard Data Package `MUST` include the following metadata properties defined in the [Data Package specification](https://specs.frictionlessdata.io/data-package/#metadata).

|Property|Type|Status|Notes
|--------|----|------|-----
|[`profile`](https://specs.frictionlessdata.io/data-package/#profile)|`hazard-data-package`|``REQUIRED``|Defines the data package as conforming to this specification. Value `MUST` be this `String`|
|[`id`](https://specs.frictionlessdata.io/data-package/#id)|`String`|`REQUIRED`|A globally unique identifier for the package, e.g. a UUID
|[`name`](https://specs.frictionlessdata.io/data-package/#name)|`String`|`REQUIRED`|A short url-usable name for the package
|[`title`](https://specs.frictionlessdata.io/data-package/#title)|`String`|`REQUIRED`|The title of the dataset
|[`description`](https://specs.frictionlessdata.io/data-package/#description)|`String`|`REQUIRED`|A description of the dataset
|[`licenses`](https://specs.frictionlessdata.io/data-package/#licenses)|Array of `Objects`|`REQUIRED`|An array of objects that describe the licence and/or terms of use for the dataset. The licence object `MUST` have both a `name` and a `path` property. While the Data Package specification supports multiple licences, to avoid ambiguity a Hazard Data Package `SHOULD` have a single licene or set of terms
|`spatial`|Array of `Strings`|`REQUIRED`|The value of this property `MUST` be an array containing one or more ISO 3-letter country codes, e.g. `[ "AFG" ]`
|`eventset`|`Object`|`REQUIRED`|An Event Set descriptor, that describes the circumstances in which a hazard occurs. See the "Event Set" descriptor section below.
|`events`|Array of `Objects`|`REQUIRED`|A list of Event descriptors. The array `MUST` contain at least one descriptor and `MAY` contain several. See the "Event Descriptor" section below.
|`resources`|Array of `Objects`|`REQUIRED`|A list of the Hazard Data Package Resources contained in the package. The array `MUST` contain at least one resource and `MAY` contain several. See the "Hazard Data Package Resources" section below.

#### Event Set descriptor

A Hazard Data Package `MUST` include an `eventset` property. The value of this property `MUST` be a valid Event Set descriptor as described in this section.

|Property|Type|Status|Notes
|--------|----|------|-----
|`hazard_type`|`String`|`REQUIRED`|Identifies the type of hazard. Valid values are defined by the "RDL Hazard Type Code list"
|`analysis_type`|`String`|`REQUIRED`|Identifies the type of analysis used to generate the Footprints. E.g. Type of analysis, probabilistic or deterministic. Valid values are defined by the "RDL Analysis Type Code List".
|`id`|`String`|`OPTIONAL`|A unique identifier for the Event Set. E.g. a UUID
|`spatial`|`String`|`OPTIONAL`|The value of this property `MUST` be an array containing one or more ISO 3-letter country codes, e.g. `[ "AFG" ]`
|`start_date`|`String`|`OPTIONAL`|ISO 8601 date time. The datetime at which the modelled scenarios start.
|`end_date`|`String`|`OPTIONAL`|ISO 8601 date time. The datetime at which the modelled scenarios start
|`year`|`String`|`OPTIONAL`|ISO 8601 date time. The reference year to which the modelled scenario refers
|`time_span`|`String`|`OPTIONAL`|ISO 8601 date time. The extent of the time period covered by the events included in the current scenario hazard analysis

Example:

```
"eventset": {
  "id": "...",
  "hazard_type": "...",
  "analysis_type": "...",
  "spatial": [ "..." ],
  "start_date": "...",
  "end_date": "...",
  "year": "...",
  "time_span": "..."
}
```

### Event Descriptors

A Hazard Data Package descriptor must have an `events` property whose value is an
array of Event descriptors. A valid Event descriptor will have the following properties


|Property|Type|Status|Notes
|--------|----|------|-----
|`id`|`String`|`REQUIRED`|A unique identifier for the Event, e.g. a UUID.
|`calculation_method`|`String`|`REQUIRED`|A description of how this Event was generated, e.g. observed or simulated. Valid values are defined by the "RDL Calculation Method Code List"
|`frequency`|`String`|`REQUIRED`|
|`description`|`String`|`OPTIONAL`|Provides a human-readable description of the event
|`return_period`|`String`|`OPTIONAL`|The probability of the event occuring expressed as an array of return periods ("10", "100", "1000") or as a single `String` specifying a range (10-1000)
|`occurrence`|`Object`|`OPTIONAL`|A JSON object with `start_date` and `end_date` properties, that provide the date-times during which the event starts and ends
|`trigger`|`Object`|`OPTIONAL`|A JSON object that has `hazard_type`, `process_type` or `event` properties that describe the trigger for this event occuring. The `event` property `MUST` refer to the `id` of another event

Example:

```
  "events": [{
    "id": "...",
    "description": "",
    "calculation_method": "...",
    "frequency_type": "...",
    "return_period": [ ... ]
    "occurrence": {
      "start_date": "...",
      "end_date": "..."
    },
    "trigger": {
      "hazard_type": "...",
      "process_type": "...",
      "event": "...",
    }
  ]
  }
```

## Hazard Data Package Resources (Footprints)

A resource in a Hazard Data Package `MUST` be a valid [Data Package Resource](https://specs.frictionlessdata.io/data-resource/), with some additional requirements as noted in the table
below.

|Property|Type|Status|Notes
|--------|----|------|-----
|[`name`](https://specs.frictionlessdata.io/data-resource/#name)|`String`|`REQUIRED`|The name is a simple name or identifier to be used for this resource. It `MUST` be a valid name as described in [the data package specification](https://specs.frictionlessdata.io/data-resource/#name)
|[`path`](https://specs.frictionlessdata.io/data-resource/#path-data-in-files)|`String`|`REQUIRED`|A "[url or path](https://specs.frictionlessdata.io/data-resource/#url-or-path)" as described in the data package specification. Provides the file system path, or a remote URL, that provides a location for the resource
|`mediatype`|`String`|`REQUIRED`|The media type/mime type for the resource. Mediatypes are maintained by the Internet Assigned Numbers Authority (IANA) in a [media type registry](https://www.iana.org/assignments/media-types/media-types.xhtml)
|`process_type`|`String`|`REQUIRED`|The type of hazard process modelled. Valid values for the `process_type` property are defined by the "RDL Process Type Code List".
|`imt`|`String`|`REQUIRED`|The intensity measure. Valid values are described in the "RDL Intensity Measure" code list
|`event`|`String`|`OPTIONAL`|Associates this resource with an event. The value should match the value of an `id` attribute of in the `event` array. This associates this footprint with that specific event. IF the package contains multiple event, then this property is `REQUIRED`. See "Associating Footprints with Events" below
|`title`|`String`|`OPTIONAL`|A title for the footprint
|`epsg`|`String`|`OPTIONAL`|Describes the spatial reference used in the data. Values should be taken from [the EPSG registry](https://epsg.org/home.html)
|`data_uncertainty`|`String`|`OPTIONAL`|Comments about the uncertainty of the data

A Hazard Data Package resource `MUST NOT` include a `data` property. Hazard Data Packages do not support "inline data" in the descriptor. Resources `MUST` be provided as additional files accessible in the file system or via a URL using the `path` property.

A resource in a Hazard Data Package `MUST` be a description of the geographic extent of
a hazard. E.g. a Footprint as defined in the Risk Data Library data model.

Resources that have the same values for the `process_type`, `imt` and `data_uncertainty` fields can be considered to be part of the same Footprint Set.

### Associating Footprints with Events

The resources in a Hazard Data Package describe the Footprints for the Hazard associated with an Event.

If there is a single element in the `events` array and the resources do not have a `event` property, then applications processing this package should assume that the Footprints are associated with that single Event.

However if there are multiple Event descriptors in the `event` array, then resources `MUST` have an `event` property whose value matches an `id` for one of the events.

### File system paths and folders

Resource files `MAY` be organised across different sub-folders contained in the data package.

For example, the following example shows two resources. One is present in the same folder as
the data package descriptor, the other in a sub-folder.

```
  "resources": [
    {
      "name": "f1.tif",
      "path": "tiffs/f1.tif",
    },
    {
      "name": "fp2.tif",
      "path": "gpkg/fp1.gpkg",
    }
  ]
```

When referencing a Shapefile, then the resource path `MUST` only include the main file that stores the feature geometry (`*.shp`).

Applications processing data packages containing Shapefiles `MUST` ensure they handle all the supporting files when storing or indexing data.

## Including additional metadata

A Hazard Data Package `MAY` include additional metadata elements. These `MAY` be provided as
extra properties associated with the dataset, an event, a resource or other elements of the
data package.

Applications that process Hazard Data Package metadata `SHOULD` ignore any metadata elements they do not understand. But they `SHOULD` aim to preserve this metadata, e.g. when copying and storing descriptors. This helps to facilitate useful extensions to the core format.

Additional metadata properties `SHOULD` be drawn from existing metadata standards wherever possible. This includes drawing on additional metadata properties defined in the Data Package specification, or standards such as [GeoDCAT](https://semiceu.github.io/GeoDCAT-AP/releases/).

## Notes on mapping to other standards and models

This is a non-normative section of the specification. It provides brief
notes converting or mapping a Hazard Data Package into other data models and standards.

### Mapping to DCAT

* A hazard data package is a `dcat:Dataset`
* A resource is a `dcat:Distribution`

See [example in this issue](https://github.com/GFDRR/rdl-jkan/issues/14)
