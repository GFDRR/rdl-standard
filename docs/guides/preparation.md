# Data packaging

The data structure and packaging of the output as obtained from the data analysts may not always align with the way we want users of the RiskDataLibrary to search and download data.

Datasets shared in risk catalogues (e.g. [Risk Data Library Collection](https://datacatalog.worldbank.org/search/collections/Risk-Data-Library) are provided as individual `RESOURCES`, which should be packed (grouped) according to three main criteria:

- **GEOGRAPHY**: data covering a multi-country region might be split into individual countries' datasets.
- **THEME**: Data resources may be grouped by hazard type, sector type, etc.
- **FORMAT**: how the data are stored. It is preferred to keep together data in the same format, conversely split different file formats in different resources. [**Read more**](formats) about recommended and supported data formats.

We also need to consider:
- **SELF-DEPENDENCY & COMPLETNESS**: the data resource can be interpreted and used by itself.
- **SIZE-EFFICIENCY**: try to avoid creating huge datasets (>1 Gb) that would be hard to download on poor connections.

Where there are many resources for a dataset, there is a temptation to include a folder structure in Data Catalog. This does not enable easy access to resources. Datasets and Resources should be set up to facilitate easy finding of the specific component of analysis, and grouping resources together in a sensible fashion, without creating problematically large download sizes.

Decisions on how to structure risk data should be taken on a project-by-project basis, because there is a wide variety of how data are structured depending on the components of a project.
________________

## Hazard data
### Format / data types
Hazard data typically include hazard maps representing one or more historical events, or simulated probabilistic scenarios (`event footprints`). Less often, hazard curves and stochastic event set tables are generated. Additional data could include intensity-duration-frequency curves, ground motion relationships, or hazard-defence measures.<br>
Generally, hazard data (footprints) takes the form of raster (geo grid) data (`GeoTIFF / COG`), less often as vector data (`gpkg`, `shp`). Supporting data (hazard curves, historical catalogue) could come as tables (`csv`, `xlsx`) or vector data (`gpkg`, `shp`).

### Thematic grouping
The main thematic groupings in hazard data are:
- **Hazard type**: data produced for seismic hazard, wildfire, fluvial flood, pluvial flood, etc.
- **Year**: e.g., current, projected 2050, 2080, etc. using climate projections

### Geographic grouping
- **Scale, location and resolution**: Hazard data may be generated at global, regional, national, subnational, or urban level. High-resolution hazard data (e.g. urban level analysis) might be grouped for individual locations (city) whenever the dataset becomes too large.

```{caution}
In general, splitting raster datasets into smaller parts is not advised, according to self-dependency and completeness criteria. If required for data efficiency, always consider a larger extent than needed as to avoid cross-border artefacts.
![Screenshot](../img/raster_clip.jpg)
```

### Packaging recommendation
We recommend grouping exposure data in the following hierarchy:
- **Hazard type**
  - *Geographic scale and location* (country; sub-national; city)
    - Year of data (current or projected)

For example:
```
* Dataset: <project name> hazard data
   * Dataset: <project name> <hazard1> RP maps
      * Dataset: <project name> <hazard1> data <country1>
         * Zipped Resource: <hazard1> <country1>_2020
         * Zipped Resource: <hazard1> <country1>_2050
         * Zipped Resource: <hazard1> <country1>_2080
      * Dataset: <project name> <hazard1> data <country2>
         * Zipped Resource: <hazard1> <country2>_2020
         * Zipped Resource: <hazard1> <country2>_2050
         * Zipped Resource: <hazard1> <country2>_2080
   * Dataset: <project name> <hazard2> RP maps
      * …
         * …
   * Dataset: <project name> <hazard1> historical catalog
```
<hr>
   
## Exposure data
### Format
Exposure geospatial data can take the form of vector (`gpkg`, `shp`), or raster (`GeoTIFF / COG`).
In some cases, exposure comes as table (`csv`, `xls`).

[EXAMPLE PIC FOR EACH FORMAT]

### Thematic grouping
The main thematic groupings in exposure data are:
- **Asset type / sector / construction type**: e.g. Structure, Content, Product / Residential, Commercial / Masonry, Wood
- **Year**: reference period or year, e.g., current, projected (2040-2060), etc.

### Geographic grouping
- **Scale, location and resolution**: Exposure data may be generated at global, regional, national, subnational, or urban level. High-resolution hazard data (e.g. urban level) might be grouped for individual locations (city) whenever the dataset becomes too large.

```{caution}
In general, splitting raster datasets into smaller parts is not advised, according to self-dependency and completeness criteria. If required for data efficiency, always consider a larger extent than needed as to avoid cross-border artefacts.
```
### Packaging recommendation
We recommend grouping exposure data in the following hierarchy:
- **Geographic scale and location** (country; sub-national; city)
  - *Year of data* (current or projected)
    - (optional) Sector or asset type (Residential; Commercial / Population, Buildings).

For example:
```
* Dataset: <project name> exposure data
   * Dataset: <project name> <country1> exposure data
      * Dataset: <project name> <country1> exposure data - 2020
         * Resource: <country1>_2020_exposure_RES
         * Resource: <country1>_2020_exposure_COM
         * Resource: <country1>_2020_exposure_EDU
         * Resource: <country1>_2020_exposure_ROAD
      * Dataset: <project name> <country1> exposure data - 2050
         * Resource: <country1>_2050_exposure_RES
         * Resource: <country1>_2050_exposure_COM
         * Resource: <country1>_2050_exposure_EDU
         * Resource: <country1>_2050_exposure_ROAD
   * Dataset: <project name> <country2> exposure data
      * …
         * …
```
<hr>

## Vulnerability data
### Format
Vulnerability data are usually provided as table data (`csv`, `xls`) containing the impact model function and parameters.
Often, vulnerability models are proprietary data and only shared as pictures; this has low reusability and should be avoided. Always try to obtain a mathematical description for this component.

### Thematic grouping
The main thematic groupings in vulnerability data are:
- **Hazard type**: e.g. Flood damage function; Earthquake fragility curves.
- **Asset type / sector / construction type**: e.g. Structure, Content, Product / Residential, Commercial / Masonry, Wood

### Geographic grouping
Vulnerability curves may be developed for individual countries or environments within a project. Where this is the case, this grouping should be retained.

### Packaging recommendation
We recommend to group exposure data in the following hierarchy:
- **Hazard type**
  - *Geographic* (unless global function, one dataset per country)
    - **Asset type / sector / construction type**: e.g. Structure, Content, Product / Residential, Commercial / Masonry, Wood

Note that this hierarchy should be maintained even when packing all the data in one file, e.g. multiple sheetx of an excel file.

[EXAMPLE OF MULTIPLE IMPACT MODELS IN ONE FILE]

For example:
```
* Dataset: <project name> vulnerability data
   * Dataset: <project name> <hazard1> vulnerability data
      * Resource: <hazard1>_RES_timber
      * Resource: <hazard1>_RES_RC
      * Resource: <hazard1>_COM_steel
      * Resource: <hazard1>_COM_RM
      * Or Resource: <hazard1>_vulnerability _curves_all_types (if data all in one file)
   * Dataset: <project name> <hazard2> vulnerability data
      * …
      * …
```
<hr>

## Loss data
### Format
Loss data often comes in the form of:
- tabulated event losses, and loss per exceedance probability
- Mapped return period loss / annual average loss - in vector files/choropleth maps

### Thematic grouping
The main thematic groupings in loss data are:
* Hazard type: there may also be a multi-hazard loss metric included.
- **Asset type / sector**: e.g. Structure, Content, Product / Residential, Commercial
* Year: e.g., current, projected 2050, 2080, etc.

### Geographic grouping
Losses are usually aggregated at national or subnational administrative level (ADM2, ADM1, or ADM0).
Losses can also be provided per asset (e.g. individual buildings or raster footprints) but it is not usual - although these files are often generated by the analysts.

### Packaging recommendation 
We recommend grouping exposure data in the following hierarchy:
- **Hazard type**
  - *Sector/asset type*
    - Year

For example:
```
* Dataset: <project name> loss data
   * Dataset: <project name> <hazard1> loss data 2020
      * Resource: <hazard1>_RES
      * Resource: <hazard1>_COM
      * Resource: <hazard1>_AllSectors
   * Dataset: <project name> <hazard2> loss data 2020
      * …
      * …
   * Dataset: <project name> <hazard1> loss data 2050
   * Dataset: <project name> <hazard1> loss data 2080
```

<br><hr>