# Flood hazard maps

**Example**: Shapefiles or rasters showing flood inundation extent and depth during recorded historical events.

## Step-by-step guidance

### 1. Dataset-level metadata

Select the following values when describing your dataset:

- **Risk data type**: `hazard`
- **Title**: "Flood inundation maps for \[event/region\]"
- **Description**: Brief description of the flood events, modeling approach, or observational data source
- **Publisher**: Organization that created or compiled the flood maps
- **License**: Appropriate license

### 2. Resources

Add resources for flood hazard map files:

- **Format**: `shapefile`, `geopackage`, `geotiff`, or `netcdf`
- **Spatial resolution**: Resolution for raster data (e.g., 30m) or scale for vector data
- **Coordinate reference system**: `EPSG:4326` or appropriate projected CRS for the region

You may have separate files for:

- Flood extent (binary inundation)
- Flood depth (water depth values)
- Flow velocity (if available)

### 3. Hazard metadata

Under the Hazard section:

#### Event sets

- **Analysis type**: `historical` (for observed events) or `scenario` (for modeled events)
- **Calculation method**: `observed`, `simulated`, or `inferred`
- **Event count**: Number of flood events documented
- **Occurrence time start**: Date of event(s) or start of analysis period
- **Occurrence time end**: End date if multiple events or modeling period
- **Occurrence time span**: Duration in ISO 8601 format

#### Hazards (within the event set)

- **Hazard type**: `flood`
- **Processes**: Select one or more:
  - `fluvial_flood` (river flooding)
  - `pluvial_flood` (surface water/rainfall flooding)
  - `coastal_flood` (storm surge, tidal flooding)
- **Intensity measure**:
  - `fl_wd:m` (flood water depth in meters)
  - `fl_fd:m3/s` (flood discharge)
  - `v_fld:m/s` (flow velocity)

### 4. Spatial coverage

Define the geographic extent:

- **Scale**: `sub-national`, `national`, or `regional`
- **Countries**: Select applicable ISO 3166-1 alpha-3 country codes
- **Administrative regions**: Specify provinces/states if relevant
- **Bounding box**: Specify coordinates of the mapped area

## Key considerations

- Clearly distinguish between flood extent (yes/no inundation) and flood depth (water depth values)
- For historical events, include event dates and names in the description
- Specify whether flood defenses are considered in the modeling
- Document the source of elevation data (e.g., DEM resolution) in additional details
