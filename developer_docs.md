# Developer documentation

This page provides the following documentation for developers of the Risk Data Library Standard:

- [How-to guides](#how-to-guides)
- [Style guides](#style-guides)
- [Reference documentation](#reference)

## How-to guides

This section contains the following how-to guides:

* [Propose changes](#propose-changes)
* [Set up a local development environment](#set-up-a-local-development-environment)
* [Resolve check failures](#resolve-check-failures)
* [Build the documentation](#build-the-documentation)
* [Deploy changes](#deploy-changes)
* [Release a new version](#developer_docs.mdrelease-a-new-version)
* [Update requirements](#update-requirements)
* [Add an RDLS metadata example](#add-an-rdls-metadata-example)

### Propose changes

Before completing the steps below, you first need to [set up a local development environment](#set-up-a-local-development-environment) so that you can resolve build errors and test failures before pushing your changes to GitHub. Alternatively, if your change is simple, you can use the [GitHub web editor](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files) and skip the running the pre-commit script, running the tests and building the documentation locally.

1. Agree on a proposal in a [GitHub issue](https://github.com/GFDRR/rdl-standard/issues).
1. Create a branch from the `dev` branch.
1. Make your changes. Do not use normative keywords in non-normative content. For more information, see [normative and non-normative content in RDLS](https://docs.google.com/document/d/13g1SZO3ZSHbkymtc69lQOu9vB9vlZVZnodAcxC50l1M/edit#).
1. Run the pre-commit script (`./manage.py pre-commit`) to update reference documentation and format markdown files.
1. Run the tests (`pytest`) and [resolve any errors](#resolve-check-failures).
1. [Build the documentation](#build-the-documentation), [resolve any errors](#resolve-check-failures) and [preview your changes locally](#build-the-documentation).
1. Commit your changes to your branch and push it to GitHub. Your changes are available for anyone to preview at \[https://rdl-standard.readthedocs.io/en/{branch name}\](https://rdl-standard.readthedocs.io/en/{branch name}).
1. [Create a pull request](https://github.com/GFDRR/rdl-standard/compare):

- Set the base branch to `dev`.
- Reference the issue number in the description.

Once the pull request is merged, the updated documentation is available to preview at [https://rdl-standard.readthedocs.io/en/dev](https://rdl-standard.readthedocs.io/en/dev).

### Set up a local development environment

#### Clone the repository

```bash
git clone git@github.com:GFDRR/rdl-standard.git
cd rdl-standard
```

Subsequent instructions assume that your current working directory is `rdl-standard`, unless otherwise stated.

#### Install submodules

```bash
git submodule init
git submodule update
```

#### Create and activate a Python virtual environment

The following instructions assume you have [Python 3.8](https://www.python.org/downloads/) or newer installed on your machine.

You can use either `pyenv` or `python3-venv`:

##### pyenv

1. Install [pyenv](https://github.com/pyenv/pyenv). The [pyenv installer](https://github.com/pyenv/pyenv-installer) is recommended.
1. Create a virtual environment.
   ```bash
   pyenv virtualenv rdl-standard
   ```
1. Activate the virtual environment
   ```bash
   pyenv activate rdl-standard
   ```
1. Set the local application-specific virtual environment. Once set, navigating to the `rdl-standard` directory will automatically activate the environment.
   ```bash
   pyenv local rdl-standard
   ```

##### python3-venv

If you are using Python 3.3 or newer, `venv` is included in the standard Python installation.

1. Create a virtual environment called .ve.
    a. Linux/MacOS users
        ```bash
        python3 -m venv .ve
        ```
    a. Windows users
        ```bash
        py -m venv .ve
        ```
1. Activate the virtual environment. You must run this command for each new terminal session.
    a. Linux/MacOS users
        ```bash
        source .ve/bin/activate
        ```
    b. Windows users
        ```bash
        .\.ve\Scripts\activate
        ```

#### Install requirements

```bash
pip install --upgrade pip setuptools
pip install -r requirements.txt
```

### Resolve check failures

#### mdformat

If this check fails, run the following command to fix markdown formatting:

```bash
mdformat docs
```

#### tests

If this check fails, review the output to identify which test failed:

##### test_json.py::test_empty

Review the warnings to identify the empty JSON files and remove the files.

##### test_json.py::test_indent

Run the following command to indent JSON files:

```bash
ocdskit indent -r .
```

##### test_json.py::test_invalid_json

Review the warnings to identify the invalid JSON files and correct the errors.

##### test_schema.py (all tests)

Review the warnings to identify and correct the errors. For more information on each test, see https://jscc.readthedocs.io/en/latest/api/testing/checks.html#module-jscc.testing.checks.

### Build the documentation

Sphinx, which builds the documentation, doesn’t watch directories for changes. To regenerate the documentation, start an HTML server, and refresh the browser whenever changes are made, run:

```bash
cd docs
make autobuild
```

Alternatively, build the documentation and view it using a local web server:

```bash
cd docs
make html
python -m http.server --directory _readthedocs/html
```

### Deploy changes

To deploy the `dev` branch to the live documentation site, [create a pull request](https://github.com/GFDRR/rdl-standard/compare) to merge the `dev` branch into the `main` branch. Once the pull request is merged, the changes are automatically deployed to the live site at [https://rdl-standard.readthedocs.io/en/](https://rdl-standard.readthedocs.io/en/).

### Release a new version

1. Update the MAJOR.MINOR `version` in `conf.py`.
1. Update the MAJOR.MINOR.PATCH version number in the following files:
  * `docs/conf.py`: update `release`
  * `docs/reference/schema.md`: update the canonical schema URL
  * `schema/rdls_schema.json`: update `id` and `properties/links/prefixItems/properties/href/const`
1. Update the version number and date in `docs/about/changelog.md`

1. Create a tag. For example:

```bash
  git tag -a 0__2__0 -m '0.2.0 release'
```

2. Push the tag:

```bash
  git push --follow-tags
```



### Update requirements

1. Install `pip-tools`.
   ```bash
   pip install pip-tools
   ```
1. Edit `requirements.in`.
1. Update `requirements.txt`.
   ```bash
   pip-compile
   ```
1. Install requirements.
   ```bash
   pip-sync requirements.txt
   ```
1. Commit your changes.


## Add an RDLS metadata example

1. Author your example RDLS metadata in JSON format. You can use either a text editor or the [RDLS spreadsheet template](https://github.com/GFDRR/rdls-spreadsheet-template/) and [Flatten Tool](https://flatten-tool.readthedocs.io/en/latest/). Your example RDLS metadata must be wrapped in an outer `datasets` array, e.g.

```json
{
  "datasets": [
    {
      "id": "1",
      "title": "My example RDLS metadata"
    }
  ]
}
```
1. Save your example JSON file to `examples/{component}/{title}/example.json` where `{component}` is the risk data component the example relates to (hazard, exposure, loss or vulnerability) and `{title}` is the title of the example.
1. Run `./manage.py pre-commit` to create a CSV version of the example.
1. Add Sphinx directives to the Markdown files in `docs` to render your example in the built documentation.

## Style guides

### Changelog style guide

- Use the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
- Begin each entry with a link to the pull request for the change.

#### Normative content

Changelog entries should be descriptive:

- Bad entry: Update schema.
- Good entry: Make `name` required.

If changes are made to files under the `schema` directory, it is assumed that corresponding changes were made to files under the `docs` directory. Do not add an entry under the "Documentation" heading if the changes directly correspond to entries under the "Codelists" and/or "Schema" headings.

For changes to schema and codelists, preserve schema/codelist ordering when adding new changelog entries. Otherwise, to reduce merge conflicts, add new changelog entries to the end of the relevant bullet list.

#### Non-normative content

Changelog entries should be descriptive. Do not add an entry like "Improve primer." Instead, simply add the PR number to the "Primer" list item.

## Reference

This section contains the following reference documentation:

- [GitHub repository](#github-repository)
- [Sphinx](#sphinx)
- [Read the Docs](#read-the-docs)
- [manage.py](#managepy)

### GitHub repository

The project repository is hosted on GitHub.

#### Branches

The `main` branch is used to build the 'live' version of the standard documentation.

The `dev` branch is used to stage changes to the `main` branch.

Feature branches branch off the `dev` branch, with work merged into the `dev` branch before finally being merged into the `main` branch.

[Branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule) are configured for the `main` and `dev` branches. The rules prevent commits being made directly by requiring [pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) before commits can be merged. They also require approvals and status checks to pass before merging.

#### Directory structure

- `.github/`: Issue templates and GitHub Actions workflows
- `docs/`:
  - `*.md`, `*/*.md`: English documentation text
  - `conf.py`: Sphinx configuration
  - `_static/`: CSS and JavaScript for the documentation
  - `_templates/`: Jinja templates for the documentation
  - `.tx/`: Transifex configuration (not yet implemented)
  - `img/`: Images used in the documentation
  - `locale/`: Translations of the English documentation (not yet implemented)
- `examples`: Example JSON files, CSV files and figures
- `schema/`: schema- and codelist-related files
- `specs/`: TBD
- `SteeringCommittee/`: Minutes of steering committee meetings

The following files are created by running a build and are not version controlled:

- `.ve/`: Python virtual environment (if using [python3-venv](#python3-venv))
- `docs/_readthedocs`: Built HTML documentation

### Sphinx

[Sphinx](https://www.sphinx-doc.org/) is the documentation generator used to build the HTML documentation from Markdown source files. It uses the [MyST - Markedly Structured Text - Parser](https://myst-parser.readthedocs.io/en/latest/index.html) to parse the Markdown source files.

#### Configuration

The Sphinx configuration for this project is based on the [Open Data Services Sphinx Base](https://github.com/OpenDataServices/sphinx-base) and is defined in `docs/conf.py`. So that links within the schema work on branches, the configuration replaces `{{version}}` placeholders in `schema/rdls_schema.json` and copies the processed schema to `docs/_readthedocs/html` for inclusion in the built documentation.

### Read the Docs

[Read the Docs](https://readthedocs.org/) builds and hosts the standard documentation site.

Whenever a commit is pushed to a branch in the GitHub repository, Read the Docs automatically builds the [version](https://docs.readthedocs.io/en/stable/tutorial/index.html#versioning-documentation) associated with the branch and hosts it at https://rdl-standard.readthedocs.io/en/<branch name>.

#### Configuration

https://rdl-standard.readthedocs.io/en/latest redrirects to https://rdl-standard.readthedocs.io/en/main.

[Automation rules](https://docs.readthedocs.io/en/stable/automation-rules.html#automation-rules) are configured to:

- Activate, build and hide a new version when a commit is pushed to a new branch in the GitHub repository.
- Delete the associated version when a branch is deleted in the GitHub repository.

[Pull request builds](https://docs.readthedocs.io/en/stable/pull-requests.html) are also enabled.

Other than the `main` branch, all branches are hidden from the [flyout menu](https://docs.readthedocs.io/en/stable/flyout-menu.html).

#### Credentials

You can find credentials for Read the Docs in the Open Data Services password database.

### manage.py

The standard repository includes a command-line utility for administrative tasks. For information on the available commands, run `./manage.py --help`.
