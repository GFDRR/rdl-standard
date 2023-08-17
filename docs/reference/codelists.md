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

- [`vulnerability/intensity`](rdls_schema.json,/properties/vulnerability,intensity)
- [`Hazard/intensity_measure`](rdls_schema.json,/$defs/Hazard,intensity_measure)
- [`Footprint/intensity_measure`](rdls_schema.json,/$defs/Footprint,intensity_measure)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/IMT.csv
---
```

### classification_scheme

This codelist is referenced by the following properties:

- [`Classification/scheme`](rdls_schema.json,/$defs/Classification,scheme)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/classification_scheme.csv
---
```

### damage_scale_name

This codelist is referenced by the following properties:

- [`vulnerability/functions/fragility/damage_scale_name`](rdls_schema.json,/properties/vulnerability,functions/fragility/damage_scale_name)
- [`vulnerability/functions/damage_to_loss/damage_scale_name`](rdls_schema.json,/properties/vulnerability,functions/damage_to_loss/damage_scale_name)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/damage_scale_name.csv
---
```

### data_formats

This codelist is referenced by the following properties:

- [`Resource/format`](rdls_schema.json,/$defs/Resource,format)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/data_formats.csv
---
```

### engineering_demand_parameter

This codelist is referenced by the following properties:

- [`vulnerability/functions/engineering_demand/parameter`](rdls_schema.json,/properties/vulnerability,functions/engineering_demand/parameter)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/engineering_demand_parameter.csv
---
```

### impact_metric

This codelist is referenced by the following properties:

- [`Impact/metric`](rdls_schema.json,/$defs/Impact,metric)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/impact_metric.csv
---
```

### impact_unit

This codelist is referenced by the following properties:

- [`Impact/unit`](rdls_schema.json,/$defs/Impact,unit)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/impact_unit.csv
---
```

### license

This codelist is referenced by the following properties:

- [`license`](rdls_schema.json,,license)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/license.csv
---
```

### location_gazetteers

This codelist is referenced by the following properties:

- [`Gazetteer_entry/scheme`](rdls_schema.json,/$defs/Gazetteer_entry,scheme)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/location_gazetteers.csv
---
```

### media_type

This codelist is referenced by the following properties:

- [`Resource/media_type`](rdls_schema.json,/$defs/Resource,media_type)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/media_type.csv
---
```

### roles

