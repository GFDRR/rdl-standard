# Schema

The schema provides the authoritative definition of the structure of Risk Data Library Standard (RDLS) data, the meaning of each field, and the rules that must be followed to publish RDLS data. It is used to validate the structure and format of RDLS data.

For this version of RDLS, the canonical URL of the schema is []](). Use the canonical URL to make sure that your software, documentation or other resources refer to the specific version of the schema with which they were tested.

This page presents the schema in an [interactive browser](#browser) and in [reference tables](#reference-tables) with additional information in paragraphs. You can also download the canonical version of the schema as [JSON Schema](../../schema/rdl_schema_0.1.json) or download it as a CSV spreadsheet [TODO].

```{note}
   If any conflicts are found between the text on this page and the text within the schema, the text within the schema takes precedence.
```

## Browser

Click on schema elements to expand the tree, or use the '+' icon to expand all elements. Use { } to view the underlying schema for any section. Required fields are indicated in **bold**.

<script src="../../_static/docson/widget.js" data-schema="../rdl_schema_0.1.json"></script>

## Reference tables

### Dataset

```{jsonschema} ../../schema/rdl_schema_0.1.json
:addtargets:
```

### Hazard

```{jsonschema} ../../schema/rdl_schema_0.1.json
:pointer: /anyOf/0/properties/hazard
:collapse: 
:addtargets:
```

### Exposure

```{jsonschema} ../../schema/rdl_schema_0.1.json
:pointer: /anyOf/1/properties/exposure
:collapse: 
:addtargets:
```

### Vulnerability

```{jsonschema} ../../schema/rdl_schema_0.1.json
:pointer: /anyOf/2/properties/vulnerability
:collapse: 
:addtargets:
```

### Loss

```{jsonschema} ../../schema/rdl_schema_0.1.json
:pointer: /anyOf/3/properties/loss
:collapse: 
:addtargets:
```

### Sub-schemas

#### common_aggregation_type

```{jsonschema} ../../schema/rdl_schema_0.1.json
:pointer: /$defs/common_aggregation_type
:collapse: 
:addtargets:
```

    "common_analysis_type": 
    "common_calc_method": 
    "common_exp_category": 
    "common_exp_occupancy": 
    "common_exp_val_type": 
    "common_frequency_type": 
    "common_hazard_type": 
    "common_impact_type": 
    "common_iso": 
    "common_license": 
    "common_occupancy_time": 
    "common_process_type": 
    "im_code": 
    "loss_loss_type": 
    "loss_metric": 
    "vulnerability_function_type": 
    "vulnerability_f_subtype": 
    "vulnerability_f_relationship": 
    "vulnerability_f_math": 
