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

- `Vulnerability/intensity`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/IMT.csv
---
```

### classification_scheme

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/classification_scheme.csv
---
```

### damage_scale_name

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/damage_scale_name.csv
---
```

### damage_scale_names

This codelist is referenced by the following properties:

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/damage_scale_names.csv
---
```

### damage_states_name

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/damage_states_name.csv
---
```

### damage_states_names

This codelist is referenced by the following properties:

- `Fragility_function/damage_states_names`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/damage_states_names.csv
---
```

### data_formats

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/data_formats.csv
---
```

### engineering_demand_parameter

This codelist is referenced by the following properties:

- `Engineering_demand_function/parameter`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/engineering_demand_parameter.csv
---
```

### impact_metric

This codelist is referenced by the following properties:

- `Impact/metric`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/impact_metric.csv
---
```

### impact_unit

This codelist is referenced by the following properties:

- `Impact/unit`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/impact_unit.csv
---
```

### license

This codelist is referenced by the following properties:

- `license`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/license.csv
---
```

### location_gazetteers

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/location_gazetteers.csv
---
```

### media_type

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/media_type.csv
---
```

### roles

The roles codelist is based on the [ISO19115 CI_RoleCode codelist](https://standards.iso.org/iso/19115/resources/Codelists/gml/CI_RoleCode.xml) with the addition of 'world_bank_team_lead' and the omission of codes covered by the `creator`, `contact_point` and `publisher` fields.

This codelist is referenced by the following properties:

- `Attribution/role`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/roles.csv
---
```

## Closed codelists

### analysis_type

This codelist is referenced by the following properties:

- `Vulnerability/hazard_analysis_type`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/analysis_type.csv
---
```

### cost_type

This codelist is referenced by the following properties:

- `Cost/type`
- `Cost/unit`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/cost_type.csv
---
```

### country

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/country.csv
---
```

### currency

This codelist is referenced by the following properties:

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/currency.csv
---
```

### data_calculation_type

This codelist is referenced by the following properties:

- `Impact/base_data_type`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/data_calculation_type.csv
---
```

### exposure_category

This codelist is referenced by the following properties:

- `Exposure/category`
- `Vulnerability/category`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/exposure_category.csv
---
```

### function_approach

This codelist is referenced by the following properties:

- `Vulnerability_function/approach`
- `Fragility_function/approach`
- `Damage_to_loss_function/approach`
- `Engineering_demand_function/approach`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/function_approach.csv
---
```

### geometry_type

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/geometry_type.csv
---
```

### hazard_type

The RDLS offers a classification of hazards that are more often required in disaster risk assessments, based on the review and mapping of existing alternative definitions into one consistent framework.

The hazard_type codelist classifies hazard phenomena by the main hazard to which they relate. Hazard phenomena can also be classified by the hazard process to which they relate. For more information, see the [process_type codelist](#process_type).

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/hazard_type.csv
---
```

### impact_type

This codelist is referenced by the following properties:

- `Impact/type`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/impact_type.csv
---
```

### process_type

The process_type codelist classifies hazard phenomena by the hazard process to which they relate. Hazard phenomena can also be the main hazard to which they relate. For more information, see the [hazard_type codelist](#hazard_type).

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/process_type.csv
---
```

### relationship_type

This codelist is referenced by the following properties:

- `Vulnerability_function/relationship`
- `Fragility_function/relationship`
- `Damage_to_loss_function/relationship`
- `Engineering_demand_function/relationship`
  \=======

### risk_data_type

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/risk_data_type.csv
---
```

### source_type

This codelist is referenced by the following properties:

- `Source/type`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/source_type.csv
---
```

### spatial_scale

This codelist is referenced by the following properties:

- `Location/scale`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/spatial_scale.csv
---
```
