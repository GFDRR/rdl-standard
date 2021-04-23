# Hazard Data Package

The Hazard Data Package is a lightweight format that supports the publication, exchange
and use of [hazard data](https://gfdrr.github.io/rdl-docs/keyconcepts.html).

It is part of [the framework of standards](https://gfdrr.github.io/rdl-docs/standards.html) developed and
recommended by the [Risk Data Library project](http://riskdatalibrary.org/).

## Status

* Initial Working Draft

## Language

The key words `MUST`, `MUST NOT`, `REQUIRED`, `SHALL`, `SHALL NOT`, `SHOULD`, `SHOULD NOT`, `RECOMMENDED`, `MAY`, and `OPTIONAL`
in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt)

## Introduction

There are no widely adopted standards to support the consistent publication, exchange and use of
risk data. This makes it hard to share, find and reuse data across disaster risk analysis projects.

The [Risk Data Library project](http://riskdatalibrary.org/) project is tackling this
issue by developing and recommending a consistent set of open standards for risk data.

Risk data consists of data about hazards, the exposure of people and assets to those hazards and
their vulnerability. Analysis of those data allows projects of potential impact that can
inform disaster risk management and reduction.

This specification defines a lightweight format for describing Hazard datasets.

It builds on existing open standards to provide a simple, consistent and flexible approach for
describing Hazard datasets that describe a range of different types of hazard (e.g. floods and wildfires) can
can beasily be adopted by different organisations.

## Use cases and scope

This specification is intended to support the following use cases:

* the publication and sharing of hazard data between people, projects and organisations
* describing the contextual data necessary to support the proper interpretation and use hazard data
* supporting the cataloguing, management and archiving of hazard data from multiple sources

The specification aims to make it easy to create and maintain metadata, making it possible to
easily turn any collection of hazard data files into a Hazard Data Package.

With this in mind, the specification does not attempt to define a single standard data format for
geospatial data. Or enforce a specific approach for organising data files. It does however
define some basic metadata which is essential to the exchange of Hazard data.

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

A Hazard Data Package is a data package containing data that describes the impact of
a physical hazard. Earthquakes, wildfires and floods are all examples of hazards.

A hazard is triggered by an __Event__. An event occurs in a specific location and might take place
at a specific time or with recurring frequency (e.g. seasonal flooding).

Related __Events__ that occur in the same location, or within a specific time window are known
as an __Event Set__. A Hazard Data Package only contains data about a single __Event Set__.

A hazard will have some impact on the surrounding environment over a geographic area known
as its __Footprint__. Different simulations of a Hazard might generate different
Footprints (a __Footprint Set__) depending on the type and parameters of the simulation.

For a more detailed review of this core model, refer to [the Risk Data Library conceptual model for
Hazard Data](https://gfdrr.github.io/rdl-docs/hazard.html).

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

To encourage consistent descriptions of Hazard datasets a Hazard Data Package descriptor will
include some additional metadata. Some of this metadata is required for the data package to be
valid.

The additional elements include:

* required metadata that describes the hazard dataset. Some of these properties are only recommended by the original Data Package specification, but are considered to be required in a Hazard Data Package descriptor
* a description of the Event(s), Hazard and Footprint(s) that are included in the dataset

These requirements are described in the following sections.

### Required dataset metadata properties

A Hazard Data Package `MUST` include the following metadata properties defined in the [Data Package specification](https://specs.frictionlessdata.io/data-package/#metadata).

#### Profile declaration

A Hazard Data Package `MUST` declare itself as conforming to this specification. This
allows applications to validate and process the package correctly

The data package descriptor `MUST` have a `profile` attribute whose value `MUST` be
the string `hazard-data-package`.

#### Basic required metadata

The following basic metadata fields of a data package are all required:

* `id` - a globally unique identifier for the package, e.g. a UUID
* `name` - which provids a short url-usable name for the package
* `title` - the title of the dataset
* `description` - a description of the package
* `licenses` - an array of licences objects that describe the licence and/or terms of use for the dataset. The licence object `MUST` have both a `name` and a `path` property.

For full definitions of those properties see the [Data Package specification](https://specs.frictionlessdata.io/data-package/#metadata).

#### Spatial metadata

A Hazard Data Package descriptor `MUST` also describe the overall spatial coverage of the dataset by including a `spatial` property.

The value of this property `MUST` be an array containing one or more ISO 3-letter country
codes. For example:

```
  "spatial": [ "AFG" ]
```

### Event Sets and Events

A Hazard Data Package describes a single set of events that cause a hazard.

#### Collections of events (Event Sets)

A Hazard Data Package `MUST` include an `eventset` property whose valid is a
JSON object, an Event Set descriptor, that describes the circumstances in
which a hazard occurs.

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

The Event Set descriptor 'MUST' have the following properties:

* `hazard_type` -- which identifies the type of hazard. Valid values for the `hazard_type` property are defined by the RDL Hazard Type Code list.
* `process_type` -- which identifies the type of analysis used to generate the Footprints. Valid values for the `process_type` property are defined by the RDL Process Type Code List.

An Event Set descriptor `MAY` have the following additional properties:

* `id` -- a unique identifier for the Event Set. E.g. a UUID
* `spatial` -- an names of spatial areas covered by the hazards
* `start_date` -- the datetime at which the modelled scenarios start
* `end_date` -- the datetime at which the modelled scenarios start
* `year` -- the reference year to which the modelled scenario refers
* `time_span` -- the extent of the time period covered by the events included in the current scenario hazard analysis [ISO 8601 format]

### Describing events

A Hazard Data Package descriptor must have an `event` property whose value is an
array of Event descriptors.

The array `MUST` contain at least one descriptor. It `MAY` contain multiple Event descriptors.

```
  "event": [{
    "id": "...",
    "description": "",
    "calculation_method": "...",
    "frequency_type": "...",
    "return_period": [ ... ]
    "occurence": {
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

An Event descriptor is a JSON object that `MUST` contain the following fields:

* `id` -- a unique identifier for the Event, e.g. a UUID.
* `calculation_method` -- A description of how this Event was generated, e.g. observed or simulated. Valid values are defined by the RDL Calculation Method Code List
* `frequency` / `frequency_type`

It `MAY` also contain the following fields:

* `description` -- provides a human-readable description of the event
* `return_period` -- the probability of the event occuring expressed as an array of return periods ("10", "100", "1000") or as a single string specifying a range (10-1000)
* `occurence` -- a JSON object with `start_date` and `end_date` field that describe the datetimes during which the event occurs
* `trigger` -- a JSON object that describes the `hazard_type`, `process_type` or `event` that triggers the hazard

#### Associating Footprints with Events

The resources in a Hazard Data Package describe the Footprints for the Hazard associated with an Event.

If there is a single element in the `event` array and the resources do not have a `event_id` property,
then applications processing this package should assume that the Footprints are associated with
that single Event.

However if there are multiple Event descriptors in the `event` array, then resources `MUST` have
an `event` property whose value matches an `id` for one of the events.

### Additional optional metadata

Additional metadata properties `MAY` be included within a Hazard Data Package.

Applications that process Hazard Data Package metadata `SHOULD` ignore any metadata
elements they do not understand and `SHOULD` aim to preserve any metadata, e.g. when
copying and storing descriptors. This helps to facilitate useful extensions to the
core format.

Additional metadata properties `SHOULD` be drawn from existing metadata standards
wherever possible.

Recommended additions?:

* `contactPoint` -- relevant contact details for a person or organisation that is responsible for the dataset

## Hazard Data Package Resources (Footprints)

A resource in a Hazard Data Package `MUST` be a valid [Data Package](https://specs.frictionlessdata.io/data-resource/#language) resource,
with some additional limitations.

Specifically a resource description:

* be a valid JSON object, contained in the `resources` array of the package
* `MUST` have a valid `name` attribute
* `MUST` have `path` which is a url or path.
* `MUST` have a `mediatype` property that specifies the IANA media type of the resource
* `MUST NOT` include a `data` element. Hazard Data Packages do not support "inline data" in
the descriptor. Resources `MUST` be provided as additional files accessible in the file system or via a URL.

A resource in a Hazard Data Package `MUST` be a description of the geographic extent of
a hazard. E.g. a Footprint as defined in the Risk Data Library data model.

A resource `MUST` have the following additional properties:

* `process_type` -- type of hazard process modelled. Valid values for the `process_type` property are defined by the RDL Process Type Code List.
* `imt` -- the intensity measure. Valid values are described in the RDL Intensite Measure

A resource `MAY` have the following additiona; properties:

* `event_id` -- the value of the `id` attribute in the `event` array. This associates the footprint with a specific event
* `title` -- a title for the footprint
* `epsg` -- the spatial reference used in the data file
* `data_uncertainty` -- Comments about the uncertainty of data

Resources that have the same values for the `process_type`, `imt` and `data_uncertainty`
fields can be considered to be part of the same Footprint Set.

The resource description `MAY` include other metadata elements, as defined in the Data Package
specification, e.g. `encoding`, `bytes`, etc.

### File system paths and folders

Resource files `MAY` be organised across different folders as required.

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

When referencing a Shapefile, then the resource path `MUST` only include the main file that
stores the feature geometry (`*.shp`). Applications processing data packages containing Shapefiles `MUST` ensure they handle all the supporting files
when storing or indexing data.

## Notes on mapping to other standards and models

Some notes about converting or mapping a Hazard Data Package into other data models and standards.

## Mapping to the Risk Data Library conceptual model

TODO.

* A hazard data package is a dataset/contribution
* It describes an Event set, see `eventset`
* It lists one or more Events which are part of that Event Set
* Each resource is a Footprint
* Resources with consistent values for some properties can be inferred to be part of the same Footprint Set

## Mapping to DCAT

TODO. See [example in this issue](https://github.com/GFDRR/rdl-jkan/issues/14)

* A hazard data package is a `dcat:Dataset`
* A resource is a `dcat:Distribution`
