# Dataset schema

```{contents} On this page
:local:
:depth: 1
```
## Overview

```{mermaid}
    erDiagram
        Direction LR
        Dataset {
            string id*
            string title*
            array risk_data_type*
            object publisher*
            object creator*
            object contact_point*
            string license*
            object lineage
            object spatial* "Spatial coverage"
            object temporal "Temporal coverage"
            object hazard "Hazard metadata"
            object exposure "Exposure metadata"
            object vulnerability "Vulnerability metadata"
            object loss "Loss metadata"

        }

        Dataset ||--|{ Resource: "Includes"
        Dataset ||--o{ Attribution: "Related to entity by"
        Dataset ||--o{ "Related resource": "Referenced by"
        Dataset ||--o{ Source: "Created using"
```

## Properties

```{jsonschema} ../../../schema/rdls_schema_processed.json
:collapse: publisher,contact_point,creator,spatial,attributions,lineage/sources,referenced_by,resources,hazard,exposure,vulnerability,loss
:externallinks: >
:   {
:       "publisher":{"url":"#publisher-contact-point-and-creator","text":"Publisher, contact point, and creator"},
:       "contact_point":{"url":"#publisher-contact-point-and-creator","text":"Publisher, contact point, and creator"},
:       "creator":{"url":"#publisher-contact-point-and-creator","text":"Publisher, contact point, and creator"},
:       "spatial":{"url":"#spatial-coverage","text":"Spatial coverage"},
:       "attributions":{"url":"#attribution","text":"Attribution"},
:       "lineage/sources":{"url":"#source","text":"Source"},
:       "referenced_by":{"url":"#related-resource","text":"Related resource"},
:       "resources":{"url":"../resource","text":"Resource"},
:       "hazard":{"url":"../hazard","text":"Hazard metadata"},
:       "exposure":{"url":"../exposure","text":"Exposure metadata"},
:       "vulnerability":{"url":"../vulnerability","text":"Vulnerability metadata"},
:       "loss":{"url":"../loss","text":"Loss metadata"}
:   }
```

## Publisher, contact point and creator

This schema is referenced by the following properties:

* `publisher`
* `contact_point`
* `creator`

### Properties

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/publisher
---
```

## Spatial coverage

This schema is referenced by the following properties:

* `spatial`

### Properties

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/spatial
---
```

## Attribution

This schema is referenced by the following properties:

* `attributions`

### Properties

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/attributions/items
---
```

## Related resource

This schema is referenced by the following properties:

* `referenced_by`

### Properties

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/referenced_by/items
---
```

## Source

This schema is referenced by the following properties:

* `lineage/sources`

### Properties

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/lineage/properties/sources/items
---
```