The roles codelist is based on the [ISO19115 CI_RoleCode codelist](https://standards.iso.org/iso/19115/resources/Codelists/gml/CI_RoleCode.xml) with the addition of 'world_bank_team_lead' and the omission of codes covered by the `creator`, `contact_point` and `publisher` fields.

This codelist is referenced by the following properties:

- [`Attribution/role`](rdls_schema.json,/$defs/Attribution,role)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/open/roles.csv
---
```

## Closed codelists

### analysis_type

This codelist is referenced by the following properties:

- [`vulnerability/hazard_analysis_type`](rdls_schema.json,/properties/vulnerability,hazard_analysis_type)
- [`loss/hazard_analysis_type`](rdls_schema.json,/properties/loss,hazard_analysis_type)
- [`Event_set/analysis_type`](rdls_schema.json,/$defs/Event_set,analysis_type)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/analysis_type.csv
---
```

### cost_type

This codelist is referenced by the following properties:

- [`Cost/type`](rdls_schema.json,/$defs/Cost,type)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/cost_type.csv
---
```

### country

This codelist is referenced by the following properties:

- [`Location/countries`](rdls_schema.json,/$defs/Location,countries)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/country.csv
---
```

### currency

This codelist is referenced by the following properties:

- [`Cost/unit`](rdls_schema.json,/$defs/Cost,unit)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/currency.csv
---
```

### data_calculation_type

This codelist is referenced by the following properties:

- [`Event_set/calculation_method`](rdls_schema.json,/$defs/Event_set,calculation_method)
- [`Event/calculation_method`](rdls_schema.json,/$defs/Event,calculation_method)
- [`Impact/base_data_type`](rdls_schema.json,/$defs/Impact,base_data_type)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/data_calculation_type.csv
---
```

### exposure_category

This codelist is referenced by the following properties:

- [`exposure/category`](rdls_schema.json,/properties/exposure,category)
- [`vulnerability/category`](rdls_schema.json,/properties/vulnerability,category)
- [`loss/category`](rdls_schema.json,/properties/loss,category)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/exposure_category.csv
---
```

### frequency_distribution

This codelist is referenced by the following properties:

- [`Event_set/frequency_distribution`](rdls_schema.json,/$defs/Event_set,frequency_distribution)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/frequency_distribution.csv
---
```

### function_approach

This codelist is referenced by the following properties:

- [`vulnerability/functions/vulnerability/approach`](rdls_schema.json,/properties/vulnerability,functions/vulnerability/approach)
- [`vulnerability/functions/fragility/approach`](rdls_schema.json,/properties/vulnerability,functions/fragility/approach)
- [`vulnerability/functions/damage_to_loss/approach`](rdls_schema.json,/properties/vulnerability,functions/damage_to_loss/approach)
- [`vulnerability/functions/engineering_demand/approach`](rdls_schema.json,/properties/vulnerability,functions/engineering_demand/approach)
- [`loss/approach`](rdls_schema.json,/properties/loss,approach)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/function_approach.csv
---
```

### geometry_type

This codelist is referenced by the following properties:

- [`Geometry/type`](rdls_schema.json,/$defs/Geometry,type)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/geometry_type.csv
---
```

### hazard_type

The RDLS offers a classification of hazards that are more often required in disaster risk assessments, based on the review and mapping of existing alternative definitions into one consistent framework. For more information, see [hazard taxonomies](../rdl/other-standards.md#hazard-taxonomies).

The hazard_type codelist classifies hazard phenomena by the main hazard to which they relate. Hazard phenomena can also be classified by the hazard process to which they relate. For more information, see the [process_type codelist](#process_type).

This codelist is referenced by the following properties:

- [`vulnerability/hazard_primary`](rdls_schema.json,/properties/vulnerability,hazard_primary)
- [`vulnerability/hazard_secondary`](rdls_schema.json,/properties/vulnerability,hazard_secondary)
- [`loss/hazard_type`](rdls_schema.json,/properties/loss,hazard_type)
- [`Hazard/type`](rdls_schema.json,/$defs/Hazard,type)
- [`Trigger/type`](rdls_schema.json,/$defs/Trigger,type)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/hazard_type.csv
---
```

### impact_type

This codelist is referenced by the following properties:

- [`Impact/type`](rdls_schema.json,/$defs/Impact,type)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/impact_type.csv
---
```

### loss_type

This codelist is referenced by the following properties:

- [`loss/type`](rdls_schema.json,/properties/loss,type)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/loss_type.csv
---
```

### process_type

The process_type codelist classifies hazard phenomena by the hazard process to which they relate. Hazard phenomena can also be the main hazard to which they relate. For more information, see the [hazard_type codelist](#hazard_type). Process types are based primarily on the [UNDRR Hazard terminology](https://www.undrr.org/publication/hazard-definition-and-classification-review-technical-report).

This codelist is referenced by the following properties:

- [`vulnerability/hazard_process_primary`](rdls_schema.json,/properties/vulnerability,hazard_process_primary)
- [`vulnerability/hazard_process_secondary`](rdls_schema.json,/properties/vulnerability,hazard_process_secondary)
- [`loss/hazard_process`](rdls_schema.json,/properties/loss,hazard_process)
- [`Hazard/processes`](rdls_schema.json,/$defs/Hazard,processes)
- [`Trigger/processes`](rdls_schema.json,/$defs/Trigger,processes)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/process_type.csv
---
```

### relationship_type

This codelist is referenced by the following properties:

- [`vulnerability/functions/vulnerability/relationship`](rdls_schema.json,/properties/vulnerability,functions/vulnerability/relationship)
- [`vulnerability/functions/fragility/relationship`](rdls_schema.json,/properties/vulnerability,functions/fragility/relationship)
- [`vulnerability/functions/damage_to_loss/relationship`](rdls_schema.json,/properties/vulnerability,functions/damage_to_loss/relationship)
- [`vulnerability/functions/engineering_demand/relationship`](rdls_schema.json,/properties/vulnerability,functions/engineering_demand/relationship)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/relationship_type.csv
---
```

### risk_data_type

This codelist is referenced by the following properties:

- [`risk_data_type`](rdls_schema.json,,risk_data_type)
- [`Source/component`](rdls_schema.json,/$defs/Source,component)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/risk_data_type.csv
---
```

### seasonality

This codelist is referenced by the following properties:

- [`Event_set/seasonality`](rdls_schema.json,/$defs/Event_set,seasonality)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/seasonality.csv
---
```

### source_type

This codelist is referenced by the following properties:

- [`Source/type`](rdls_schema.json,/$defs/Source,type)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/source_type.csv
---
```

### spatial_scale

This codelist is referenced by the following properties:

- [`Location/scale`](rdls_schema.json,/$defs/Location,scale)

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../schema/codelists/closed/spatial_scale.csv
---
```
