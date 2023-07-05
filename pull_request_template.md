**Related issues**

<!-- Add links to related issues here. If you want an issue to be automatically closed when the PR is merged, use keywords (https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword). -->

**Description**

<!-- If the changes in the PR are not sufficiently explained by the related issues and commit messages, add a description here. -->

**Merge checklist**

<!-- Complete the checklist before requesting a review. -->

- [ ] Update the changelog ([style guide](developer_docs.md#changelog-style-guide))
- [ ] Run `./manage.py` pre-commit

If you added or removed a field:

- [ ] Update the `collapse` option of the jsonschema directives for dataset, resource, hazard, exposure, vulnerability and loss on `reference/schema.md`
