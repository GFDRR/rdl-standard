// Check of a dataset against the RDLS schema, used by the RDLS Metadata Editor.
// It does not need the page: tests/test_mde_validator.py runs it in Node.

/**
 * Schema validation, with the rules that the catalogue applies to each pull request
 * (python/check_datasets.py and python/validator.py in GFDRR/rdl-jkan). It covers the
 * JSON Schema keywords that the RDLS schema uses. As in the catalogue, `format` is not checked.
 */
function getSchemaErrors(dataset, schema) {
    const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    const toKey = value => {
        if (Array.isArray(value)) return `[${value.map(toKey).join()}]`;
        if (!isObject(value)) return JSON.stringify(value);
        return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${toKey(value[key])}`).join()}}`;
    };
    const typeChecks = {
        object: isObject,
        array: Array.isArray,
        string: value => typeof value === 'string',
        number: value => typeof value === 'number',
        integer: Number.isInteger,
        boolean: value => typeof value === 'boolean',
        null: value => value === null
    };
    const shorten = (text, length = 60) => text.length > length ? `${text.slice(0, length)}…` : text;
    const quote = value => shorten(JSON.stringify(value));
    const listValues = values => values.slice(0, 8).join(', ') + (values.length > 8 ? `, … (${values.length} in total)` : '');
    const resolve = ref => ref.slice(2).split('/').filter(Boolean)
        .reduce((node, key) => node[key.replace(/~1/g, '/').replace(/~0/g, '~')], schema);

    function check(value, rule, path) {
        if (rule === true) return [];
        if (rule === false) return [{ path, message: 'is not allowed' }];
        const errors = [];
        const add = message => errors.push({ path, message });
        const passes = subrule => check(value, subrule, path).length === 0;

        if (rule.$ref) errors.push(...check(value, resolve(rule.$ref), path));
        if (rule.type) {
            const types = [].concat(rule.type);
            if (!types.some(type => typeChecks[type](value))) add(`${quote(value)} must be of type ${types.join(' or ')}`);
        }
        if (rule.enum && !rule.enum.some(item => toKey(item) === toKey(value))) {
            add(`${quote(value)} is not one of the allowed values: ${listValues(rule.enum)}`);
        }
        if ('const' in rule && toKey(rule.const) !== toKey(value)) add(`must be ${quote(rule.const)}`);

        if (typeof value === 'string') {
            const length = [...value].length;
            if (length < rule.minLength) add(`must have at least ${rule.minLength} character(s)`);
            if (length > rule.maxLength) add(`must have at most ${rule.maxLength} character(s)`);
            if (rule.pattern && !new RegExp(rule.pattern, 'u').test(value)) add(`${quote(value)} does not have the expected format (${rule.pattern})`);
        }
        if (typeof value === 'number') {
            if (value < rule.minimum) add(`${value} is less than the minimum of ${rule.minimum}`);
            if (value > rule.maximum) add(`${value} is more than the maximum of ${rule.maximum}`);
            if (value <= rule.exclusiveMinimum) add(`${value} must be more than ${rule.exclusiveMinimum}`);
            if (value >= rule.exclusiveMaximum) add(`${value} must be less than ${rule.exclusiveMaximum}`);
        }
        if (Array.isArray(value)) {
            if (value.length < rule.minItems) add(`must have at least ${rule.minItems} item(s)`);
            if (value.length > rule.maxItems) add(`must have at most ${rule.maxItems} item(s)`);
            if (rule.uniqueItems && new Set(value.map(toKey)).size < value.length) add('has items that are repeated');
            const prefixItems = rule.prefixItems || [];
            value.forEach((item, index) => {
                const subrule = index < prefixItems.length ? prefixItems[index] : rule.items;
                if (subrule !== undefined) errors.push(...check(item, subrule, [...path, index]));
            });
        }
        if (isObject(value)) {
            if (Object.keys(value).length < rule.minProperties) add(`must have at least ${rule.minProperties} field(s)`);
            (rule.required || []).forEach(key => {
                // The catalogue does not require these two
                if (rule.title === 'Event' && key === 'occurrence') return;
                if (rule.title === 'Hazard' && key === 'hazard_process') return;
                if (!Object.hasOwn(value, key)) errors.push({ path, message: `${quote(key)} is required`, missing: key });
            });
            Object.entries(rule.properties || {}).forEach(([key, subrule]) => {
                if (!Object.hasOwn(value, key)) return;
                // The forms of a date overlap, so the catalogue accepts any number of them
                if (['start', 'end'].includes(key) && subrule.oneOf) {
                    const { oneOf, ...others } = subrule;
                    subrule = { ...others, anyOf: oneOf };
                }
                errors.push(...check(value[key], subrule, [...path, key]));
            });
        }

        (rule.allOf || []).forEach(subrule => errors.push(...check(value, subrule, path)));
        if (rule.anyOf && !rule.anyOf.some(passes)) {
            const required = rule.anyOf.map(subrule => subrule.required);
            add(required.every(Boolean)
                ? `must have at least one of: ${[...new Set(required.flat())].join(', ')}`
                : 'does not have any of the allowed forms');
        }
        if (rule.oneOf && rule.oneOf.filter(passes).length !== 1) add('must have exactly one of the allowed forms');
        if (rule.not && passes(rule.not)) {
            add(rule.not.required ? `must not have: ${rule.not.required.join(', ')}` : 'is not allowed here');
        }
        if (rule.if !== undefined) {
            const branch = passes(rule.if) ? rule.then : rule.else;
            if (branch !== undefined) errors.push(...check(value, branch, path));
        }
        return errors;
    }

    return check(dataset, schema, []);
}

/** Text that was decoded wrongly, which the catalogue rejects too */
function getTextErrors(value, path = []) {
    if (typeof value === 'string') {
        const match = value.match(/\uFFFD|[\u00C3\u00C2][\u0080-\u00BF]|\u00E2\u20AC/);
        if (!match) return [];
        const context = value.slice(Math.max(0, match.index - 20), match.index + 20);
        return [{ path, message: `has text with the wrong encoding: …${context}…` }];
    }
    if (value === null || typeof value !== 'object') return [];
    return Object.entries(value).flatMap(([key, item]) => getTextErrors(item, [...path, Array.isArray(value) ? Number(key) : key]));
}

/** The error as a line of text. ['resources', 0, 'spatial'] is shown as "resources 1 › spatial". */
function describeCatalogueError({ path, message }) {
    const place = path.map(part => typeof part === 'number' ? ` ${part + 1}` : ` › ${part}`).join('').replace(/^ › /, '');
    return place ? `${place}: ${message}` : message;
}

// For the tests, which load this file in Node
if (typeof module !== 'undefined') {
    module.exports = { getSchemaErrors, getTextErrors, describeCatalogueError };
}
