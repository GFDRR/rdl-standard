# Exposure metadata

```{contents} On this page
:local:
:depth: 1
```

The `exposure` component is described as:

```{jsoninclude-quote} ../../../docs/_readthedocs/html/rdls_schema_processed.json
---
jsonpointer: /properties/exposure/description
---
```

The exposure component describes metadata for datasets containing information on the distribution and characteristics of built environment assets (buildings and infrastructure) and natural assets and population, that are used in risk assessment. The exposure component provides codelists to describe the type of assets and costs, and the taxonomy scheme that is used to describe construction and demographic information contained in the dataset. For more information, see [exposure standards](../../rdl/other-standards.md#exposure-standards).

The exposure component uses exposure categories consistent with the vulnerability and loss components of this standard. Spatial reference and location information are described using existing external standards. Temporal information can include date and duration of events or year of scenario, and is defined using the Dublin Core standards.

```{seealso}

* [How to describe location-only exposure data](../../guides/metadata.md#describe-location-only-exposure-data)

```

## Examples

``````{dropdown} Example: Central Asia projected residential exposure dataset

The following example shows RDLS metadata for the [Central Asia projected residential exposure dataset](https://datacatalog.worldbank.org/search/dataset/0064254/Central-Asia-exposure-dataset---Projected-residential-exposure) in tabular format and JSON format.

`````{tab-set}

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

```{jsonschema} ../../../docs/_readthedocs/html/rdls_schema_processed.json
:pointer: /properties/exposure/items
:collapse: metrics
:externallinks: >
:   {
:       "metrics":{"url":"#metric","text":"Metric"}
:   }
```

## Metric

```{jsonschema} ../../../docs/_readthedocs/html/rdls_schema_processed.json
:pointer: /properties/exposure/items/properties/metrics/items
```