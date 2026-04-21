# Hazard metadata

```{contents} On this page
---
local:
depth: 1
---
```

The `hazard` component is described as:

```{jsoninclude-quote} ../../../docs/_readthedocs/html/rdls_schema_processed.json
---
jsonpointer: /properties/hazard/description
---
```

The hazard component describes metadata about modeled natural hazards data, including hazard intensity footprints of historical or hypothetical events, return period hazard maps, hazard or susceptibility index, and stochastic event sets. The metadata defines the hazard type, physical process and intensity measures used in the dataset. Multiple hazards and processes (including cascading events) can be defined for each hazard, enabling users to describe dataset that contain, for example, earthquake ground shaking and liquefaction, and tsunami inundation triggered by the earthquake.

The hazard component uses hazard_type, process_type and intensity_measure consistent with the vulnerability and loss components of this standard. Spatial reference and location information are described using existing external standards. Temporal information can include date and duration of events or year of scenario, and is defined using the Dublin Core standards.

## Overview

```{mermaid}
    erDiagram
        Direction LR

        Dataset ||--o| "Hazard metadata": "Hazard data described by"
        "Hazard metadata" o|--|{ Event_set: "Describes"
```

## Examples

``````{dropdown} Example: Fathom Global Flood Map
---
open:
---
The following example shows RDLS metadata for the [Fathom Global Flood Map](https://www.fathom.global/product/global-flood-map/) in tabular format and JSON format.

`````{tab-set}

````{tab-item} Figure

```{figure} ../../../examples/hazard/fathom/figure.png
```

````

````{tab-item} Metadata (tabular)

In tabular format, the metadata consists of several tables. To aid comprehension, the metadata is presented column wise using field titles.

```{csv-table-no-translate} Datasets
---
stub-columns: 1
widths: auto
file: ../../../examples/hazard/fathom/datasets.csv
---

```

```{csv-table-no-translate} Resources
---
stub-columns: 1
widths: auto
file: ../../../examples/hazard/fathom/Resources.csv
---

```

```{csv-table-no-translate} Event sets
---
stub-columns: 1
widths: auto
file: ../../../examples/hazard/fathom/Hazard metadata_Event sets.csv
---

```

```{csv-table-no-translate} Event set hazards
---
stub-columns: 1
widths: auto
file: ../../../examples/hazard/fathom/Hazard metadata_Event sets_Hazards.csv
---

```

````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/hazard/fathom/example.json
   :jsonpointer: /datasets/0
   :title: Example
```

`````

``````

``````{dropdown} Example: Aqueduct Floods Hazard Maps

The following example shows RDLS metadata for the [Aqueduct Floods Hazard Maps](https://www.wri.org/data/aqueduct-floods-hazard-maps) in tabular format and JSON format.

`````{tab-set}

````{tab-item} Figure

```{figure} ../../../examples/hazard/aqueduct/figure.png
```

````

````{tab-item} Metadata (tabular)

In tabular format, the metadata consists of several tables. To aid comprehension, the metadata is presented column wise using field titles.

```{csv-table-no-translate} Datasets
---
stub-columns: 1
widths: auto
file: ../../../examples/hazard/aqueduct/datasets.csv
---

```

```{csv-table-no-translate} Resources
---
stub-columns: 1
widths: auto
file: ../../../examples/hazard/aqueduct/Resources.csv
---

```

```{csv-table-no-translate} Event sets
---
stub-columns: 1
widths: auto
file: ../../../examples/hazard/aqueduct/Hazard metadata_Event sets.csv
---

```

```{csv-table-no-translate} Event set hazards
---
stub-columns: 1
widths: auto
file: ../../../examples/hazard/aqueduct/Hazard metadata_Event sets_Hazards.csv
---

```

````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/hazard/aqueduct/example.json
   :jsonpointer: /datasets/0
   :title: Example
```

````

`````
``````

## Properties

```{jsonschema} ../../../docs/_readthedocs/html/rdls_schema_processed.json
---
pointer: /properties/hazard
collapse: event_sets
externallinks: >-
  {
      "event_sets":{"url":"#event-set","text":"Event set"}
  }
---
```

## Event set

```{mermaid}
    erDiagram
        Direction LR

        Event_set {
            string id*
            string analysis_type*
        }

        "Hazard metadata" |o--|{ Event_set: "Describes"
        Event_set ||--|{ "Hazard": "Includes"
        Event_set o|--|{ "Event": "Includes"
```

```{jsonschema} ../../../docs/_readthedocs/html/rdls_schema_processed.json
---
pointer: /properties/hazard/properties/event_sets/items
collapse: hazards,events
externallinks: >-
  {
      "hazards":{"url":"#hazard","text":"Hazard"},
      "events":{"url":"#event","text":"Event"}
  }
---
```

## Event

```{mermaid}
    erDiagram
        Direction LR

        Event {
            string id*
            string calculation_method*
            object hazard*
            object occurrence*
        }

        "Event_set" |o--o{ Event: "Includes"
```

```{jsonschema} ../../../docs/_readthedocs/html/rdls_schema_processed.json
---
pointer: /properties/hazard/properties/event_sets/items/properties/events/items
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
pointer: /properties/hazard/properties/event_sets/items/properties/hazards/items
---
```
