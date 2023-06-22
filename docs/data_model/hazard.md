# Hazard

## Schema attributes

The hazard schema stores data about the intensity and occurrence probability of physical hazard phenomena such as floods, earthquakes, wildfires or others. The specific hazard process can be defined and measured with a specific intensity unit. For example, earthquake hazard may be represented as ground shaking, liquefaction or ground displacement.

```{eval-rst}
 .. mermaid::

  classDiagram
      Event set -- Event1
      Event set -- Event2
      Event set: Hazard type
      Event set: Analytical method
      class Event1{
        Occurrence frequency
        Time reference
        Hazard trigger
      }
      class Event2{
        Occurrence frequency
        Time reference
        Hazard trigger
      }
      Event1 -- Footprint1
      Event1 -- Footprint2
      Event2 -- Footprint3
      Event2 -- Footprint4
      class Footprint1{
        Hazard process
        Intensity measure
        Uncertainty
      }
      class Footprint2{
        Hazard process
        Intensity measure
        Uncertainty
      }
      class Footprint3{
        Hazard process
        Intensity measure
        Uncertainty
      }
      class Footprint4{
        Hazard process
        Intensity measure
        Uncertainty
      }
```

<br>

The schema specifies which type of analysis and data methodology that has generated the dataset. It supports either simulated probabilistic scenarios and empirical observations. If the dataset has been produced for a specific location, such a city, the name of the location can be included.

|**Required**| **Attribute** | **Description** | **Type** |
|:---:| --- | --- | --- |
|*| Hazard type | Main hazard type from list of options | <ul><li>Coastal Flood<li>Convective Storm<li>Drought<li>Earthquake<li>Extreme Temperature<li>Flood<li>Landslide<li>Tsunami<li>Volcanic<li>Wildfire<li>Strong Wind<li>Multi-Hazard</ul> |
|*| Analysis type | Type of analysis that generated the data | <ul><li>Deterministic<li>Probabilistic |
|\*| Calculation method | The methodology used for the modelling of hazard | <ul><li>Simulated<li>Observed<li>Inferred |
|| Geographic area | Specific location for which the dataset has been developed | Name of location |

<br>When the scenario modelled refers to a specific period of time, this can be specified in terms of dates, period span and reference year. For example, an observed flood event that occurred from 1.10.2009 (time start) to 3.10.2009 (time end), spanning over 3 days (time span). When precise time collocation is unknown or not applicable, a general reference date such as "2009" is used to identify events (time year). This is also useful to specify future scenario, e.g. time year: 2050.

|**Required**| **Attribute** | **Description** | **Type** |
|:---:| --- | --- | --- |
|| Time start | The time at which the modelled scenario starts | Date |
|| Time end | The time at which the modelled scenario ends | Date |
|| Time span | The duration of the modelled period | Number |
|| Time year | One reference year to univocally identify the scenario | Date (year) |

<br>When instead the hazard scenario is represented in probabilistic terms, the occurrence probability (frequency distribution) of hazard can be expressed in different ways. The most common way to communicate this is the "return period", expressed as the number of years after which a given hazard intensity could occur again: RP 100 indicates that that event has a probability of once in 100 years. This attribute can indicate individual layer frequency (RP100) or a range of frequencies for a collection of layers (RP10-100) The probability of occurrence is usually calculated on the basis of a reference period that provides observations: this period can be specified by start date, end date and time span. For example, an analysis of earthquake frequency based on seismic observations from 1934 (occurrence time start) to 2001 (occurrence time end), for a total count of 66 years (occurrence time span).

|**Required**| **Attribute** | **Description** | **Type** |
|:---:| --- | --- | --- |
|| Frequency type | The frequency of occurrence of the present event | <ul><li>Rate of Exceedance<li>Probability of Exceedance<li>Return Period</ul> |
|| Occurrence probability | For probabilistic scenario, the occurrence probability is expressed according to frequency type | Text |
|| Occurrence time (start) | Start date of the period used to infer the occurrence probability | Date (year) |
|| Occurrence time (end) | End date of the period used to specify the occurrence probability | Date (year) |
|| Occurrence time (span) | The duration of the period used to specify the occurrence probability | Number of years |

