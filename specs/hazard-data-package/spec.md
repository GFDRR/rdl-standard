# Hazard Data Package

The Hazard Data Package is a lightweight format that supports the publication, exchange 
and use of [hazard data](https://gfdrr.github.io/rdl-docs/keyconcepts.html).

It is part of [the framework of standards](https://gfdrr.github.io/rdl-docs/standards.html) 
developed and recommended by the [Risk Data Library project](http://riskdatalibrary.org/).

## Status

* Initial Working Draft

## Language

The key words `MUST`, `MUST NOT`, `REQUIRED`, `SHALL`, `SHALL NOT`, `SHOULD`, 
`SHOULD NOT`, `RECOMMENDED`, `MAY`, and `OPTIONAL` in this document are to be 
interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt)

## Introduction

There are no widely adopted standards to support the consistent publication, exchange 
and use of risk data. This makes it hard to share, find and reuse data across 
disaster risk analysis projects.

The [Risk Data Library project](http://riskdatalibrary.org/) project is attempting to address this issue by developing 
and recommending a consistent set of open standards for data.

Risk data consists of data about hazards, the exposure of people and assets to 
those hazards and their vulnerability. Analysis of those data allows projects of 
potential impact that can inform disaster risk management and reduction.

This specification defines a lightweight format for describing Hazard data sets.

It builds on existing open standards to provide a simple, but consistent 
way of describing a range of different types of hazard, including floods, 
earthquakes and wildfires.

## Use cases and scope

This specification is intended to support the following use cases:

* publication and sharing of hazard data between people, projects and organisations
* capturing contextual data necessary to support the proper interpret and use hazard data
* support the cataloguing, management and archiving of hazard data from multiple sources

The specification aims to make it easy to create and maintain metadata. It should be 
possible to quickly turn any collection of hazard data files into a Hazard Data Package.

With this in mind, the specification does not attempt to define a single standard data format for geospatial data, or enforce a specific approach for organising data files.

However the Risk Data Library [recommends the adoption of specific standards](https://gfdrr.github.io/rdl-docs/standards.html) to further improve interoperability of data.

## Terminology

## What is a data package?

A data package is a simple container format used to describe and package a 
dataset. 

It consists of:

* a __descriptor__: a file that contains metadata describing how the data was produced and its important characteristics such as the format, spatial coverage, time of creation, etc
* __resources__: one or more data files that contain the actual data

## What is a hazard data package?

A hazard data package is a data package that contains data describing physical 
hazards, such as earthquakes, wildfires and floods. 

The metadata for a Hazard Data Package will include the elements described in [the 
Risk Data Library conceptual model for Hazard Data](https://gfdrr.github.io/rdl-docs/hazard.html).

This metadata will include a description of the event, e.g. its type, how often it occurs and how it 
is triggered. 

Accompanying this metadata will be one or more spatial data files that describe 
the footprint for the hazard. 

This spatial data might be represented in a number of different formats, including 
GeoTIFF, Shapefiles or GeoPackages.

## Hazard Data Package Descriptors

A Hazard Data Package is an extension of the [Data Package](https://specs.frictionlessdata.io/data-package/) 
specification.

Any valid Hazard Data Package will also be a valid Data Package. This means that 
it:

* `MUST` be a valid JSON object
* `MUST` be stored in a file called `datapackage.json`
* `MUST` be contained in the top-level directory, relative to the resources that are part of the package
* `MUST` contain a `resources` property that describes the data resources (see section on "Hazard Data Package Resources")
* `MAY` contain additional metadata properties

However, to encourage consistent descriptions of Hazard datasets this specification 
imposes additional requirements. These consist of additional requirements to:

* include basic metadata about the dataset. Some of these are only recommended by the original Data Package specification
* include information about the spatial coverage of the dataset, to support discovery and indexing
* describe the event(s) whose footprint(s) are described within the dataset

These are described in the following sections.

### Required Data Package metadata properties

A Hazard Data Package `MUST` include the following [metadata properties defined in the 
[Data Package specification](https://specs.frictionlessdata.io/data-package/#metadata). 

* `profile` - which must be the string `hazard-data-package`
* `name` - to provide a short url-usable name for the package
* `id` - a globally unique identifier for the package, e.g. a UUID
* `title` - the title of the dataset
* `description` - a description of the package
* `licenses` - at least one license that describes the licence and/or terms of use for the dataset. The licence object `MUST` have both a `name` and a `path` property

For full definitions of those properties review the [Data Package specification](https://specs.frictionlessdata.io/data-package/#metadata).

### Describing spatial coverage

* `MUST` include spatial coverage
* `MAY` use one of several formats, as follows?


```
  "spatial": [ "Afghanistan" ]
```

```
  "spatial": {
    "bbox": {
      "north": -5.710,
      "south": -6.571,
      "east": 39.599,
      "west": 39.093,
      "epsg_code": "4326"
    }
  }
```

### Describing Footprints

The RDL data model defines several properties which help to define how footprints 
have been generated. A Hazard Data Package descriptor 
`MAY` include the following additional properties

TODO - which fields are required?

```
  "process_type": "QGM",
  "imt": "PGA:g",
  "data_uncertainty": "",
```

### Describing events

* `MUST` include at least one event
* `MUST` include core set of fields about event
* `MAY` include optional elements

```
  "event": [{
    "id": "...",
    "description": "",
    "calculation_method": "SIM3",
    "frequency": 0.01,
    "occurence": {
      "time_start": "...",
      "time_end": "..."
    },
    "trigger": {
      "hazard_type": "...",
      "process_type": "...",
      "event_id": "",
    },
    "eventset": {
      "id": "...",
      "geographic_area_name": "Zanzibar",
      "creation_date": "2016-01-01",
      "hazard_type": "...",
      "start_date": "2016-01-01",
      "end_date": "2016-12-31",
      "duration":"",
      "is_prob": true,
    }
  ]
  },
```

#### Collections of events (Event Sets)

TODO

### Additional optional metadata

Additional metadata properties `MAY` be included within a Hazard Data Package. 

Applications that process Hazard Data Package metadata `SHOULD` ignore any metadata 
elements they do not understand and `SHOULD` aim to preserve any metadata, e.g. when 
copying and storing descriptors. This helps to facilitate useful extensions to the 
core format.

Additional metadata properties `SHOULD` be drawn from existing metadata standards 
wherever possible. 

Recommended additions?:

* `contactPoint`?
* `project`?

## Hazard Data Package Resources (Footprints)

`MUST` be a valid [Data Package](https://specs.frictionlessdata.io/data-resource/#language) resource

Specifically, to be a valid Hazard Data Package resource it

* `MUST` have `path` which is a url or path.
* `MUST` have a valid `name` attribute
* `MUST` have a `format` and/or `mediatype`?
* `MUST NOT` include `data` element, as a Hazard Data Package does not support "inline data" in 
the descriptor

It `MAY` have other elements from Data Package specification, e.g. `encoding`, `bytes`, etc.

In addition it `MAY`(?) also have following items from RDL data model:

* `intensity`
* `uncertainty_2nd_moment`
* ...

Files `MAY` be organised across different folders as required. Where formats include 
multiple files, e.g. a Shapefile then the package `MUST` list all of them?

```
  "resources": [
    {
      "name": "fp1.tif",
      "path": "fp1.tif",
      "title": "...",
      "encoding": "ISO-8859-1",
      "format": "geotiff",
      "intensity": "...",
      "uncertainty_2nd_moment": "..."
    },
    {
      "name": "fp2.tif",
      "path": "fp2.tif",
      "title": "...",
      "encoding": "ISO-8859-1",
      "format": "geotiff",
      "intensity": "...",
      "uncertainty_2nd_moment": "..."
    }
  ]
```



