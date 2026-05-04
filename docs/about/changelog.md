# Changelog

This page lists changes to the Risk Data Library Standard.

## 1.0 - 2026-XX-XX

### Schema

Changes in this section are grouped by the schema component that they affect.

#### Cross-cutting

Changes in this section affect more than one schema component.

- [#392](https://github.com/GFDRR/rdl-standard/pull/392), (#409(https://github.com/GFDRR/rdl-standard/pull/409) (affects Hazard, Vulnerability and Loss):
  - Rationalise hazard modelling
  - Add conditional validation of hazard process based on hazard type
  - Add conditional validation of intensity measure based on hazard type
  - Add `Hazard.classification` and `Classification.title`
- [#380](https://github.com/GFDRR/rdl-standard/pull/380) (affects Exposure, Vulnerability and Loss):
  - `Metric` - Replace `.quantity_kind` with `.measurement.quantity_kind` and `.measurement.unit`
  - `Impact` - Replace `.unit` with `.measurement.quantity_kind` and `.measurement.unit`
- [#396](https://github.com/GFDRR/rdl-standard/pull/396) (affects Dataset and Hazard):
  - `Entity`: Require any of `.email`, `.url`.
  - `Event.ocurrence`: Require any of `.probabilistic`, `.empirical`, `.deterministic`.
- [#400](https://github.com/GFDRR/rdl-standard/pull/400) (affects Dataset and Loss):
  - Move `.sources` to `.lineage.sources`
  - Add `Source.risk_data_type`
  - Rename `Source.component` to `Source.used_in`
  - Add `.lineage.description`
  - Remove `.hazard_id`, `.exposure_id` and `.vulnerability_id` from `Losses`
- [#407](https://github.com/GFDRR/rdl-standard/pull/407) (affects Dataset and Resource)
  - Add `temporal` and `spatial_resolution` at dataset level
  - Add `spatial` to `Resource`
  - Update descriptions for `spatial`, `temporal`, `spatial_resolution` and `temporal_resolution` at both dataset and resource level.
- [#422](https://github.com/GFDRR/rdl-standard/pull/422) (affects Dataset, Resource, Hazard, Vulnerability and Loss):
  - Replace `project` with `project.name` and `project.url`.
  - Require either `Resource.download_url` or `Resource.access_url`.
  - Make `SimpleHazard.type` and `SimpleHazard.process` required.
  - Align `enums` with codelist CSVs.
  - Remove `Location.geometry`.
- [#405](https://github.com/GFDRR/rdl-standard/pull/405) (affects Dataset, Vulnerability and Losses):
  - Make `.description` required
  - Reorder some properties
  - Move repeated impact properties from `Losses` and `Function` to new `Impact` definition
  - Refactor to reduce repetition and standardise use of allOf keyword

#### Dataset

- [#373](https://github.com/GFDRR/rdl-standard/pull/373):
  - Add `License` to `$defs`
  - Add `format: iri` to `License`.
  - Add field `license` to `source` object.

#### Resource

- [#404](https://github.com/GFDRR/rdl-standard/pull/404)
  - Add `Climate` object to `$defs` with fields for `model`, `scenario` and `percentile`
  - Add `climate` to `Resource`
  - Add `baseline_period` to `Resource`
  - Add `central_year` to `Period`
- [#401](https://github.com/GFDRR/rdl-standard/pull/401) - Add `Resource.conforms_to`.
- [#398](https://github.com/GFDRR/rdl-standard/pull/398) - Add `spatial_aggregation` to `Resource`.

#### Hazard

- [#406](https://github.com/GFDRR/rdl-standard/pull/406) - Remove fields:
  - `Event.footprint`
  - `Event_set.temporal`
  - `Event_set.spatial`

#### Exposure

- [#408](https://github.com/GFDRR/rdl-standard/pull/408) - Make `exposure` an array of `Exposure_items`.
- [#415](https://github.com/GFDRR/rdl-standard/pull/415) - Replace `Exposure_item.taxonomy` with `Exposure_item.classification`.
- [#434](https://github.com/GFDRR/rdl-standard/pull/434) - Update `Exposure_item.asset_type.scheme` description.

#### Vulnerability

- [#395](https://github.com/GFDRR/rdl-standard/pull/395) - Refactor vulnerability component.

### Loss

- [#402](https://github.com/GFDRR/rdl-standard/pull/402) - Restructure `Losses`:
  - Rename `.category` to `.asset_category`
  - Move `.cost.dimension` to `.asset_dimension`
  - Move `.impact.type` to `.impact_and_losses.impact_type`
  - Move `.impact.base_data_type` to `.impact_and_losses.impact_modelling`
  - Move `.impact_metric` to `.impact_and_losses.impact_metric`
  - Replace `.impact.unit` and `.cost.unit` with `.impact_and_losses.Measurement`
  - Move `.type` to `.impact_and_losses.loss_type`
  - Move `.approach` to `.impact_and_losses.loss_approach`
  - Move `.hazard_analysis_type` to `.losses_and_impact.loss_frequency_type`
- [#453](https://github.com/GFDRR/rdl-standard/pull/453) Added `disaster_identifiers` to `losses`

### Codelists

Changes in this section are grouped by the codelist that they affect.

- `classification_scheme.csv`:
  - Add codes:
    - [#409](https://github.com/GFDRR/rdl-standard/pull/409) - 'UNDRR-HIPS-2025'
    - [#395](https://github.com/GFDRR/rdl-standard/pull/395):
      - 'HAZUS'
      - 'CDC-SVI'
      - 'Custom'
      - 'EMS-98'
      - 'PAGER'
      - 'OED'
  - Remove codes:
    - [#395](https://github.com/GFDRR/rdl-standard/pull/395) - 'GED4ALL-socio-economic'
    - [#434](https://github.com/GFDRR/rdl-standard/pull/434) - 'USHS_EHP'
  - Rename codes:
    - [#395](https://github.com/GFDRR/rdl-standard/pull/395) - 'MOVER-social-vulnerability-categories' to 'MOVER'
- `exposure_category.csv`:
  - [#395](https://github.com/GFDRR/rdl-standard/pull/395) - Add 'economic_indicator' and 'development_index'
- `hazard_type.csv`:
  - [#409](https://github.com/GFDRR/rdl-standard/pull/409) - Align with UNDRR HIPs.
- `impact_metric.csv`:
  - Add codes:
    - [#381](https://github.com/GFDRR/rdl-standard/pull/381) - 'risk_index'
    - [#395](https://github.com/GFDRR/rdl-standard/pull/395) - 'exposure_to_hazard'
    - [#402](https://github.com/GFDRR/rdl-standard/pull/402) - 'production_loss' and 'exposure_to_hazard'
    - [#418](https://github.com/GFDRR/rdl-standard/pull/418):
      - 'fatality_ratio_vulnerability'
      - 'fatality_count'
      - 'fatality_ratio_loss'
      - 'disruption_days'
      - 'disruption_loss'
      - 'displaced_days'
  - Rename codes:
    - [#384](https://github.com/GFDRR/rdl-standard/pull/384) - Rename non-unique 'loss_ratio' codes
- `imt.csv`:
  - Add codes
    - [#411](https://github.com/GFDRR/rdl-standard/pull/411) - 'fl_d:h'
    - [#418](https://github.com/GFDRR/rdl-standard/pull/418):
      - 'POE'
      - 'DSize'
      - 'SA:g'
  - [#370](https://github.com/GFDRR/rdl-standard/pull/370), [#383](https://github.com/GFDRR/rdl-standard/pull/383) - Rename codes and update code format
  - [#409](https://github.com/GFDRR/rdl-standard/pull/409) - Align with UNDRR HIPs
  - [#453](https://github.com/GFDRR/rdl-standard/pull/453) - Adding imt for sea level rise
- `license.csv`:
  - [#373](https://github.com/GFDRR/rdl-standard/pull/373) - Replace codes with license URLs, update titles
  - [#440](https://github.com/GFDRR/rdl-standard/pull/440) - Add CC BY-NC 4.0 license to license.csv
- `metric_dimension.csv`:
  - [#422](https://github.com/GFDRR/rdl-standard/pull/422) - Add missing title and description for 'index'.
- `process_type.csv`:
  - [#385](https://github.com/GFDRR/rdl-standard/pull/385) - Add 'volcano_gas_aerosols'
  - [#409](https://github.com/GFDRR/rdl-standard/pull/409) - Align with UNDRR HIPs.
- `quantity_kind.csv`:
  - [#403](https://github.com/GFDRR/rdl-standard/pull/403) - Add 'index'.
- `spatial_scale.csv`:
  - [#397](https://github.com/GFDRR/rdl-standard/pull/397) - Add 'urban'.

### Normative documentation

- [#405](https://github.com/GFDRR/rdl-standard/pull/405) - Restructure schema reference documentation.

### Non-normative documentation

- [#429](https://github.com/GFDRR/rdl-standard/pull/429) - Add guidance on describing location-only exposure data.
- [#431](https://github.com/GFDRR/rdl-standard/pull/431) - Update [What is the RDLS?](../rdl/what.md).

* [#434](https://github.com/GFDRR/rdl-standard/pull/434) - Remove `guides/metadata/mappings.md` in favour of mappings documented in codelists.

## 0.2.0 - 2023-09-08

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
- [#127](https://github.com/GFDRR/rdl-standard/pull/127) - Inline `Exposure`, `Hazard_metadata`, `vulnerability`, `Vulnerability_function`, `Fragility_function`, `Occurence`, `Damage_to_loss_function`, `Engineering_demand_function`, `Probability`, `Empirical`, `Deterministic` and `Loss` and rearrange `$defs`.
- [#168](https://github.com/GFDRR/rdl-standard/pull/168) - Add version number and `links` field.
- [#163](https://github.com/GFDRR/rdl-standard/pull/163) - fix typos within rdl_schema_0.1.json
- [#180](https://github.com/GFDRR/rdl-standard/pull/180) - Refactors schema, moves `hazard`, `exposure`, `vulnerability` and `loss` to top level and removes 'anyOf'.
- [#181](https://github.com/GFDRR/rdl-standard/pull/181) - Various fixes:
  - Codelist filename in `Classification.scheme`
  - {\{version}} placeholder replacement in built schema
  - `version` type
  - Required fields in `Event_set`, `Hazard` and `Footprint`
  - Markdown syntax in `Attribution.role` description
- [#190](https://github.com/GFDRR/rdl-standard/pull/190) - Deletes type key from properties with `$ref` components.
- [#212](https://github.com/GFDRR/rdl-standard/pull/212) - Update top-level `description`.
- [#203](https://github.com/GFDRR/rdl-standard/pull/203), [#228](https://github.com/GFDRR/rdl-standard/pull/228) - Add package schema.
- [#204](https://github.com/GFDRR/rdl-standard/pull/204), [#229](https://github.com/GFDRR/rdl-standard/pull/229):
  - Add field `metrics`.
  - rename cost_type.csv to metric_dimension.csv and update code descriptions.
  - Add quantity_kind.csv.
- [#207](https://github.com/GFDRR/rdl-standard/pull/207):
  - update description of `spatial` to recommend use of `bbox` when coordinates based location is needed.
  - update descriptions of `spatial`, `bbox`, `centroid` and `coordinates` to specify use of WGS84 and decimal degrees.
  - update `coordinates` to allow only numbers within arrays.
- [#208](https://github.com/GFDRR/rdl-standard/pull/208) - Add regex pattern to `coordinate_system` and update description to mandate ESRI or EPSG codes.
- [#205](https://github.com/GFDRR/rdl-standard/pull/205) - Convert `risk_data_type` to array.
- [#215](https://github.com/GFDRR/rdl-standard/pull/219) - Remove `.hazard_id`, `exposure_id` and `vulnerability_id` from `loss` required array.
- [#210](https://github.com/GFDRR/rdl-standard/pull/210) - Replace `resource.`url with `.access_url` and `download_url`
- [#218](https://github.com/GFDRR/rdl-standard/pull/218) - `Vulnerability·taxonomy` removed from required array.
- [#220](https://github.com/GFDRR/rdl-standard/pull/220) - Reorder top-level fields.
- [#233](https://github.com/GFDRR/rdl-standard/pull/233), [#235](https://github.com/GFDRR/rdl-standard/pull/235) - Rename authorNames to `author_names`, datePublished to `date_published` and gazetteerEntries to `gazetteer_entries`.
- [#232](https://github.com/GFDRR/rdl-standard/pull/232)
  - Convert `disaster_identifiers` to array of `Classification` objects.
  - Add new codes to classification_scheme.csv.
- [#236](https://github.com/GFDRR/rdl-standard/pull/236), [#244](https://github.com/GFDRR/rdl-standard/pull/244) - Fix broken codelist reference URLs.
- [#239](https://github.com/GFDRR/rdl-standard/pull/239) - Clarify purpose of `links`, add link to dataset identifier guidance in `id` description.
- [#241](https://github.com/GFDRR/rdl-standard/pull/241) - Update schema and documentation URLs.
- [#242](https://github.com/GFDRR/rdl-standard/pull/242) - Remove redundant `minProperties` keywords, add missing `minLength` and `uniqueItems` keywords.
- [#246](https://github.com/GFDRR/rdl-standard/pull/246) - Update `loss` component:
  - Replace `loss` object with `loss.losses` array.
  - Replace `loss.costs` array with `loss.losses.cost` object.

### Codelists

- [#101](https://github.com/GFDRR/rdl-standard/pull/101) - Update and rename `cost_type.csv` and create `exposure_category.csv`.
- [#114](https://github.com/GFDRR/rdl-standard/pull/114) - 'IMT.csv' add descriptions and change pattern of codes to metric:unit.
- [#117](https://github.com/GFDRR/rdl-standard/pull/117) - Create 'license.csv' codelist and replace `license_code` field with `license`.
- [#105](https://github.com/GFDRR/rdl-standard/pull/105) - Create 'country.csv', 'location_gazetteers.csv' and 'geometry_type.csv'.
- [#121](https://github.com/GFDRR/rdl-standard/pull/121) - Create 'frequency_distribution.csv' and 'seasonality.csv'
- [#130](https://github.com/GFDRR/rdl-standard/pull/130) - 'hazard_type.csv' add descriptions and hazard category which aligns with UNDRR Hazard taxonomy, and update codes from abbreviations to human-readable words.
- [#134](https://github.com/GFDRR/rdl-standard/pull/134) - 'risk_data_type.csv', replace codes with lower-case versions.
- [#143](https://github.com/GFDRR/rdl-standard/pull/143) - Update 'license.csv' to include Open Definition conformant licences and those listed as options on WB Data Catalog.
- [#164](https://github.com/GFDRR/rdl-standard/pull/164) - replace camelCase codes with snake_case codes in 'frequency_distribution.csv' and 'seasonality.csv'
- [#189](https://github.com/GFDRR/rdl-standard/pull/189) - add 'ISO 3166-1 alpha-3' to 'location_gazetteers.csv and 'generalized_extreme_value' to 'frequency_distribution.csv'
- [#136](https://github.com/GFDRR/rdl-standard/issues/136)- add description for secondary_rupture.
- [#214](https://github.com/GFDRR/rdl-standard/pull/214) - use consistent separators in `classification_scheme.csv` codes.

### Normative documentation

- [#120](https://github.com/GFDRR/rdl-standard/pull/120):
  - Rename data model documentation to reference documentation.
  - Use jsonschema Sphinx directive to generate schema reference tables from schema.
  - Restructure reference documentation.
  - Update `manage.py pre-commmit` to generate sub-schema reference.
- [#169](https://github.com/GFDRR/rdl-standard/pull/169) - Uncollapse `event_sets` in `hazard` reference table.
- [#146](https://github.com/GFDRR/rdl-standard/pull/146) - Update introduction to the RDLS reference section.
- [#193](https://github.com/GFDRR/rdl-standard/pull/193) - Fix lists of referencing fields for subschemas and codelists.
- [#212](https://github.com/GFDRR/rdl-standard/pull/212) - Update diagrams, add descriptions for dataset, resource and risk components.
- [#225](https://github.com/GFDRR/rdl-standard/pull/225) - Update high level descriptions of the 4 risk data components.
- [#196](https://github.com/GFDRR/rdl-standard/pull/196) - Add examples to schema reference documentation.
- [#214](https://github.com/GFDRR/rdl-standard/pull/214) - Improve display of codelist reference.

### Non-normative documentation

- [#111](https://github.com/GFDRR/rdl-standard/pull/111) - Add Global Library for Schools Infrastructure (GLOSI) to taxonomies.
- [#171](https://github.com/GFDRR/rdl-standard/pull/171) - Updating glossary to add loss components, adjust other entries and remove images from glossary.
- [#174](https://github.com/GFDRR/rdl-standard/pull/174) - Add local tests guidance to developer_docs.md
- [#172](https://github.com/GFDRR/rdl-standard/pull/172) - Re-write use cases as user stories, for data publisher and data user roles.
- [#175](https://github.com/GFDRR/rdl-standard/pull/175) - Restructure documentation, rewrite landing page, add new introductory content.
- [#224](https://github.com/GFDRR/rdl-standard/pull/224) - Update contact email addresses.
- [#239](https://github.com/GFDRR/rdl-standard/pull/239) - Add content to `docs/guides/metadata.md`, add UNDRR-ISC HIP taxonomy mapping.
- [#243](https://github.com/GFDRR/rdl-standard/pull/243) - Add link to RDLS Convertor tool in navigation menu.
