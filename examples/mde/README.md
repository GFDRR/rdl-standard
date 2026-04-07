# Metadata Editor Examples

This directory contains step-by-step guidance examples for using the RDL Standard metadata editor. These examples help users understand what values to select when describing different types of risk datasets.

## Purpose

Unlike the complete schema examples in the parent `examples/` directory, these files provide:

1. **Quick reference guidance** for metadata entry
2. **Step-by-step instructions** on what to select in the editor
3. **Practical examples** of data structures
4. **Key considerations** for each dataset type

These examples are designed to be:
- **Discoverable**: Easy to find and reference in documentation
- **Maintainable**: Separate from normative schema content
- **Reusable**: Can be loaded by external tools and documentation sites

## Structure

Examples are organized by risk data component:

### Hazard (`hazard/`)
- [earthquake_catalog.md](hazard/earthquake_catalog.md) - Historical earthquake catalog with empirical analysis
- [tropical_cyclone.md](hazard/tropical_cyclone.md) - Probabilistic tropical cyclone wind hazard using GEV analysis
- [flood_inundation.md](hazard/flood_inundation.md) - Flood hazard maps showing inundation extent

### Exposure (`exposure/`)
- [building_inventory.md](exposure/building_inventory.md) - Building inventory database with footprints and attributes
- [population_admin.md](exposure/population_admin.md) - Population dataset by administrative boundaries from surveys
- [service_accessibility.md](exposure/service_accessibility.md) - Service accessibility analysis over road networks

### Vulnerability (`vulnerability/`)
- [earthquake_fragility.md](vulnerability/earthquake_fragility.md) - Earthquake fragility curves for building structures
- [flood_damage_curves.md](vulnerability/flood_damage_curves.md) - Flood depth-damage functions from statistical analysis
- [wealth_index.md](vulnerability/wealth_index.md) - Relative wealth index as socio-economic vulnerability indicator

### Loss (`loss/`)
- [earthquake_loss.md](loss/earthquake_loss.md) - Earthquake loss database from historical event
- [flood_risk.md](loss/flood_risk.md) - Flood risk model with expected annual damages

## Using these examples

Each example file follows a consistent structure:

1. **Overview**: Brief description of the example dataset type
2. **Step-by-step guidance**: Detailed instructions organized by metadata section
3. **Example data structure**: Sample data formats and field descriptions
4. **Key considerations**: Important notes and best practices

## Integration with documentation

These examples are intended to be:

1. **Linked from schema descriptions**: Referenced in the main documentation rather than embedded
2. **Loaded by metadata editors**: Can be parsed by tools to provide contextual help
3. **Version controlled**: Tracked separately from normative schema content
4. **Multilingual ready**: Structured for potential translation

## Related resources

- Complete schema examples: `/examples/hazard/`, `/examples/exposure/`, etc.
- Schema reference documentation: `/docs/reference/schema/`
- RDLS guidance: `/docs/guides/`

## Contributing

When adding new examples:

1. Follow the existing template structure
2. Use clear, concise language
3. Provide practical, realistic scenarios
4. Include data structure examples with sample values
5. Document key considerations and common pitfalls
6. Link to relevant codelists and taxonomies

## Source

These examples were created based on the requirements in [Issue #417](https://github.com/GFDRR/rdl-standard/issues/417), which identified the need for practical guidance that is:
- Available and discoverable in the documentation site
- Separated from normative schema content for better version control
- Easy to maintain without complex markdown escaping in JSON
