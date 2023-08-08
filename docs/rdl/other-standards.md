# How does RDLS relate to other standards?

RDLS has been built based on existing open data standards.

In this section you will find a short summary of the core standards upon which the RDL data model has been built.

## General standards

RDLS is built using [JSON](https://www.json.org/json-en.html) (JavaScript Object Notation). JSON is a lightweight data-interchange format which is easy for humans to read and write and easy for machines to parse and generate.

## Hazard data standards

In 2018 an international consortium led by the British Geological Survey developed a first-of-its-kind standard for hazard information.
In this standard, we developed a list of hazard type codes and process type codes which are used as a reference in the hazard, vulnerability and loss components of the standard, and facilitate matching of appropriate vulnerability functions to hazard data, for example.
Details about the development are reported [here](https://riskdatalibrary.org/resources).

**GLIDE disaster event identifier**:
Since the beginning of 2004, GLobal IDEntifier numbers (GLIDE) are produced at (GLIDEnumber.net) for all new disaster events reported by partner institutions and those discovered by ADRC.
A GLIDE number comprises two letters to identify the disaster type (e.g. EQ - earthquake); the year of the disaster; a six-digit, sequential disaster number; and the three-letter ISO code for country of occurrence. E.g., the GLIDE number for West-India Earthquake in India is: EQ-2001-000033-IND. This number is posted by the above organizations and in many other websites, on their documents relating to that particular disaster and gradually other partners will include it in whatever information they generate. As information suppliers join in this initiative, documents and data pertaining to specific events may be easily retrieved from various sources, or linked together using the unique GLIDE numbers. List of services using GLIDE: https://glidenumber.net/glide/public/links.jsp
The RDL Standard uses a GLIDE number in the `hazard.event` object, to denote the historical event to which hazard event data relates, e.g., the simulated hazard intensity footprint of that event.

### Hazard taxonomies

The RDL project performed a review of the most relevant hazard taxonomies and derived a classification focusing on those hazards and processes that are more often required in disaster risk assessments, while mapping and matching alternative definitions into one consistent framework. There are several existing taxonomies that could have been adopted to describe hazard data:

- [UNDRR](https://www.undrr.org/publication/hazard-definition-and-classification-review) (formerly UNISDR) recently proposed an extended taxonomy that covers 300 natural and anthropogenic hazards in 8 categories (Meteo-Hydrological, Geohazard, Environmental, Extraterrestrial, Chemical, Biological, Technological, Societal).

- [Disaster Risk Management Knowledge Centre](https://drmkc.jrc.ec.europa.eu/risk-data-hub) covers 32 natural and anthropogenic hazards in 8 categories (Geophysical, Hydrological, Meteorological, Climatological, Biological, Technological, Transportation, Malicious).

- [Inspire](https://inspire.ec.europa.eu/codelist/NaturalHazardCategoryValue) covers 25 natural hazards in 6 categories (Geological/hydrological, Meteorological/climatological, Fires, Biological, Cosmic, Other).

- [EM-DAT](https://www.emdat.be/classification) covers 34 natural and technological hazards in 9 categories (Geophysical, Meteorological, Hydrological, Climatological, Biological, Extraterrestrial, Industrial accident, Transport accident, Miscellaneous accident).

- [Munich-RE](https://www.cred.be/downloadFile.php?file=sites/default/files/DisCatClass_264.pdf) covers 27 natural hazards 13 main categories (Geophysical, Meteorological, Hydrological, Climatological, Biological, Extraterrestrial).

## Exposure standards

The exposure schema can accommodate different descriptions of assets using a taxonomy which describes their characteristics (e.g. building occupancy, construction, age, height, etc. or road surface type).

### GED4ALL

In 2018 an international consortium led by the Global Earthquake Model Foundation (GEM) developed an open, multi-scale exposure data schema for multi-hazard analysis ([GED4ALL](https://wiki.openstreetmap.org/wiki/GED4ALL)) in response to recommendations from community consultation. GED4ALL simplified certain detailed engineering aspects of the original global exposure model focussed on earthquake hazards ([GED4GEM](https://journals.sagepub.com/doi/10.1177/8755293020919429)), while also expanding the exposure parameters included, so the impacts of other hazards could be related to exposure data using the standard. In this standard, GED4ALL is used as a reference in the exposure, vulnerability and loss components, to describe the exposure type to which losses relate, and to facilitate matching of appropriate vulnerability functions to exposure data, for example. Details about the development of GED4ALL are reported [here](https://riskdatalibrary.org/resources).

GED4ALL can be populated with building-level data from OpenStreetMap (OSM) following the [guidance](https://wiki.openstreetmap.org/wiki/GED4ALL) from the Humanitarian OSM Team, which collects contributions from the community on how OSM tags can be best aligned with the GED4ALL taxonomy. This is the suggested option for classification of exposure data in the RDL.

### GEM Building Taxonomy

The [GEM Building Taxonomy](https://www.globalquakemodel.org/gempublications/GEM-building-taxonomy-version-2.0) is dedicated to building characteristics relevant to assessing vulnerability to seismic events. It describes characteristics such as an asset's height, number of storeys, age, occupancy, material, type of roof, floor, foundations and structural system. [TaxtWEB](https://platform.openquake.org/taxtweb) is a tool developed by GEM to assist with the generation of the taxonomy string which is used to describe these attributes.

Example: The string `CR/HEX:1/YEX:1981/RES+RES1` describes a residential single family building, of reinforced concrete construction, built in 1981. This is the short version of the taxonomy, the long version explicitly includes all of the unknown fields too.

### Open Exposure Data (OED)

[OED](https://github.com/OasisLMF/ODS_OpenExposureData) is a standard curated by the Oasis community for the insurance industry. The aim of OED is to provide the industry with a robust, open, and transparent data format. The detailed descriptions of the OED taxonomy to describe an asset (structure, infrastructure, or human) are covered in ['Open Exposure Data Spec.xlsx' with reference and background information](https://github.com/OasisLMF/ODS_OpenExposureData/tree/develop/OpenExposureData/Docs), or \[online\]https://oasislmf.github.io/OpenDataStandards/index.html.

Example: In the Open Exposure Data (OED) Standard and other insurance industry models, asset characteristics are separated into individual columns. This record describes a building classified as general residential, single storey, constructed from adobe masonry, with an unknown year of construction:

| OccupancyCode | ConstructionCode | NumberOfStoreys | YearBuilt |
| ------------- | ---------------- | --------------- | --------- |
| 1050          | 5101             | 1               | 0         |

### GLOSI: Global Library for Schools Infrastructure

The World Bank Global Program for Safer Schools (GPSS) developed the GLOSI taxonomy to provide a systematic classification system for school buildings. GLOSI classifies school buildings based on 12 parameters [(interactive guide)](https://gpss.worldbank.org/index.php/en/node/571) that govern the building’s structural performance, supported by [research](https://www.sciencedirect.com/science/article/pii/S2212420923000742) into school buildings specifically. There are three primary parameters (main structural system, height range, and seismic design level) and 9 secondary parameters: Diaphragm Type; Structural Irregularity; Span Length; Pier Type; Foundation Type; Seismic Pounding Risk; Effective Seismic Retrofitting; Structural Health Condition; and Non-Structural Components.

School buildings are described using a '/'-separated single taxonomy string similar to GED4ALL. For example, "**RC2/MR(2)/LD**/RD/NI/SP/RO/RF/NP/OS/FC/NN" describes a mid-rise (MR(2)) school built from reinforced concrete building with a framed structure and masonry infills (RC2)   with Low Seismic Design Level (LD).

### CEDE

[CEDE (Catastrophe Exposure Data Exchange)](https://docs.air-worldwide.com/Database/CEDE/10.0/webframe.html#topic1.html), is the exposure database format used by Touchstone®, AIR's comprehensive risk management platform that was first released in early 2013. It is publicly available and used widely in the insurance industry to describe asset characteristics and values for catastrophe modelling. CEDE uses a database format and allows users to apply different occupancy and construction schemes and codesets to their data, and add additional fields describing year of construction, number of storeys, etc. The most common taxonomy used in CEDE is [AIRConstruction](https://docs.air-worldwide.com/Database/CEDE/10.0/webframe.html#topic32.html) and [AIROccupancy](https://docs.air-worldwide.com/Database/CEDE/10.0/webframe.html#topic33.html). These codes are also available in the [OED Open Exposure Data Spec](https://github.com/OasisLMF/ODS_OpenExposureData/tree/develop/OpenExposureData/Docs) as OED was based on and builds on CEDE.

Example: In CEDE data asset characteristics are separated into individual columns. This record describes a building classified as general residential, single storey, constructed from adobe masonry, with an unknown year of construction:

| OccupancyCode | ConstructionCode | NumberOfStoreys | YearBuilt |
| ------------- | ---------------- | --------------- | --------- |
| 301           | 112              | 1               | 0         |

## Vulnerability data standards

In 2018 an international consortium led by the UCL EPICentre developed a first-of-its-kind standard for vulnerability information, called MOVER.
Details about the development are reported [here](https://riskdatalibrary.org/resources).

## Loss data standards

In 2019 GEM and UCL EPICentre developed a first-of-its-kind standard for loss information.
Details about the development are reported [here](https://riskdatalibrary.org/resources).
