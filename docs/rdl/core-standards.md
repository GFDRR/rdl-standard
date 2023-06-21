# Core Standards

RDLS has been built based on existing open data standards.

In this section you will find a short summary of the core standards upon which the RDL data model has been built.

## General standards

RDLS is built using [JSON](https://www.json.org/json-en.html) (JavaScript Object Notation). JSON is a lightweight data-interchange format which is easy for humans to read and write and easy for machines to parse and generate.

## Exposure standards

**GED4ALL**:
In 2018 an international consortium led by the Global Earthquake Model Foundation (GEM) developed an open, multi-scale exposure data schema for multi-hazard analysis (GED4ALL) in response to recommendations from community consultation. GED4ALL simplified certain detailed engineering aspects of the original global exposure model focussed on earthquake hazards ([GED4GEM](https://journals.sagepub.com/doi/10.1177/8755293020919429)), while also expanding the exposure parameters included, so the impacts of other hazards could be related to exposure data using the standard. In this standard, GED4ALL is used as a reference in the exposure, vulnerability and loss components, to describe the exposure type to which losses relate, and to facilitate matching of appropriate vulnerability functions to exposure data, for example.
Details about the development of GED4ALL are reported [here](https://riskdatalibrary.org/resources).

## Hazard data standards

In 2018 an international consortium led by the British Geological Survey developed a first-of-its-kind standard for hazard information.
In this standard, we developed a list of hazard type codes and process type codes which are used as a reference in the hazard, vulnerability and loss components of the standard, and facilitate matching of appropriate vulnerability functions to hazard data, for example.
Details about the development are reported [here](https://riskdatalibrary.org/resources).

**GLIDE disaster event identifier**:
Since the beginning of 2004, GLobal IDEntifier numbers (GLIDE) are produced at (GLIDEnumber.net) for all new disaster events reported by partner institutions and those discovered by ADRC.
A GLIDE number comprises two letters to identify the disaster type (e.g. EQ - earthquake); the year of the disaster; a six-digit, sequential disaster number; and the three-letter ISO code for country of occurrence. E.g., the GLIDE number for West-India Earthquake in India is: EQ-2001-000033-IND. This number is posted by the above organizations and in many other websites, on their documents relating to that particular disaster and gradually other partners will include it in whatever information they generate. As information suppliers join in this initiative, documents and data pertaining to specific events may be easily retrieved from various sources, or linked together using the unique GLIDE numbers. List of services using GLIDE: https://glidenumber.net/glide/public/links.jsp
The RDL Standard uses a GLIDE number in the `hazard.event` object, to denote the historical event to which hazard event data relates, e.g., the simulated hazard intensity footprint of that event.

## Vulnerability data standards

In 2018 an international consortium led by the UCL EPICentre developed a first-of-its-kind standard for vulnerability information, called MOVER.
Details about the development are reported [here](https://riskdatalibrary.org/resources).

## Loss data standards

In 2019 GEM and UCL EPICentre developed a first-of-its-kind standard for loss information.
Details about the development are reported [here](https://riskdatalibrary.org/resources).

<br><hr>
