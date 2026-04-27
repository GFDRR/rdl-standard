# Exposure metadata

```{contents} On this page
---
local:
depth: 1
---
```

The `exposure` component is described as:

```{jsoninclude-quote} ../../../schema/rdls_schema_processed.json
---
jsonpointer: /properties/exposure/description
---
```

The exposure component describes metadata for datasets containing information on the distribution and characteristics of built environment assets (buildings and infrastructure) and natural assets and population, that are used in risk assessment. The exposure component provides codelists to describe the type of assets and costs, and the taxonomy scheme that is used to describe construction and demographic information contained in the dataset. For more information, see [exposure standards](../../rdl/other-standards.md#exposure-standards).

The exposure component uses exposure categories consistent with the vulnerability and loss components of this standard. Spatial reference and location information are described using existing external standards. Temporal information can include date and duration of events or year of scenario, and is defined using the Dublin Core standards.

```{seealso}

* [How to describe location-only exposure data](../../guides/metadata/how_to.md#describe-location-only-exposure-data)

```

## Examples

``````{dropdown} Example: Central Asia projected residential exposure dataset

The following example shows RDLS metadata for the [Central Asia projected residential exposure dataset](https://datacatalog.worldbank.org/search/dataset/0064254/Central-Asia-exposure-dataset---Projected-residential-exposure) in tabular format and JSON format.

`````{tab-set}

````{tab-item} Metadata (tabular)
hazard

```{csv-table-no-translate} Datasets
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_projected/datasets.csv
---

```

```{csv-table-no-translate} Resources
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_projected/Resources.csv
---

```

```{csv-table-no-translate} Attributions
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_projected/Attributions.csv
---

```

```{csv-table-no-translate} Referenced by
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_projected/Referenced by.csv
---

```

```{csv-table-no-translate} Sources
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_projected/Sources.csv
---

```

```{csv-table-no-translate} Gazetteer entries (spatial coverage)
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_projected/Spatial coverage_Gazetteer entries.csv
---

```

```{csv-table-no-translate} Exposure metrics
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_projected/Exposure metadata_Exposure metrics.csv
---

```

````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/exposure/central_asia_residential_projected/example.json
   :jsonpointer: /datasets/0
   :title: Example
```

`````
``````

``````{dropdown} Example: Central Asia current residential exposure dataset

The following example shows RDLS metadata for the [Central Asia current residential exposure dataset](https://datacatalog.worldbank.org/search/dataset/0064251/Central-Asia-exposure-dataset---Residential-buildings) in tabular format and JSON format.

`````{tab-set}

````{tab-item} Metadata (tabular)

In tabular format, the metadata consists of several tables. To aid comprehension, the metadata is presented column wise using field titles.

```{csv-table-no-translate} Datasets
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_current/datasets.csv
---

```

```{csv-table-no-translate} Resources
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_current/Resources.csv
---

```

```{csv-table-no-translate} Attributions
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_current/Attributions.csv
---

```

```{csv-table-no-translate} Referenced by
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_current/Referenced by.csv
---

```

```{csv-table-no-translate} Sources
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_current/Sources.csv
---

```

```{csv-table-no-translate} Gazetteer entries (spatial coverage)
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_current/Spatial coverage_Gazetteer entries.csv
---

```

```{csv-table-no-translate} Exposure metrics
---
stub-columns: 1
widths: auto
file: ../../../examples/exposure/central_asia_residential_current/Exposure metadata_Exposure metrics.csv
---

```

````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/exposure/central_asia_residential_current/example.json
   :jsonpointer: /datasets/0
   :title: Example
```

````

`````
``````

## Overview

```{mermaid}
    erDiagram
        Direction LR

        Exposure_item {
            string id*
            string category*
            object asset_type
        }

        Dataset ||--o{ "Exposure metadata": ""
        "Exposure metadata" o|--|{ Exposure_item: "Describes exposure of"
        Exposure_item o|--|{ "Metric": "Exposure quantified by"
```

## Properties

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/exposure/items
:collapse: metrics
:externallinks: >
:   {
:       "metrics":{"url":"#metric","text":"Metric"}
:   }
```

## Metric

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/exposure/items/properties/metrics/items
```