# Minutes of RDLS Fellows project Steering Committee #5

11 May 2023 / 09:00-10:30 EDT, 14:00-15:30 GMT / via Teams

## Attendees

Pierre Chrzanowski, Cristiano Giovando, Andrea Garcia (GFDRR) 
Carolina Hess (SwissRe Foundation)
Rachel Vint (Open Data Services)
SC members: 
- Paul Henshaw, GEM Foundation
- Matt Donovan, Oasis/Open Data Standards
- Stephen Hutchings, JBA Risk Management
Invitees:
- Johanna Carter, Oasis/Open Data Standards
- Marcus Elten, UNDRR
Absent:
- Tiziana Rossetto, UCL EPICentre
- Nick Moody, IDF/GRMA
- Beat Aeberhardt, Swiss Re
- Justin Ginetti, Hamish Patten, IFRC - Global Risk Databank (excused)

## Agenda

1.  Minutes of last meeting: https://github.com/GFDRR/rdl-standard/tree/dev/SteeringCommittee 
2.  Progress on the standard:
a.  Update on revision of schema to object-oriented JSON format. We’d like to offer 1 week to review and to get SC members’ approval.
i.  Github issues available to contribute on 
b.  Data sprint:
i.  Planned for beginning of June
ii. Will be done with RDL Fellows to create metadata and format data in pipeline.
c.  Update on standard implementation
i.  Documentation revisions ongoing, available to review in June
3.  Update on Fellowship program
a.  Sharing project descriptions, review for interest in collaborating / further work
b.  Arrange a fellowship workshop, in which steering committee can share their work/projects
4.  Update on aligning Open Data Standards and RDLS - Oasis team developing use of hazard and vulnerability metadata into Oasis models. Last meeting, requested use cases for having hazard and vulnerability standard wrapped around data in Oasis.
5.  IFRC - Global Risk Databank - possiblity to use RDLS and data from Data Catalog.
6.  Propose next SC meetings
a.  Wednesday 12 July 2023
b.  Thursday 14 September 2023
c.  Thursday 16 November 2023
7.  AOB

## Notes

- Progress on the standard (see slides)
  - PH: Question on taxonomy- is taxonomy naming retained in metadata?
  - SF: Taxonomy code is remaining in the dataset but not in the metadata
  - PH: Taxonomy source should come with version as well - SF agreed name and version should be in metadata
  - Issues will be shared on github with indications / pointers to invite specific reviewers
  - When we have uploaded a good number of issues we will mail to update and invite comments
- Objective is to have a approved version by next SCM early July
- SF: we have been working with the World Bank data catalog team to display RDL metadata - discussion here https://github.com/GFDRR/rdl-standard/issues/51 
- Oasis ODS can benefit from using RDLS metadata - lots of dev effort has been on preparing big model files - metadata has been a secondary consideration, and its not compulsory - models not well derived - which perils, units, size of event set, etc, how freq defined.
- Adopting RDL standard could be used to better describe models
- Can adopt in ODS package - Johanna Carter checking what ODS needs, / doesn’t - what might be missing in RDL.
- PH: Nasdaq “Key Facts” document provides brief description of most important aspects of a Model.  If Nasdaq were happy to share their template this might be useful since many OASIS vendors are already producing such documents for their models.
- MD: Question on integration of the ODS into RDLS - SF: lots we can learn from 
- PH: Humanitarian still separated from the Insurance sector (humanitarian models often focus on data points such as fatalities, etc. while OASIS models can produce insured/reinsured losses).  RDLS has been designed to be taxonomy neutral. Don’t replicate or build new functions if existing in RLDS or ODS - re-use.
- JC: would make sense to have the Financial Terms in the RDLS exposure data given RLDS Loss component include ec/ins loss perspectives
- Presentation of the Global Risk Data Bank by Marcus Elten
- A project between UNDRR and IFRC - concept note
  - Middle of phase 2; A first demo 2-3 weeks
  - SteerCo includes NASA, WMO…
  - First step is to provide a consistent database of historical event impacts - footprints, impact. 
  - SF: Ideal situation that GRD and RLDS representing the same information, GRD using RDLS metadata about historical events - GRD data into modellers to represent event as best as possible; modellers share information beach to GRD on modelled impacts? Can SC propose some use cases to support this need?
- CH: Data from Global Risk Datankbase could be used for parametric insurance product trigger setting (based on understanding of past impacts)
- Marcus suggested SteerCo as place GFDRR can contribute.

## Actions
- GFDRR to share Fellowship project descr.
- Have a Fellow Workshop to share info from SC members organisation / experience / opportunities. AG to share workshop dates, plan agenda.
- ODS/Stu to log github issues, email SC when bulk done.
- Stu - set up conversation about tax. strings. 
- Tax type and version needs to be in the metadata
- Implementing occ/con types in separate fields - or as one string?
- Understand how footprints in RDLS can complement historical data in ‘GRD’ - GFDRR conversation with IFRC planned.
## Next Meeting Agenda
- Make next set of SC meetings more strategic focus, with renewed focus on funding and future direction, having been focussed on technical elements in last few meetings.
- Update on agreed new schema version (to be agreed before the meeting)
- Fellowship progress incl feedback from the SC sharing of experience.
Date: Weds 12 July 2023

