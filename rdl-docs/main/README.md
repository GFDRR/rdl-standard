# Instructions for  setting up mkdocs
(for more details see https://www.mkdocs.org/#installation)

## Requirements
- python >= 3.5 (tested 3.8)
- GIT installed and with GitHub credentials (when you deploy the first time, a popup should ask you for GitHub credentials)

## Suggested
- GitHub for desktop
- don't use root, create and activate an environment

## Installation
- clone the rdl-docs repo from github
- update pip: "pip install --upgrade pip"
- install mkdocs: "pip install mkdocs"
- install mkdocs themes plugin: "pip install mkdocs-bootstrap"
- install mkdocs table plugin: "pip install mkdocs-bootstrap-tables-plugin"
- install mkdocs mermaid2 plugin: "pip install mkdocs-mermaid2-plugin"

## Editing the documentation
- The content of pages is located in docs/*.md markdown files 
- RDL style over ReadTheDocs basic theme is located in css/extra.css
- Website configuration is mkdocs.yml

## Inspect and deploy
- cd yourpath/GitHub/rdl-doc
- Inspect the website on localhost: "mkdocs serve"
- Build documentation on local folder /site: "mkdocs build"
- Deploy on server: "mkdocs gh-deploy --clean" (the --clean parameter will remove the previous version)
- The documentation is built and uploaded to branch "gh-pages" and available at https://GFDRR.github.io/rdl-docs
