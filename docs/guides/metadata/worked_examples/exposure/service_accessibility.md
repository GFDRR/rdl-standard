# Service accessibility analysis over road networks

**Example**: Analysis of accessibility to critical services (hospitals, schools, emergency facilities) using road network data and travel time calculations.

## Step-by-step guidance

### 1. Dataset-level metadata

Select the following values when describing your dataset:

- **Risk data type**: `exposure`
- **Title**: "Service accessibility analysis for [region]"
- **Description**: Brief description of the accessibility analysis, services included, and methodology (e.g., network analysis, isochrones)
- **Publisher**: Organization that performed the accessibility analysis
- **License**: Appropriate license

### 2. Resources

Add resources for your accessibility analysis files:

- **Format**: `shapefile`, `geopackage`, `geojson`, `csv`, or `geotiff`
- **Spatial resolution**: Network segments, grid cells, or point-based (service locations)
- **Coordinate reference system**: `EPSG:4326` or appropriate projected CRS

You may have multiple resources for:
- Road network data
- Service locations (points)
- Accessibility zones (isochrones or travel time grids)
- Summary statistics by administrative area

### 3. Exposure metadata

Under the Exposure section:

#### Category
- **Category**: `infrastructure`

#### Taxonomy
- **Source**: Custom or infrastructure classification system
- **Codes**: Specify service types (e.g., healthcare, education, emergency response)

#### Metrics
Define what is being measured:

**Metric 1 - Travel time:**
- **Dimension**: `accessibility`
- **Quantity kind**: `time`
- **Unit**: `minutes` or `seconds`

**Metric 2 - Distance** (optional):
- **Dimension**: `accessibility`
- **Quantity kind**: `length`
- **Unit**: `km` or `m`

**Metric 3 - Service capacity** (optional):
- **Dimension**: `structure`
- **Quantity kind**: `count`
- **Unit**: `1` (e.g., number of beds, classrooms)

#### Occupancy
Specify infrastructure types:
- `healthcare`
- `education`
- `emergency_services`
- `transportation`
- (Select all that apply)

### 4. Spatial coverage

Define the geographic extent:

- **Scale**: `sub-national`, `national`, or `regional`
- **Countries**: Select applicable ISO 3166-1 alpha-3 country codes
- **Administrative regions**: Specify provinces/districts if relevant
- **Bounding box**: Specify coordinates of the analysis area

## Example data structure

Your accessibility dataset should include:

**Service locations:**
- Service ID
- Service type/category
- Coordinates
- Capacity information
- Operating status

**Road network:**
- Road segment ID
- Road class/type
- Speed limit or average travel speed
- Road condition
- Geometry (line)

**Accessibility results:**
- Location identifier
- Nearest service ID
- Travel time (minutes)
- Travel distance (km)
- Service accessibility category (e.g., "within 30 minutes")

## Key considerations

- Specify the travel mode assumed (driving, walking, public transport)
- Document assumptions about travel speeds and road conditions
- Include temporal factors if relevant (peak hours, seasonal access)
- Clarify whether analysis considers barriers (bridges out, flooding, etc.)
- Reference the road network dataset used (e.g., OpenStreetMap, national road database)
- Specify the method used for accessibility calculation (network analysis, Euclidean distance, cost-distance)
