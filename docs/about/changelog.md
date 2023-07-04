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
- [#116](https://github.com/GFDRR/rdl-standard/pull/116) - Replace `biblio_title` and `biblio_url` with `Related_resource` definition.
- [#115](https://github.com/GFDRR/rdl-standard/pull/115) - Add `Entity` and `Attribution` objects, update entity related field names and descriptions.
- [#124](https://github.com/GFDRR/rdl-standard/pull/124):
  - Replace `vulnerability` object with `Vulnerability` definition.
  - Replace `function_type`, `calculation_method`, `approach`, `f_math` and `f_relationship` with `functions` object and `Vulnerability_function`, `Fragility_function`, `Damage_to_loss_function` and `Engineering_demand_function` definitions.
  - Add `.scale` to `Spatial` object.
  - Update field names, titles and descriptions in `Vulnerability` definition.
  - Create `Impact` object and update associated field names, titles and descriptions.

### Codelists

- [#101](https://github.com/GFDRR/rdl-standard/pull/101) - update and rename cost_type.csv, create exposure_category.csv
- [#114](https://github.com/GFDRR/rdl-standard/pull/114) - 'IMT.csv' add descriptions and change pattern of codes to metric:unit.
- [#117](https://github.com/GFDRR/rdl-standard/pull/117) - Create 'license.csv' codelist and replace `license_code` field with `license`.
- [#105](https://github.com/GFDRR/rdl-standard/pull/105) - Create 'country.csv', 'location_gazetteers.csv' and 'geometry_type.csv'.

### Normative documentation

### Non-normative documentation

- [#111 ](https://github.com/GFDRR/rdl-standard/pull/111) - Add Global Library for Schools Infrastructure (GLOSI) to taxonomies.

### Other
