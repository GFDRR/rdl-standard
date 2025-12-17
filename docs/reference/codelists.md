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

This codelist has the following codes:

````{dropdown} Codes
---
open:
---
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/classification_scheme.csv
```
````

### damage_scale_name

This codelist is referenced by the following properties:

- [`FragilityFunction/damage_scale_name`](rdls_schema.json,/$defs/FragilityFunction,damage_scale_name)
- [`DamageToLossFunction/damage_scale_name`](rdls_schema.json,/$defs/DamageToLossFunction,damage_scale_name)
- [`EngineeringDemandFunction/damage_scale_name`](rdls_schema.json,/$defs/EngineeringDemandFunction,damage_scale_name)

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

- [`Resource/data_format`](rdls_schema.json,/$defs/Resource,data_format)

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

- [`EngineeringDemandFunction/parameter`](rdls_schema.json,/$defs/EngineeringDemandFunction,parameter)

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

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/impact_metric.csv
```
````

### impact_unit

This codelist is referenced by the following properties:

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/open/impact_unit.csv
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

- [`Metric/quantity_kind`](rdls_schema.json,/$defs/Metric,quantity_kind)

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

## Closed codelists

### analysis_type

This codelist is referenced by the following properties:

- [`VulnerabilityCommonFields/hazard_analysis_type`](rdls_schema.json,/$defs/VulnerabilityCommonFields,hazard_analysis_type)
- [`VulnerabilityFunction/hazard_analysis_type`](rdls_schema.json,/$defs/VulnerabilityFunction,hazard_analysis_type)
- [`FragilityFunction/hazard_analysis_type`](rdls_schema.json,/$defs/FragilityFunction,hazard_analysis_type)
- [`DamageToLossFunction/hazard_analysis_type`](rdls_schema.json,/$defs/DamageToLossFunction,hazard_analysis_type)
- [`EngineeringDemandFunction/hazard_analysis_type`](rdls_schema.json,/$defs/EngineeringDemandFunction,hazard_analysis_type)
- [`Event_set/analysis_type`](rdls_schema.json,/$defs/Event_set,analysis_type)
- [`Losses/impact_and_losses/loss_frequency_type`](rdls_schema.json,/$defs/Losses,impact_and_losses/loss_frequency_type)

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

### currency

This codelist is referenced by the following properties:

- [`Losses/impact_and_losses/currency`](rdls_schema.json,/$defs/Losses,impact_and_losses/currency)

This codelist has the following codes:

````{dropdown} Codes
```{csv-table-no-translate}
:header-rows: 1
:widths: auto
:file: ../../schema/codelists/closed/currency.csv
```
````

### data_calculation_type

This codelist is referenced by the following properties:

- [`VulnerabilityCommonFields/impact_modelling`](rdls_schema.json,/$defs/VulnerabilityCommonFields,impact_modelling)
- [`VulnerabilityFunction/impact_modelling`](rdls_schema.json,/$defs/VulnerabilityFunction,impact_modelling)
- [`FragilityFunction/impact_modelling`](rdls_schema.json,/$defs/FragilityFunction,impact_modelling)
- [`DamageToLossFunction/impact_modelling`](rdls_schema.json,/$defs/DamageToLossFunction,impact_modelling)
- [`EngineeringDemandFunction/impact_modelling`](rdls_schema.json,/$defs/EngineeringDemandFunction,impact_modelling)
- [`Event_set/calculation_method`](rdls_schema.json,/$defs/Event_set,calculation_method)
- [`Event/calculation_method`](rdls_schema.json,/$defs/Event,calculation_method)
- [`Losses/impact_and_losses/impact_modelling`](rdls_schema.json,/$defs/Losses,impact_and_losses/impact_modelling)

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

- [`VulnerabilityCommonFields/category`](rdls_schema.json,/$defs/VulnerabilityCommonFields,category)
- [`VulnerabilityFunction/category`](rdls_schema.json,/$defs/VulnerabilityFunction,category)
- [`FragilityFunction/category`](rdls_schema.json,/$defs/FragilityFunction,category)
- [`DamageToLossFunction/category`](rdls_schema.json,/$defs/DamageToLossFunction,category)
- [`EngineeringDemandFunction/category`](rdls_schema.json,/$defs/EngineeringDemandFunction,category)
- [`Exposure_item/category`](rdls_schema.json,/$defs/Exposure_item,category)
- [`Losses/asset_category`](rdls_schema.json,/$defs/Losses,asset_category)

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

- [`VulnerabilityFunction/approach`](rdls_schema.json,/$defs/VulnerabilityFunction,approach)
- [`FragilityFunction/approach`](rdls_schema.json,/$defs/FragilityFunction,approach)
- [`DamageToLossFunction/approach`](rdls_schema.json,/$defs/DamageToLossFunction,approach)
- [`EngineeringDemandFunction/approach`](rdls_schema.json,/$defs/EngineeringDemandFunction,approach)
- [`Losses/impact_and_losses/loss_approach`](rdls_schema.json,/$defs/Losses,impact_and_losses/loss_approach)

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

