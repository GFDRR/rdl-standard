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