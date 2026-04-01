# Resource schema

```{contents} On this page
---
local:
depth: 1
---
```

A `Resource` is defined as:

```{jsoninclude-quote} ../../../schema/rdls_schema_processed.json
---
jsonpointer: /properties/resources/items/description
---
```

Each dataset can have many associated resources.

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
---
pointer: /properties/resources/items
collapse: spatial
addtargets:
externallinks: >-
  {
      "spatial":{"url":"#spatial-coverage","text":"Spatial coverage"}
  }
---
```

## Spatial coverage

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/resources/items/properties/spatial
---
```
