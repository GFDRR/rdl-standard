# Developer documentation

This page provides [how-to guides](#how-to-guides) and [reference documentation](#reference) for developers of the Risk Data Library Standard.

## How-to guides

This section contains the following how-to guides:

* [Propose changes](#propose-changes)
* [Deploy changes](#deploy-changes)
* [Set up a local development environment](#set-up-a-local-development-environment)
* [Build the documentation](#build-the-documentation)
* [Update requirements](#update-requirements)
* [Resolve check failures](#resolve-check-failures)

### Propose changes

The preferred approach for making changes to the standard is to use a [local development environment](#set-up-a-local-development-environment) so that you can resolve build errors and test failures before committing your changes. Making repeated commits whilst trying to resolve issues can result in a messy commit history, which makes reviewing pull requests more complicated. Alternatively, if your change is simple, you can use the [GitHub web editor](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files).

1. Agree on a proposal in a [GitHub issue](https://github.com/GFDRR/rdl-standard/issues).
1. Create a branch from the `dev` branch.
1. Make your changes. Do not use normative keywords in non-normative content. For more information, see [normative and non-normative content in RDLS](https://docs.google.com/document/d/13g1SZO3ZSHbkymtc69lQOu9vB9vlZVZnodAcxC50l1M/edit#).
1. Run `./manage.py pre-commit`.
1. [Build the documentation](#build-the-documentation), resolve any errors and preview your changes locally.
1. Commit your changes to your branch and push it to GitHub. Your changes are available for anyone to preview at [https://rdl-standard.readthedocs.io/en/{branch name}](https://rdl-standard.readthedocs.io/en/{branch name}).
1. [Create a pull request](https://github.com/GFDRR/rdl-standard/compare):
  * Set the base branch to `dev`.
  * Reference the issue number in the description. 

Once the pull request is merged, the updated documentation is available to preview at [https://rdl-standard.readthedocs.io/en/dev](https://rdl-standard.readthedocs.io/en/dev).

### Deploy changes

To deploy the `dev` branch to the live documentation site, [create a pull request](https://github.com/GFDRR/rdl-standard/compare) to merge the `dev` branch into the `main` branch. Once the pull request is merged, the changes are automatically deployed to the live site at [https://rdl-standard.readthedocs.io/en/](https://rdl-standard.readthedocs.io/en/).

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

1. Install [python3-venv](https://docs.python.org/3/library/venv.html).

    ```bash
    sudo apt-get install python3-venv
    ```
1. Create a virtual environment.
    ```bash
    python3 -m venv .ve
    ```
1. Activate the virtual environment. You must run this command for each new terminal session.
    ```bash
    source .ve/bin/activate
    ```

#### Install requirements

```bash
pip install --upgrade pip setuptools
pip install -r requirements.txt
```

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
python -m http.server --directory _build/html
```

### Update requirements

1. Install `pip-tools`.
    ```bash
    pip install pip-tools
    ```
2. Edit `requirements.in`.
3. Update `requirements.txt`.
    ```bash
    pip-compile
    ```
4. Install requirements.
    ```bash
    pip-sync requirements.txt
    ```
5. Commit your changes.

### Resolve check failures

#### mdformat

If this check fails, run the following command to fix markdown formatting:

```bash
mdformat docs
```

## Reference

This section contains the following reference documentation:

* [GitHub repository](#github-repository)
* [Sphinx](#sphinx)
* [Read the Docs](#read-the-docs)

### GitHub repository

The project repository is hosted on GitHub.

#### Branches

The `main` branch is used to build the 'live' version of the standard documentation.

The `dev` branch is used to stage changes to the `main` branch.

Feature branches branch off the `dev` branch, with work merged into the `dev` branch before finally being merged into the `main` branch.

[Branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule) are configured for the `main` and `dev` branches. The rules prevent commits being made directly by requiring [pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) before commits can be merged. They also require approvals and status checks to pass before merging.

#### Directory structure

* `.github/`: Issue templates and GitHub Actions workflows
* `docs/`:
  * `*.md`, `*/*.md`: English documentation text
  * `conf.py`: Sphinx configuration
  * `_static/`: CSS and JavaScript for the documentation
  * `_templates/`: Jinja templates for the documentation
  * `.tx/`: Transifex configuration (not yet implemented)
  * `img/`: Images used in the documentation
  * `locale/`: Translations of the English documentation (not yet implemented)
* `schema/`: schema-related files
* `specs/`: TBD
* `SteeringCommittee/`: Minutes of steering committee meetings

The following files are created by running a build and are not version controlled:

* `.ve/`: Python virtual environment (if using [python3-venv](#python3-venv))
* `docs/_build`: Built HTML documentation

### Sphinx

[Sphinx](https://www.sphinx-doc.org/) is the documentation generator used to build the HTML documentation from Markdown source files. The Sphinx configuration for this project is based on the [Open Data Services Sphinx Base](https://github.com/OpenDataServices/sphinx-base). It uses the [MyST - Markedly Structured Text - Parser](https://myst-parser.readthedocs.io/en/latest/index.html) to parse the Markdown source files.

### Read the Docs

[Read the Docs](https://readthedocs.org/) builds and hosts the standard documentation site.

Whenever a commit is pushed to a branch in the GitHub repository, Read the Docs automatically builds the [version](https://docs.readthedocs.io/en/stable/tutorial/index.html#versioning-documentation) associated with the branch and hosts it at https://rdl-standard.readthedocs.io/en/<branch name>.

#### Configuration

https://rdl-standard.readthedocs.io/en/latest redrirects to https://rdl-standard.readthedocs.io/en/main.

[Automation rules](https://docs.readthedocs.io/en/stable/automation-rules.html#automation-rules) are configured to:

* Activate, build and hide a new version when a commit is pushed to a new branch in the GitHub repository.
* Delete the associated version when a branch is deleted in the GitHub repository.

[Pull request builds](https://docs.readthedocs.io/en/stable/pull-requests.html) are also enabled.

Other than the `main` branch, all branches are hidden from the [flyout menu](https://docs.readthedocs.io/en/stable/flyout-menu.html).

#### Credentials

You can find credentials for Read the Docs in the Open Data Services password database.
