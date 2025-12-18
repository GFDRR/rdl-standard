# Minutes of RDLS Steering Committee No. 8

7 December 2023 / 09:00-10:30 EDT, 14:00-15:30 GMT / via Teams

## Attendees

Pierre Chrzanowski, Mattia Amadio, Stuart Fraser, Andy Garcia (GFDRR)
Jen Harris (Open Data Services)

**SC members:**
- Stephen Hutchings, JBA Risk Management
- Hamish Patten, Justin Ginetti (IFRC)
- Carolina Hess (SwReFoundation)
- Thomas Phillips (SwRe)

**Absent**
- Tiziana Rossetto, UCL EPICentre
- Matt Donovan, Oasis ODS
- Beat Aeberhardt, Swiss Re
- Johanna Carter, Oasis ODS
- Paul Henshaw, GEM Foundation
- Nick Moody, IDF/GRMA
- Rachel Vint, Open Data Services

**Agenda**
- Update on launch and RDL Fellows week, DC, November 2023
- Current status and plans for 2024
- Technical changes in WB Data Catalog – internal change in process but greater potential for better user access, APIs…
- Opportunities for using RDLS outside of WB
- Please highlight any, as we continue to work on this.
- Update from Joh on Oasis integration
- Update from Steve on JBA testing of RDLS integration
- Stuart – GRMA applying RDLS in TORs
- Tiziana – update on MVDat
 
Presentation
n/a




## Notes
- Update on launch and RDL Fellows week, DC, November 2023
  - Successful webinar to launch RDLS
  - RDL presented at AAGS at U. Columbia. Fellows presented projects, RDLS presented by Mat, one fellow invited to give lecture.
  - Successful workshop with fellows working with data in RDLS.

- Current status and plans for 2024
  - Potential funding to be announced - can support further development including risk data portal.
	- Common platform needed to encourage network effect
  - GFDRR grants - c. 100 p.a. with substantial number producing risk data - mandating use of RDLS metadata and RDL Collection submission.
  - Discussion with HDX to review their datasets, identify risk data and apply RDLS.
  - Carolina proposal to keep SC going, to continue work and direction. Agreed by GFDRR as valuable and IFRC happy to continue. Potential lower frequency in non-development times. SwReFoudnation / GFDRR happy to facilitate
  - GFDRR to coordinate feedback on who should attend, proposed frequency, content / direction to take.
   

- Outreach
  - UR 2024 - session submitted
  - Paper to update from Murnane 2019.
  - Humanitarian Networks Partnerships Week, Geneva, 6-10 May 24: **seems we cannot propose a session**
  	- https://www.unocha.org/events/humanitarian-networks-and-partnerships-weeks-hnpw
  	- The first week (29 April to 3 May) will be held remotely, the second week (6 to 10 May) will be organized face-to-face at the CICG in Geneva.
  	- Who can register sessions and exhibition stands: Only the networks and partnerships that are members of the Leading-Edge Programme (LEP), the governing body of the HNPW, are invited to organize sessions and exhibition stands at the HNPW. Please see tab "Networks and Partnerships" above for an overview of registered networks and partnerships.
  	- Who can participate in remote and face-to-face sessions:
      	- Invited persons: Invitations will be sent directly by the networks and partnerships to their members and stakeholders for the sessions they organize.
      	- Persons who did not receive an invitation: Most session will be open for public access, where also those without invitation can register to attend. Once participant registration is open, sessions can be found by keyword or organizing network/partnership in the online event program.
      	- Participant registration will be opened in February 2024
  - Weather and Society Conference, February 26th to March 1st 2024, online only: **May not fit social science aspect but Propose to submit, its free, online only, could do poster or presentation in RISK KNOWLEDGE session?**
  	- https://www.weatherandsociety.de/
  	- The themes and sessions of the conference will focus on the **social science contribution to the four pillars of EW4ALL and the cross-cutting enablers** which connect across and within all aspects of the early warning value cycle:
    	- Risk knowledge and management
    	- Observations and forecasting
    	- Dissemination and communication
    	- Preparedness to respond
    	- Cross-cutting enablers, particularly partnerships and locally-led action
    	- Monitoring and evaluation


- Technical changes in WB Data Catalog – internal change in process but greater potential for better user access, APIs…
  - Moving to Azure, data lakes, new APIs, causing delays on our data upload pipeline.

- Opportunities for using RDLS outside of WB
  - Potential to promote within SwissRe - create event with industry partners - need to propose content, participants with CH / Thomas.

  - IFRC
	- have used schema and modified for use in the Global Crisis Databank
  	- consider it well thought-out but maybe consider how it can be made more flexible.  
	- Could push retrospective analysis of event losses back to RDL Collection
	-

  - Oasis ODS integration:
	- ODS Steering Committee: no resistance and some support to adopt RDL metadata standards.
	- There is no formal action plan yet, following the scoping report from ODS team
	- Oasis is keen to improve model standards and accessibility.
	- 2024: upgrade and improve free models available and make them more accessible
  	- Includes adding more model metadata linked to RDLS
  	- Enabling test of RDLS and metadata import tool
	- Pushing the standard into Oasis and ODS relies on having some examples (public GitHub model repositories complete with metadata) and support from model developers
 
  - Update from Steve on JBA testing of RDLS integration
	- Tested with flood hazard data – 2 WB projects - new hazard maps (Vietnam) and climate change event sets (Tunisia)
	- Spreadsheet template easy to populate; Converter is simple to use
	- Sufficient supporting documentation
	- Requires time to become familiar with the templates and supporting information: a need for some introductory training to assist uptake
 
	- Spreadsheet templates:
  	- Relatively easy to complete the spreadsheets and the drop-down menus help to speed the process up. Links to the schema and code lists particularly useful for accessing documentation
  	- Thorough: no obvious missing options for flood hazard
  	- Lots of options, time-consuming to provide information for all the options listed in the spreadsheets
 
	- Useful:
  	- toggle on the “required” fields only
  	- Company-specific project codes
  	- Clearer instructions on dataset ID
  	- Generic email (company, team)
  	- Better guidance on event set (optional tabs)
  	- Clunky jumping between spreadsheet and online resources - simple interface could be helpful
 
	- Supporting documentation:
  	- Plenty of it, thorough
  	- New user – time required to understand all of it – a call helped, tutorial / video would be useful
  	- Potentially too many links and too much supporting information but that’s probably not a bad thing!
 
	- .json converter:
  	- Useful error messages helps to troubleshoot errors in the input spreadsheet templates
  	- Helpful to list spreadsheet tab name in error message (did deliberate error testing)

- Stuart – GRMA applying RDLS in TORs
  - GRMA mandating use of RDLS in TORs - working in MDG, PAK, CRI, NGA

- Tiziana – update on MVDat
  - TR not available to give update.
 

## Actions:  
- Set up next SC calls - quarterly for now.
- Email to request feedback from SC group [done]
- Attend next Tuesday 21:00 CET IFRC call [done]
- Set up call with IFRC in Jan 2024 - loss and damage focus, moderations to schema, following
- Feedback from JBA into github
- Plan with Carolina & Thomas an event with SwReFound / SwRe to share RDLS
- Write up paper on RDLS
- Assess / submit sessions - Humanitarian Network Partnership Week and Weather and Society Conference [assessed, not attending]

 
    



