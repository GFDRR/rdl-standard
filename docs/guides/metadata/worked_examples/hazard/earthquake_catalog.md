# Historical earthquake catalog

**Example**: A CSV file containing historical seismic events with location, magnitude, and date information for empirical analysis.

## Step-by-step guidance

### 1. Dataset-level metadata

Select the following values when describing your dataset:

- **Risk data type**: `hazard`
- **Title**: "Historical earthquake catalog for \[region\]"
- **Description**: Brief description of the catalog coverage period and source
- **Publisher**: Organization maintaining the earthquake catalog
- **License**: Appropriate license (e.g., CC-BY-4.0, public domain)

### 2. Resources

Add one or more resources representing your earthquake catalog files:

- **Format**: `csv`, `shapefile`, or `geopackage`
- **Spatial resolution**: Point data (enter specific precision if relevant, e.g., 0.01 degrees)
- **Coordinate reference system**: `EPSG:4326` (or appropriate CRS)

### 3. Hazard metadata

Under the Hazard section:

#### Event sets

- **Analysis type**: `historical` (empirical/observed events)
- **Calculation method**: `observed`
- **Event count**: Total number of recorded earthquakes
- **Occurrence time start**: Start date of catalog coverage
- **Occurrence time end**: End date of catalog coverage
- **Occurrence time span**: Time period in ISO 8601 duration format (e.g., `P50Y` for 50 years)

#### Hazards (within the event set)

- **Hazard type**: `earthquake`
- **Processes**: `ground_shaking`
- **Intensity measure**: `PGA:g` (peak ground acceleration) or `v_ects:MW` (moment magnitude)

### 4. Spatial coverage

Define the geographic extent:

- **Scale**: `national`, `regional`, or `global`
- **Countries**: Select applicable ISO 3166-1 alpha-3 country codes
- **Bounding box**: Optional - specify coordinates if needed

## Example data structure

Your CSV file should include columns such as:

- Event ID
- Date/time (ISO 8601 format)
- Latitude
- Longitude
- Magnitude (with scale, e.g., Mw)
- Depth (km)
- Location description
