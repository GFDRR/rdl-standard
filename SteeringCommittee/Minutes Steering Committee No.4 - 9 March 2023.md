# Minutes of RDLS Fellows project Steering Committee No.4

9 March 2023 / 09:00-10:30 EDT, 14:00-15:30 GMT / via Teams

## Attendees

Pierre Chrzanowski, Mattia Amadio, Andrea Garcia (GFDRR) 
Carolina Hess (SwissRe Foundation)
Rachel Vint, Jen Harris (Open Data Services)
SC members: 
- Beat Aeberhardt, Swiss Re
- Paul Henshaw, GEM Foundation
- Matt Donovan, ODS
- Stephen Hutchings, JBA Risk Management
- Tiziana Rossetto, UCL EPICentre
- Nick Moody, IDF/GRMA

## Agenda

1. Update on Fellowship program
	a. Summary of technical review findings (document link) 
	b. Priority tasks for the review and enhancement of the RDLS - underway
	c. Request to SC members: review/contribute potential implementations of standard
2. Update on technical review of the standard
3. Update on standard implementation
4. Update on epicentre vulnerability database
5. Alignment with ODS/RDLS
6. AOB

## Notes

* Update on Fellowship program
    * Introduced fellows and range of experience. From masters people to people experienced with ADB and others. Reasons for 2 fellows in the Philippines. Isabelle was assigned a project in CB working on detecting exposure data, support from SwissRe Foundation, ground-truth validation. 
    * Will provide a summary of fellows to SC, to share profiles, and potentially set up bilateral meetings to discuss projects/relevant experience.
    * TR: what happens to fellows at the end of the program: encourage them to maintain a relationship beyond the project, increasing talent and exposure is a nice thing to do, and good to grow that talent and see where they can get to. PC: will be STC and meet WB staff so have a chance to explore that.
    * NM: How can we propose to or explore opportunities with Fellows, before they start considering other opps? E.g. GRMA opportunity for work. PC: there are workshops, and we welcome presentations on the initiatives you’re working on, to do show those opportunities.
    * CH: important to Foundation that the Fellows are supported and get jobs after the initial project training. Encourage meeting them, to discuss.
* Update on the technical review of the standard
    * Summary of technical review findings ([document link](https://docs.google.com/document/d/1dBK7dr7JzHnLwcR9RTHybjpaS8JViopu5LLGPHqpm2c/edit?usp=sharing)) 
        * RV: By July, should have updated standard and repo, documentation site. This report informs that. Ran through the report's main sections. Highlighted normative/non-normative text, example data, recommendations on the schema to align with JSON schema version, the development environment to make it clear about how people can use it.
        * General request to SC to have a look and comment on anything that raises flags, missing.
    * Priority tasks for the review and enhancement of the RDLS - underway
        * User implementation - request on how you prepare would want to handle data:
            * PH:
                * Metadata - any text-based solution would work.
                * Data in any text-based format - any tools stop working quickly. In .shp/tif, good as people can put data straight into it, but how to keep it together.
                * Humans filling in data/forms - online form appropriate.
                * Where lots of data, want to be able to interrogate a db and create metadata automatically.
            * TR: simplest things work well - think of developing countries context - multi-use means familiarity. Dropdown menus, choices, less free text - better for consistency.
            * EV: licences with spreadsheets, preference of Google vs MS e,g. Creating things online is good but also need to create a manual for each approach. Need to advocate for the completion of metadata - make it less of a burden. Generic academic users may not think of adding the metadata. Would do an online tool.
            * SH: make it as easy as possible, droplists to make it as easy as possible. Be prescriptive in file formats too. Many in JBA can use JSON, many don’t. 
            * PC: helpful for us to all review the tools we’re using. We can be biased towards using WB tools because we’re using the data hub.
            * CH: some corporates can't open Google Docs, etc.
* Update on standard implementation
    * Update on the datasets being converted, uploaded - good coverage soon in the data catalog RDL Collection: [https://datacatalog.worldbank.org/search/collections/Risk-Data-Library](https://datacatalog.worldbank.org/search/collections/Risk-Data-Library).
* Update on epicentre vulnerability database
    * MOVER-MVData presentation - past present and future. Development of MOVER to develop structured data. Massive schema. Adminimum dashboard in Heroku hosting of db. THen refactored MOVER with GEM (‘MOVER_cf’). Grouped information common >1 function type. Used TH hazard taxonomy and elaborated process types. Organised the ideal IMT per process.
    * Now MVDat: expanding - single hazard multiple concurrent processes; single hazard, multiple sequential processes; multiple concurrent hazards; multiple sequential hazards. Including more dimensionality - from bi-dimensional, to curves in real-time / multi-dimensionality. To reduce the uncertainty in selecting and using the functions, characterising hazards and the dynamics between hazards and triggers. Working on oceanic/coastal; adding into hazard code explicit mention of the trigger (TSI, EQ_TSI, VO_TSI, LS_TSI). Adding asset schema natural resource, livelihoods, energy/power, biomedical scientific research facilities, decarbonisation, data centre/internet server farms (networks as well as industrial buildings and components).
    * Built almost complete registry of seismic and tsunami. LS, FL, WS functions are good. Not global but expanding.
    * Future: 
        * Would like feedback from practitioners, develop
        * Develop data schema - industrial components: Lots of interest. Also on socio-economic data.
        * Move from descriptive analytics to predictive analytics.
        * Business model still to be defined. Need to build a community.
    * SF/PC: can we find a way to link data to RDLS, and implement some of the new codes in RDLS (PH highlighted the different framing of hazards and triggers - allowing association between different triggers and hazards).
* Alignment with ODS/RDLS
    * Workshop in 2021. Standards for exposure data that goes into industry cat models, loss estimates produced by them. Any model using the platform can use these standards - proprietary data standards have dominated the industry. We don’t have a standard H/V standard. Idea of the project to be funded under Oasis development, is to implement the RDL H/V standards in Oasis - Joh Carter leading. Would be looking to IDF funding and engage with RDL team.
        * Please think for next time about use cases for having hazard and vulnerability standard wrapped around data in Oasis.
    * Oasis conference flagged.
* AOB
    * PC: Last minutes feedback received, upload to github after this call

## Actions:
 - Last minutes upload to github (PC) 
 
 ## Next Meeting Agenda 

 - Date: May 11, 9am EST / 3pm CET
- Proposed agenda: Risk Data Library Standard proposed change by ODS Global Risk Data Bank by IFRC
