# Codelists

Some schema fields refer to codelists, to limit and standardise the possible values of the fields, in order to promote data interoperability.

Codelists can either be open or closed. **Closed codelists** are intended to be comprehensive; for example, the currency codelist covers all currencies in the world. **Open codelists** are intended to be representative, but not comprehensive.

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

### IMT

This codelist is referenced by the following properties:

- [`Hazard/intensity_measure`](rdls_schema.json,/$defs/Hazard,intensity_measure)
- [`Footprint/intensity_measure`](rdls_schema.json,/$defs/Footprint,intensity_measure)
- [`Function/intensity_measure`](rdls_schema.json,/$defs/Function,intensity_measure)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/IMT.csv
```
````

### classification_scheme

This codelist is referenced by the following properties:

- [`Classification/scheme`](rdls_schema.json,/$defs/Classification,scheme)
- [`Function/taxonomy`](rdls_schema.json,/$defs/Function,taxonomy)
- [`SocioEconomicIndex/scheme`](rdls_schema.json,/$defs/SocioEconomicIndex,scheme)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/classification_scheme.csv
```
````

### damage_scale_name

This codelist is referenced by the following properties:

- [`Damage_scale_states_names/damage_scale_name`](rdls_schema.json,/$defs/Damage_scale_states_names,damage_scale_name)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/damage_scale_name.csv
```
````

### data_formats

This codelist is referenced by the following properties:

- [`Resource/format`](rdls_schema.json,/$defs/Resource,format)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/data_formats.csv
```
````

### engineering_demand_parameter

This codelist is referenced by the following properties:

- [`Engineering_demand_parameter/parameter`](rdls_schema.json,/$defs/Engineering_demand_parameter,parameter)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/engineering_demand_parameter.csv
```
````

### impact_metric

This codelist is referenced by the following properties:

- [`Impact/metric`](rdls_schema.json,/$defs/Impact,metric)
- [`Function/impact_metric`](rdls_schema.json,/$defs/Function,impact_metric)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/impact_metric.csv
```
````

### license

This codelist is referenced by the following properties:

- [`license`](rdls_schema.json,,license)
- [`Source/license`](rdls_schema.json,/$defs/Source,license)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/license.csv
```
````

### location_gazetteers

This codelist is referenced by the following properties:

- [`Gazetteer_entry/scheme`](rdls_schema.json,/$defs/Gazetteer_entry,scheme)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/location_gazetteers.csv
```
````

### media_type

This codelist is referenced by the following properties:

- [`Resource/media_type`](rdls_schema.json,/$defs/Resource,media_type)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/media_type.csv
```
````

### quantity_kind

The quantity kind codelist is a subset of the codes in the [QUDT Quantity Kind Vocabulary](https://www.qudt.org/doc/DOC_VOCAB-QUANTITY-KINDS.html). It includes a code for the [currency quantity kind](https://qudt.org/vocab/quantitykind/Currency), which does not appear in the vocabulary because QUDT lists currencies in a separate graph from other quantity kinds.

This codelist is referenced by the following properties:

- [`Measurement/quantity_kind`](rdls_schema.json,/$defs/Measurement,quantity_kind)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/quantity_kind.csv
```
````

### roles

