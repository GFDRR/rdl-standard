# Codelists

Some fields in the metadata standard refer to codelists to promote data interoperability. Codelists limit and standardise the possible values of the fields.

Codelists can either be open or closed:

* **Closed codelists** are intended to be comprehensive; for example, the currency codelist covers all currencies in the world.
* **Open codelists** are intended to be representative, but not comprehensive.

Publishers must use the codes in the codelists, unless no code is appropriate. If no code is appropriate and the codelist is **open**, then a publisher may use a new code outside those in the codelist. If no code is appropriate and the codelist is **closed**, then a publisher should instead create an issue in the [RDLS GitHub repository](https://github.com/GFDRR/rdl-standard/issues).

```{admonition} Extending open codelists
---
class: Tip
---
If you use new codes outside those in an open codelist, please create an issue in the [RDLS GitHub repository](https://github.com/GFDRR/rdl-standard/issues), so that the codes can be considered for inclusion in the codelist.
```

The [schema](index.md) has a `codelist` property to indicate the CSV file that defines the codes in the codelist (shown as tables below). It also has an `openCodelist` property, to indicate whether the codelist is open or closed.

Codes are case-sensitive, and are generally provided as English language camelCase. Codes must not be translated.

## Open codelists

### classification_scheme

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/classification_scheme.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/classification_scheme.csv
```

````

### conforms_to

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/conforms_to.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/conforms_to.csv
```

````

### damage_scale_name

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/damage_scale_name.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/damage_scale_name.csv
```

````

### engineering_demand_parameter

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/engineering_demand_parameter.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/engineering_demand_parameter.csv
```
````

### impact_metric

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/impact_metric.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/impact_metric.csv
```
````

### IMT

The IMT codelist defines intensity measures and the hazard types to which each intensity measure applies.

````{dropdown} Codes

```{button-link} ../../codelists/open/IMT.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/IMT.csv
```
````

````{seealso}

For validation puropses, separate codelists for each hazard type are also provided below: 

```{contents} 
---
local:
depth: 1
---
```

````

#### imt_coastal_flood

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_coastal_flood.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_coastal_flood.csv
```
````

#### imt_convective_storm

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_convective_storm.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_convective_storm.csv
```
````

#### imt_drought

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_drought.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_drought.csv
```
````

#### imt_earthquake

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_drought.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_drought.csv
```
````

#### imt_extreme_temperature

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_extreme_temperature.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_extreme_temperature.csv
```
````

#### imt_flood

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_flood.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_flood.csv
```
````

#### imt_landslide

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_landslide.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_landslide.csv
```
````

#### imt_strong_wind

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_strong_wind.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_strong_wind.csv
```
````

#### imt_tsunami

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_tsunami.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_tsunami.csv
```
````

#### imt_volcanic

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_volcanic.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_volcanic.csv
```
````

#### imt_wildfire

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/imt_wildfire.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/imt_wildfire.csv
```
````

### license

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/license.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/license.csv
```
````

### location_gazetteers

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/location_gazetteers.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/location_gazetteers.csv
```
````

### media_type

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/media_type.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/media_type.csv
```
````

### quantity_kind

```{seealso}
[units](#units)
```

The quantity kind codelist is a subset of the codes in the [QUDT Quantity Kind Vocabulary](https://www.qudt.org/doc/DOC_VOCAB-QUANTITY-KINDS.html). It includes a code for the [currency quantity kind](https://qudt.org/vocab/quantitykind/Currency), which does not appear in the vocabulary because QUDT lists currencies in a separate graph from other quantity kinds.

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/quantity_kind.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/quantity_kind.csv
```
````

### roles

The roles codelist is based on the [ISO19115 CI_RoleCode codelist](https://standards.iso.org/iso/19115/resources/Codelists/gml/CI_RoleCode.xml) with the addition of 'world_bank_team_lead' and the omission of codes covered by the `creator`, `contact_point` and `publisher` fields.

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/roles.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/roles.csv
```
````

### units

For validation purposes, a separate unit codelist for each [quantity kind](#quantity_kind) is provided:

```{contents} 
---
local:
depth: 1
---
```

Each codelist is a subset of the codes in the [QUDT Unit Vocabulary](https://www.qudt.org/doc/DOC_VOCAB-UNITS.html).

```{seealso}

[unit_currency](#unit_currency) (closed codelist)

```

#### unit_area

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/unit_area.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_area.csv
```
````

#### unit_count

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/unit_count.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_count.csv
```
````

#### unit_dimensionless_ratio

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/unit_dimensionless_ratio.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_dimensionless_ratio.csv
```
````

#### unit_length

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/unit_length.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_length.csv
```
````

#### unit_mass

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/unit_mass.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_mass.csv
```
````

#### unit_mass_per_area

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/unit_mass_per_area.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_mass_per_area.csv
```
````

#### unit_time

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/unit_time.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_time.csv
```
````

#### unit_volume

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/unit_volume.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_volume.csv
```
````

## Closed codelists

### analysis_type

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/analysis_type.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/analysis_type.csv
```
````

### climate_scenario

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/climate_scenario.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/climate_scenario.csv
```
````

### country

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/country.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/country.csv
```
````

### data_calculation_type

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/data_calculation_type.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/data_calculation_type.csv
```
````

### exposure_category

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/exposure_category.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/exposure_category.csv
```
````

### frequency_distribution

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/frequency_distribution.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/frequency_distribution.csv
```
````

### function_approach

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/function_approach.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/function_approach.csv
```
````

### hazard_type

The RDLS offers a classification of hazards that are more often required in disaster risk assessments, based on the review and mapping of existing alternative definitions into one consistent framework. For more information, see [hazard taxonomies](../rdl/other-standards.md#hazard-taxonomies).

The hazard_type codelist classifies hazard phenomena by the main hazard to which they relate. Hazard phenomena can also be classified by the hazard process to which they relate. For more information, see the [process_type codelist](#process_type).

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/hazard_type.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/hazard_type.csv
```
````

### impact_type

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/impact_type.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/impact_type.csv
```
````

### loss_type

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/loss_type.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/loss_type.csv
```
````

### metric_dimension

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/metric_dimension.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/metric_dimension.csv
```
````

### process_type

The process_type codelist classifies hazard phenomena by the hazard process to which they relate. Hazard phenomena can also be the main hazard to which they relate. For more information, see the [hazard_type codelist](#hazard_type). Process types are based primarily on the [UNDRR Hazard terminology](https://www.undrr.org/publication/hazard-definition-and-classification-review-technical-report).

This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/process_type.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/process_type.csv
```
````

### relationship_type

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/relationship_type.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/relationship_type.csv
```
````

### risk_data_type

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/risk_data_type.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/risk_data_type.csv
```
````

### seasonality

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/seasonality.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/seasonality.csv
```
````

### source_type

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/source_type.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/source_type.csv
```
````

### spatial_scale

This codelist has the following codes:

````{dropdown} Codes
---
open:
---

```{button-link} ../../codelists/open/spatial_scale.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/spatial_scale.csv
```
````

### unit_currency

```{seealso}
[units](#units)

```
This codelist has the following codes:

````{dropdown} Codes

```{button-link} ../../codelists/open/unit_currency.csv
:color: primary
:shadow:
Download CSV file
```

```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/unit_currency.csv
```
````
