# Schema

The schema provides the authoritative definition of the structure of Risk Data Library Standard (RDLS) data, the meaning of each field, and the rules that must be followed to publish RDLS data. It is used to validate the structure and format of RDLS data.

For this version of RDLS, the canonical URL of the schema is \[\]\](). Use the canonical URL to make sure that your software, documentation or other resources refer to the specific version of the schema with which they were tested.

This page presents the schema in an [interactive browser](#browser) and in [reference tables](#reference-tables) with additional information in paragraphs. You can also download the canonical version of the schema as [JSON Schema](../../schema/rdl_schema_0.1.json) or download it as a CSV spreadsheet \[TODO\].

```{note}
   If any conflicts are found between the text on this page and the text within the schema, the text within the schema takes precedence.
```

## Browser

Click on schema elements to expand the tree, or use the '+' icon to expand all elements. Use { } to view the underlying schema for any section. Required fields are indicated in **bold**.

<script src="../../_static/docson/widget.js" data-schema="../rdl_schema_0.1.json"></script>

## Reference tables

### Dataset

In addition to schema-specific attributes, each dataset is identified by a list of attributes based on the [Dublin Core Metadata Initiative Metadata Terms](https://www.dublincore.org/specifications/dublin-core/dcmi-terms). Other attributes are specific to individual resources, covering level of aggregation, resolution and format.

```{jsonschema} ../../schema/rdl_schema_0.1.json
---
addtargets:
---
```

### Resource

Other attributes are specific to individual resources, covering level of aggregation, resolution and format.

```{jsonschema} ../../schema/rdl_schema_0.1.json
---
pointer: /$defs/Resource
collapse:
addtargets:
---
```

### Hazard

The hazard schema stores data about the intensity and occurrence probability of physical hazard phenomena such as floods, earthquakes, wildfires or others. The specific hazard process can be defined and measured with a specific intensity unit. For example, earthquake hazard may be represented as ground shaking, liquefaction or ground displacement.

```{eval-rst}
 .. mermaid::

  classDiagram
      Event set -- Event1
      Event set -- Event2
      Event set: Hazard type
      Event set: Analytical method
      class Event1{
        Occurrence frequency
        Time reference
        Hazard trigger
      }
      class Event2{
        Occurrence frequency
        Time reference
        Hazard trigger
      }
      Event1 -- Footprint1
      Event1 -- Footprint2
      Event2 -- Footprint3
      Event2 -- Footprint4
      class Footprint1{
        Hazard process
        Intensity measure
        Uncertainty
      }
      class Footprint2{
        Hazard process
        Intensity measure
        Uncertainty
      }
      class Footprint3{
        Hazard process
        Intensity measure
        Uncertainty
      }
      class Footprint4{
        Hazard process
        Intensity measure
        Uncertainty
      }
```



`````{tab-set}

````{tab-item} Schema

```{jsonschema} ../../schema/rdl_schema_0.1.json
---
pointer: /anyOf/0/properties/hazard
collapse:
addtargets:
---
```

````

````{tab-item} Examples

**Flood hazard maps for Kabul**

Schema attributes for flood hazard map related to occurrence probability of a river flood event with a return period of once in 100 years over Kabul, Afghanistan. The hydrological data used for modelling the intensity of floods is derived from observations over the period 1958-2001 (44 years). The hazard intensity is measured as water depth, in meters. These information cover all mandatory fields, and few optional fields.

![Screenshot](../img/hzd_fl_kabul.jpg)

| **Required** | **Attribute**           | **Example**     |
| :----------: | ----------------------- | --------------- |
|      \*      | Hazard type             | Flood           |
|      \*      | Analysis type           | Probabilistic   |
|      \*      | Calculation method      | Simulated       |
|              | Geographic area         | Kabul           |
|              | Frequency type          | Return Period   |
|              | Occurrence probability  | 100 years       |
|              | Occurrence time (start) | 1958            |
|              | Occurrence time (end)   | 2001            |
|              | Occurrence time (span)  | 44 years        |
|      \*      | Hazard process          | River flood     |
|      \*      | Unit of measure         | Water depth (m) |

**Earthquake hazard maps for Afghanistan**

Schema attributes for earthquake hazard map related to occurrence probability of an event with return period of  once in 1000 years over Afghanistan. The seismic data catalogue behind the calculation of occurrence probability start from year 800, covering a period of 1200 years. The hazard intensity is measured as Peak Ground Acceleration, expressed in (g).

![Screenshot](../img/hzd_eq_afg.jpg)

| **Required** | **Attribute**           | **Example**   |
| :----------: | ----------------------- | ------------- |
|      \*      | Hazard type             | Earthquake    |
|      \*      | Analysis type           | Probabilistic |
|      \*      | Calculation method      | Simulated     |
|              | Frequency type          | Return Period |
|              | Occurrence probability  | 1000 years    |
|              | Occurrence time (start) | 800           |
|              | Occurrence time (end)   | 2001          |
|              | Occurrence time (span)  | 1200 years    |
|      \*      | Hazard process          | Ground motion |
|      \*      | Unit of measure         | PGA (g)       |


````

`````

The hazard schema specifies which type of analysis and data methodology that has generated the dataset. It supports either simulated probabilistic scenarios and empirical observations. If the dataset has been produced for a specific location, such a city, the name of the location can be included.

When the scenario modelled refers to a specific period of time, this can be specified in terms of dates, period span and reference year. For example, an observed flood event that occurred from 1.10.2009 (time start) to 3.10.2009 (time end), spanning over 3 days (time span). When precise time collocation is unknown or not applicable, a general reference date such as "2009" is used to identify events (time year). This is also useful to specify future scenario, e.g. time year: 2050.

When instead the hazard scenario is represented in probabilistic terms, the occurrence probability (frequency distribution) of hazard can be expressed in different ways. The most common way to communicate this is the "return period", expressed as the number of years after which a given hazard intensity could occur again: RP 100 indicates that that event has a probability of once in 100 years. This attribute can indicate individual layer frequency (RP100) or a range of frequencies for a collection of layers (RP10-100) The probability of occurrence is usually calculated on the basis of a reference period that provides observations: this period can be specified by start date, end date and time span. For example, an analysis of earthquake frequency based on seismic observations from 1934 (occurrence time start) to 2001 (occurrence time end), for a total count of 66 years (occurrence time span).

The schema distinguish between the hazard and process represented and the hazard and process identified as the cause, or concause for the manifestation of the represented hazard. For example, a dataset represent landslide hazard that is triggered by an earthquake will have Hazard type: Landslide; Trigger hazard type: Earthquake. The unit of measure refers to the represented hazard and process. A description can be added to cover additional information not included in the schema.

The hazard dataset could include one or more footprints for the same event, where each is one possible realisation (i.e. one footprint could represent minimum, another footprint the average and another one the maximum). The event uncertainty can be represented explicitly, through the inclusion of multiple footprints per event.

Hazard data are most often represented by geospatial grids (raster); sometimes they are represented by points or polygons.

### Exposure

```{jsonschema} ../../schema/rdl_schema_0.1.json
---
pointer: /anyOf/1/properties/exposure
collapse:
addtargets:
---
```

### Vulnerability

```{jsonschema} ../../schema/rdl_schema_0.1.json
---
pointer: /anyOf/2/properties/vulnerability
collapse:
addtargets:
---
```

### Loss

```{jsonschema} ../../schema/rdl_schema_0.1.json
---
pointer: /anyOf/3/properties/loss
collapse:
addtargets:
---
```

### Sub-schemas

#### common_aggregation_type

```{jsonschema} ../../schema/rdl_schema_0.1.json
---
pointer: /$defs/common_aggregation_type
collapse:
addtargets:
---
```
