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
The following example shows RDLS metadata for the [Fathom Global Flood Map](https://www.fathom.global/product/global-flood-map/) in JSON format.

`````{tab-set}

````{tab-item} Figure

```{figure} ../../../examples/hazard/fathom/figure.png
```

````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/hazard/fathom/example.json
   :jsonpointer:
   :title: Example
```

`````

``````

``````{dropdown} Example: UNOSAT Flood event in SSD

The following example shows RDLS metadata for the [UNOSAT Flood event in SSD](https://unosat.org/products/4174) in JSON format.

`````{tab-set}

````{tab-item} Figure

```{figure} ../../../examples/hazard/unosat/figure.png
```

````

````{tab-item} Metadata (JSON)

```{eval-rst}
.. jsoninclude:: ../../../examples/hazard/unosat/example.json
   :jsonpointer:
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
