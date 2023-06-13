<!--https://hackmd.io/c3be76ulTnO2llvUWNM2sg-->

# Taxonomies

The RDLS defines taxonomies for describing risk data. In this section you will find a short summary of the taxonomies that can be used with the RDLS, as well as the other main taxonomies for disaster risk assessments.

## Hazard taxonomies

The RDL project performed a review of the most relevant hazard taxonomies and derived a classification focusing on those hazards and processes that are more often required in disaster risk assessments, while mapping and matching alternative definitions into one consistent framework. There are several existing taxonomies that could have been adopted to describe hazard data:

- [**UNDRR**](https://www.undrr.org/publication/hazard-definition-and-classification-review) (formerly UNISDR) recently proposed an extended taxonomy that covers 300 natural and anthropogenic hazards in 8 categories (Meteo-Hydrological, Geohazard, Environmental, Extraterrestrial, Chemical, Biological, Technological, Societal).

- [**Disaster Risk Management Knowledge Centre**](https://drmkc.jrc.ec.europa.eu/risk-data-hub) covers 32 natural and anthropogenic hazards in 8 categories (Geophysical, Hydrological, Meteorological, Climatological, Biological, Technological, Transportation, Malicious).

- [**Inspire**](https://inspire.ec.europa.eu/codelist/NaturalHazardCategoryValue) covers 25 natural hazards in 6 categories (Geological/hydrological, Meteorological/climatological, Fires, Biological, Cosmic, Other).

- [**EM-DAT**](https://www.emdat.be/classification) covers 34 natural and technological hazards in 9 categories (Geophysical, Meteorological, Hydrological, Climatological, Biological, Extraterrestrial, Industrial accident, Transport accident, Miscelleanous accident).

- [**Munich-RE**](https://www.cred.be/downloadFile.php?file=sites/default/files/DisCatClass_264.pdf) covers 27 natural hazards 13 main categories (Geophysical, Meteorological, Hydrological, Climatological, Biological, Extraterrestrial).


## Exposure taxonomies 

The exposure schema can accomodate different descriptions of assets using a taxonomy which describes their characteristics (e.g. building occupancy, construction, age, height, etc. or road surface type).

### GED4all (recommended)

[**GED4all**](ged4all.md) has been developed by GFDRR under the UK-DFID Challenge Fund, this open exposure database schema is meant for multi-hazard risk analysis. GED4ALL can be populated with building-level data from OpenStreetMap (OSM) following the [guidance](https://wiki.openstreetmap.org/wiki/GED4ALL) from the Humanitarian OSM Team, which collects contributions from the community on how OSM tags can be best aligned with the GED4ALL taxonomy. This is the suggested option for classification of exposure data in the RDL.

```{eval-rst}
.. toctree::
   :maxdepth: 1
   :hidden:

   ged4all

```
### GEM Building Taxonomy

The [GEM Building Taxonomy](https://www.globalquakemodel.org/gempublications/GEM-building-taxonomy-version-2.0) is dedicated to building characteristics relevant to assessing vulnerability to seismic events. It describes characteristics such as an asset's height, number of storeys, age, occupancy, material, type of roof, floor, foundations and structural system. [TaxtWEB](https://platform.openquake.org/taxtweb) is a tool developed by GEM to assist with the generation of the taxonomy string which is used to describe these attributes. 

Example: The string `CR/HEX:1/YEX:1981/RES+RES1` describes a residential single family building, of reinforced concrete construction, built in 1981. This is the short version of the taxonomy, the long version explicitly includes all of the unknown fields too.

### Open Exposure Data (OED) 

[OED](https://github.com/OasisLMF/ODS_OpenExposureData) is a standard curated by the Oasis community for the insurance industry. The aim of OED is to provide the industry with a robust, open, and transparent data format. The detailed descriptions of the OED taxonomy to describe an asset (structure, infrastructure, or human) are covered in ['Open Exposure Data Spec.xlsx' with reference and background information](https://github.com/OasisLMF/ODS_OpenExposureData/tree/develop/OpenExposureData/Docs), or [online]https://oasislmf.github.io/OpenDataStandards/index.html.

Example: In the Open Exposure Data (OED) Standard and other insurance industry models, asset characteristics are separated into individual columns. This record describes a building classified as general residential, single storey, constructed from adobe masonry, with an unknown year of construction:
| OccupancyCode | ConstructionCode | NumberOfStoreys | YearBuilt |
| -------------- | -------------- | -------------- | -------------- |
| 1050 | 5101 | 1 | 0 |


### CEDE

[CEDE (Catastrophe Exposure Data Exchange)](https://docs.air-worldwide.com/Database/CEDE/10.0/webframe.html#topic1.html), is the exposure database format used by Touchstone®, AIR's comprehensive risk management platform that was first released in early 2013. It is publicly available and used widely in the insurance industry to describe asset characteristics and values for catastrophe modelling. CEDE uses a database format and allows users to apply different occupancy and construction schemes and codesets to their data, and add additional fields describing year of construction, number of storeys, etc. The most common taxonomy used in CEDE is [AIRConstruction](https://docs.air-worldwide.com/Database/CEDE/10.0/webframe.html#topic32.html) and [AIROccupancy](https://docs.air-worldwide.com/Database/CEDE/10.0/webframe.html#topic33.html). These codes are also available in the [OED Open Exposure Data Spec](https://github.com/OasisLMF/ODS_OpenExposureData/tree/develop/OpenExposureData/Docs) as OED was based on and builds on CEDE.

Example: In CEDE data asset characteristics are separated into individual columns. This record describes a building classified as general residential, single storey, constructed from adobe masonry, with an unknown year of construction: 
| OccupancyCode | ConstructionCode | NumberOfStoreys | YearBuilt
| -------------- | -------------- | -------------- | -------------- |
| 301 | 112 | 1 | 0 |


## Vulnerability taxonomies

Content under development.

## Loss taxonomies

Content under development.
