# Schema reference

```{eval-rst}
.. toctree::
   :maxdepth: 1
   :hidden:

   dataset
   resource
   hazard
   exposure
   vulnerability
   loss

```

The schema provides the authoritative definition of the structure of Risk Data Library Standard (RDLS) data, the meaning of each field, and the rules that must be followed to publish RDLS data. It is used to validate the structure and format of RDLS data.

For this version of RDLS, the canonical URL of the schema is [https://docs.riskdatalibrary.org/en/1\_\_0\_\_0/rdls_schema.json](https://docs.riskdatalibrary.org/en/1__0__0/rdls_schema.json). Use the canonical URL to make sure that your software, documentation or other resources refer to the specific version of the schema with which they were tested.

The pages in this section present the schema in tables with additional information in paragraphs. You can also [view the schema in an interactive browser](../browser.md) or [download it as JSON Schema](../../../docs/_readthedocs/html/rdls_schema_processed.json).

```{note}
   If any conflicts are found between the text in the documentation and the text within the schema, the text within the schema takes precedence.
```

The RDLS schema covers [dataset fields](dataset.md), [resource fields](resource.md) and four risk-specific components to describe risk datasets:

- [Hazard](hazard.md): Metadata that is specific to datasets that describe processes or phenomena that may cause loss of life, injury or other health impacts, property damage, social and economic disruption or environmental degradation. For example, a classification of the type of the hazard, the units in which the intensity of the hazard is measured, and the frequency at which the hazard occurs.
- [Exposure](exposure.md): Metadata that is specific to datasets that describe the location and demographic information of people, and the location, characteristics and value of assets in the built and natural environment. For example, the type of building and the cost to replace it if it suffered damage.
- [Vulnerability](vulnerability.md): Metadata that is specific to datasets that describe the vulnerability and fragility relationships and indexes used in risk analysis. This includes the type of exposure, hazard intensity and impact the relationship describes, and information on how the relationship was developed. This component uses attributes consistent with the hazard, exposure and loss components.
- [Loss](loss.md): Metadata that is specific to datasets that contain the simulated (modeled) risk and impact estimates produced in a risk assessment, including explicit links to the hazard, exposure, and vulnerability datasets used in the analysis.

For general definitions of hazard, exposure, vulnerability and loss, please see the [Glossary](../../glossary.md).

## Spatial and temporal properties

Spatial and temporal coverage and resolution should be specified at both dataset and resource level, even when they are consistent amongst a dataset's resources.

If spatial or temporal coverage or resolution differ by resource, use the resource-level properties to describe the coverage and resolution of each resource, and the dataset-level properties to describe the overall coverage of the dataset. In particular, note that `spatial.gazetteer_entries` should be used to describe the overall area covered by the dataset, not each of the areas covered by the individual resources.
