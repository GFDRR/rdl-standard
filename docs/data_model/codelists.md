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

### data_formats

This codelist is referenced by the following properties:

- `Resource/format`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/data_formats.csv
---
```

### location_gazetteers

This codelist is referenced by the following properties:

- `Gazetteer_entry/scheme`
- `Geometry/type`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/location_gazetteers.csv
---
```

### media_type

This codelist is referenced by the following properties:

- `Resource/media_type`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/open/media_type.csv
---
```

## Closed codelists

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

This codelist is referenced by the following properties:

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

### exposure_category

This codelist is referenced by the following properties:

- `Exposure/category`

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

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/function_approach.csv
---
```

### geometry_type

This codelist is referenced by the following properties:

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/geometry_type.csv
---
```

### risk_data_type

This codelist is referenced by the following properties:

- `risk_data_type`

This codelist has the following codes:

```{csv-table-no-translate}
---
header-rows: 1
widths: auto
file: ../../codelists/closed/risk_data_type.csv
---
```
