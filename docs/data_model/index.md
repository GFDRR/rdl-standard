# Data model

The Risk Data Library Standard [schema](schema.md) covers [general dataset attributes](schema.md#dataset) and four specific components:

- [Hazard](schema.md#hazard): main hazard type, specific process, trigger of the hazard, occurrence frequency of event, intensity unit to measure the process and analytical method.
- [Exposure](schema.md#exposure): asset category, occupancy and specific taxonomy, cost type and value.
- [Vulnerability](schema.md#vulnerability): model that links hazard intensity and exposure classification to measure of impact over the total exposed value.
- [Loss](schema.md#loss): modelled damage and losses produced in a risk assessment as a function of hazard, exposure and vulnerability components.

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

______________________________________________________________________

```{eval-rst}
.. toctree::
   :maxdepth: 1
   :hidden:

   loss
   codelists
   schema

```
