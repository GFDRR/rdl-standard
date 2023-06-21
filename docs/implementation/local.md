# Local schema implementation

Structuring and naming of risk data files within a project folder represent the simplest and most direct level of implementation of the Risk Data Standard.

## Structure of project folder

<br>

## Naming convention for files

To help univocally identify the content of a dataset file, the filename should summarise all the key information that allow to distinquish it from the others.
The general format, all in lower caps, uses a tag approach to build the full filename:

      [component_code]-{project_name}-[country_iso]-{schema_specifics}-{time}

The name is made of [required] and {optional} attributes. Each component uses the most relevant attribute as schema_specifics, for example:

- Hazard:<br>
`hzd-[country_iso]-{project_name}-{hazard_type}-{process_type}-{hazard_trigger}-{frequency}-{time}`<br>
Example: pluvial flood hazard scenario with return period 10 years in 2050 for Afghanistan is named:<br>
**hzd-afg-mhra-fl-fpf-rp10-2050**
<br><br>
- Exposure:<br>
`exp-[country_iso]-{project_name}-{occupancy}-{exposure_model}-{time}`<br>
Example: residential exposure in Madagascar from Open Street Map 2015 is named:<br>
**exp-mdg-swio_rafi-residential-osm-2015**
<br><br>
- Vulnerability:<br>
`vln-[country_iso]-{project_name}-{hazard_type}-{occupancy}-{vulnerability_model}`<br>
Example: flood depth-damage function developed for India by JRC over industrial land cover is named:<br>
**vln-ind-fl-industrial-jrc**
<br><br>
- Loss:<br>
`lss-[country_iso]-{project_name}-{hazard_type}-{occupancy}-{time}`<br>
Example: eartquake losses over Madagascar infrastructures over the period 1920-2012 is named:<br>
**lss-mdg-eq-infrastructrure-1920_2012**

<br><hr>