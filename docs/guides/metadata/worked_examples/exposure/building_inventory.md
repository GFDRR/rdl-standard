# Building inventory database

**Example**: A geopackage or shapefile containing building footprints with structural attributes and replacement costs.

## Step-by-step guidance

### 1. Dataset-level metadata

Select the following values when describing your dataset:

- **Risk data type**: `exposure`
- **Title**: "Building inventory for \[region\]"
- **Description**: Brief description of the building database, data collection method, and coverage
- **Publisher**: Organization that compiled or maintains the building inventory
- **License**: Appropriate license

### 2. Resources

Add resources for your building inventory files:

- **Format**: `geopackage`, `shapefile`, `csv`, or `geojson`
- **Spatial resolution**: Building-level (footprint) or aggregated (e.g., grid cell)
- **Coordinate reference system**: `EPSG:4326` or appropriate projected CRS

### 3. Exposure metadata

Under the Exposure section:

#### Category

- **Category**: `buildings`

#### Taxonomy

Select the appropriate taxonomy source:

- **Source**: `GED4ALL` (Global Exposure Database for All)
- Alternative sources: custom taxonomy, national building codes, PAGER

#### Metrics

Define what is being measured for each building:

**Metric 1 - Structure value:**

- **Dimension**: `structure`
- **Quantity kind**: `currency`
- **Unit**: Currency code (e.g., `USD`, `EUR`)

**Metric 2 - Building count** (if aggregated):

- **Dimension**: `buildings`
- **Quantity kind**: `count`
- **Unit**: `1` (dimensionless count)

**Metric 3 - Floor area** (optional):

- **Dimension**: `structure`
- **Quantity kind**: `area`
- **Unit**: `m2`

#### Occupancy

Specify building use types present in the inventory:

- `residential`
- `commercial`
- `industrial`
- `infrastructure`
- (Select all that apply)

### 4. Spatial coverage

Define the geographic extent:

- **Scale**: `sub-national`, `national`, or `regional`
- **Countries**: Select applicable ISO 3166-1 alpha-3 country codes
- **Administrative regions**: Specify provinces/cities if relevant
- **Bounding box**: Specify coordinates of the inventory coverage

## Example data structure

Your building inventory should include attributes such as:

- Building ID
- Geometry (point or polygon)
- Occupancy type
- Building taxonomy code
- Number of stories
- Construction material
- Year built
- Replacement cost
- Floor area
- Number of occupants (if available)

## Key considerations

- Use standardized taxonomy codes (e.g., GED4ALL) for consistency
- Document the currency and reference year for cost values
- Specify whether values are replacement cost, market value, or other
- Include data collection date and methodology in additional details
