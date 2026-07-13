# Exposure metadata

```{contents} On this page
---
local:
depth: 1
---
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

* [How to describe location-only exposure data](../../guides/metadata/how_to.md#describe-location-only-exposure-data)

```

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

## Examples

``````{dropdown} Example: GHSL Population map
---
open:
---
The following example shows RDLS metadata for the [GHSL Population map](https://catalog.riskdatalibrary.org/datasets/rdls_exp-jrc_ghspopulationgridmultitem/) in JSON format.

`````{tab-set}

````{tab-item} Figure

```{figure} ../../../examples/exposure/ghsl/figure.png
```
````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/exposure/ghsl/example.json
   :jsonpointer:
   :title: Example
```

`````
``````

``````{dropdown} Example: World Settlement Footprint Evolution

The following example shows RDLS metadata for the [World Settlement Footprint Evolution](https://catalog.riskdatalibrary.org/datasets/rdls_exp-crstac_worldsettlementfootprintwsf_wsfevolution/) in JSON format.

`````{tab-set}

````{tab-item} Figure

```{figure} ../../../examples/exposure/wsf/figure.png
```
````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/exposure/wsf/example.json
   :jsonpointer:
   :title: Example
```

````

`````
``````

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
