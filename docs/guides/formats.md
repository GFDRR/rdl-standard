# Data formats

Risk data can be made of spatial or non-spatial data.

- Non-spatial data most often consist of table data stored as excel or csv files for greater compatibility.

- Spatial data (geodata) can be shared in a variety of formats depending on the software used by the analyst. Over the years, [OSGEO ](https://wiki.osgeo.org/wiki/Main_Page) (Open Source Geospatial Foundation) tried to converge towards a limited number of "best" standard formats for each geospatial type. Below is a list of recommended and supported geodata formats.

## Recommended geodata formats

### Vector data: GeoPackage

**GeoPackage** (`.gpkg`) is an open, non-proprietary SQLite3 extended Database container. It is platform-independent and standards-based (OGC, QGIS, GDAL). Similar to ESRI geodatabase, but more responsive. It is a single-file format that can store anything from vector data and attributes, symbology, pyramids, table data as individual layers within one geopackage. It is possible to store rasters, but its supports for raster data is still limited and we don't recommend storing those as geopackage. Supports SQL and API to DB - fit for web applications, can export to PostGIS. There is no limit of attributes, attribute name size, or file size (unlike shapefile). Internal metadata specifications are under development.

### Raster data: GeoTIFF / COG (.tif)
**GeoTIFF** (`.tif`) is the image standard file for GIS and satellite remote sensing applications. It can store multiple realisations as “bands”. GeoTIFFs can be accompanied by other auxiliary files (.tfw for raster geolocation, .xml for metadata, .aux for projections and others, .ovr for pyramids to improve visualisation). These should be packed together with the .tif files for sharing.
A Cloud Optimized GeoTIFF (COG) is a regular GeoTIFF file, aimed at being hosted on a HTTP file server, with an internal organization that enables more efficient workflows on the cloud. It does this by leveraging the ability of clients issuing ​[HTTP GET range requests](https://tools.ietf.org/html/rfc7233) to ask for just the parts of a file they need. This is the best option for data that needs to be hosted ona  geocatalogue such as [GeoNode](https://www.geonode-gfdrrlab.org).

## Supported geodata formats

### Vector data
- **ESRI ShapeFile (SHP)**
Well established, de facto standard in the GIS community. Accepted by all GIS software. Format specifications are open, however it is a proprietary format (controlled by Esri). It can only contains one geometry type (point, line, polygon) per file. It is a multiple-parts file format (.shp for geometry, .dbf for table, .shx for indexining, .prj for CRS, other optional for encoding, indexes, etc.). Attribute names are limited to 10 characters, and number of attributes (ie table fields) is limited to 255. The file size is restricted to 2 GB.

### Raster data
- **Network Common Data Form (NetCDF)**
NetCDF GIS format is an interface for array-oriented data for storing multi-dimensional variables. Commonly used in the scientific community for multidimensional geodata storage (e.g. climate data). Supported by ArcGIS and QGIS via toolbox conversion or extensions; most spatial processing tools require conversion into raster first.

- **GRIdded Binary or General Regularly-distributed Information in Binary (GRIB)**    
GRIB was standardized by the WMO and in operation since 1985. Similar to NetCDF, GRIB files are commonly used in meteorology to store historical and forecast weather data. It’s a multidimensional file with the advantages of self-description, flexibility and expandability. There are tools to convert GRIB into rasters such as grb2grid and QGIS software.

<br><hr>