# Loss metadata

```{contents} On this page
---
local:
depth: 1
---
```

The `loss` component is described as:

```{jsoninclude-quote} ../../../docs/_readthedocs/html/rdls_schema_processed.json
---
jsonpointer: /properties/loss/description
---
```

The loss component provides metadata describing data generated in risk assessments, i.e., modelled impacts and losses for single historical events or hypothetical scenarios and risk estimates from analysis of large event sets. The data can include monetary and non-monetary, and direct or indirect, impacts and losses.
Loss datasets can be explicitly linked to the exposure, hazard, and vulnerability datasets used in the analysis. This component uses descriptions of assets, hazards and impact types consistent with all other components of this standard. Spatial reference and location information are described using existing external standards. Temporal information can include date and duration of events or year of scenario, and is defined using the Dublin Core standards.


## Overview

```{mermaid}
    erDiagram
        Direction LR

        Losses {
            string id*
            object hazard*
            string asset_category*
            string asset_dimension*
            object impact_and_losses
        }

        Dataset ||--o{ "Loss metadata": ""
        "Loss metadata" o|--|{ Losses: "Describes"
```
## Examples

``````{dropdown} Example: Tomorrow's Cities Flood Risk Assessment Dataset for Nairobi, Kenya
---
open:
---
The following example shows RDLS metadata the [Tomorrow's Cities Flood Risk Assessment Dataset for Nairobi, Kenya](https://catalog.riskdatalibrary.org/datasets/rdls_hevl-kentmrwcities_nairobi/) in JSON format.

`````{tab-set}

````{tab-item} Figure

```{figure} ../../../examples/Loss/nairobi/figure.png
```

````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/Loss/nairobi/example.json
   :jsonpointer: /datasets/0
   :title: Example
```

`````

``````
``````{dropdown} Example: Global multi-hazard average annual loss

The following example shows RDLS metadata for [Global multi-hazard average annual loss](https://catalog.riskdatalibrary.org/datasets/rdls_lss-GIRI_AAL/) in JSON format.

`````{tab-set}

````{tab-item} Figure

```{figure} ../../../examples/Loss/global/figure.png
```

````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/Loss/global/example.json
   :jsonpointer: /datasets/0
   :title: Example
```

`````

``````

``````{dropdown} Example: DesInventar Disaster Loss and Damage Dataset for Sri Lanka

The following example shows RDLS metadata for the [DesInventar Disaster Loss and Damage Dataset for Sri Lanka](https://catalog.riskdatalibrary.org/datasets/rdls_lss-lkaundrr_desinventar/) in JSON format.

`````{tab-set}

````{tab-item} Figure

```{figure} ../../../examples/Loss/desinventar/figure.png
```

````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/Loss/desinventar/example.json
   :jsonpointer: /datasets/0
   :title: Example
```

````

`````
``````

## Properties

```{jsonschema} ../../../docs/_readthedocs/html/rdls_schema_processed.json
---
pointer: /properties/loss/properties/losses/items
collapse: hazard
externallinks: >-
  {
      "hazard":{"url":"#hazard","text":"Hazard"}
  }
---
```

## Hazard

```{jsonschema} ../../../docs/_readthedocs/html/rdls_schema_processed.json
---
pointer: /properties/loss/properties/losses/items/properties/hazard
externallinks: >-
  {
      "hazard":{"url":"#hazard","text":"Hazard"}
  }
---
```