- [`VulnerabilityCommonFields/hazard_primary`](rdls_schema.json,/$defs/VulnerabilityCommonFields,hazard_primary)
- [`VulnerabilityCommonFields/hazard_secondary`](rdls_schema.json,/$defs/VulnerabilityCommonFields,hazard_secondary)
- [`VulnerabilityFunction/hazard_primary`](rdls_schema.json,/$defs/VulnerabilityFunction,hazard_primary)
- [`VulnerabilityFunction/hazard_secondary`](rdls_schema.json,/$defs/VulnerabilityFunction,hazard_secondary)
- [`FragilityFunction/hazard_primary`](rdls_schema.json,/$defs/FragilityFunction,hazard_primary)
- [`FragilityFunction/hazard_secondary`](rdls_schema.json,/$defs/FragilityFunction,hazard_secondary)
- [`DamageToLossFunction/hazard_primary`](rdls_schema.json,/$defs/DamageToLossFunction,hazard_primary)
- [`DamageToLossFunction/hazard_secondary`](rdls_schema.json,/$defs/DamageToLossFunction,hazard_secondary)
- [`EngineeringDemandFunction/hazard_primary`](rdls_schema.json,/$defs/EngineeringDemandFunction,hazard_primary)
- [`EngineeringDemandFunction/hazard_secondary`](rdls_schema.json,/$defs/EngineeringDemandFunction,hazard_secondary)
- [`Hazard/type`](rdls_schema.json,/$defs/Hazard,type)
- [`Trigger/type`](rdls_schema.json,/$defs/Trigger,type)
- [`Losses/hazard_type`](rdls_schema.json,/$defs/Losses,hazard_type)

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

- [`VulnerabilityCommonFields/impact_type`](rdls_schema.json,/$defs/VulnerabilityCommonFields,impact_type)
- [`VulnerabilityFunction/impact_type`](rdls_schema.json,/$defs/VulnerabilityFunction,impact_type)
- [`FragilityFunction/impact_type`](rdls_schema.json,/$defs/FragilityFunction,impact_type)
- [`DamageToLossFunction/impact_type`](rdls_schema.json,/$defs/DamageToLossFunction,impact_type)
- [`EngineeringDemandFunction/impact_type`](rdls_schema.json,/$defs/EngineeringDemandFunction,impact_type)
- [`Losses/impact_and_losses/impact_type`](rdls_schema.json,/$defs/Losses,impact_and_losses/impact_type)

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

- [`Losses/impact_and_losses/loss_type`](rdls_schema.json,/$defs/Losses,impact_and_losses/loss_type)

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
- [`Losses/asset_dimension`](rdls_schema.json,/$defs/Losses,asset_dimension)

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

- [`VulnerabilityCommonFields/hazard_process_primary`](rdls_schema.json,/$defs/VulnerabilityCommonFields,hazard_process_primary)
- [`VulnerabilityCommonFields/hazard_process_secondary`](rdls_schema.json,/$defs/VulnerabilityCommonFields,hazard_process_secondary)
- [`VulnerabilityFunction/hazard_process_primary`](rdls_schema.json,/$defs/VulnerabilityFunction,hazard_process_primary)
- [`VulnerabilityFunction/hazard_process_secondary`](rdls_schema.json,/$defs/VulnerabilityFunction,hazard_process_secondary)
- [`FragilityFunction/hazard_process_primary`](rdls_schema.json,/$defs/FragilityFunction,hazard_process_primary)
- [`FragilityFunction/hazard_process_secondary`](rdls_schema.json,/$defs/FragilityFunction,hazard_process_secondary)
- [`DamageToLossFunction/hazard_process_primary`](rdls_schema.json,/$defs/DamageToLossFunction,hazard_process_primary)
- [`DamageToLossFunction/hazard_process_secondary`](rdls_schema.json,/$defs/DamageToLossFunction,hazard_process_secondary)
- [`EngineeringDemandFunction/hazard_process_primary`](rdls_schema.json,/$defs/EngineeringDemandFunction,hazard_process_primary)
- [`EngineeringDemandFunction/hazard_process_secondary`](rdls_schema.json,/$defs/EngineeringDemandFunction,hazard_process_secondary)
- [`Hazard/hazard_process`](rdls_schema.json,/$defs/Hazard,hazard_process)
- [`Trigger/hazard_process`](rdls_schema.json,/$defs/Trigger,hazard_process)
- [`Losses/hazard_process`](rdls_schema.json,/$defs/Losses,hazard_process)

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

- [`VulnerabilityFunction/relationship`](rdls_schema.json,/$defs/VulnerabilityFunction,relationship)
- [`FragilityFunction/relationship`](rdls_schema.json,/$defs/FragilityFunction,relationship)
- [`DamageToLossFunction/relationship`](rdls_schema.json,/$defs/DamageToLossFunction,relationship)
- [`EngineeringDemandFunction/relationship`](rdls_schema.json,/$defs/EngineeringDemandFunction,relationship)

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

- [`Source/component`](rdls_schema.json,/$defs/Source,component)

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
