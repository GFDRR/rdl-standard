# Dataset schema

```{contents} On this page
---
local:
depth: 1
---
```

The top-level object in the RDLS schema is a risk dataset. A risk dataset is described as:

```{jsoninclude-quote} ../../../schema/rdls_schema_processed.json
---
jsonpointer: /description
---
```

The general attributes of a dataset are described by fields based on the [Data Catalog Vocabulary](https://www.w3.org/TR/vocab-dcat-3/) and the [Dublin Core Metadata Initiative Metadata Terms](https://www.dublincore.org/specifications/dublin-core/dcmi-terms).

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

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/publisher
---
```

## Spatial coverage

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/spatial
---
```

## Attribution

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/attributions/items
---
```

## Related resource

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/referenced_by/items
---
```

## Source

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/lineage/properties/sources/items
---
```
