# Changelog

This page lists changes to the Risk Data Library Standard.

## YYYY-MM-DD

### Schema

- [#93](https://github.com/GFDRR/rdl-standard/pull/93) - Remove nesting in top-level object.
- [#105](https://github.com/GFDRR/rdl-standard/pull/105) - Create `Spatial` object, replacing `common.geo_coverage`.
- [#102](https://github.com/GFDRR/rdl-standard/pull/102) - Replace `resource` object with `Resource` definition, add `Resource.id` and update the names, titles and descriptions of its other properties.
- [#104](https://github.com/GFDRR/rdl-standard/pull/104) - Add `Period` object.
- [#100](https://github.com/GFDRR/rdl-standard/pull/100) - Update field names, titles and descriptions not covered in other issues.

### Codelists

- [#105](https://github.com/GFDRR/rdl-standard/pull/105) - Create 'country.csv', 'location_gazetteers.csv' and 'geometry_type.csv'.

### Normative documentation

- [#120](https://github.com/GFDRR/rdl-standard/pull/120):
  - Rename data model documentation to reference documentation.
  - Use jsonschema Sphinx directive to generate schema reference tables from schema.
  - Restructure reference documentation.
  - Update `manage.py pre-commmit` to generate sub-schema reference.

### Non-normative documentation

### Other
