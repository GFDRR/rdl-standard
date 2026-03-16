# Hazard metadata schema

```{contents} On this page
:local:
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

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/hazard/properties/event_sets/items
:collapse: hazards,spatial,events
:externallinks: >
:   {
:       "hazards":{"url":"#hazards","text":"Hazards"},
:       "spatial":{"url":"#spatial-coverage","text":"Spatial coverage"},
:       "events":{"url":"#events","text":"Events"}
:   }
```

## Hazards

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/hazard/properties/event_sets/items/properties/hazards/items
```

##  Spatial coverage

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/hazard/properties/event_sets/items/properties/spatial
```

## Events

```{jsonschema} ../../../schema/rdls_schema_processed.json
:pointer: /properties/hazard/properties/event_sets/items/properties/events/items
```