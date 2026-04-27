# Earthquake loss database

**Example**: A tabular database documenting economic losses from a historical earthquake event, with values in USD and breakdowns by loss type and geographic area.

## Step-by-step guidance

### 1. Dataset-level metadata

Select the following values when describing your dataset:

- **Risk data type**: `loss`
- **Title**: "Economic losses from [earthquake event name/date]"
- **Description**: Brief description of the earthquake event, affected regions, and data collection methodology
- **Publisher**: Organization that compiled the loss data (e.g., government agency, World Bank, insurance association)
- **License**: Appropriate license

### 2. Resources

Add resources for your loss database files:

- **Format**: `csv`, `xlsx`, or `geopackage`
- **Spatial resolution**: Administrative level, building-level, or grid-based
- **Coordinate reference system**: `EPSG:4326` (if spatial) or not applicable for tabular data

### 3. Loss metadata

Under the Loss section:

#### Loss category

- **Category**: `economic`

#### Hazard event reference

Link to the specific hazard event:

- **Hazard type**: `earthquake`
- **Event name**: Official name or designation of the earthquake
- **Event date**: Date of occurrence (ISO 8601 format: YYYY-MM-DD)
- **Event magnitude**: Moment magnitude (Mw) or other scale
- **Event location**: Epicenter coordinates or affected region

#### Loss metrics

Define what loss types are measured:

**Metric 1 - Direct structural damage:**

- **Loss type**: `direct`
- **Dimension**: `structure`
- **Unit**: Currency code (e.g., `USD`)
- **Reference year**: Year for currency valuation

**Metric 2 - Direct contents damage** (optional):

- **Loss type**: `direct`
- **Dimension**: `content`
- **Unit**: Currency code

**Metric 3 - Business interruption** (optional):

- **Loss type**: `indirect`
- **Dimension**: `business_interruption`
- **Unit**: Currency code

**Metric 4 - Casualties** (optional):

- **Loss type**: `human`
- **Dimension**: `fatalities` or `injuries`
- **Unit**: `people` or `count`

#### Temporal information

- **Assessment date**: When losses were assessed or reported
- **Time period**: If losses accumulated over time (e.g., business interruption duration)

### 4. Spatial coverage

Define the geographic extent of losses:

- **Scale**: `sub-national` or `national`
- **Countries**: Select applicable ISO 3166-1 alpha-3 country codes
- **Administrative regions**: Provinces/districts affected
- **Bounding box**: Coordinates of affected area

## Example data structure

Your loss database should include:

**For spatially-aggregated losses:**

- Geographic unit ID (e.g., admin code, district ID)
- Geographic unit name
- Geometry or coordinates (if spatial)
- Direct structural losses
- Direct contents losses
- Indirect/business interruption losses
- Number of buildings damaged by damage state
- Population affected
- Fatalities and injuries

**Example CSV structure:**

```
District_Code,District_Name,Direct_Loss_Structure_USD,Direct_Loss_Content_USD,Buildings_Damaged,Population_Affected,Fatalities
YEM001,Sana'a,125000000,45000000,2500,150000,45
YEM002,Taiz,78000000,28000000,1800,95000,28
YEM003,Aden,52000000,18000000,1200,60000,15
```

**For building-level losses:**

- Building ID
- Location (coordinates)
- Building type/taxonomy
- Damage state
- Structural loss value
- Contents loss value
- Occupants affected

## Key considerations

- Specify the currency and reference year for all monetary values
  - Include exchange rates if values were originally in local currency
  - Note if values are adjusted for inflation
- Document the source of loss estimates
  - Government assessments
  - Insurance claims data
  - Field surveys (PDNA, DALA)
  - Remote sensing damage assessment
  - Engineering estimates
- Distinguish between different loss types:
  - **Direct losses**: Physical damage to assets (structure, contents, inventory)
  - **Indirect losses**: Business interruption, production losses, economic disruption
  - **Intangible losses**: Loss of life, cultural heritage, environmental damage
- Include information about:
  - Assessment methodology and assumptions
  - Coverage (insured vs. uninsured losses)
  - Disaggregation (by sector, building type, damage state)
  - Uncertainty and confidence levels
- Reference the specific earthquake event clearly:
  - Official designation or name
  - Date and time
  - Magnitude and depth
  - Link to earthquake catalog or USGS event ID
- Note any exclusions or limitations:
  - Partial coverage areas
  - Excluded sectors or loss types
  - Time cutoffs for loss accumulation

## Linking to hazard and exposure data

When possible, provide linkages to:

- **Hazard**: Reference the earthquake event in a hazard catalog
- **Exposure**: Link to building inventory or exposure dataset for affected area
- **Vulnerability**: Reference damage functions used if losses are modeled rather than observed
