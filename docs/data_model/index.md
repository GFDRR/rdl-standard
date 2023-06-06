# Data model

The Risk Data Library Standard schema covers [**general dataset attributes**](general) and four specific components:

- [**Hazard**](hazard): main hazard type, specific process, trigger of the hazard, occurrence frequency of event, intensity unit to measure the process and analytical method.
- [**Exposure**](exposure): asset category, occupancy and specific taxonomy, cost type and value.
- [**Vulnerability**](vulnerability): model that links hazard intensity and exposure classification to measure of impact over the total exposed value.
- [**Loss**](loss): modelled damage and losses produced in a risk assessment as a function of hazard, exposure and vulnerability components.
</ul>

For definitions of these terms, please see the [Glossary](https://rdl-standard.readthedocs.io/en/docs.mat/glossary.html)

The diagram below shows the core relationships between schema components, and their core attributes.

```{eval-rst}
 .. mermaid::

  classDiagram
      Dataset -- Hazard
      Dataset -- Exposure
      Dataset -- Vulnerability
      Dataset -- Loss
      Dataset: -Project name
      Dataset: -Coverage
      Dataset: -Purpose
      Dataset: -Bibliography
      class Hazard{
        -Type, Process
        -Trigger
        -Frequency
        -Intensity unit
        -Analytical method
          }
      class Exposure{
        -Asset category
        -Occupancy
        -Taxonomy
        -Cost type
      }
      class Vulnerability{
        -Hazard process
        -Exposure taxonomy
        -Analytical  method 
        -Applicability
      }
      class Loss{
        -Hazard process
        -Exposure taxonomy
        -Loss frequency
        -Loss metric
      }          
```

<hr>

```{eval-rst}
.. toctree::
   :maxdepth: 1
   :hidden:

   general
   hazard
   exposure
   vulnerability
   loss

```
