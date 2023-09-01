**Related issues**

<!-- Add links to related issues here. If you want an issue to be automatically closed when the PR is merged, use keywords (https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword). -->

**Description**

<!-- If the changes in the PR are not sufficiently explained by the related issues and commit messages, add a description here. -->

**Merge checklist**

<!-- Complete the checklist before requesting a review. -->

If you added, removed or renamed a field:

- [ ] Update the `collapse` option of the jsonschema directives for dataset, resource, hazard, exposure, vulnerability and loss on `reference/schema.md`
- [ ] Update the diagrams in `reference/schema/md`
- [ ] Update the JSON files in `examples`

Always:

- [ ] Run `./manage.py` pre-commit
- [ ] Update the changelog ([style guide](developer_docs.md#changelog-style-guide))

**Having trouble?**

See [how to resolve check failures](https://github.com/GFDRR/rdl-standard/blob/dev/developer_docs.md#resolve-check-failures).