<br>The schema distinguish between the hazard and process represented and the hazard and process identified as the cause, or concause for the manifestation of the represented hazard. For example, a dataset represent landslide hazard that is triggered by an earthquake will have Hazard type: Landslide; Trigger hazard type: Earthquake. The unit of measure refers to the represented hazard and process. A description can be added to cover additional information not included in the schema.

|**Required**| **Attribute** | **Description** | **Type** |
|:---:| --- | --- | --- |
|| Trigger hazard type | The hazard type that has triggered the event (if any) | Hazard type |
|| Trigger process type |  The process type that triggered the event (if any) | Process type |

<br>The hazard dataset could include one or more footprints for the same event, where each is one possible realisation (i.e. one footprint could represent minimum, another footprint the average and another one the maximum). The event uncertainty can be represented explicitly, through the inclusion of multiple footprints per event.

|**Required**| **Attribute** | **Description** | **Type** |
|:---:| --- | --- | --- |
|*| Hazard process | Specific hazard process | Process type |
|*| Unit of measure | Intensity measure of the process | Option list |
|| Description | Provides additional information about a specific event | Text |
|| Data uncertainty | The typology of uncertainty, if considered | Text |

### Hazard types

The RDLS offers a classification of hazards that are more often required in disaster risk assessments, based on the review and mapping of existing alternative definitions into one consistent framework.
<br>The **RDLS** classifies hazard phenomena as main hazard (8 categories) and hazard process (27 categories):

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
<br>
Each hazard type and associated processes can have one or more type of measure metrics, which include the unit of measure:<br>

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

<br><hr>

## Examples

Hazard data are most often represented by geospatial grids (raster); sometimes they are represented by points or polygons.

### Flood hazard maps for Kabul

Schema attributes for flood hazard map related to occurrence probability of a river flood event with a return period of once in 100 years over Kabul, Afghanistan. The hydrological data used for modelling the intensity of floods is derived from observations over the period 1958-2001 (44 years). The hazard intensity is measured as water depth, in meters. These information cover all mandatory fields, and few optional fields.

![Screenshot](../img/hzd_fl_kabul.jpg)

|**Required**| **Attribute** | **Example** |
|:---:| --- | --- |
|*| Hazard type | Flood |
|*| Analysis type | Probabilistic |
|*| Calculation method | Simulated |
|| Geographic area | Kabul |
|| Frequency type | Return Period |
|| Occurrence probability | 100 years |
|| Occurrence time (start) | 1958 |
|| Occurrence time (end) | 2001 |
|| Occurrence time (span) | 44 years |
|*| Hazard process | River flood |
|\*| Unit of measure | Water depth (m) |

<br>

### Earthquake hazard maps for Afghanistan

Schema attributes for earthquake hazard map related to occurrence probability of an event with return period of  once in 1000 years over Afghanistan. The seismic data catalogue behind the calculation of occurrence probability start from year 800, covering a period of 1200 years. The hazard intensity is measured as Peak Ground Acceleration, expressed in (g).

![Screenshot](../img/hzd_eq_afg.jpg)

|**Required**| **Attribute** | **Example** |
|:---:| --- | --- |
|*| Hazard type | Earthquake |
|*| Analysis type | Probabilistic |
|*| Calculation method | Simulated |
|| Frequency type | Return Period |
|| Occurrence probability | 1000 years |
|| Occurrence time (start) | 800 |
|| Occurrence time (end) | 2001 |
|| Occurrence time (span) | 1200 years |
|*| Hazard process | Ground motion |
|\*| Unit of measure | PGA (g) |

<br><hr>
