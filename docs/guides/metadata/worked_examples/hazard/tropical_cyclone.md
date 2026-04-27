# Probabilistic tropical cyclone model

**Example**: Raster return period maps showing tropical cyclone wind speeds using Generalized Extreme Value (GEV) statistical analysis.

## Step-by-step guidance

### 1. Dataset-level metadata

Select the following values when describing your dataset:

- **Risk data type**: `hazard`
- **Title**: "Probabilistic tropical cyclone wind hazard maps for [region]"
- **Description**: Brief description of the modeling approach and GEV analysis methodology
- **Publisher**: Organization or research institution that produced the model
- **License**: Appropriate license

### 2. Resources

Add resources for each return period map:

- **Format**: `geotiff` or `netcdf`
- **Spatial resolution**: Resolution in meters or degrees (e.g., 1000m, 0.01 degrees)
- **Coordinate reference system**: `EPSG:4326` or appropriate projected CRS

You may have multiple resources for different return periods (e.g., 10-year, 50-year, 100-year, 500-year).

### 3. Hazard metadata

Under the Hazard section:

#### Event sets

- **Analysis type**: `probabilistic`
- **Calculation method**: `simulated` or `statistical`
- **Event count**: Number of return period scenarios included
- **Occurrence range**: Range description (e.g., "1/10 to 1/500 years")

#### Hazards (within the event set)

- **Hazard type**: `wind`
- **Processes**: `tropical_cyclone`
- **Intensity measure**: `v_ect(3s):kph` (3-second gust wind speed in km/h) or `v_ect(1m):mph` (1-minute sustained wind in mph)

### 4. Statistical analysis

Add information about the extreme value analysis:

- **Statistical method**: Select `GEV` (Generalized Extreme Value)
- **Return periods**: List the return periods available (e.g., 10, 25, 50, 100, 250, 500 years)

### 5. Spatial coverage

Define the geographic extent:

- **Scale**: `national` or `regional`
- **Countries**: Select applicable ISO 3166-1 alpha-3 country codes
- **Bounding box**: Specify coordinates of the model domain

## Key considerations

- Each raster file typically represents one return period
- Ensure intensity measures are clearly specified with units
- GEV analysis parameters (location, scale, shape) may be documented in additional details
