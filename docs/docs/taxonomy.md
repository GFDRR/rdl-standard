<!--https://hackmd.io/c3be76ulTnO2llvUWNM2sg-->

# Taxonomies

The RDLS defines taxonomies for describing risk data. In this section you will find a short summary of the taxonomies recommended for the RDLS, as well as the other main taxonomies for disaster risk assessments.

## Hazard taxonomies

There are several existing taxonomies that could have been adopted to describe hazard data. The RDL project performed a review of most of them.

This resulted in an new taxonomy to unify the existing taxonomies for the purpose of risk data classification, focusing on those hazards and processes that are more often required in disaster risk assessments while mapping and matching alternative definitions into one consistent framework.

### RDLS Hazard Taxonomy (recommended)

The **RDLS Hazard Taxonomy** classifies hazard phenomena as main hazard (8 categories) and hazard process (27 categories):

<div class="scrollbar table-scroll" markdown="1">

| **Hazard type** | **Process type** |
|---|---|
| Coastal Flood | Coastal Flood |
| Coastal Flood | Storm Surge |
| Convective Storm | Tornado |
| Drought | Agricultural Drought |
| Drought | Hydrological Drought |
| Drought | Meteorological Drought |
| Drought | Socio-economic Drought |
| Earthquake | Primary Rupture |
| Earthquake | Secondary Rupture |
| Earthquake | Ground Motion |
| Earthquake | Liquefaction |
| Extreme Temperature | Extreme cold |
| Extreme Temperature | Extreme heat |
| Flood | Fluvial Flood |
| Flood | Pluvial Flood |
| Landslide | Landslide |
| Landslide | Snow Avalanche |
| Tsunami | Tsunami |
| Volcanic | Ashfall |
| Volcanic | Ballistics |
| Volcanic | Proximal hazards |
| Volcanic | Lahar |
| Volcanic | Lava |
| Volcanic | Pyroclastic Flow |
| Wildfire | Wildfire |
| Strong Wind | Extratropical cyclone |
| Strong Wind | Tropical cyclone |

</div>
<br/>

Each hazard type and associated processes can have one or more type of measure metrics, which include the unit of measure:

<div class="scrollbar table-scroll" markdown="1">

**Hazard type** | **Metric:Unit** | **Description**
---|---|---
EQ | PGA:g | Peak ground acceleration in g
EQ | PGA:m/s2 | Peak ground acceleration in m/s2 (meters per second squared)
EQ | PGV:m/s | Peak ground velocity in m/s
EQ | AvgSa:m/s2 | Average spectral acceleration
EQ | Sd(T1):m | Spectral displacement
EQ | Sv(T1):m/s | Spectral velocity
EQ | PGDf:m | Permanent ground deformation
EQ | D:s | Significant duration
EQ | IA:m/s | Arias intensity (IÎ±) or (IA) or (Ia)
EQ | Neq:- | Effective number of cycles
EQ | EMS:- | European macroseismic scale
EQ | MMI:- | Modified Mercalli Intensity
EQ | CAV:m/s | Cumulative absolute velocity
EQ | D_B:s | Bracketed duration
FL, CF | fl_wd:m | Flood water depth
FL, CF | fl_wv:m/s | Flood flow velocity
WI | v_ect(3s):km/h | 3-sec at 10m sustained wind speed (kph)
WI | v_ect(1m):km/h | 1-min at 10m sustained wind speed (kph)
WI | v_etc(10m):km/h | 10-min sustained wind speed (kph)
WI | PGWS_tcy:km/h | Peak gust wind speed
LS | ls_fd:m | Landslide flow depth
LS | I_DF:m3/s2 | Debris-flow intensity index
LS | v_lsl:m/s2 | Landslide flow velocity
LS | ls_mfd:m | Maximum foundation displacement
LS | SD_lsl:m | Landslide displacement
TS | Rh_tsi:m | Tsunami wave runup height
TS | d_tsi:m | Tsunami inundation depth
TS | MMF:m4/s2 | Modified momentum flux
TS | F_drag:kN | Drag force
TS | Fr:- | Froude number
TS | v_tsi:m/s | Tsunami velocity
TS | F_QS:kN | Quasi-steady force
TS | MF:m3/s2 | Momentum flux
TS | h_tsi:m | Tsunami wave height
TS | Fh_tsi:m | Tsunami Horizontal Force
VO | h_vaf:m | Ash fall thickness
VO | L_vaf:kg/m2 | Ash loading
DR | CMI:- | Crop Moisture Index
DR | PDSI:- | Palmer Drought Severity Index
DR | SPI:- | Standard Precipitation Index

</div>
<br/>

### Other hazard taxonomies

For a mapping between RDLS Hazard Taxonomy and other existing hazard taxonomies, please see this [here](). 

List of other hazard taxonomies below:

- [**UNDRR**](https://www.undrr.org/publication/hazard-definition-and-classification-review) (formerly UNISDR) recently proposed an extended taxonomy that covers 300 natural and anthropogenic hazards in 8 categories (Meteo-Hydrological, Geohazard, Environmental, Extraterrestrial, Chemical, Biological, Technological, Societal).

- [**Disaster Risk Management Knowledge Centre**](https://drmkc.jrc.ec.europa.eu/risk-data-hub) covers 32 natural and anthropogenic hazards in 8 categories (Geophysical, Hydrological, Meteorological, Climatological, Biological, Technological, Transportation, Malicious).

- [**Inspire**](https://inspire.ec.europa.eu/codelist/NaturalHazardCategoryValue) covers 25 natural hazards in 6 categories (Geological/hydrological, Meteorological/climatological, Fires, Biological, Cosmic, Other).

- [**EM-DAT**](https://www.emdat.be/classification) covers 34 natural and technological hazards in 9 categories (Geophysical, Meteorological, Hydrological, Climatological, Biological, Extraterrestrial, Industrial accident, Transport accident, Miscelleanous accident).

- [**Munich-RE**](https://www.cred.be/downloadFile.php?file=sites/default/files/DisCatClass_264.pdf) covers 27 natural hazards 13 main categories (Geophysical, Meteorological, Hydrological, Climatological, Biological, Extraterrestrial).


## Exposure taxonomy 

The exposure schema can accomodate different descriptions of assets using a taxonomy which describes their characteristics (e.g. building occupancy, construction, age, height, etc. or road surface type).

### GED4all (recommended)

[**GED4all**](ged4all.md) has been developed by GFDRR under the UK-DFID Challenge Fund, this open exposure database schema is meant for multi-hazard risk analysis. GED4ALL can be populated with building-level data from OpenStreetMap (OSM) following the [guidance](https://wiki.openstreetmap.org/wiki/GED4ALL) from the Humanitarian OSM Team, which collects contributions from the community on how OSM tags can be best aligned with the GED4ALL taxonomy. This is the suggested option for classification of exposure data in the RDL.

### Other exposure taxonomies

[**GEM-OpenQuake**](https://platform.openquake.org/taxtweb): developed specifically for the Global Earthquake Model (GEM), this taxonomy is dedicated to buildings for which it describe the size and properties (height, number of storeys, age, occupancy, material, type of roof, floor and foundations).
