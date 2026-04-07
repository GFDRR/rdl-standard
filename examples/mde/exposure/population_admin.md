# Population dataset by administrative boundaries

**Example**: Population count data aggregated by administrative units (e.g., districts, municipalities) from census surveys or estimates.

## Step-by-step guidance

### 1. Dataset-level metadata

Select the following values when describing your dataset:

- **Risk data type**: `exposure`
- **Title**: "Population data for [region]"
- **Description**: Brief description of the population data source, survey year, and aggregation level
- **Publisher**: National statistical office or organization providing the data
- **License**: Appropriate license

### 2. Resources

Add resources for your population data files:

- **Format**: `csv`, `shapefile`, `geopackage`, or `geojson`
- **Spatial resolution**: Administrative level (e.g., ADMIN2, ADMIN3)
- **Coordinate reference system**: `EPSG:4326` (if spatial) or not applicable for tabular data

### 3. Exposure metadata

Under the Exposure section:

#### Category
- **Category**: `population`

#### Metrics
Define what is being measured:

**Metric 1 - Population count:**
- **Dimension**: `population`
- **Quantity kind**: `count`
- **Unit**: `people` or `1` (dimensionless count)

**Metric 2 - Population density** (optional):
- **Dimension**: `population`
- **Quantity kind**: `density`
- **Unit**: `people/km2`

#### Temporal information
- **Reference year**: Year of census or population estimate
- **Projection scenario** (if applicable): Baseline, SSP scenarios, etc.

### 4. Spatial coverage

Define the geographic extent:

- **Scale**: `national` or `sub-national`
- **Countries**: Select applicable ISO 3166-1 alpha-3 country codes
- **Administrative regions**: Specify the administrative level (e.g., provinces, districts, municipalities)
- **Gazetteer entries**: Link to administrative unit identifiers

## Example data structure

Your population dataset should include:
- Administrative unit ID/code
- Administrative unit name
- Geometry (polygon) or link to spatial boundaries
- Total population count
- Disaggregation by age groups (optional)
- Disaggregation by gender (optional)
- Urban/rural classification (optional)

## Key considerations

- Clearly specify the reference year for population data
- Document the source of data (census, survey, model estimate)
- Include information about disaggregation (age, gender) if available
- For projected populations, specify the scenario and methodology
- Link to official administrative boundary codes where possible (e.g., ISO 3166-2)
