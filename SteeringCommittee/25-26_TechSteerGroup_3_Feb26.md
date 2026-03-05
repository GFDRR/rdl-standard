# Minutes of RDLS Technical Steering Committee 2025-2026 No. 3

24 February 2026 

## Attendees
Pierre Chrzanowski, Mattia Amadio, Stuart Fraser

**SG members:**
- James Allard, JBA Risk Management
- Rachel Vint, Open Data Services
- Sam Roeslin, EU JRC

**Absent:**
- Ric Huting, Royal Haskoning
- Tom Russell, Environmental Institute, U. Oxford


**Agenda**
- Updates on schema development​
- Catalog updates and new datasets​
- Events ​
- Urban data tracker
- Questions, feedback
 

## Notes

Presentation: [RDLS_GF_SG3_Feb26.pdf](https://github.com/user-attachments/files/25530138/RDLS_GF_SG3_Feb26.pdf)

**1. Schema dev**
- Summary of issues and their status at https://github.com/orgs/GFDRR/projects/11/views/1 (status: public, no log in required)

-	ODS are currently making changes according to discussions in individual issues. Implementation decisions balance value to practical use of the schema with preventing the schema from becoming too convoluted.
    -	includes working on documentation, tooling e.g. metadata editor, and version 1.0 of the RDLS schema itself.

-	Post-v1.0: We move into the **stewardship phase** – we need to agree a change process and mechanism for stable governance.
    -	Especially to maintain steering and governance in low funding periods where dev work is reduced (typical WB cycle)
    -	Discuss at next meeting
        -	Come with examples – Oasis, e.g., from Stu; Others’ experience of these processes
    -	Discuss at event in Paris with wider partners
        - Inititiatives that are dedicated to supporting open standards more widely
        - Explore *Partnership structures*, rather than led by one institution

-	Key Issues:
    -	[#6](https://github.com/GFDRR/rdl-standard/issues/6): Mat explained the issue and decision.
        -	JBA - agreeing with explanation – internally recognise its challenging;
        -	Sam: technically makes sense. *However*, please identify which field (is it only one?) that determines what type of data is contained within the schema. Do we flag it well enough within the component?
    -	[#237](https://github.com/GFDRR/rdl-standard/issues/237) – non-risk data. Mat explained the base data we were considering including in RDLS, as separate new component. Concluded: postpone inclusion of context data in order to focus on V1 and publish more datasets early as possible; moreover a lot of this data can be described with existing geo metadata standards.
        -	Pierre: feels like a suitable boundary - agreement from Stu and James 
        -	James added: make use of the source data listed somehow – dedicated search of the source component? Value of this to orgs working in a new place.

**2. Data catalog**
- High level changes: new front end for easier data set intepretation, search; new address will be catalog.riskdatalibrary.org
-	New key datasets
    - HDX harvesting process - filters 24,000 datasets based on HDX metadata content, maps metadata to RDLS; examples now in RDL catalog. E.g. storm footprint: https://jkan.riskdatalibrary.org/datasets/rdls_exp-hdx_wfp_advanced_disaste_phl_philippines_cyclone_1001032_windstorm/
        - Process / principles of filtering and review can be applied to other large catalogues 
    - Tomorrow's Cities – good data catalog without metadata (was provided separately in PDF in different repo) - demonstrates ability of RDLS to create metadata where it didn't exist; provide that back to the original catalog (e.g. https://jkan.riskdatalibrary.org/?project=tomorrow-s-cities-gcrf-urban-disaster-risk-hub)
    - Desinventar (via HDX process) - to provide examples mapped to new UNDRR DELTA systems too. Application of loss catalogue valuable to JRC (e.g. https://jkan.riskdatalibrary.org/?project=desinventar-sendai-disaster-information-management-system)
        - Stu follow up with Sam for specific example of value - how this helps JRC link modelled and observed loss data.
    - Urban flood data online for Freetown (https://jkan.riskdatalibrary.org/datasets/rdls_hzd-gfdrr_sle_flood/), and in progress for Monrovia, Banjul and Phucoq

**3. Events** 
- (x3 in 2026) Provide example applications for urban data and RDLS, and contribute to practical data sprint with RDL Fellow and European partners. 
- First: Paris WB offices - inviting members of this group to 1.5 days: 21-22 May.
- Second: Abu Dhabi in October: UR conference Focus day planned (0.5 day +)
- Third: Autumn, African focus and country, TBD.  
- Invitations to Paris to follow in next two weeks (agenda being finalised).

**4. Urban data tracker** 
- Principles: Develop a tool and framework to enable collection of urban data sources (including but not limited to risk information) and publication of a data overview for individual cities - % of data types available per category e.g. environment, socio-economics, risk information, buildings, governance, infrastructure
- Presented the concept, timeline of development: beta version enabling data ingestion and display to be available for reliable use at the Paris event - mid May.
- Further development likely after May.
    - Sam: will share with another team; GHSL team working on urban data, may be interested.

**5. AOB**
- Pierre noted a open call for European funding on open geospatial: https://www.horizon-europe.gouv.fr/services-and-business-incubator-geospatial-open-source-developments-41508
  - Request for discussion if anyone is keen to collaborate on a call related to urban or risk data, or has experience with these calls

- Instructions on updating meeting notes requested by Sam:
  - Navigate to meeting notes file on `1.0-dev` branch
  - Edit file
  - Commit changes - this will prompt a pull request, due to the branch being protected.
  - Create PR for review by core team (GFDRR / ODS)
    
  
## Actions
1. Mat, Stu to check and clarify how we flag flag type of losses withing the loss component and confirm to Sam / group
2. Agenda for next meeting to include post-v1.0 governance
   - Rachel to set out good practice, others to bring examples for discussion
   - Stu to addtime for discussion into Paris event / UR event.
3. Stu / Sam to discuss JRC application of loss catalogue description using RDLS.

