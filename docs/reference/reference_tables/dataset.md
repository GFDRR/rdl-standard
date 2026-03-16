# Dataset schema

```{contents} On this page
:local:
```
## Overview

```{mermaid}
    ---
    config:
    layout: elk
    elk:
        nodePlacementStrategy: SIMPLE
    ---

    erDiagram

        dataset {
            string id
            string(email) title
            string risk_data_type
            string(iri) license
        }

        publisher {
            string name
            string(email) email*
            string(iri) url*
        }

        spatial {

        }

        contact_point {
            string name
            string(email) email*
            string(iri) url*
        }

        creator {
            string name
            string(email) email*
            string(iri) url*
        }

        dataset ||--|{ resource: includes
        dataset ||--|| publisher: "published by"
        dataset ||--|| spatial: "covers the area described by"
        dataset ||--|| contact_point: "maintained by"
        dataset ||--|| creator: "produced by"
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
:       "attributions":{"url":"#attributions","text":"Attributions"},
:       "lineage/sources":{"url":"#sources","text":"Sources"},
:       "referenced_by":{"url":"#referenced-by","text":"Referenced by"},
:       "resources":{"url":"../resource","text":"Resource"},
:       "hazard":{"url":"#hazard-metadata","text":"Hazard metadata"},
:       "exposure":{"url":"#exposure-metadata","text":"Exposure metadata"},
:       "vulnerability":{"url":"#vulnerability-metadata","text":"Vulnerability metadata"},
:       "loss":{"url":"#loss-metadata","text":"Loss metadata"}
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

## Attributions

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/attributions/items
---
```

## Sources

```{jsonschema} ../../../schema/rdls_schema_processed.json
---
pointer: /properties/lineage/properties/sources/items
---
```