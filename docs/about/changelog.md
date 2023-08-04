# Changelog

This page lists changes to the Risk Data Library Standard.

## YYYY-MM-DD

### Schema

- [#93](https://github.com/GFDRR/rdl-standard/pull/93) - Remove nesting in top-level object.
- [#101](https://github.com/GFDRR/rdl-standard/pull/101) - create `Exposure` object and updated associated field names, titles and descriptions.
- [#105](https://github.com/GFDRR/rdl-standard/pull/105) - Create `Spatial` object, replacing `common.geo_coverage`.
- [#102](https://github.com/GFDRR/rdl-standard/pull/102) - Replace `resource` object with `Resource` definition, add `Resource.id` and update the names, titles and descriptions of its other properties.
- [#104](https://github.com/GFDRR/rdl-standard/pull/104) - Add `Period` object.
- [#100](https://github.com/GFDRR/rdl-standard/pull/100) - Update field names, titles and descriptions not covered in other issues.
- [#119](https://github.com/GFDRR/rdl-standard/pull/119):
  - Add fields:
    - `identifier`
    - `sources`
    - `temporal_resolution`
    - `Resource.temporal_resolution`
  - Add `Source` definition.
  - Update field descriptions in `Resource` definition.
  - Add validation keywords to `Location`, `Gazetteer_entry` and `Geometry` definitions.
- [#116](https://github.com/GFDRR/rdl-standard/pull/116) - Replace `biblio_title` and `biblio_url` with `Related_resource` definition.
- [#115](https://github.com/GFDRR/rdl-standard/pull/115) - Add `Entity` and `Attribution` objects, update entity related field names and descriptions.
- [#121](https://github.com/GFDRR/rdl-standard/pull/121):
  - Nest footprints within events and events within event sets.
  - Update `calculation_method`.
  - Add fields:
    - `event_set.id`
    - `event.id`
    - `footprint_set.id`
    - `event_set.disaster_identifier`
    - `event_set.frequency_distribution`
    - `event_set.seasonality`
    - `event_set.calculation_method`
    - `event_set.number_events`
    - `event_set.temporal`
  - Add codelists for `event_set.hazard_type` and `event_set.analysis_type`.
  - Move `process_type` from `footprint_set` to `event` and `event_set`.
  - Create `Occurrence` object.
  - Removes `common_calc_method`, `common_frequency_type`, `common_hazard_type`, `common_impact_type`, `common_process_type` and `im_code`.
- [#124](https://github.com/GFDRR/rdl-standard/pull/124):
  - Replace `vulnerability` object with `Vulnerability` definition.
  - Replace `function_type`, `calculation_method`, `approach`, `f_math` and `f_relationship` with `functions` object and `Vulnerability_function`, `Fragility_function`, `Damage_to_loss_function` and `Engineering_demand_function` definitions.
  - Add `.scale` to `Spatial` object.
  - Update field names, titles and descriptions in `Vulnerability` definition.
  - Create `Impact` object and update associated field names, titles and descriptions.
    -[#132](https://github.com/GFDRR/rdl-standard/pull/132):
  - Replace `loss` object with `Loss` definition.
  - Removes `time_start`, `time_end`, `time_year` from `loss`.
  - Removes `loss_loss_type`, `loss_metric` from `$defs`.
- [#127](https://github.com/GFDRR/rdl-standard/pull/127) - Inline `Exposure`, `Hazard_metadata`, `vulnerability`, `Vulnerability_function`, `Fragility_function`, `Occurence`, `Damage_to_loss_function`, `Engineering_demand_function`, `Probability`, `Empirical`, `Deterministic` and `Loss` and rearrange `$defs`
- [#163](https://github.com/GFDRR/rdl-standard/pull/163) - fix typos within rdl_schema_0.1.json

### Codelists

- [#101](https://github.com/GFDRR/rdl-standard/pull/101) - update and rename cost_type.csv, create exposure_category.csv
- [#114](https://github.com/GFDRR/rdl-standard/pull/114) - 'IMT.csv' add descriptions and change pattern of codes to metric:unit.
- [#117](https://github.com/GFDRR/rdl-standard/pull/117) - Create 'license.csv' codelist and replace `license_code` field with `license`.
- [#105](https://github.com/GFDRR/rdl-standard/pull/105) - Create 'country.csv', 'location_gazetteers.csv' and 'geometry_type.csv'.
- [#121](https://github.com/GFDRR/rdl-standard/pull/121) - Create 'frequency_distribution.csv' and 'seasonality.csv'
- [#130](https://github.com/GFDRR/rdl-standard/pull/130) - 'hazard_type.csv' add descriptions and hazard category which aligns with UNDRR Hazard taxonomy, and update codes from abbreviations to human-readable words.
- [#134](https://github.com/GFDRR/rdl-standard/pull/134) - 'risk_data_type.csv', replace codes with lower-case versions.
- [#164](https://github.com/GFDRR/rdl-standard/pull/164) - replace camelCase codes with snake_case codes in 'frequency_distribution.csv' and 'seasonality.csv'

### Normative documentation

- [#120](https://github.com/GFDRR/rdl-standard/pull/120):
  - Rename data model documentation to reference documentation.
  - Use jsonschema Sphinx directive to generate schema reference tables from schema.
  - Restructure reference documentation.
  - Update `manage.py pre-commmit` to generate sub-schema reference.
- [#146](https://github.com/GFDRR/rdl-standard/pull/146) - Update introduction to the RDLS reference section. 

### Non-normative documentation

- [#111](https://github.com/GFDRR/rdl-standard/pull/111) - Add Global Library for Schools Infrastructure (GLOSI) to taxonomies.

### Other