The roles codelist is based on the [ISO19115 CI_RoleCode codelist](https://standards.iso.org/iso/19115/resources/Codelists/gml/CI_RoleCode.xml) with the addition of 'world_bank_team_lead' and the omission of codes covered by the `creator`, `contact_point` and `publisher` fields.

This codelist is referenced by the following properties:

- [`Attribution/role`](rdls_schema.json,/$defs/Attribution,role)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/roles.csv
```
````

### unit_area

The area codelist is a subset of the codes in the [QUDT Unit Vocabulary](https://www.qudt.org/doc/DOC_VOCAB-UNITS.html), applicable to the area [quantity kind](#quantity_kind).

This codelist is referenced by the following properties:

- [`Measurement/unit`](rdls_schema.json,/$defs/Measurement,unit)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_area.csv
```
````

### unit_count

The area codelist is a subset of the codes in the [QUDT Unit Vocabulary](https://www.qudt.org/doc/DOC_VOCAB-UNITS.html), applicable to the count [quantity kind](#quantity_kind).

This codelist is referenced by the following properties:

- [`Measurement/unit`](rdls_schema.json,/$defs/Measurement,unit)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_count.csv
```
````

### unit_dimensionless_ratio

The area codelist is a subset of the codes in the [QUDT Unit Vocabulary](https://www.qudt.org/doc/DOC_VOCAB-UNITS.html), applicable to the dimensionless ratio [quantity kind](#quantity_kind).

This codelist is referenced by the following properties:

- [`Measurement/unit`](rdls_schema.json,/$defs/Measurement,unit)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_dimensionless_ratio.csv
```
````

### unit_length

The area codelist is a subset of the codes in the [QUDT Unit Vocabulary](https://www.qudt.org/doc/DOC_VOCAB-UNITS.html), applicable to the length [quantity kind](#quantity_kind).

This codelist is referenced by the following properties:

- [`Measurement/unit`](rdls_schema.json,/$defs/Measurement,unit)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_length.csv
```
````

### unit_mass

The area codelist is a subset of the codes in the [QUDT Unit Vocabulary](https://www.qudt.org/doc/DOC_VOCAB-UNITS.html), applicable to the mass [quantity kind](#quantity_kind).

This codelist is referenced by the following properties:

- [`Measurement/unit`](rdls_schema.json,/$defs/Measurement,unit)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_mass.csv
```
````

### unit_time

The area codelist is a subset of the codes in the [QUDT Unit Vocabulary](https://www.qudt.org/doc/DOC_VOCAB-UNITS.html), applicable to the time [quantity kind](#quantity_kind).

This codelist is referenced by the following properties:

- [`Measurement/unit`](rdls_schema.json,/$defs/Measurement,unit)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_time.csv
```
````

### unit_volume

The area codelist is a subset of the codes in the [QUDT Unit Vocabulary](https://www.qudt.org/doc/DOC_VOCAB-UNITS.html), applicable to the volume [quantity kind](#quantity_kind).

This codelist is referenced by the following properties:

- [`Measurement/unit`](rdls_schema.json,/$defs/Measurement,unit)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/unit_volume.csv
```
````

## Closed codelists

### analysis_type

This codelist is referenced by the following properties:

- [`Event_set/analysis_type`](rdls_schema.json,/$defs/Event_set,analysis_type)
- [`Losses/hazard_analysis_type`](rdls_schema.json,/$defs/Losses,hazard_analysis_type)
- [`Function/hazard_analysis_type`](rdls_schema.json,/$defs/Function,hazard_analysis_type)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/analysis_type.csv
```
````

### country

This codelist is referenced by the following properties:

- [`Location/countries`](rdls_schema.json,/$defs/Location,countries)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/country.csv
```
````

### data_calculation_type

This codelist is referenced by the following properties:

- [`Event_set/calculation_method`](rdls_schema.json,/$defs/Event_set,calculation_method)
- [`Event/calculation_method`](rdls_schema.json,/$defs/Event,calculation_method)
- [`Impact/base_data_type`](rdls_schema.json,/$defs/Impact,base_data_type)
- [`Function/impact_modelling`](rdls_schema.json,/$defs/Function,impact_modelling)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/data_calculation_type.csv
```
````

### exposure_category

This codelist is referenced by the following properties:

- [`exposure/category`](rdls_schema.json,/properties/exposure,category)
- [`Losses/category`](rdls_schema.json,/$defs/Losses,category)
- [`Function/category`](rdls_schema.json,/$defs/Function,category)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/exposure_category.csv
```
````

### frequency_distribution

This codelist is referenced by the following properties:

- [`Event_set/frequency_distribution`](rdls_schema.json,/$defs/Event_set,frequency_distribution)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/frequency_distribution.csv
```
````

### function_approach

This codelist is referenced by the following properties:

- [`Losses/approach`](rdls_schema.json,/$defs/Losses,approach)
- [`Function/approach`](rdls_schema.json,/$defs/Function,approach)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/function_approach.csv
```
````

### geometry_type

This codelist is referenced by the following properties:

- [`Geometry/type`](rdls_schema.json,/$defs/Geometry,type)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/geometry_type.csv
```
````

### hazard_type

The RDLS offers a classification of hazards that are more often required in disaster risk assessments, based on the review and mapping of existing alternative definitions into one consistent framework. For more information, see [hazard taxonomies](../rdl/other-standards.md#hazard-taxonomies).

The hazard_type codelist classifies hazard phenomena by the main hazard to which they relate. Hazard phenomena can also be classified by the hazard process to which they relate. For more information, see the [process_type codelist](#process_type).

This codelist is referenced by the following properties:

- [`Hazard/type`](rdls_schema.json,/$defs/Hazard,type)
- [`Trigger/type`](rdls_schema.json,/$defs/Trigger,type)
- [`Losses/hazard_type`](rdls_schema.json,/$defs/Losses,hazard_type)
- [`Function/hazard_primary`](rdls_schema.json,/$defs/Function,hazard_primary)
- [`Function/hazard_secondary`](rdls_schema.json,/$defs/Function,hazard_secondary)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/hazard_type.csv
```
````

### impact_type

This codelist is referenced by the following properties:

- [`Impact/type`](rdls_schema.json,/$defs/Impact,type)
- [`Function/impact_type`](rdls_schema.json,/$defs/Function,impact_type)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/impact_type.csv
```
````

### loss_type

This codelist is referenced by the following properties:

- [`Losses/type`](rdls_schema.json,/$defs/Losses,type)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/loss_type.csv
```
````

### metric_dimension

This codelist is referenced by the following properties:

- [`Metric/dimension`](rdls_schema.json,/$defs/Metric,dimension)
- [`Cost/dimension`](rdls_schema.json,/$defs/Cost,dimension)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/metric_dimension.csv
```
````

### process_type

The process_type codelist classifies hazard phenomena by the hazard process to which they relate. Hazard phenomena can also be the main hazard to which they relate. For more information, see the [hazard_type codelist](#hazard_type). Process types are based primarily on the [UNDRR Hazard terminology](https://www.undrr.org/publication/hazard-definition-and-classification-review-technical-report).

This codelist is referenced by the following properties:

- [`Hazard/processes`](rdls_schema.json,/$defs/Hazard,processes)
- [`Trigger/processes`](rdls_schema.json,/$defs/Trigger,processes)
- [`Losses/hazard_process`](rdls_schema.json,/$defs/Losses,hazard_process)
- [`Function/hazard_process_primary`](rdls_schema.json,/$defs/Function,hazard_process_primary)
- [`Function/hazard_process_secondary`](rdls_schema.json,/$defs/Function,hazard_process_secondary)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/process_type.csv
```
````

### relationship_type

This codelist is referenced by the following properties:

- [`Function/relationship`](rdls_schema.json,/$defs/Function,relationship)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/relationship_type.csv
```
````

### risk_data_type

This codelist is referenced by the following properties:

- [`risk_data_type`](rdls_schema.json,,risk_data_type)
- [`Source/risk_data_type`](rdls_schema.json,/$defs/Source,risk_data_type)
- [`Source/used_in`](rdls_schema.json,/$defs/Source,used_in)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/risk_data_type.csv
```
````

### seasonality

This codelist is referenced by the following properties:

- [`Event_set/seasonality`](rdls_schema.json,/$defs/Event_set,seasonality)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/seasonality.csv
```
````

### source_type

This codelist is referenced by the following properties:

- [`Source/type`](rdls_schema.json,/$defs/Source,type)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/source_type.csv
```
````

### spatial_scale

This codelist is referenced by the following properties:

- [`Location/scale`](rdls_schema.json,/$defs/Location,scale)

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/spatial_scale.csv
```
````

### unit_currency

This codelist is referenced by the following properties:

- [`Cost/unit`](rdls_schema.json,/$defs/Cost,unit)
- [`Measurement/unit`](rdls_schema.json,/$defs/Measurement,unit)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/unit_currency.csv
```
````
