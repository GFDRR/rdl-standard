# Resource schema

```{contents} On this page
:local:
:depth: 1
```

## Overview

```{mermaid}
    erDiagram
        Direction LR
        Resource {
            string id*
            string title*
            string description*
            string media_type
            string format
            object spatial
            object temporal
            string access_url
            string download_url
            object baseline_period
            object climate
        }

        Dataset ||--|{ Resource: "Includes"
```

## Properties

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/resources/items
:collapse: spatial
:externallinks: >
:   {
:       "spatial":{"url":"#spatial-coverage","text":"Spatial coverage"}
:   }
```

## Spatial coverage

This schema is referenced by the following properties:

* `spatial`

### Properties

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/resources/items/properties/spatial
---