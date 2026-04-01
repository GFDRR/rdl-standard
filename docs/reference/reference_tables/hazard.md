# Hazard metadata schema

```{contents} On this page
:local:
:depth: 1
```

## Overview

```{mermaid}
    erDiagram
        Direction LR

        Dataset ||--o| "Hazard metadata": "Hazard data described by"
        "Hazard metadata" o|--|{ Event_set: "Describes"
```

## Properties

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/hazard
:collapse: event_sets
:externallinks: >
:   {
:       "event_sets":{"url":"#event-sets","text":"Event sets"}
:   }
```

## Event sets

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

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/hazard/properties/event_sets/items
:collapse: hazards,events
:externallinks: >
:   {
:       "hazards":{"url":"#hazards","text":"Hazards"},
:       "events":{"url":"#events","text":"Events"}
:   }
```

## Hazards

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/hazard/properties/event_sets/items/properties/hazards/items
```

## Events

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/hazard/properties/event_sets/items/properties/events/items
```