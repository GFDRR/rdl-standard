# Flood risk model

**Example**: A probabilistic risk model estimating mean annual disruption or expected annual damages to energy infrastructure from flooding.

## Step-by-step guidance

### 1. Dataset-level metadata

Select the following values when describing your dataset:

- **Risk data type**: `loss` (risk is expressed as expected losses)
- **Title**: "Flood risk assessment for [infrastructure type/region]"
- **Description**: Brief description of the risk model, infrastructure covered, and methodology
- **Publisher**: Organization that developed the risk model
- **License**: Appropriate license

### 2. Resources

Add resources for your risk model outputs:

- **Format**: `csv`, `geopackage`, `shapefile`, or `geotiff`
- **Spatial resolution**: Asset-level, grid-based, or administrative aggregation
- **Coordinate reference system**: `EPSG:4326` or appropriate projected CRS

### 3. Loss metadata

Under the Loss section:

#### Loss category
- **Category**: `economic` (for monetary losses) or `operational` (for service disruption)

#### Risk metrics
Define the risk measures provided:

**Metric 1 - Expected Annual Damage (EAD):**
- **Loss type**: `risk`
- **Dimension**: `structure` or `total`
- **Unit**: Currency code (e.g., `USD`)
- **Reference year**: Year for currency valuation
- **Interpretation**: Mean annual loss averaged across all flood return periods

**Metric 2 - Annual Average Loss (AAL)** (alternative term):
- **Loss type**: `risk`
- **Dimension**: As applicable
- **Unit**: Currency code

**Metric 3 - Service disruption:**
- **Loss type**: `risk`
- **Dimension**: `downtime`
- **Unit**: `days` or `hours`
- **Interpretation**: Expected annual downtime due to flood events

**Metric 4 - Affected population** (optional):
- **Loss type**: `risk`
- **Dimension**: `population`
- **Unit**: `people`

#### Return period losses (optional)
In addition to average annual metrics, you may include scenario losses:
- **Return periods**: e.g., 10, 50, 100, 500 years
- **Loss values**: Direct losses for each return period scenario

#### Hazard reference
Link to the flood hazard component:
- **Hazard type**: `flood`
- **Processes**: `fluvial_flood`, `pluvial_flood`, or `coastal_flood`
- **Return periods modeled**: List of return periods used in risk calculation
- **Hazard dataset**: Reference to the flood hazard maps used

#### Exposure reference
Link to the exposure component:
- **Exposure category**: `infrastructure` (or `buildings`, `population`)
- **Asset types**: Specify infrastructure types (e.g., power plants, substations, transmission lines)
- **Exposure dataset**: Reference to the infrastructure inventory used

#### Vulnerability reference
Link to the vulnerability component:
- **Vulnerability functions**: Reference to depth-damage curves used
- **Function IDs**: List specific vulnerability functions applied

### 4. Spatial coverage

Define the geographic extent:

- **Scale**: `national`, `sub-national`, or `regional`
- **Countries**: Select applicable ISO 3166-1 alpha-3 country codes
- **Administrative regions**: Specify if relevant
- **Infrastructure network**: Describe coverage (e.g., entire national grid, specific utility service area)
- **Bounding box**: Coordinates of modeled area

## Example data structure

Your risk model outputs should include:

**For asset-level risk:**
- Asset ID
- Asset type/category
- Location (coordinates)
- Expected Annual Damage (USD)
- Expected annual downtime (days)
- Return period losses (10yr, 50yr, 100yr, 500yr)
- Asset replacement value
- Risk as % of asset value

**Example CSV structure:**
```
Asset_ID,Asset_Type,Longitude,Latitude,EAD_USD,AAD_Days,Loss_10yr_USD,Loss_100yr_USD,Replacement_Value_USD,Risk_Ratio
PS_001,Substation,100.523,13.756,125000,0.5,50000,450000,15000000,0.0083
PP_001,Power_Plant,100.612,13.821,450000,2.1,200000,1800000,250000000,0.0018
TL_045,Transmission_Line,100.445,13.698,35000,0.2,15000,120000,2000000,0.0175
```

**For aggregated risk:**
- Geographic unit (admin area, grid cell)
- Total EAD across all assets
- Number of assets at risk
- Population affected
- Critical infrastructure count

## Key considerations

### Risk calculation methodology
- Document the approach used to calculate risk:
  - Integration of loss-exceedance curve
  - Summation across return periods with probability weighting
  - Monte Carlo simulation
- Specify assumptions:
  - Independence of flood events
  - Stationarity of hazard probabilities
  - Climate change considerations

### Model components
Clearly document linkages:
- **Hazard**: Which flood maps and return periods were used
- **Exposure**: Which infrastructure inventory and attributes
- **Vulnerability**: Which damage functions were applied
- **Dependencies**: Cascade effects, network disruptions

### Currency and valuation
- Specify currency and reference year
- Document valuation approach for infrastructure:
  - Replacement cost
  - Depreciated value
  - Service replacement value
- Include indirect losses if modeled:
  - Business interruption
  - Wider economic impacts
  - Social costs

### Uncertainty
- Include uncertainty bounds if available:
  - Aleatory uncertainty (natural variability)
  - Epistemic uncertainty (model/parameter uncertainty)
- Document sensitivity to key assumptions
- Provide confidence intervals for risk estimates

### Interpretation of risk metrics
- **Expected Annual Damage (EAD)**: Long-term average annual loss
  - Calculated by integrating the loss-exceedance curve
  - Represents the mean loss if same conditions persist over many years
- **Return period losses**: Scenario-based losses for specific events
  - E.g., "100-year flood loss" is loss from 1% annual probability event
  - NOT the loss expected to occur once per 100 years
- **Risk ratio**: EAD as percentage of asset value
  - Useful for prioritization and comparison across assets

### Time horizon and discounting
- Specify if risk is calculated for current conditions or future projections
- Note any discount rate applied for multi-year analyses
- Document climate change scenarios if included

## Linking to other components

A complete risk assessment should reference:
1. **Hazard dataset**: Flood maps used (with DOI or dataset ID)
2. **Exposure dataset**: Infrastructure inventory (with version)
3. **Vulnerability dataset**: Damage functions applied (with source)
4. **Validation**: Historical losses used for calibration (if available)

This allows users to:
- Understand the basis for risk estimates
- Reproduce calculations
- Update risk with new hazard scenarios or exposure data
- Validate against observed losses
