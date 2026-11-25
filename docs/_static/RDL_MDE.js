// The RDLS Metadata Editor (RDL_MDE.html)

// RDLS Schema Configuration
const RDLS_VERSIONS = {
    '1.0': 'https://docs.riskdatalibrary.org/en/1__0__0/rdls_schema.json'
};
const CODELISTS_URL = 'https://docs.riskdatalibrary.org/en/latest/codelists';

const SECTIONS = ['hazard', 'exposure', 'vulnerability', 'loss'];
const REQUIRED_ROLES = ['publisher', 'creator', 'contact_point'];

let currentSchema = null;
let currentSchemaVersion = '1.0'; // Track current schema version for URL substitutions
let currentFormData = {};
let activeSections = new Set(['general']);

// What is open in the edit window, see openEditor
let currentObjectEditor = null;

// Country names cache
let countryNames = {};

// Fields whose options or visibility depend on a field next to them
const DEPENDENT_FIELDS = {
    type: ['process', 'intensity_measure'],
    quantity_kind: ['unit', 'valuation_year']
};

// Auto-completion suggestions for common fields
const AUTO_COMPLETE_SUGGESTIONS = {
    'title': [
        'Global Flood Risk Assessment',
        'Earthquake Hazard Database',
        'Climate Change Vulnerability Index',
        'Urban Exposure Inventory',
        'Disaster Loss Database'
    ],
    'purpose': [
        'Risk assessment for urban planning',
        'Insurance portfolio analysis',
        'Climate adaptation planning',
        'Disaster risk reduction strategy development'
    ]
};

// The character limits of text fields that the schema leaves open
const TEXT_LIMITS = { description: 2500, details: 5000, purpose: 1500, citation: 1500 };

// ================================
// SCHEMA REFERENCE RESOLUTION
// ================================

/** The allowed values of a property (or of its items), or null */
function getEnumValues(property) {
    const resolve = rule => rule?.enum || (rule?.$ref && resolveReferenceSimple(rule.$ref)?.enum) || null;
    return resolve(property) || resolve(property?.items);
}

/** A code as text: "strong_wind" is shown as "Strong Wind" */
function describeCode(code) {
    const text = String(code);
    if (text.includes('(') && text.includes(')')) return text; // such as "CSV (csv)"
    return text.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function getPropertyTitle(name, property) {
    return property?.title || describeCode(name.split('.').pop());
}

// ================================
// FIELD CREATION
// ================================

let inlineContextCount = 0;

/**
 * Where fields are: in the form ('normal'), in the edit window ('modal') or in an item of a
 * list of the edit window ('inline'). Each change of a field goes straight to the data.
 */
class FieldCreationContext {
    constructor(type = 'normal', { itemData = null, arrayName = null } = {}) {
        this.type = type;
        this.itemData = itemData; // the item being edited, in the inline context
        this.arrayName = arrayName; // the list that the item (inline) or the window's object (modal) belongs to
        this.draft = type === 'modal' ? currentObjectEditor.draft : null;
        this.idPrefix = { normal: '', modal: 'modal_', inline: `inline_${type === 'inline' ? ++inlineContextCount : 0}_` }[type];
    }

    /** The object that holds the values of the fields */
    getRoot() {
        if (this.type === 'inline') return this.itemData;
        return this.draft || currentFormData;
    }

    getValue(name) {
        return getNestedValue(this.getRoot(), name);
    }

    setValue(name, value) {
        setNestedValue(this.getRoot(), name, value);
        if (this.type === 'normal') formChanged();
    }

    createField(name, property, value, options = {}) {
        return new FieldFactory(this).createField(name, property, value, options);
    }

    getFieldId(name) {
        return this.idPrefix + name;
    }

    /** Store the value of a control when it changes */
    connect(element, name, property) {
        element.id = this.getFieldId(name);
        if (this.type === 'normal') {
            element.addEventListener('change', () => {
                touchedFields.add(name);
                scheduleValidation();
            });
        }
        element.addEventListener(element.tagName === 'SELECT' ? 'change' : 'input', () => {
            this.setValue(name, convertInput(element.value, property));
            updateDependentFields(this, element, name, element.value);
        });
    }
}

function convertInput(text, property) {
    const isNumber = ['number', 'integer'].includes(property.type) && text.trim() !== '' && Number.isFinite(Number(text));
    return isNumber ? Number(text) : text;
}

/** Change the value of a control as the user would */
function setControlValue(element, value) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Creates the appropriate elements of a field, based on its property in the schema and on the context */
class FieldFactory {
    constructor(context) {
        this.context = context;
    }

    createField(name, property, value, options = {}) {
        const isInline = this.context.type === 'inline';
        // Identifiers are generated, except those of classifications, which are codes given by the user
        const isClassificationId = property?.title === 'Classification identifier';
        if (!isClassificationId && (name === 'id' || (isInline && name.endsWith('.id')))) {
            return document.createElement('div');
        }
        // The trigger of a hazard is only asked for in the hazards of an event set
        if (name.includes('trigger') && (isInline ? this.context.arrayName !== 'hazards' : name.includes('hazard.'))) {
            return document.createElement('div');
        }

        const container = document.createElement('div');
        container.className = this.context.type === 'normal' ? 'form-field' : 'modal-form-field';
        container.dataset.fieldPath = name;
        // All datasets have a spatial coverage: what is missing is marked on its fields
        if (options.required && name !== 'spatial') container.classList.add('required');

        const resolvedProperty = this.resolveProperty(property);
        if (!resolvedProperty || !resolvedProperty.type) return container;

        // Objects show their own title
        const baseName = name.split('.').pop();
        const hasLabel = !options.hideLabel && resolvedProperty.type !== 'object';
        const label = hasLabel ? this.addLabelAndDescription(container, name, resolvedProperty, options) : null;

        const inputElement = this.createInputElement(name, resolvedProperty, value, options);
        container.appendChild(inputElement);
        this.connectLabel(label, name, inputElement);
        this.addExamples(container, resolvedProperty);

        if (baseName === 'valuation_year') {
            const quantityKind = this.context.getValue(name.replace(/valuation_year$/, 'quantity_kind'));
            container.style.display = quantityKind === 'currency' ? '' : 'none';
        }
        return container;
    }

    resolveProperty(property) {
        if (property.$ref) {
            const resolved = resolveReference(property.$ref);
            if (resolved) {
                return { ...resolved, title: property.title || resolved.title, description: property.description || resolved.description };
            }
        }

        // Handle anyOf - extract format if it exists in any of the options
        if (property.anyOf && !property.format) {
            const option = property.anyOf.find(({ format }) => format);
            if (option) return { ...property, format: option.format };
        }

        return property;
    }

    getTitle(name, property) {
        const isTrigger = name.split('.').pop() === 'trigger' && this.context.arrayName === 'hazards';
        return isTrigger ? 'Hazard trigger' : getPropertyTitle(name, property);
    }

    addLabelAndDescription(container, name, property, options) {
        const label = document.createElement('label');
        label.textContent = this.getTitle(name, property);
        label.className = 'form-label';
        if (options.required) {
            label.insertAdjacentHTML('beforeend', ' <span class="text-danger" aria-hidden="true">*</span>');
        }
        container.appendChild(label);

        if (property.description) container.appendChild(createDescription(property.description));
        return label;
    }

    /** Tell what the label is for: a single control, or a group of them */
    connectLabel(label, name, inputElement) {
        if (!label) return;
        const id = this.context.getFieldId(name);
        if ([inputElement, ...inputElement.querySelectorAll('[id]')].some(element => element.id === id)) {
            label.htmlFor = id;
        } else {
            label.id = `${id}_label`;
            inputElement.setAttribute('role', 'group');
            inputElement.setAttribute('aria-labelledby', label.id);
        }
    }

    createInputElement(name, property, value, options) {
        switch (property.type) {
            case 'integer':
            case 'number':
                return this.createNumberInput(name, property, value);
            case 'array':
                if (name.split('.').pop() === 'bbox') {
                    return this.createCoordinatesInput(name, value, ['SW Longitude', 'SW Latitude', 'NE Longitude', 'NE Latitude']);
                }
                if (name.split('.').pop() === 'centroid') {
                    return this.createCoordinatesInput(name, value, ['Longitude', 'Latitude']);
                }
                return this.createArrayInput(name, property, value);
            case 'object':
                return this.createObjectInput(name, property, value, options);
            default:
                return this.createStringInput(name, property, value);
        }
    }

    createStringInput(name, property, value) {
        const baseName = name.split('.').pop();
        if (baseName === 'process') return this.createProcessSelect(name, property, value);
        if (baseName === 'unit' || (property.codelist && property.openCodelist)) return this.createCombobox(name, property, value);
        if (getEnumValues(property)) return this.createSelect(name, property, value, getEnumValues(property));
        if (this.isFlexibleDateField(property)) return this.createFlexibleDateInput(name, property, value);
        if (property.format === 'date') return this.createSimpleInput('date', name, property, value);
        if (property.format === 'email') return this.createSimpleInput('email', name, property, value);
        if (property.format === 'iri') return this.createSimpleInput('url', name, property, value);
        if (['description', 'purpose', 'notes', 'details', 'lineage', 'citation'].some(word => name.includes(word))) {
            return this.createTextareaInput(name, property, value);
        }
        return this.createTextInput(name, property, value);
    }

    createSimpleInput(type, name, property, value) {
        const input = document.createElement('input');
        input.type = type;
        input.className = 'form-control';
        input.value = value ?? '';
        this.context.connect(input, name, property);
        return input;
    }

    createTextInput(name, property, value) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        const input = this.createSimpleInput('text', name, property, value);
        if (property.maxLength) input.maxLength = property.maxLength;

        // For digit-only fixed-length patterns like ^[0-9]{4}$, only accept digits
        const digits = property.pattern?.match(/^\^\[0-9\]\{(\d+)\}\$$/);
        if (digits) {
            input.maxLength = Number(digits[1]);
            input.inputMode = 'numeric';
            input.addEventListener('input', () => {
                const text = input.value.replace(/[^0-9]/g, '');
                if (text !== input.value) setControlValue(input, text);
            });
        }

        wrapper.appendChild(input);
        if (this.context.type === 'normal') this.setupAutoComplete(input, name, property);
        return wrapper;
    }

    createTextareaInput(name, property, value) {
        const wrapper = document.createElement('div');
        const textarea = document.createElement('textarea');
        textarea.className = 'form-control';
        textarea.value = value ?? '';
        textarea.rows = 3;
        textarea.style.resize = 'vertical';
        textarea.style.minHeight = '80px';
        this.context.connect(textarea, name, property);
        wrapper.appendChild(textarea);

        const maxLength = TEXT_LIMITS[name.split('.').pop()] || property.maxLength;
        if (maxLength) {
            textarea.maxLength = maxLength;
            const counter = document.createElement('small');
            counter.className = 'form-text text-muted d-block text-end mt-1';
            const updateCounter = () => {
                const remaining = maxLength - textarea.value.length;
                counter.textContent = `${textarea.value.length} / ${maxLength} characters`;
                counter.style.setProperty('color', remaining < 100 ? '#dc3545' : remaining < 500 ? '#b45309' : '#6c757d', 'important');
            };
            textarea.addEventListener('input', updateCounter);
            updateCounter();
            wrapper.appendChild(counter);
        }

        const autoResize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
        };
        textarea.addEventListener('input', autoResize);
        textarea.addEventListener('focus', autoResize);

        // Fit the height to the text at first, and again when the width changes:
        // the page can be very narrow while it loads, e.g. in a background tab.
        let fittedWidth = 0;
        new ResizeObserver(() => {
            const width = textarea.offsetWidth;
            if (width > 0 && width !== fittedWidth) {
                fittedWidth = width;
                requestAnimationFrame(autoResize);
            }
        }).observe(textarea);

        return wrapper;
    }

    isFlexibleDateField(property) {
        const schemas = property.oneOf || property.anyOf;
        return Array.isArray(schemas) && schemas.some(({ format, pattern }) => format === 'date' || pattern?.includes('d{4}'));
    }

    createFlexibleDateInput(name, property, value) {
        const wrapper = document.createElement('div');
        const input = this.createSimpleInput('text', name, property, value);
        input.placeholder = 'YYYY, YYYY-MM, or YYYY-MM-DD';
        const help = document.createElement('small');
        help.className = 'form-text text-muted d-block mt-1';
        help.textContent = 'Format: YYYY (e.g., 2024), YYYY-MM (e.g., 2024-01), or YYYY-MM-DD (e.g., 2024-01-15)';
        wrapper.append(input, help);
        return wrapper;
    }

    createNumberInput(name, property, value) {
        const input = this.createSimpleInput('number', name, property, value);
        if (property.minimum !== undefined) input.min = property.minimum;
        if (property.maximum !== undefined) input.max = property.maximum;
        input.step = property.type === 'integer' ? '1' : 'any';
        return input;
    }

    createSelect(name, property, value, codes) {
        const select = document.createElement('select');
        select.className = 'form-select';
        fillSelect(select, codes, value, property.enumNames);
        this.context.connect(select, name, property);
        return select;
    }

    /** The processes of the type of hazard that is next to it */
    createProcessSelect(name, property, value) {
        const type = this.context.getValue(name.replace(/process$/, 'type'));
        return this.createSelect(name, property, value, getHazardProcesses(type) || getEnumValues(property) || []);
    }

    createCombobox(name, property, value) {
        const wrapper = document.createElement('div');
        wrapper.className = 'combobox-wrapper';

        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const input = this.createSimpleInput('text', name, property, value);
        input.placeholder = 'Type or select from suggestions...';
        input.autocomplete = 'off';

        const dropdownBtn = document.createElement('button');
        dropdownBtn.type = 'button';
        dropdownBtn.className = 'btn btn-outline-secondary dropdown-toggle';
        dropdownBtn.setAttribute('data-bs-toggle', 'dropdown');
        dropdownBtn.setAttribute('aria-label', `Suggestions for ${getPropertyTitle(name, property)}`);
        dropdownBtn.setAttribute('aria-expanded', 'false');

        const menu = document.createElement('ul');
        menu.className = 'dropdown-menu';

        inputGroup.append(input, dropdownBtn, menu);
        wrapper.appendChild(inputGroup);

        const help = document.createElement('small');
        help.className = 'form-text text-muted d-block mt-1';
        if (name.endsWith('intensity_measure')) {
            help.innerHTML = 'An intensity measure is missing? Please <a href="https://github.com/GFDRR/rdl-standard/issues/new?template=proposal" target="_blank" rel="noopener noreferrer">submit a request</a> to add a new one.';
        } else {
            help.textContent = 'You can select from suggestions or type a custom value.';
        }
        wrapper.appendChild(help);

        if (this.context.type === 'normal') this.setupAutoComplete(input, name, property, wrapper);

        // Also called when the field that the options depend on changes
        input.reloadOptions = async () => {
            menu.replaceChildren(createMenuNote('Loading options...'));
            try {
                const options = await this.loadOptions(name, property);
                fillMenu(menu, input, options);
                return options;
            } catch (error) {
                console.error(`Failed to load the options of ${name}:`, error);
                menu.replaceChildren(createMenuNote('The options could not be loaded. Type a value.'));
                return [];
            }
        };
        input.reloadOptions();

        return wrapper;
    }

    /** The options of a field, as { code, title } objects */
    async loadOptions(name, property) {
        const baseName = name.split('.').pop();
        const getSibling = key => this.context.getValue([...name.split('.').slice(0, -1), key].join('.'));
        if (baseName === 'intensity_measure') {
            const options = await CodelistManager.loadIntensityMeasures(getSibling('type'));
            return options.length > 0 ? options : CodelistManager.loadIntensityMeasures();
        }
        if (baseName === 'unit') {
            const quantityKind = getSibling('quantity_kind');
            const options = await CodelistManager.loadConditionalCodelist('Measurement', 'unit', { quantity_kind: quantityKind });
            return quantityKind === 'currency' ? options.map(option => ({ ...option, title: `[${option.code}] ${option.title}` })) : options;
        }
        const options = await CodelistManager.loadCodelist(property.codelist);
        return property.codelist === 'classification_scheme.csv'
            ? CodelistManager.filterClassificationSchemes(options, this.getClassificationPurpose(name))
            : options;
    }

    /** What a classification scheme is for, which is told by the list or by the field it is in */
    getClassificationPurpose(name) {
        const path = `${this.context.arrayName || ''}.${name}`.toLowerCase();
        if (path.includes('disaster_identifier')) return 'Disaster identifier';
        if (path.includes('socio_economic')) return 'Socio-economic index';
        if (path.includes('asset_type') || path.includes('taxonomy')) return 'Building taxonomy';
        if (path.includes('classification')) return 'Hazard classification';
        return null;
    }

    /** A bounding box or a centroid. Coordinates that are not given stay empty. */
    createCoordinatesInput(name, value, labels) {
        const container = document.createElement('div');
        container.className = 'bbox-field row g-2 mx-0';
        const inputs = labels.map((text, index) => {
            const column = document.createElement('div');
            column.className = 'col-md-6';
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.className = 'form-control';
            input.id = `${this.context.getFieldId(name)}_${index}`;
            input.value = value?.[index] ?? '';
            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = text;
            label.htmlFor = input.id;
            column.append(label, input);
            container.appendChild(column);
            return input;
        });
        inputs.forEach(input => input.addEventListener('input', () => {
            const numbers = inputs.map(({ value: text }) => text === '' ? null : Number(text));
            this.context.setValue(name, numbers.every(number => number === null) ? undefined : numbers);
        }));
        return container;
    }

    createArrayInput(name, property, value) {
        const container = document.createElement('div');
        container.className = 'array-field';
        container.setAttribute('data-array-name', name);

        const items = Array.isArray(value) ? value : [];
        const store = () => this.context.setValue(name, items);
        const itemSchema = resolveItems(property);
        const hasObjects = itemSchema?.type === 'object';

        const itemsContainer = document.createElement('div');
        itemsContainer.id = `${this.context.getFieldId(name)}_items`;

        const render = () => {
            itemsContainer.replaceChildren(...items.map((item, index) => {
                if (!hasObjects) return this.createArrayItem(name, property, itemSchema, items, index, store, render);
                return this.context.type === 'normal'
                    ? createObjectSummaryCard(item, index, name, property, items, render)
                    : this.createInlineObjectEditor(item, index, name, property, itemSchema, items, store, render);
            }));
        };

        const showNewItem = () => {
            const item = itemsContainer.lastElementChild;
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            item.querySelector('input, select, textarea')?.focus({ preventScroll: true });
        };

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'btn btn-outline-primary btn-sm mb-2';
        addBtn.textContent = `+ Add ${property.title || name}`;
        addBtn.addEventListener('click', () => {
            if (hasObjects && this.context.type === 'normal') {
                openObjectEditor(name, items.length, property.items, items, render);
                return;
            }
            items.push(hasObjects ? createItem(name, itemSchema) : '');
            render();
            store();
            showNewItem();
        });

        container.append(addBtn, itemsContainer);
        render();
        return container;
    }

    /** An item that is a text */
    createArrayItem(name, property, itemSchema, items, index, store, render) {
        const row = document.createElement('div');
        row.className = 'array-item d-flex gap-2 align-items-center mb-2';

        const codes = getEnumValues(itemSchema);
        const input = document.createElement(codes ? 'select' : 'input');
        input.className = codes ? 'form-select' : 'form-control';
        input.setAttribute('aria-label', `${getPropertyTitle(name, property)} ${index + 1}`);
        if (codes) {
            fillSelect(input, codes, items[index], itemSchema.enumNames);
        } else {
            input.type = 'text';
            input.value = items[index] ?? '';
        }
        input.addEventListener(codes ? 'change' : 'input', () => {
            items[index] = input.value;
            store();
        });

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-outline-danger btn-sm';
        removeBtn.textContent = '×';
        removeBtn.setAttribute('aria-label', `Remove ${getPropertyTitle(name, property)} ${index + 1}`);
        removeBtn.addEventListener('click', () => {
            items.splice(index, 1);
            render();
            store();
        });

        row.append(input, removeBtn);
        return row;
    }

    /** An item that is an object, edited inside the edit window */
    createInlineObjectEditor(item, index, arrayName, arrayProperty, itemSchema, items, store, render) {
        const card = document.createElement('div');
        card.className = 'card mb-2';
        card.setAttribute('data-item-index', index);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-3';

        const context = new FieldCreationContext('inline', { itemData: item, arrayName });
        sortProperties(itemSchema).forEach(([key, property]) => {
            cardBody.appendChild(context.createField(key, property, item[key], { required: itemSchema.required?.includes(key) }));
        });

        const actions = document.createElement('div');
        actions.className = 'd-flex justify-content-end mt-2';
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-outline-danger btn-sm';
        removeBtn.textContent = 'Remove';
        removeBtn.setAttribute('aria-label', `Remove ${getPropertyTitle(arrayName, arrayProperty)} ${index + 1}`);
        removeBtn.addEventListener('click', () => {
            items.splice(index, 1);
            render();
            store();
        });
        actions.appendChild(removeBtn);

        cardBody.appendChild(actions);
        card.appendChild(cardBody);
        return card;
    }

    createObjectInput(name, property, value, options) {
        const container = document.createElement('div');
        container.className = 'object-field';
        const baseName = name.split('.').pop();
        const titleText = this.getTitle(name, property);

        // Classifications are closed at first
        const isCollapsible = ['classification', 'asset_type'].includes(baseName);
        const content = isCollapsible ? document.createElement('details') : container;
        if (isCollapsible) container.appendChild(content);
        const title = document.createElement(isCollapsible ? 'summary' : 'div');
        title.className = 'object-title';
        title.textContent = titleText;
        content.appendChild(title);
        container.setAttribute('role', 'group');
        container.setAttribute('aria-label', titleText);
        if (property.description) content.appendChild(createDescription(property.description));

        // A field is required if all the objects that hold it are
        const isRequired = options.required;
        sortProperties(property).forEach(([key, subproperty]) => {
            const required = Boolean(isRequired && property.required?.includes(key)) || (key === 'scale' && baseName === 'spatial');
            content.appendChild(this.context.createField(`${name}.${key}`, subproperty, value?.[key], { required }));
        });

        if (baseName === 'spatial') updateCountriesField(container, value?.scale);
        return container;
    }

    addExamples(container, property) {
        if (property.examples && property.examples.length > 0) {
            const hint = document.createElement('div');
            hint.className = 'field-hint';
            const title = document.createElement('strong');
            title.textContent = 'Examples:';
            hint.append(title, ` ${property.examples.slice(0, 3).join(', ')}`);
            container.appendChild(hint);
        }
    }

    setupAutoComplete(input, fieldName, property, container = input.parentElement) {
        const suggestions = [...new Set([...(property.examples || []), ...(AUTO_COMPLETE_SUGGESTIONS[fieldName] || [])])];
        if (suggestions.length === 0) return;

        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'autocomplete-suggestions';
        container.appendChild(suggestionsDiv);

        input.addEventListener('input', () => {
            const text = input.value.toLowerCase();
            const matches = text ? suggestions.filter(suggestion => suggestion.toLowerCase().includes(text) && suggestion !== input.value) : [];
            suggestionsDiv.replaceChildren(...matches.slice(0, 8).map(match => {
                const div = document.createElement('div');
                div.className = 'autocomplete-suggestion';
                div.textContent = match;
                div.addEventListener('click', () => setControlValue(input, match));
                return div;
            }));
            suggestionsDiv.style.display = matches.length > 0 ? 'block' : 'none';
        });

        input.addEventListener('blur', () => {
            setTimeout(() => { suggestionsDiv.style.display = 'none'; }, 150);
        });
    }
}

function createDescription(text) {
    const description = document.createElement('div');
    description.className = 'form-text text-muted mb-2';
    description.innerHTML = parseMarkdownLinks(text);
    return description;
}

/** The schema of the items of a list, with its references resolved */
function resolveItems(property) {
    const items = property.items;
    if (items?.$ref) return resolveReference(items.$ref);
    if (items?.allOf) return resolveAllOfSchemas(items);
    return items || null;
}

/** A new item of a list. The identifiers of classifications are given by the user. */
function createItem(arrayName, itemSchema) {
    const name = arrayName.split('.').pop();
    if (itemSchema?.title === 'Classification') return {};
    const prefixes = {
        resources: 'resource', sources: 'source', attributions: 'attribution', referenced_by: 'reference', gazetteer_entries: 'gazetteer',
        event_sets: 'event_set', events: 'event', hazards: 'hazard', exposure: 'exposure', metrics: 'metric', losses: 'loss',
        vulnerability: 'function', fragility: 'function', damage_to_loss: 'function', engineering_demand: 'function', socio_economic: 'indicator'
    };
    return { id: generateUniqueId(prefixes[name] || 'item') };
}

/** The properties of an object, in the order that they are shown: required ones first, and the hazard ones by their own order */
function sortProperties(schema) {
    const entries = Object.entries(schema.properties || {});
    const order = 'intensity_measure' in (schema.properties || {}) ? ['id', 'type', 'process', 'intensity_measure', 'classification', 'trigger'] : [];
    const getRank = key => order.includes(key) ? order.indexOf(key) : order.length + (schema.required?.includes(key) ? 0 : 1);
    return entries.sort(([a], [b]) => getRank(a) - getRank(b));
}

function fillSelect(select, codes, value, names) {
    const isCountries = codes.includes('USA');
    const getText = (code, index) => isCountries ? `${code} - ${countryNames[code] || code}` : names?.[index] || describeCode(code);
    const options = [new Option('Select an option...', ''), ...codes.map((code, index) => new Option(getText(code, index), code))];
    // Show a value that is not allowed, instead of nothing
    if (value && !codes.includes(value)) options.push(new Option(`${value} (not in the list)`, value));
    select.replaceChildren(...options);
    select.value = value || '';
}

function createMenuNote(text) {
    const item = document.createElement('li');
    const note = document.createElement('span');
    note.className = 'dropdown-item-text text-muted fst-italic';
    note.textContent = text;
    item.appendChild(note);
    return item;
}

function fillMenu(menu, input, options) {
    if (options.length === 0) {
        menu.replaceChildren(createMenuNote('No suggestions available. Type a custom value.'));
        return;
    }
    menu.replaceChildren(...options.map(({ code, title, validUntil }) => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dropdown-item';
        button.textContent = title + (validUntil ? ` (valid until ${validUntil})` : '');
        button.addEventListener('click', () => setControlValue(input, code));
        item.appendChild(button);
        return item;
    }), createMenuNote('You can also type a custom value'));
}

/** Global datasets do not need countries */
function updateCountriesField(container, scale) {
    const countries = container.querySelector('[data-array-name$="countries"]');
    if (!countries) return;
    const isGlobal = scale === 'global';
    countries.querySelectorAll('input, select, button').forEach(element => { element.disabled = isGlobal; });
    countries.classList.toggle('is-disabled', isGlobal);
    countries.querySelector('.global-scale-note')?.remove();
    if (isGlobal) {
        const note = document.createElement('div');
        note.className = 'global-scale-note alert alert-info mt-2 mb-0 small';
        note.textContent = 'Country selection is not required for global scale datasets.';
        countries.appendChild(note);
    }
}

/** After a change, update the fields next to it that depend on it */
function updateDependentFields(context, element, name, value) {
    const parts = name.split('.');
    const baseName = parts.pop();

    if (baseName === 'scale') {
        updateCountriesField(element.closest('.object-field'), value);
        return;
    }

    (DEPENDENT_FIELDS[baseName] || []).forEach(key => {
        const control = document.getElementById(context.getFieldId([...parts, key].join('.')));
        if (!control) return;
        if (key === 'process') {
            const codes = getHazardProcesses(value);
            if (!codes) return;
            const previous = control.value;
            fillSelect(control, codes, codes.includes(previous) ? previous : '');
            if (previous && !codes.includes(previous)) setControlValue(control, '');
        } else if (key === 'intensity_measure') {
            updateIntensityMeasure(control);
        } else if (key === 'unit') {
            setControlValue(control, '');
            control.reloadOptions();
        } else if (key === 'valuation_year') {
            control.closest('[data-field-path]').style.display = value === 'currency' ? '' : 'none';
            if (value !== 'currency' && control.value) setControlValue(control, '');
        }
    });
}

/** Show the intensity measures of the type of hazard, and clear the one of another type */
async function updateIntensityMeasure(control) {
    const [options, allOptions] = await Promise.all([control.reloadOptions(), CodelistManager.loadIntensityMeasures()]);
    const has = list => list.some(({ code }) => code === control.value);
    if (control.value && has(allOptions) && !has(options)) setControlValue(control, '');
}

/** The processes of a type of hazard, or null if the schema does not limit them */
function getHazardProcesses(type) {
    if (!type) return null;
    const rules = ConditionalRules.getApplicable(resolveReferenceSimple('#/$defs/SimpleHazard'), { type });
    return rules.map(rule => rule.properties?.process?.enum).find(Boolean) || null;
}

// ================================
// CODELISTS
// ================================

/** Loads the codelists, each once, as lists of { code, title, category, validUntil } */
class CodelistManager {
    static requests = new Map();

    static async loadCodelist(name) {
        if (!name) return [];
        // The schema has "IMT.csv" for imt.csv
        const file = name.toLowerCase();
        if (!this.requests.has(file)) {
            const request = this.fetchCodelist(file);
            this.requests.set(file, request);
            request.catch(() => this.requests.delete(file)); // to try again the next time
        }
        return this.requests.get(file);
    }

    static async fetchCodelist(file) {
        const folder = file === 'unit_currency.csv' ? 'closed' : 'open';
        const response = await fetch(`${CODELISTS_URL}/${folder}/${file}`);
        if (!response.ok) throw new Error(`HTTP ${response.status} for ${file}`);
        return this.parseCSV(await response.text());
    }

    static parseCSV(text) {
        const [header = [], ...rows] = parseCsvRows(text);
        const columns = header.map(cell => cell.trim().toLowerCase());
        const get = (row, column) => row[columns.indexOf(column)]?.trim() || '';
        return rows.filter(row => get(row, 'code')).map(row => ({
            code: get(row, 'code'),
            title: get(row, 'title') || get(row, 'code'),
            category: get(row, 'category'),
            validUntil: get(row, 'valid until')
        }));
    }

    /** The codelist that the schema gives to a field for the other values of its object */
    static async loadConditionalCodelist(definition, field, data) {
        const rules = ConditionalRules.getApplicable(resolveReferenceSimple(`#/$defs/${definition}`), data);
        const codelists = rules.map(rule => {
            const property = rule.properties?.[field];
            return (property?.$ref ? resolveReferenceSimple(property.$ref) : property)?.codelist;
        });
        return this.loadCodelist(codelists.find(Boolean));
    }

    /** The intensity measures of a type of hazard, or all of them */
    static async loadIntensityMeasures(type) {
        return type ? this.loadConditionalCodelist('Hazard', 'intensity_measure', { type }) : this.loadCodelist('imt.csv');
    }

    /** The classification schemes for a purpose, with those of no or of an unknown category */
    static filterClassificationSchemes(schemes, purpose) {
        const purposes = ['Disaster identifier', 'Hazard classification', 'Building taxonomy', 'Socio-economic index'];
        return schemes.filter(({ category }) => !purpose || !purposes.includes(category) || category === purpose);
    }
}

/** The rows of a CSV file. Quoted cells can hold commas, quotes ("") and line breaks. */
function parseCsvRows(text) {
    const rows = [[]];
    let cell = '';
    let isQuoted = false;
    const endCell = () => { rows[rows.length - 1].push(cell); cell = ''; };
    const source = text.replace(/^\ufeff/, '').replace(/\r\n?/g, '\n').trim();
    for (let i = 0; i < source.length; i++) {
        const character = source[i];
        if (isQuoted) {
            if (character !== '"') cell += character;
            else if (source[i + 1] === '"') { cell += '"'; i++; } else isQuoted = false;
        } else if (character === '"') isQuoted = true;
        else if (character === ',') endCell();
        else if (character === '\n') { endCell(); rows.push([]); } else cell += character;
    }
    endCell();
    return rows;
}

/** The if-then rules of the schema, which the options of some fields come from */
class ConditionalRules {
    /** The "then" parts of the rules of a definition that apply to some data */
    static getApplicable(definition, data) {
        return (definition?.allOf || []).flatMap(rule => {
            const resolved = rule.$ref ? resolveReferenceSimple(rule.$ref) : rule;
            if (resolved?.allOf) return this.getApplicable(resolved, data);
            return resolved?.if && resolved.then && this.applies(resolved.if, data) ? [resolved.then] : [];
        });
    }

    static applies(condition, data) {
        return Object.entries(condition.properties || {}).every(([name, rule]) => {
            if (rule.const !== undefined) return data[name] === rule.const;
            return !rule.enum || rule.enum.includes(data[name]);
        });
    }
}

// ================================
// MAIN APPLICATION LOGIC
// ================================

// Auto-ID generation
function generateUniqueId(prefix = 'item') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}_${result}`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    setupEventListeners();
    loadCountryNames();
    // Auto-load v1.0 schema. Loading it resets the form, so drafts and datasets
    // can only be opened afterwards.
    await loadSchema('1.0');
    await openInitialDataset();
});

function setupEventListeners() {
    // Section checkboxes
    SECTIONS.forEach(section => {
        document.getElementById(`${section}Check`).addEventListener('change', function() {
            if (this.checked) {
                activeSections.add(section);
                addSectionTab(section);
            } else {
                activeSections.delete(section);
                removeSectionTab(section);
            }
            updateRiskDataType();
            generateForm();
            formChanged();
        });
    });

    // Buttons
    document.getElementById('exportJson').addEventListener('click', exportJson);
    document.getElementById('saveProgress').addEventListener('click', saveProgress);
    document.getElementById('editDataset').addEventListener('click', showEditDatasetModal);
    document.getElementById('editDatasetForm').addEventListener('submit', submitEditDataset);
    document.getElementById('editDatasetModal').addEventListener('shown.bs.modal', () => document.getElementById('editDatasetUrl').focus());
    document.getElementById('editDatasetModal').addEventListener('hidden.bs.modal', () => { editDatasetRequest++; });
    document.getElementById('loadData').addEventListener('click', loadData);
    document.getElementById('validateForm').addEventListener('click', validateForm);
    document.getElementById('resetForm').addEventListener('click', resetForm);
    document.getElementById('publishGitHub').addEventListener('click', openGithubConfig);

    // Export window
    document.getElementById('exportForm').addEventListener('submit', submitExport);
    document.getElementById('filenameModal').addEventListener('shown.bs.modal', () => document.getElementById('exportFilename').select());

    // GitHub window
    document.getElementById('verifyToken').addEventListener('click', authenticateWithToken);
    document.getElementById('signOut').addEventListener('click', logoutGithub);
    document.getElementById('publishToGithub').addEventListener('click', publishToGithub);
    document.getElementById('datasetIdInput').addEventListener('input', scheduleDatasetIdCheck);

    // Edit window
    document.getElementById('saveObjectBtn').addEventListener('click', saveCurrentObject);
    document.getElementById('objectEditorModal').addEventListener('hide.bs.modal', confirmCloseEditor);
    moveOnEnter(document.getElementById('objectEditorForm'), () => document.getElementById('saveObjectBtn').focus());
}

/** Enter moves to the next field, and adds a line in a text area */
function moveOnEnter(form, atEnd = () => {}) {
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('keydown', event => {
        if (event.key !== 'Enter' || !event.target.matches('input, select')) return;
        event.preventDefault();
        const fields = [...form.querySelectorAll('input, select, textarea')].filter(field => field.offsetParent && !field.disabled);
        const next = fields[fields.indexOf(event.target) + 1];
        if (next) next.focus();
        else atEnd();
    });
}

async function loadSchema(version) {
    // Store the version globally for URL substitutions
    currentSchemaVersion = version;

    updateSchemaStatus(`Loading RDLS v${version} schema...`, 'text-info');

    try {
        const response = await fetch(RDLS_VERSIONS[version]);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        currentSchema = await response.json();
        currentFormData = {};
        updateSchemaStatus('', '');
        generateForm();
    } catch (error) {
        updateSchemaStatus(`Failed to load the schema: ${error.message}. Reload the page to try again.`, 'text-danger');
        console.error('Schema loading error:', error);
    }
}

function updateSchemaStatus(message, className) {
    const status = document.getElementById('schemaStatus');
    status.textContent = message;
    status.className = `schema-status ${className}`;
}

function loadCountryNames() {
    const a3to2 = {
        AFG:'AF',ALB:'AL',DZA:'DZ',ASM:'AS',AND:'AD',AGO:'AO',AIA:'AI',ATA:'AQ',
        ATG:'AG',ARG:'AR',ARM:'AM',ABW:'AW',AUS:'AU',AUT:'AT',AZE:'AZ',BHS:'BS',
        BHR:'BH',BGD:'BD',BRB:'BB',BLR:'BY',BEL:'BE',BLZ:'BZ',BEN:'BJ',BMU:'BM',
        BTN:'BT',BOL:'BO',BES:'BQ',BIH:'BA',BWA:'BW',BVT:'BV',BRA:'BR',IOT:'IO',
        BRN:'BN',BGR:'BG',BFA:'BF',BDI:'BI',CPV:'CV',KHM:'KH',CMR:'CM',CAN:'CA',
        CYM:'KY',CAF:'CF',TCD:'TD',CHL:'CL',CHN:'CN',CXR:'CX',CCK:'CC',COL:'CO',
        COM:'KM',COD:'CD',COG:'CG',COK:'CK',CRI:'CR',HRV:'HR',CUB:'CU',CUW:'CW',
        CYP:'CY',CZE:'CZ',CIV:'CI',DNK:'DK',DJI:'DJ',DMA:'DM',DOM:'DO',ECU:'EC',
        EGY:'EG',SLV:'SV',GNQ:'GQ',ERI:'ER',EST:'EE',SWZ:'SZ',ETH:'ET',FLK:'FK',
        FRO:'FO',FJI:'FJ',FIN:'FI',FRA:'FR',GUF:'GF',PYF:'PF',ATF:'TF',GAB:'GA',
        GMB:'GM',GEO:'GE',DEU:'DE',GHA:'GH',GIB:'GI',GRC:'GR',GRL:'GL',GRD:'GD',
        GLP:'GP',GUM:'GU',GTM:'GT',GGY:'GG',GIN:'GN',GNB:'GW',GUY:'GY',HTI:'HT',
        HMD:'HM',VAT:'VA',HND:'HN',HKG:'HK',HUN:'HU',ISL:'IS',IND:'IN',IDN:'ID',
        IRN:'IR',IRQ:'IQ',IRL:'IE',IMN:'IM',ISR:'IL',ITA:'IT',JAM:'JM',JPN:'JP',
        JEY:'JE',JOR:'JO',KAZ:'KZ',KEN:'KE',KIR:'KI',PRK:'KP',KOR:'KR',KWT:'KW',
        KGZ:'KG',LAO:'LA',LVA:'LV',LBN:'LB',LSO:'LS',LBR:'LR',LBY:'LY',LIE:'LI',
        LTU:'LT',LUX:'LU',MAC:'MO',MDG:'MG',MWI:'MW',MYS:'MY',MDV:'MV',MLI:'ML',
        MLT:'MT',MHL:'MH',MTQ:'MQ',MRT:'MR',MUS:'MU',MYT:'YT',MEX:'MX',FSM:'FM',
        MDA:'MD',MCO:'MC',MNG:'MN',MNE:'ME',MSR:'MS',MAR:'MA',MOZ:'MZ',MMR:'MM',
        NAM:'NA',NRU:'NR',NPL:'NP',NLD:'NL',NCL:'NC',NZL:'NZ',NIC:'NI',NER:'NE',
        NGA:'NG',NIU:'NU',NFK:'NF',MNP:'MP',NOR:'NO',OMN:'OM',PAK:'PK',PLW:'PW',
        PSE:'PS',PAN:'PA',PNG:'PG',PRY:'PY',PER:'PE',PHL:'PH',PCN:'PN',POL:'PL',
        PRT:'PT',PRI:'PR',QAT:'QA',MKD:'MK',ROU:'RO',RUS:'RU',RWA:'RW',REU:'RE',
        BLM:'BL',SHN:'SH',KNA:'KN',LCA:'LC',MAF:'MF',SPM:'PM',VCT:'VC',WSM:'WS',
        SMR:'SM',STP:'ST',SAU:'SA',SEN:'SN',SRB:'RS',SYC:'SC',SLE:'SL',SGP:'SG',
        SXM:'SX',SVK:'SK',SVN:'SI',SLB:'SB',SOM:'SO',ZAF:'ZA',SGS:'GS',SSD:'SS',
        ESP:'ES',LKA:'LK',SDN:'SD',SUR:'SR',SJM:'SJ',SWE:'SE',CHE:'CH',SYR:'SY',
        TWN:'TW',TJK:'TJ',TZA:'TZ',THA:'TH',TLS:'TL',TGO:'TG',TKL:'TK',TON:'TO',
        TTO:'TT',TUN:'TN',TUR:'TR',TKM:'TM',TCA:'TC',TUV:'TV',UGA:'UG',UKR:'UA',
        ARE:'AE',GBR:'GB',UMI:'UM',USA:'US',URY:'UY',UZB:'UZ',VUT:'VU',VEN:'VE',
        VNM:'VN',VGB:'VG',VIR:'VI',WLF:'WF',ESH:'EH',YEM:'YE',ZMB:'ZM',ZWE:'ZW',
        ALA:'AX'
    };
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    countryNames = new Proxy({}, {
        get(_, code) {
            if (typeof code !== 'string') return undefined;
            const a2 = a3to2[code];
            if (!a2) return undefined;
            try { return regionNames.of(a2); } catch { return undefined; }
        }
    });
}

function addSectionTab(section) {
    const tabsContainer = document.getElementById('metadataTabs');
    const contentContainer = document.getElementById('metadataTabContent');

    tabsContainer.style.display = 'flex';

    const tabButton = document.createElement('li');
    tabButton.className = 'nav-item';
    tabButton.setAttribute('role', 'presentation');
    tabButton.innerHTML = `
                <button class="nav-link ${section}-tab" id="${section}-tab" data-bs-toggle="tab" 
                        data-bs-target="#${section}" type="button" role="tab"
                        aria-controls="${section}" aria-selected="false" tabindex="-1">
                    ${section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
            `;
    tabsContainer.appendChild(tabButton);

    const tabContent = document.createElement('div');
    tabContent.className = 'tab-pane fade';
    tabContent.id = section;
    tabContent.setAttribute('role', 'tabpanel');
    tabContent.setAttribute('aria-labelledby', `${section}-tab`);
    tabContent.innerHTML = `<div id="${section}Form"></div>`;
    contentContainer.appendChild(tabContent);
}

function removeSectionTab(section) {
    const tabButton = document.getElementById(`${section}-tab`);
    const tabContent = document.getElementById(section);

    if (tabButton?.classList.contains('active')) bootstrap.Tab.getOrCreateInstance(document.getElementById('general-tab')).show();
    if (tabButton) tabButton.parentElement.remove();
    if (tabContent) tabContent.remove();

    if (activeSections.size === 1) {
        document.getElementById('metadataTabs').style.display = 'none';
    }
}

function generateForm() {
    if (!currentSchema) {
        updateFormStatus('warning', 'No schema loaded');
        return;
    }

    try {
        // Initialize array-type fields if they don't exist
        Object.entries(currentSchema.properties).forEach(([key, property]) => {
            if (property.type === 'array' && !SECTIONS.includes(key) && !currentFormData[key]) currentFormData[key] = [];
        });

        generateGeneralForm(document.getElementById('metadataForm'));
        SECTIONS.filter(section => activeSections.has(section)).forEach(section => {
            generateSectionForm(section, document.getElementById(`${section}Form`));
        });

        updateFormStatus('success', 'Ready');
        updatePreview();
        refreshValidation();
    } catch (error) {
        updateFormStatus('danger', 'Generation Error: ' + error.message);
        console.error('Form generation error:', error);
    }
}

function createForm(titleText) {
    const form = document.createElement('form');
    form.noValidate = true;
    moveOnEnter(form);
    const heading = document.createElement('div');
    heading.className = 'd-flex align-items-center mb-2 mt-3';
    const title = document.createElement('h2');
    title.textContent = titleText;
    title.className = 'h5 mb-0';
    heading.appendChild(title);
    form.appendChild(heading);
    return { form, heading };
}

function generateGeneralForm(container) {
    const { form } = createForm('General Metadata');
    if (editingDataset) form.appendChild(createFixedIdField(editingDataset.id));

    // The attributions are shown apart
    const others = ['id', 'links', 'risk_data_type', 'attributions', ...REQUIRED_ROLES, ...SECTIONS];
    const context = new FieldCreationContext('normal');
    Object.entries(currentSchema.properties).filter(([key]) => !others.includes(key)).forEach(([key, property]) => {
        form.appendChild(context.createField(key, property, currentFormData[key], { required: currentSchema.required.includes(key) }));
    });
    form.appendChild(createAttributionSection());
    container.replaceChildren(form);
}

/** The entities responsible for the dataset: the required roles, and the list of attributions */
function createAttributionSection() {
    const section = document.createElement('div');
    section.className = 'card mb-4';
    section.innerHTML = '<div class="card-header"><h3 class="h6 mb-0">Attributions</h3><small class="text-muted">Entities responsible for this dataset</small></div>';
    const body = document.createElement('div');
    body.className = 'card-body';
    section.appendChild(body);

    const createTitle = text => {
        const title = document.createElement('h4');
        title.className = 'h6 text-secondary mb-3';
        title.textContent = text;
        return title;
    };

    const createRow = (path, title, entity, buttons) => {
        const row = document.createElement('div');
        row.className = 'object-summary-card d-flex justify-content-between align-items-center';
        if (path) row.dataset.fieldPath = path;
        const text = document.createElement('div');
        const strong = document.createElement('div');
        strong.className = 'object-summary-title';
        strong.textContent = title;
        const details = document.createElement('div');
        details.className = 'object-summary-details';
        details.textContent = [entity?.name, entity?.email, entity?.affiliation?.name].filter(Boolean).join(' • ') || 'Not set';
        text.append(strong, details);
        const actions = document.createElement('div');
        actions.className = 'd-flex gap-2';
        actions.append(...buttons.map(([label, style, action]) => createButton(label, style, action, `${label} ${title}`)));
        row.append(text, actions);
        return row;
    };

    const render = () => {
        const entitySchema = currentSchema.$defs.Entity;
        const required = REQUIRED_ROLES.map(role => {
            const entity = currentFormData[role];
            const open = () => openEditor({
                title: describeCode(role),
                schema: entitySchema,
                draft: entity,
                path: [role],
                commit: draft => { currentFormData[role] = draft; },
                render
            });
            return createRow(role, describeCode(role), entity, [[entity?.name ? 'Edit' : 'Add', 'outline-primary', open]]);
        });

        const attributions = currentFormData.attributions;
        const { items } = currentSchema.properties.attributions;
        const others = attributions.map((attribution, index) => {
            const remove = () => {
                if (!confirm('Remove this attribution?')) return;
                attributions.splice(index, 1);
                render();
                formChanged();
            };
            const row = createRow('', attribution.role ? describeCode(attribution.role) : 'No role specified', attribution.entity, [
                ['Edit', 'outline-primary', () => openObjectEditor('attributions', index, items, attributions, render)],
                ['Remove', 'outline-danger', remove]
            ]);
            setCardPath(row, 'attributions', index);
            return row;
        });
        const add = createButton('+ Add Attribution', 'outline-primary', () => openObjectEditor('attributions', attributions.length, items, attributions, render));

        body.replaceChildren(createTitle('Required'), ...required, createTitle('Additional (optional)'), ...others, add);
        markProblems();
    };
    render();
    return section;
}

function createButton(label, style, action, description = label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn btn-${style} btn-sm`;
    button.textContent = label;
    button.setAttribute('aria-label', description);
    button.addEventListener('click', action);
    return button;
}

const SECTION_NOTES = {
    hazard: {
        text: 'This component covers different kinds of hazard descriptions, including observed hazard events, hazard maps and modelled scenarios used in probabilistic risk assessment.',
        examples: [['flood_inundation', 'Flood hazard maps'], ['tropical_cyclone', 'Probabilistic tropical cyclone model'], ['earthquake_catalog', 'Historical earthquake catalog']]
    },
    exposure: {
        text: 'This component can represent assets location and size, in form of aggregated inventories or individual items.',
        examples: [['building_inventory', 'Building inventory database'], ['population_admin', 'Population dataset by administrative boundaries'], ['service_accessibility', 'Service accessibility analysis over road networks']]
    },
    vulnerability: {
        text: 'Vulnerability metadata can describe two different kinds of datasets:<br>' +
            '<strong>FUNCTIONS:</strong> the relationships between hazard intensity and expected impact for specific exposure categories. This covers damage functions, fragility curves, and other kinds of vulnerability models.<br>' +
            '<strong>SOCIO-ECONOMIC INDICES:</strong> descriptors of the social and economic characteristics of vulnerable populations or assets.',
        examples: [['flood_damage_curves', 'Flood depth-damage functions'], ['earthquake_fragility', 'Earthquake fragility curves for building structures'], ['wealth_index', 'Relative wealth index']]
    },
    loss: {
        text: 'This component is meant to cover both empirical disaster events, as well as probabilistic risk modelling outputs.',
        examples: [['flood_risk', 'Flood risk model'], ['earthquake_loss', 'Earthquake loss database']]
    }
};

function generateSectionForm(section, container) {
    const schema = currentSchema.properties[section];
    const { form, heading } = createForm(`${describeCode(section)} Metadata`);

    const notes = document.createElement('div');
    notes.id = `${section}-description`;
    notes.className = 'form-text text-muted mb-3';
    notes.hidden = true;
    const { text, examples } = SECTION_NOTES[section];
    const links = examples.map(([name, title]) =>
        `<li><a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/${section}/${name}/" target="_blank" rel="noopener noreferrer">${title}</a></li>`);
    notes.innerHTML = `${parseMarkdownLinks(schema.description || '')} ${text}<p class="mt-2 mb-0"><strong>Examples:</strong></p><ul>${links.join('')}</ul>`;
    const toggle = createButton('Instructions & Examples', 'outline-secondary ms-2', () => {
        notes.hidden = !notes.hidden;
        toggle.setAttribute('aria-expanded', String(!notes.hidden));
        toggle.textContent = notes.hidden ? 'Instructions & Examples' : 'Hide Instructions';
    });
    toggle.removeAttribute('aria-label');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', notes.id);
    heading.appendChild(toggle);
    form.appendChild(notes);

    const context = new FieldCreationContext('normal');
    if (schema.type === 'array') {
        form.appendChild(context.createField(section, schema, currentFormData[section], { hideLabel: true }));
    } else {
        Object.entries(schema.properties).forEach(([key, property]) => {
            form.appendChild(context.createField(`${section}.${key}`, property, currentFormData[section]?.[key], { required: schema.required?.includes(key) }));
        });
    }
    container.replaceChildren(form);
}

function resolveReference(ref) {
    if (!ref.startsWith('#/$defs/')) return null;
    if (!currentSchema || !currentSchema.$defs) {
        console.warn('Schema not loaded yet, cannot resolve ref:', ref);
        return null;
    }

    const path = ref.replace('#/$defs/', '').split('/');
    let current = currentSchema.$defs;

    for (const segment of path) {
        if (current && current[segment] !== undefined) {
            current = current[segment];
        } else {
            return null;
        }
    }

    // v1.0: Expand allOf composition (for Hazard hierarchy)
    if (current && current.allOf) {
        current = expandAllOf(current);
    }

    return current;
}

/**
 * Expand allOf composition into a single schema with merged properties
 * Used for Hazard hierarchy: SimpleHazard → Hazard → HazardWithTrigger
 */
function expandAllOf(schema) {
    if (!schema.allOf || !Array.isArray(schema.allOf)) {
        return schema;
    }

    // Start with base schema properties
    const expanded = {
        type: schema.type || 'object',
        title: schema.title,
        description: schema.description,
        properties: { ...(schema.properties || {}) },
        required: [...(schema.required || [])]
    };

    // Merge each allOf item
    schema.allOf.forEach(item => {
        // If item is a $ref, resolve it first
        if (item.$ref) {
            const resolved = resolveReferenceSimple(item.$ref);
            if (resolved) {
                item = resolved;
                // Recursively expand if the resolved item also has allOf
                if (item.allOf) {
                    item = expandAllOf(item);
                }
            }
        }

        // Merge properties
        if (item.properties) {
            Object.assign(expanded.properties, item.properties);
        }

        // Merge required fields
        if (item.required && Array.isArray(item.required)) {
            item.required.forEach(field => {
                if (!expanded.required.includes(field)) {
                    expanded.required.push(field);
                }
            });
        }

        // Keep if/then rules for conditional validation (don't expand these)
        if (item.if && item.then) {
            if (!expanded.allOf) expanded.allOf = [];
            expanded.allOf.push(item);
        }
    });

    return expanded;
}

/**
 * Simple reference resolver without allOf expansion (to avoid infinite recursion)
 */
function resolveReferenceSimple(ref) {
    if (!ref.startsWith('#/$defs/')) return null;
    if (!currentSchema || !currentSchema.$defs) return null;

    const path = ref.replace('#/$defs/', '').split('/');
    let current = currentSchema.$defs;

    for (const segment of path) {
        if (current && current[segment] !== undefined) {
            current = current[segment];
        } else {
            return null;
        }
    }

    return current;
}

function resolveAllOfSchemas(schema) {
    // Merge all schemas in an allOf array into a single schema
    if (!schema.allOf || !Array.isArray(schema.allOf)) {
        return schema;
    }

    let merged = { type: 'object', properties: {} };

    // Merge each schema in allOf
    schema.allOf.forEach(subSchema => {
        // Resolve $ref if present
        let resolvedSchema = subSchema;
        if (subSchema.$ref) {
            resolvedSchema = resolveReference(subSchema.$ref);
        }

        // Merge properties
        if (resolvedSchema) {
            if (resolvedSchema.type) {
                merged.type = resolvedSchema.type;
            }
            if (resolvedSchema.properties) {
                merged.properties = { ...merged.properties, ...resolvedSchema.properties };
            }
            if (resolvedSchema.required) {
                merged.required = merged.required || [];
                merged.required = [...new Set([...merged.required, ...resolvedSchema.required])];
            }
            if (resolvedSchema.title) {
                merged.title = resolvedSchema.title;
            }
            if (resolvedSchema.description) {
                merged.description = resolvedSchema.description;
            }
            // Copy allOf for conditional validation
            if (resolvedSchema.allOf) {
                merged.allOf = merged.allOf || [];
                merged.allOf = [...merged.allOf, ...resolvedSchema.allOf];
            }
        }
    });

    return merged;
}

function parseMarkdownLinks(text) {
    if (!text) return text;

    // Replace {{version}} placeholder with current schema version
    text = text.replace(/\{\{version\}\}/g, currentSchemaVersion);

    // Convert markdown links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, linkText, url) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-none">${linkText} <small>↗</small></a>`;
    });

    // Convert **bold** text
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert `inline code` to styled code tags (GitHub-style)
    text = text.replace(/`([^`]+)`/g, '<code class="px-1 py-0" style="background-color: #f6f8fa; border: 1px solid #d0d7de; border-radius: 3px; font-size: 0.9em; color: #24292f;">$1</code>');

    // Convert bullet points (lines starting with -)
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> items in <ul>
    text = text.replace(/(<li>.*<\/li>\n?)+/g, function(match) {
        return '<ul class="mb-2 ms-3">' + match + '</ul>';
    });

    // Convert double line breaks to paragraphs
    text = text.replace(/\n\n+/g, '</p><p class="mb-2">');

    // Wrap in paragraph if not already wrapped
    if (!text.startsWith('<p') && !text.startsWith('<ul')) {
        text = '<p class="mb-2">' + text + '</p>';
    } else if (text.includes('</p><p')) {
        text = '<p class="mb-2">' + text + '</p>';
    }

    // Convert single line breaks to <br>
    text = text.replace(/\n/g, '<br>');

    return text;
}

function getNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current && current[key] !== undefined) {
            current = current[key];
        } else {
            return null;
        }
    }

    return current;
}

function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
}

/** Open an item of a list in the edit window. An index after the last one adds an item. */
function openObjectEditor(arrayName, index, itemSchema, items, render) {
    const schema = resolveItems({ items: itemSchema });
    openEditor({
        title: itemSchema.title || schema.title || describeCode(arrayName.split('.').pop()),
        schema,
        draft: items[index] || createItem(arrayName, schema),
        arrayName,
        path: [...arrayName.split('.'), index],
        commit: draft => {
            items[index] = draft;
            setNestedValue(currentFormData, arrayName, items);
        },
        render
    });
}

/**
 * Open an object in the edit window. Its fields change a copy of it, which replaces the
 * object when it is saved.
 */
function openEditor({ title, schema, draft, arrayName = null, path, commit, render }) {
    const copy = structuredClone(draft || {});
    currentObjectEditor = { draft: copy, original: serializeClean(copy), isSaved: false, title, schema, path, commit, render };

    document.getElementById('objectEditorModalLabel').textContent = `Edit ${title}`;
    document.getElementById('saveObjectBtn').textContent = `Save ${title}`;

    const context = new FieldCreationContext('modal', { arrayName });
    document.getElementById('objectEditorFields').replaceChildren(...sortProperties(schema).map(([key, property]) =>
        context.createField(key, property, copy[key], { required: schema.required?.includes(key) })));
    markEditorProblems();

    const modal = document.getElementById('objectEditorModal');
    modal.querySelector('.modal-body').scrollTop = 0;
    bootstrap.Modal.getOrCreateInstance(modal).show();
}

function serializeClean(value) {
    return JSON.stringify(cleanEmptyValues(value) || {});
}

/** Ask before closing the edit window if its changes were not saved */
function confirmCloseEditor(event) {
    if (currentObjectEditor.isSaved) return;
    const isChanged = serializeClean(currentObjectEditor.draft) !== currentObjectEditor.original;
    if (isChanged && !confirm(`Discard your changes to this ${currentObjectEditor.title.toLowerCase()}?`)) event.preventDefault();
}

/** Tell which item of a list a card shows */
function setCardPath(card, arrayName, index) {
    card.dataset.arrayName = arrayName;
    card.dataset.index = index;
}

function createObjectSummaryCard(object, index, arrayName, arrayProperty, items, render) {
    const card = document.createElement('div');
    card.className = 'object-summary-card';
    setCardPath(card, arrayName, index);

    const { titleText, detailsText } = summarizeObject(object, index, arrayName, arrayProperty);
    const title = document.createElement('div');
    title.className = 'object-summary-title';
    title.textContent = titleText;
    const details = document.createElement('div');
    details.className = 'object-summary-details';
    details.textContent = detailsText || 'Click Edit to add details';

    const actions = document.createElement('div');
    actions.className = 'd-flex gap-2 mt-2';
    const edit = () => openObjectEditor(arrayName, index, arrayProperty.items, items, render);
    const remove = () => {
        if (!confirm(`Remove “${titleText}”?`)) return;
        items.splice(index, 1);
        render();
        formChanged();
    };
    actions.append(
        createButton('Edit', 'outline-primary', edit, `Edit ${titleText}`),
        createButton('Remove', 'outline-danger', remove, `Remove ${titleText}`)
    );

    card.append(title, details, actions);
    return card;
}

/** The title and the details of the card of an object */
function summarizeObject(object, index, arrayName, arrayProperty) {
    const listName = arrayName.split('.').pop();
    const shorten = text => text && text.length > 160 ? `${text.slice(0, 160)}…` : text;
    const join = (parts, separator) => parts.filter(Boolean).join(separator);
    const describe = code => code && describeCode(code);
    const describeHazard = hazard => hazard && join([describe(hazard.type), describe(hazard.process)], ' / ');
    const list = values => [...new Set((values || []).filter(Boolean))].join(', ');
    const count = (values, word) => values?.length ? `${values.length} ${word}${values.length > 1 ? 's' : ''}` : '';

    let title;
    let details = [];
    if (listName === 'event_sets') {
        title = list((object.hazards || []).map(describeHazard));
        details = [describe(object.analysis_type), describe(object.calculation_method), list(object.hazards?.map(hazard => hazard.intensity_measure)), count(object.events, 'event')];
    } else if (listName === 'exposure') {
        title = object.category && `${describeCode(object.category)} exposure`;
        details = [object.asset_type?.title || object.asset_type?.id, list(object.metrics?.map(metric => join([describe(metric.dimension), describe(metric.measurement?.quantity_kind)], ': '))), object.asset_type?.description];
    } else if (listName === 'losses') {
        const impact = object.impact_and_losses?.impact;
        title = object.hazard?.type && `${describeHazard(object.hazard)} loss`;
        details = [describe(object.asset_category), describe(impact?.metric), describe(impact?.measurement?.quantity_kind), describe(impact?.modelling), object.description];
    } else if (arrayName.includes('functions')) {
        title = describeHazard(object.hazard_primary);
        details = [describe(object.approach), describe(object.relationship), describe(object.category), describe(object.impact?.metric)];
    } else if (listName === 'socio_economic') {
        title = object.indicator_name;
        details = [object.reference_year, object.description];
    } else {
        title = object.title || object.name || object.description;
        details = [object.format || object.media_type, object.title || object.name ? object.description : '', object.url || object.uri || object.download_url || object.access_url];
    }
    return {
        titleText: shorten(title) || object.id || `${arrayProperty.title || arrayName} ${index + 1}`,
        detailsText: join(details.map(detail => detail && shorten(String(detail))), ' • ')
    };
}

function saveCurrentObject() {
    const { draft, schema, title, commit, render } = currentObjectEditor;
    addMissingIds(draft, schema);
    commit(draft);
    currentObjectEditor.isSaved = true;
    render();
    formChanged();
    bootstrap.Modal.getInstance(document.getElementById('objectEditorModal')).hide();
    updateFormStatus('success', `${title} saved`);
}

/** Add the identifiers that the schema requires to the items of the lists of an object */
function addMissingIds(object, schema) {
    Object.entries(schema.properties || {}).forEach(([key, property]) => {
        const value = object[key];
        if (value === null || typeof value !== 'object') return;
        if (!Array.isArray(value)) {
            addMissingIds(value, property.$ref ? resolveReference(property.$ref) : property);
            return;
        }
        const itemSchema = resolveItems(property);
        if (itemSchema?.type !== 'object') return;
        value.forEach(item => {
            if (!item.id && itemSchema.required?.includes('id')) Object.assign(item, createItem(key, itemSchema));
            addMissingIds(item, itemSchema);
        });
    });
}

/** Show, save and check the data after a change */
function formChanged() {
    updatePreview();
    autoSave();
    scheduleValidation();
}

function getFilteredFormData() {
    // Get the current schema version
    // v1.0 schema reference
    const schemaVersion = '1__0__0';
    const schemaUrl = `https://docs.riskdatalibrary.org/en/${schemaVersion}/rdls_schema.json`;

    // Define the correct order based on RDLS schema
    const schemaFieldOrder = [
        'id', 'title', 'description', 'risk_data_type', 'publisher', 'version', 'purpose',
        'project', 'details', 'contact_point', 'creator', 'spatial', 'spatial_resolution',
        'temporal', 'temporal_resolution', 'license', 'rights',
        'attributions', 'lineage', 'referenced_by', 'resources',
        'hazard', 'exposure', 'vulnerability', 'loss', 'links'
    ];

    // Create filtered data with ordered fields
    const filteredData = {};

    // Add fields in schema order
    schemaFieldOrder.forEach(key => {
        if (currentFormData[key] !== undefined) {
            // For section fields, only include if active
            if (SECTIONS.includes(key)) {
                if (activeSections.has(key)) {
                    filteredData[key] = currentFormData[key];
                }
            } else {
                // Always include non-section fields
                filteredData[key] = currentFormData[key];
            }
        }
    });

    // Add any remaining fields not in the schema order (for extensibility)
    Object.entries(currentFormData).forEach(([key, value]) => {
        if (!schemaFieldOrder.includes(key) && !SECTIONS.includes(key)) {
            filteredData[key] = value;
        }
    });

    // Remove flat bbox_N / centroid_N keys from wherever they may have accumulated
    // (root level or inside spatial) and ensure they appear only as proper arrays.
    const coordFlatDefs = [
        { arrayKey: 'bbox',     flatKeys: ['bbox_0', 'bbox_1', 'bbox_2', 'bbox_3'] },
        { arrayKey: 'centroid', flatKeys: ['centroid_0', 'centroid_1'] }
    ];
    function stripFlatCoordKeys(obj) {
        coordFlatDefs.forEach(({ arrayKey, flatKeys }) => {
            if (!flatKeys.some(k => k in obj)) return;
            if (!Array.isArray(obj[arrayKey])) {
                const vals = flatKeys
                    .map(k => (obj[k] !== '' && obj[k] != null) ? parseFloat(obj[k]) : null)
                    .filter(v => v !== null && !isNaN(v));
                if (vals.length) obj[arrayKey] = vals;
            }
            flatKeys.forEach(k => delete obj[k]);
        });
    }
    // Root level (filteredData is a local object — safe to mutate directly)
    stripFlatCoordKeys(filteredData);
    // Inside spatial (filteredData.spatial refs currentFormData — shallow-copy first)
    if (filteredData.spatial) {
        filteredData.spatial = Object.assign({}, filteredData.spatial);
        stripFlatCoordKeys(filteredData.spatial);
    }

    return filteredData;
}

function updatePreview() {
    document.getElementById('outputPreview').textContent = JSON.stringify(buildDatasetPackage(), null, 2);
}

function updateFormStatus(type, message) {
    const status = document.getElementById('formStatus');
    status.className = `badge bg-${type}`;
    status.textContent = message;
}

function updateRiskDataType() {
    // Automatically set risk_data_type based on checked sections
    const riskDataTypes = [];

    SECTIONS.forEach(section => {
        const checkbox = document.getElementById(`${section}Check`);
        if (checkbox && checkbox.checked) {
            riskDataTypes.push(section);
        }
    });

    // Always ensure risk_data_type is an array and update currentFormData
    currentFormData.risk_data_type = riskDataTypes;
}

// ================================
// VALIDATION
// ================================

let hasRunFullValidation = false;
let currentProblems = []; // what is wrong in the dataset: { path, missing, message }
const touchedFields = new Set(); // the fields of the form that were changed, which are marked before the first validation
const MAX_LISTED_PROBLEMS = 100;

function resetValidation() {
    hasRunFullValidation = false;
    touchedFields.clear();
}

/** What the catalogue would reject in a dataset, as a list of { path, message } */
function getCatalogueErrors(dataset) {
    if (!currentSchema) return [{ path: [], message: 'The RDLS schema could not be loaded, so the metadata cannot be validated' }];
    return [...getSchemaErrors(dataset, currentSchema), ...getTextErrors(dataset)];
}

/** All that should be fixed in the dataset of the form */
function findProblems() {
    const dataset = buildDatasetPackage().datasets[0];
    // Formats, such as those of URLs, are not checked by the catalogue
    const problems = currentSchema
        ? [...getSchemaErrors(dataset, currentSchema, true), ...getTextErrors(dataset)]
        : getCatalogueErrors(dataset);
    SECTIONS.filter(section => activeSections.has(section) && !dataset[section]).forEach(section => {
        problems.push({ path: [section], message: 'is selected but has no metadata. Fill it in, or untick it in the dataset sections' });
    });
    const seen = new Set();
    return problems.map(problem => explainMissingScale(problem, dataset)).filter(problem => {
        const text = describeCatalogueError(problem);
        return !seen.has(text) && seen.add(text);
    });
}

/**
 * Without a scale, the rules for the countries of all scales apply to a location,
 * which does not tell that the scale is what is missing
 */
function explainMissingScale(problem, dataset) {
    const path = problem.path.slice(0, problem.path.lastIndexOf('spatial') + 1);
    const location = path.reduce((value, key) => value?.[key], dataset);
    const isAboutCountries = path.length > 0 && (problem.path.length === path.length || problem.path[path.length] === 'countries');
    if (!isAboutCountries || typeof location?.scale === 'string' || typeof location !== 'object') return problem;
    return { path, missing: 'scale', message: '"scale" is required' };
}

let validationTimer = null;

/** Check the dataset once the user stops typing */
function scheduleValidation() {
    clearTimeout(validationTimer);
    validationTimer = setTimeout(refreshValidation, 200);
}

/** Check the dataset and show what was found */
function refreshValidation() {
    clearTimeout(validationTimer);
    currentProblems = findProblems();
    renderValidationSummary();
    markProblems();
}

function validateForm() {
    hasRunFullValidation = true;
    refreshValidation();
    const summary = document.getElementById('validationSummary');
    summary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    summary.focus({ preventScroll: true });
}

function renderValidationSummary() {
    const badge = document.getElementById('overallValidation');
    const message = document.getElementById('validationMessage');
    const list = document.getElementById('problemList');
    const publishButton = document.getElementById('publishGitHub');
    const count = currentProblems.length;

    list.replaceChildren();
    publishButton.disabled = !hasRunFullValidation || count > 0;
    publishButton.className = `btn btn-sm w-100 mb-2 ${publishButton.disabled ? 'btn-outline-success' : 'btn-success'}`;
    if (!hasRunFullValidation) {
        badge.className = 'badge bg-secondary';
        badge.textContent = 'Not validated';
        message.textContent = 'Click “Validate Metadata” to check the dataset.';
        publishButton.title = 'Run validation first to enable publishing';
        return;
    }
    if (count === 0) {
        badge.className = 'badge bg-success';
        badge.textContent = 'Valid';
        message.textContent = 'The metadata is valid: it follows the RDL Standard.';
        publishButton.title = 'Publish validated dataset to RDL catalog';
        return;
    }
    badge.className = 'badge bg-danger';
    badge.textContent = `${count} problem${count > 1 ? 's' : ''}`;
    message.textContent = 'Click a problem to go to its field.';
    publishButton.title = `Fix ${count} problem${count > 1 ? 's' : ''} to enable publishing`;
    list.append(...currentProblems.slice(0, MAX_LISTED_PROBLEMS).map(problem => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'problem-link';
        button.textContent = describeCatalogueError(problem);
        button.addEventListener('click', () => goToProblem(problem));
        item.appendChild(button);
        return item;
    }));
    if (count > MAX_LISTED_PROBLEMS) {
        const item = document.createElement('li');
        item.textContent = `… and ${count - MAX_LISTED_PROBLEMS} more`;
        list.appendChild(item);
    }
}

/** The path of the field that a problem is about */
function getProblemPath({ path, missing }) {
    return missing === undefined ? path : [...path, missing];
}

/** Whether a problem is to be marked: all of them after a validation, and before it those of the fields that were changed */
function isShown(problem) {
    return hasRunFullValidation || touchedFields.has(getProblemPath(problem).join('.'));
}

/**
 * The element of the form or of the edit window that shows a path: a field, an item of a list
 * or the card of an object. If the path goes on inside of it, `rest` is what is left of the path.
 */
function findPathElement(scope, path) {
    for (let length = path.length; length > 0; length--) {
        const part = path.slice(0, length);
        const last = part[part.length - 1];
        const selector = typeof last === 'number'
            ? `[data-array-name="${CSS.escape(part.slice(0, -1).join('.'))}"][data-index="${last}"]`
            : `[data-field-path="${CSS.escape(part.join('.'))}"]`;
        let element = findOwn(scope, selector);
        if (!element && typeof last === 'number') {
            const list = findOwn(scope, `.array-field[data-array-name="${CSS.escape(part.slice(0, -1).join('.'))}"]`);
            element = list?.querySelector(':scope > [id$="_items"]').children[last] || null;
        }
        if (element) return { element, rest: path.slice(length) };
    }
    return null;
}

/** The first element in a scope that is not inside an item of one of its lists, whose fields have paths of their own */
function findOwn(scope, selector) {
    const owner = element => element.parentElement.closest('.card[data-item-index]');
    const scopeOwner = scope.matches('.card[data-item-index]') ? scope : null;
    return [...scope.querySelectorAll(selector)].find(element => owner(element) === scopeOwner) || null;
}

/** The innermost element of the edit window that shows a path, which can go through the items of lists */
function findEditorElement(path) {
    let scope = document.getElementById('objectEditorFields');
    let found = null;
    let rest = path;
    while (rest.length > 0) {
        const next = findPathElement(scope, rest);
        if (!next) break;
        found = next;
        rest = next.rest;
        if (!found.element.matches('.card[data-item-index]')) break;
        scope = found.element;
    }
    return found;
}

function clearProblems(scope) {
    scope.querySelectorAll('.has-problem').forEach(element => element.classList.remove('has-problem'));
    scope.querySelectorAll('.problem-text').forEach(element => element.remove());
    scope.querySelectorAll('[aria-invalid]').forEach(element => element.removeAttribute('aria-invalid'));
}

function markElement(element, text) {
    element.classList.add('has-problem');
    if (element.matches('[data-field-path]:not(.object-summary-card)')) {
        element.querySelector('input, select, textarea')?.setAttribute('aria-invalid', 'true');
    }
    // One message for each element is enough: the list has all of them
    if ([...element.children].some(child => child.classList.contains('problem-text'))) return;
    const note = document.createElement('div');
    note.className = 'problem-text';
    note.textContent = text;
    if (element.matches('.array-item')) element.classList.add('flex-wrap');
    element.appendChild(note);
}

/** The text of a problem next to the element that shows it, or a part of its path */
function describeAtElement(problem, rest) {
    if (problem.missing !== undefined && rest.length === 0) return 'This field is required';
    const { path, message } = problem;
    const text = describeCatalogueError({ path: path.slice(getProblemPath(problem).length - rest.length), message }).trim();
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Mark the fields and the cards of the form that have a problem */
function markProblems() {
    const form = document.getElementById('metadataTabContent');
    clearProblems(form);
    document.querySelectorAll('#metadataTabs .has-problem').forEach(tab => tab.classList.remove('has-problem'));
    currentProblems.filter(isShown).forEach(problem => {
        const path = getProblemPath(problem);
        const found = findPathElement(form, path);
        if (found) markElement(found.element, describeAtElement(problem, found.rest));
        document.getElementById(`${getSectionOf(path)}-tab`)?.classList.add('has-problem');
    });
}

/** Mark the fields of the edit window that had a problem when it was opened */
function markEditorProblems() {
    if (!hasRunFullValidation) return;
    const { path } = currentObjectEditor;
    currentProblems.forEach(problem => {
        const problemPath = getProblemPath(problem);
        if (!path.every((part, index) => problemPath[index] === part)) return;
        const found = findEditorElement(problemPath.slice(path.length));
        if (found) markElement(found.element, describeAtElement(problem, found.rest));
    });
}

function getSectionOf(path) {
    return SECTIONS.includes(path[0]) ? path[0] : 'general';
}

/** Show the field of a problem, opening the edit window if it is in one of the cards */
function goToProblem(problem) {
    const path = getProblemPath(problem);
    if (path[0] === 'risk_data_type') {
        document.getElementById('hazardCheck').focus();
        return;
    }
    const tab = document.getElementById(`${getSectionOf(path)}-tab`);
    if (tab) bootstrap.Tab.getOrCreateInstance(tab).show();
    const found = findPathElement(document.getElementById('metadataTabContent'), path);
    if (!found) {
        // A section that is empty
        setTimeout(() => focusField(document.getElementById(getSectionOf(path))), 200);
        return;
    }
    const { element, rest } = found;
    const editButton = element.matches('.object-summary-card') ? element.querySelector('button') : null;
    if (!editButton) {
        // Wait for the tab to be shown
        setTimeout(() => focusField(element), 200);
        return;
    }
    document.getElementById('objectEditorModal').addEventListener('shown.bs.modal', () => {
        const field = findEditorElement(rest);
        if (field) focusField(field.element);
    }, { once: true });
    editButton.click();
}

function focusField(element) {
    for (let details = element.closest('details'); details; details = details.parentElement.closest('details')) details.open = true;
    element.querySelectorAll(':scope > .object-field > details').forEach(details => { details.open = true; });
    element.scrollIntoView({ block: 'center' });
    element.querySelector('input:not(:disabled), select:not(:disabled), textarea, button')?.focus({ preventScroll: true });
}

/**
 * Suggest an id such as rdls_hzd-ken_worldbank_flood_hazard_map: the types of data, the
 * countries, who made the dataset and its title. The catalogue only accepts letters, digits,
 * hyphens and underscores.
 */
function generateDatasetId() {
    const toWords = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

    const codes = { hazard: ['hzd', 'h'], exposure: ['exp', 'e'], vulnerability: ['vln', 'v'], loss: ['lss', 'l'] };
    const types = SECTIONS.filter(section => currentFormData.risk_data_type?.includes(section));
    const typePart = types.length > 1 ? types.map(type => codes[type][1]).join('') : types.length === 1 ? codes[types[0]][0] : 'data';

    // Datasets of many countries are named after none of them
    const countries = [...new Set((currentFormData.spatial?.countries || []).filter(Boolean))].map(country => country.toLowerCase());
    const countryPart = countries.length > 0 && countries.length <= 3 ? `-${countries.sort().join('-')}` : '';

    // An acronym, if the name has one: "Humanitarian Data Exchange (HDX)"
    const maker = currentFormData.project?.name || currentFormData.creator?.name || currentFormData.publisher?.name || '';
    const acronym = maker.match(/\(([A-Z][A-Za-z0-9-]{1,14})\)/);
    const makerPart = toWords(acronym ? acronym[1] : maker).join('').slice(0, 20) || 'dataset';

    let titlePart = '';
    const skipped = ['the', 'of', 'for', 'and', 'in', 'a', 'an', 'to', 'on', 'from', 'by', 'with'];
    toWords(currentFormData.title || '').filter(word => !skipped.includes(word)).forEach(word => {
        if (titlePart.length + word.length < 40) titlePart += `_${word}`;
    });

    return `rdls_${typePart}${countryPart}_${makerPart}${titlePart}`;
}

function packageDataset(datasetMetadata) {
    // Get the current schema version
    // v1.0 schema reference
    const schemaVersion = '1__0__0';
    const schemaUrl = `https://docs.riskdatalibrary.org/en/${schemaVersion}/rdls_schema.json`;

    // Generate unique dataset ID if not present
    if (!datasetMetadata.id) {
        datasetMetadata.id = generateDatasetId();
    }

    // Ensure links array exists and has the schema reference as first item
    if (!datasetMetadata.links) {
        datasetMetadata.links = [];
    }

    // Check if describedby link already exists
    const hasDescribedBy = datasetMetadata.links.some(link => link.rel === 'describedby');

    if (!hasDescribedBy) {
        // Add schema reference as first link with rel="describedby"
        datasetMetadata.links.unshift({
            href: schemaUrl,
            rel: 'describedby'
        });
    } else {
        // Update existing describedby link to current schema version
        const describedByIndex = datasetMetadata.links.findIndex(link => link.rel === 'describedby');
        datasetMetadata.links[describedByIndex].href = schemaUrl;
    }

    // Reorder fields according to schema
    const schemaFieldOrder = [
        'id', 'title', 'description', 'risk_data_type', 'publisher', 'version', 'purpose',
        'project', 'details', 'contact_point', 'creator', 'spatial', 'spatial_resolution',
        'temporal', 'temporal_resolution', 'license', 'rights',
        'attributions', 'lineage', 'referenced_by', 'resources',
        'hazard', 'exposure', 'vulnerability', 'loss', 'links'
    ];

    const orderedMetadata = {};

    // Add fields in schema order
    schemaFieldOrder.forEach(key => {
        if (datasetMetadata[key] !== undefined) {
            orderedMetadata[key] = datasetMetadata[key];
        }
    });

    // Add any remaining fields not in schema order
    Object.keys(datasetMetadata).forEach(key => {
        if (!schemaFieldOrder.includes(key)) {
            orderedMetadata[key] = datasetMetadata[key];
        }
    });

    // Create the package structure (datasets only, no top-level schema field)
    const packagedData = {
        datasets: [orderedMetadata]
    };

    return packagedData;
}

function cleanEmptyValues(obj) {
    // Recursively trim strings, and remove empty strings, empty arrays, and null/undefined values
    if (typeof obj === 'string') obj = obj.trim();
    if (Array.isArray(obj)) {
        // Filter out empty values from arrays
        const filtered = obj
            .map(item => cleanEmptyValues(item))
            .filter(item => {
                if (item === null || item === undefined || item === '') return false;
                if (Array.isArray(item) && item.length === 0) return false;
                if (typeof item === 'object' && Object.keys(item).length === 0) return false;
                return true;
            });
        return filtered.length > 0 ? filtered : undefined;
    } else if (obj !== null && typeof obj === 'object') {
        // Process objects
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            const cleanedValue = cleanEmptyValues(value);

            // Only include the property if it has a meaningful value
            if (cleanedValue !== undefined && cleanedValue !== null && cleanedValue !== '') {
                // Skip empty arrays
                if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
                    continue;
                }
                // Skip empty objects
                if (typeof cleanedValue === 'object' && !Array.isArray(cleanedValue) && Object.keys(cleanedValue).length === 0) {
                    continue;
                }
                cleaned[key] = cleanedValue;
            }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    } else if (obj === '' || obj === null || obj === undefined) {
        return undefined;
    }
    return obj;
}

// Characters that the catalogue rejects and that text pasted from elsewhere often holds
function replaceRejectedCharacters(value) {
    if (typeof value === 'string') {
        return value.replace(/ /g, ' ').replace(/[​﻿]/g, '');
    }
    if (Array.isArray(value)) return value.map(replaceRejectedCharacters);
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceRejectedCharacters(item)]));
    }
    return value;
}

/**
 * Put the keys of a value in the order they have in a reference, so that an update
 * only shows what changed. Keys that are new stay after the key they follow.
 */
function alignKeyOrder(value, reference) {
    if (Array.isArray(value) && Array.isArray(reference)) {
        return value.map((item, index) => {
            const sameId = item?.id !== undefined && reference.find(other => other?.id === item.id);
            return alignKeyOrder(item, sameId || reference[index]);
        });
    }
    const isObject = item => item !== null && typeof item === 'object' && !Array.isArray(item);
    if (!isObject(value) || !isObject(reference)) return value;

    const keys = Object.keys(reference).filter(key => key in value);
    let previous = null;
    Object.keys(value).forEach(key => {
        if (!keys.includes(key)) keys.splice(previous === null ? 0 : keys.indexOf(previous) + 1, 0, key);
        previous = key;
    });
    return Object.fromEntries(keys.map(key => [key, alignKeyOrder(value[key], reference[key])]));
}

/** Nested number fields, such as return periods, are stored as text: convert those that the schema says are numbers */
function convertNumbers(value, rule) {
    if (!rule || typeof rule !== 'object') return value;
    if (rule.$ref) value = convertNumbers(value, resolveReference(rule.$ref));
    (rule.allOf || []).forEach(subrule => { value = convertNumbers(value, subrule); });
    if (typeof value === 'string') {
        const isNumber = ['number', 'integer'].includes(rule.type) && value.trim() !== '' && Number.isFinite(Number(value));
        return isNumber ? Number(value) : value;
    }
    if (Array.isArray(value)) return rule.items ? value.map(item => convertNumbers(item, rule.items)) : value;
    if (value !== null && typeof value === 'object' && rule.properties) {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convertNumbers(item, rule.properties[key])]));
    }
    return value;
}

/** The dataset in the form, as it is exported and published */
function buildDatasetPackage() {
    const packagedData = packageDataset(getFilteredFormData());
    if (editingDataset) packagedData.datasets[0].id = editingDataset.id;
    // Clean empty values before export
    const cleanedData = cleanEmptyValues(replaceRejectedCharacters(packagedData));
    cleanedData.datasets[0] = convertNumbers(cleanedData.datasets[0], currentSchema);
    return editingDataset?.original ? alignKeyOrder(cleanedData, editingDataset.original) : cleanedData;
}

function serializeDatasetPackage(packagedData) {
    return JSON.stringify(packagedData, null, 2) + (editingDataset?.trailingNewline ? '\n' : '');
}

// The text that the export window saves
let exportText = '';

function exportJson() {
    const packagedData = buildDatasetPackage();
    exportText = serializeDatasetPackage(packagedData);
    const input = document.getElementById('exportFilename');
    input.value = packagedData.datasets[0].id;
    // In the catalogue, the file of a dataset is named after its id
    input.readOnly = Boolean(editingDataset);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('filenameModal')).show();
}

function submitExport(event) {
    event.preventDefault();
    const filename = document.getElementById('exportFilename').value.trim().replace(/\.json$/i, '') || 'rdls_metadata';
    const url = URL.createObjectURL(new Blob([exportText], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
    bootstrap.Modal.getInstance(document.getElementById('filenameModal')).hide();
}

// GitHub Integration Functions
function openGithubConfig() {
    const idInput = document.getElementById('datasetIdInput');
    idInput.readOnly = Boolean(editingDataset);
    idInput.value = editingDataset ? editingDataset.id : (currentFormData.id || generateDatasetId());
    if (!publishInProgress) clearGithubStatus();
    checkDatasetIdInput();

    // Check authentication state
    checkGithubAuthState();

    const modal = new bootstrap.Modal(document.getElementById('githubConfigModal'));
    modal.show();
}

// ---- Is the id of a new dataset free? ----

let datasetIdCheckTimer = null;
let datasetIdCheckCount = 0;

function scheduleDatasetIdCheck() {
    clearTimeout(datasetIdCheckTimer);
    datasetIdCheckTimer = setTimeout(checkDatasetIdInput, 300);
}

/** Tell next to the id field whether the id can be used */
async function checkDatasetIdInput() {
    const checkNumber = ++datasetIdCheckCount;
    if (editingDataset) {
        showDatasetIdFeedback('text-muted', 'This updates the existing dataset. Its id cannot be changed.');
        return;
    }
    const id = document.getElementById('datasetIdInput').value.trim();
    if (!DATASET_ID_PATTERN.test(id)) {
        showDatasetIdFeedback('text-danger', 'An id must start with a letter or digit and have only letters, digits, hyphens and underscores.');
        return;
    }
    showDatasetIdFeedback('text-muted', 'Checking that the id is free…');
    let usedId, failed = false;
    try {
        usedId = findUsedId(id, await getCatalogIds());
    } catch (error) {
        console.error('Could not check the id:', error);
        failed = true;
    }
    if (checkNumber !== datasetIdCheckCount) return; // the id has changed since
    if (failed) {
        showDatasetIdFeedback('text-warning', 'Could not check whether this id is free. It is checked again when you publish.');
    } else if (usedId) {
        const link = document.createElement('a');
        link.href = `${window.location.pathname}?dataset=${usedId}`;
        link.target = '_blank';
        link.textContent = 'open that dataset for editing';
        showDatasetIdFeedback('text-danger', `${usedId} is already used in the catalogue. Choose another id, or `, link, '.');
    } else {
        showDatasetIdFeedback('text-success', 'This id is free.');
    }
}

function showDatasetIdFeedback(className, ...content) {
    const feedback = document.getElementById('datasetIdFeedback');
    feedback.className = `form-text ${className}`;
    feedback.replaceChildren(...content);
}

/** The id in use that equals the given one, upper and lower case being the same, or undefined */
function findUsedId(id, usedIds) {
    return usedIds.find(usedId => usedId.toLowerCase() === id.toLowerCase());
}

let catalogIds = null;

async function getCatalogIds({ refresh = false } = {}) {
    if (refresh || !catalogIds) {
        try {
            catalogIds = await fetchPublishedIds();
        } catch (error) {
            console.warn('Reading the ids from GitHub instead:', error.message);
            catalogIds = await fetchRepositoryIds();
        }
    }
    return catalogIds;
}

async function fetchPublishedIds() {
    const response = await fetch(`${CATALOG_URL}/dataset-ids.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`dataset-ids.json: HTTP ${response.status}`);
    const ids = await response.json();
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(id => typeof id === 'string')) {
        throw new Error('dataset-ids.json is not a list of ids');
    }
    return ids;
}

// The contents API lists at most 1,000 files of a folder, the trees API lists them all
async function fetchRepositoryIds() {
    const token = sessionStorage.getItem('github_access_token');
    const tree = await githubRequest(token, `repos/${TARGET_REPO}/git/trees/${TARGET_BRANCH}:${DATASETS_PATH}`);
    if (tree.truncated) throw new Error('The list of dataset files is not complete');
    return tree.tree
        .filter(file => file.path.endsWith('.json'))
        .map(file => file.path.slice(0, -'.json'.length));
}

// GitHub Configuration
const TARGET_REPO_OWNER = 'GFDRR';
const TARGET_REPO_NAME = 'rdl-jkan';
const TARGET_REPO = `${TARGET_REPO_OWNER}/${TARGET_REPO_NAME}`;
const TARGET_BRANCH = 'rdl-1.0'; // Target branch for PRs
const DATASETS_PATH = '_datasets/json'; // Folder of the dataset files, named <id>.json
const CATALOG_URL = 'https://catalog.riskdatalibrary.org';
const DATASET_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/; // As checked by the catalogue

// Initialize GitHub auth state on page load
window.addEventListener('DOMContentLoaded', () => {
    checkGithubAuthState();
});

async function authenticateWithToken() {
    const token = document.getElementById('githubToken').value.trim();

    if (!token) {
        showGithubStatus('error', 'Please enter a GitHub token');
        return;
    }

    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        showGithubStatus('error', 'Invalid token format. Token should start with "ghp_" or "github_pat_"');
        return;
    }

    showGithubStatus('info', 'Verifying token...');

    try {
        // Verify token by getting user info
        const userResponse = await githubRequest(token, 'user');

        // Token is valid, store it
        sessionStorage.setItem('github_access_token', token);
        sessionStorage.setItem('github_username', userResponse.login);

        checkGithubAuthState();
        showGithubStatus('success', `Successfully authenticated as ${userResponse.login}!`);

    } catch (error) {
        console.error('Token verification error:', error);
        showGithubStatus('error', `Authentication failed: ${error.message}`);
    }
}

function checkGithubAuthState() {
    const token = sessionStorage.getItem('github_access_token');
    const username = sessionStorage.getItem('github_username');

    if (token && username) {
        document.getElementById('notAuthenticated').style.display = 'none';
        document.getElementById('authenticated').style.display = 'block';
        document.getElementById('githubUsername').textContent = username;

        // Show publish button if authenticated
        const publishBtn = document.getElementById('publishToGithub');
        if (publishBtn) publishBtn.disabled = false;
    } else {
        document.getElementById('notAuthenticated').style.display = 'block';
        document.getElementById('authenticated').style.display = 'none';

        // Disable publish button if not authenticated
        const publishBtn = document.getElementById('publishToGithub');
        if (publishBtn) publishBtn.disabled = true;
    }
}

function logoutGithub() {
    sessionStorage.removeItem('github_access_token');
    sessionStorage.removeItem('github_username');
    checkGithubAuthState();
    showGithubStatus('info', 'Signed out successfully');
}

async function ensureUserFork(token, username) {
    showGithubStatus('info', 'Checking for existing fork...');

    try {
        // Check if user already has a fork
        const forkResponse = await fetch(`https://api.github.com/repos/${username}/${TARGET_REPO_NAME}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (forkResponse.ok) {
            const forkData = await forkResponse.json();
            if (forkData.fork && forkData.parent.full_name === TARGET_REPO) {
                showGithubStatus('success', 'Fork already exists');
                return `${username}/${TARGET_REPO_NAME}`;
            }
        }

        // Fork doesn't exist, create it
        showGithubStatus('info', 'Creating fork in your account...');
        const createForkResponse = await githubRequest(token, `repos/${TARGET_REPO}/forks`, {
            method: 'POST',
            body: JSON.stringify({})
        });

        // Wait a moment for fork to be ready
        showGithubStatus('info', '⏳ Waiting for fork to be ready...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        showGithubStatus('success', `Fork created: ${createForkResponse.full_name}`);
        return createForkResponse.full_name;

    } catch (error) {
        throw new Error(`Failed to create fork: ${error.message}`);
    }
}

let publishInProgress = false;

async function publishToGithub() {
    if (publishInProgress) return;
    publishInProgress = true;

    // Disable publish button during operation
    const publishBtn = document.getElementById('publishToGithub');
    publishBtn.disabled = true;

    try {
        await publishDataset();
    } catch (error) {
        console.error('GitHub publish error:', error);
        showGithubStatus('error', `${describePublishError(error)}`);
    } finally {
        publishInProgress = false;
        checkGithubAuthState();
    }
}

function describePublishError(error) {
    if (error instanceof UserFacingError) return error.message;
    const prefix = 'Publication failed: ';
    switch (error.status) {
        case 401: return prefix + 'Authentication failed. Please sign in again.';
        case 403: return prefix + 'Access denied. Please check your GitHub permissions.';
        case 404: return prefix + 'Repository not found.';
        case 409: return prefix + 'The file changed on GitHub in the meantime. Please try again.';
    }
    if (error.message.includes('fork')) return prefix + 'Could not create fork. Please try again or create a fork manually.';
    if (error instanceof TypeError) return prefix + 'Network connection error. Please check your internet connection.';
    return prefix + error.message;
}

async function publishDataset() {
    const token = sessionStorage.getItem('github_access_token');
    const username = sessionStorage.getItem('github_username');
    const target = editingDataset; // the dataset to update, or null for a new one
    const isUpdate = Boolean(target);

    // Input validation
    if (!token || !username) {
        throw new UserFacingError('Please sign in with GitHub first');
    }

    // Check if form data is valid and has essential fields
    if (!currentFormData || Object.keys(currentFormData).length === 0) {
        throw new UserFacingError('No metadata to publish. Please fill out the form first.');
    }

    const datasetId = isUpdate ? target.id : document.getElementById('datasetIdInput').value.trim();
    if (!DATASET_ID_PATTERN.test(datasetId)) {
        throw new UserFacingError('The dataset id must start with a letter or digit and have only letters, digits, hyphens and underscores.');
    }

    // Warn if essential fields are missing
    if (!currentFormData.title && !confirm('No title found in metadata. Continue publishing?')) {
        clearGithubStatus();
        return;
    }

    if (!isUpdate) {
        currentFormData.id = datasetId;
        updatePreview();
        autoSave();
    }
    const packagedData = buildDatasetPackage();
    const fileText = serializeDatasetPackage(packagedData);
    const dataset = packagedData.datasets[0];
    const errors = getCatalogueErrors(dataset).map(describeCatalogueError);
    if (errors.length > 0) {
        const more = errors.length > 3 ? `; and ${errors.length - 3} more` : '';
        throw new UserFacingError(`Nothing was published, because the catalogue would reject this dataset. ${errors.slice(0, 3).join('; ')}${more}. Click Validate Metadata to see all the errors.`);
    }
    const datasetTitle = (dataset.title || datasetId).replace(/\s+/g, ' ');
    const path = `${DATASETS_PATH}/${datasetId}.json`;
    const changedFields = isUpdate ? listChangedFields(dataset, target.original) : null;
    if (changedFields && changedFields.length === 0) {
        throw new UserFacingError('There are no changes to publish: the metadata is the same as in the catalogue.');
    }

    // Step 1: Check, without writing anything, that the dataset can be published
    showGithubStatus('info', 'Checking the catalogue...');
    const baseResponse = await githubRequest(token, `repos/${TARGET_REPO}/git/ref/heads/${TARGET_BRANCH}`);
    const baseSha = baseResponse.object.sha;
    const publishedSha = await getFileSha(token, TARGET_REPO, path, baseSha);
    if (isUpdate) {
        checkCanUpdate(target, publishedSha);
    } else {
        await checkIdIsFree(datasetId, publishedSha);
    }

    // Step 2: Decide what to do about open pull requests for the same dataset
    const branchName = `rdl-dataset-${datasetId}`;
    const pullRequest = await chooseOpenPullRequest(token, username, branchName, isUpdate);
    if (pullRequest === 'cancel') {
        showGithubStatus('info', 'Publication cancelled. Nothing was changed on GitHub.');
        return;
    }

    // Step 3: Find or create the branch
    let repo, branch, fileSha;
    if (pullRequest) {
        repo = pullRequest.head.repo.full_name;
        branch = pullRequest.head.ref;
        fileSha = await getFileSha(token, repo, path, branch);
    } else {
        // The branch starts from the catalogue, so the file there is the published one
        repo = await ensureUserFork(token, username);
        branch = await createBranch(token, repo, branchName, baseSha);
        fileSha = publishedSha;
    }

    // Step 4: Create/update file. Without the sha of the file it replaces, GitHub refuses to.
    showGithubStatus('info', 'Uploading dataset file...');
    const content = btoa(unescape(encodeURIComponent(fileText)));
    const commitMessage = `${isUpdate ? 'Update' : 'Add'} RDLS dataset: ${datasetTitle}

Dataset ${isUpdate ? 'updated' : 'published'} via RDLS Metadata Editor
- Title: ${dataset.title || 'Untitled'}
- Description: ${dataset.description ? dataset.description.substring(0, 100) + '...' : 'No description'}
${changedFields ? `- Changed fields: ${changedFields.join(', ')}\n` : ''}- Timestamp: ${new Date().toISOString()}`;

    await githubRequest(token, `repos/${repo}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify({
            message: commitMessage,
            content: content,
            branch: branch,
            ...(fileSha ? { sha: fileSha } : {})
        })
    });

    // Step 5: Create Pull Request from USER'S FORK to MAIN REPO, unless it was added to an open one
    let prResponse = pullRequest;
    if (!pullRequest) {
        showGithubStatus('info', 'Creating pull request...');
        const details = isUpdate
            ? `**Dataset:** ${CATALOG_URL}/datasets/${datasetId}

**Changed fields:** ${changedFields ? changedFields.map(field => `\`${field}\``).join(', ') : 'not known'}`
            : `**Description:**
${dataset.description || 'No description provided'}`;
        prResponse = await githubRequest(token, `repos/${TARGET_REPO}/pulls`, {
            method: 'POST',
            body: JSON.stringify({
                title: `${isUpdate ? 'Update RDLS dataset' : 'Add RDLS Dataset'}: ${datasetTitle}`,
                head: `${username}:${branch}`, // Important: user:branch format
                base: TARGET_BRANCH,
                body: `## ${isUpdate ? 'RDLS Dataset Update' : 'New RDLS Dataset Submission'}

**Dataset Title:** ${dataset.title || 'Untitled'}

${details}

**File:** \`${path}\`

**Submission Details:**
- Published via RDLS Metadata Editor
- Timestamp: ${new Date().toISOString()}
- Validation: Passed
- Submitted by: @${username}

---
This pull request was automatically generated by the RDLS Metadata Editor.`
            })
        });
    }

    // Success!
    showPublishSuccess(prResponse, Boolean(pullRequest));
}

function showPublishSuccess(prResponse, wasAdded) {
    const prUrl = prResponse.html_url;
    const link = document.createElement('a');
    link.href = prUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `View Pull Request #${prResponse.number}`;
    showGithubStatus('success', wasAdded ? 'Your changes were added to your pull request! ' : 'Successfully published! ', link);

    // Show confirmation and offer to close modal
    setTimeout(() => {
        const message = wasAdded
            ? `Your changes were added to Pull Request #${prResponse.number}.`
            : `Dataset successfully published as Pull Request #${prResponse.number}!`;
        if (confirm(`${message}\n\nWould you like to view it on GitHub now?`)) {
            window.open(prUrl, '_blank');
        }
        // Close modal after 2 seconds regardless
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('githubConfigModal'));
            if (modal) modal.hide();
        }, 2000);
    }, 1000);
}

/** The top-level fields that differ from the catalogue, or null if the catalogue version is not known */
function listChangedFields(dataset, originalPackage) {
    if (!originalPackage) return null;
    const original = cleanEmptyValues(originalPackage).datasets[0];
    const keys = new Set([...Object.keys(original), ...Object.keys(dataset)]);
    return [...keys].filter(key => JSON.stringify(original[key]) !== JSON.stringify(dataset[key]));
}

function checkCanUpdate(target, publishedSha) {
    if (!publishedSha) {
        throw new UserFacingError(`The dataset ${target.id} is no longer in the catalogue, so it cannot be updated. Nothing was published.`);
    }
    if (!target.sha) {
        throw new UserFacingError('This browser could not tell which version of the dataset you opened, so the update cannot be published safely. Export the JSON instead.');
    }
    if (publishedSha !== target.sha) {
        throw new UserFacingError('The dataset has changed in the catalogue since you opened it, and publishing would undo that change. Nothing was published. ' +
            'Export your version, then choose "Discard My Changes" to start from the current one. If it changed in the last few minutes, wait before you reload.');
    }
}

async function checkIdIsFree(id, publishedSha) {
    let usedId = publishedSha ? id : undefined;
    if (!usedId) {
        try {
            usedId = findUsedId(id, await getCatalogIds({ refresh: true }));
        } catch (error) {
            console.error('Could not check the id:', error);
            throw new UserFacingError('Could not check that the dataset id is free, so nothing was published. Please try again.');
        }
    }
    if (usedId) {
        throw new UserFacingError(`The id ${usedId} is already used in the catalogue. Choose another id, or open that dataset to edit it. Nothing was published.`);
    }
}

/**
 * Look for open pull requests made by this editor for the same dataset, and ask what
 * to do about them. Returns the user's own pull request to add the changes to, null
 * to open a new one, or 'cancel'.
 */
async function chooseOpenPullRequest(token, username, branchName, isUpdate) {
    const openPullRequests = await findOpenPullRequests(token, branchName);
    const isOwn = pr => pr.user?.login?.toLowerCase() === username.toLowerCase() &&
        pr.head.repo?.owner?.login?.toLowerCase() === username.toLowerCase() &&
        pr.head.ref.startsWith(branchName); // not one for an id that differs by upper and lower case
    const own = openPullRequests.find(isOwn);
    const others = openPullRequests.filter(pr => !isOwn(pr));

    if (own) {
        return askGithubChoice(
            `You already have an open pull request for this dataset: #${own.number} “${own.title}”. ` +
            'Adding to it replaces the dataset file there with what is in the form now, as a new commit: changes made there that are not in the form are undone.',
            [
                { label: `Add to pull request #${own.number}`, value: own },
                ...(isUpdate ? [{ label: 'Open a separate pull request', value: null }] : []),
                { label: 'Cancel', value: 'cancel' }
            ]
        );
    }
    if (others.length > 0 && !isUpdate) {
        throw new UserFacingError(`The id is already used by a dataset waiting for review in pull request #${others[0].number}. Choose another id. Nothing was published.`);
    }
    if (others.length > 0) {
        const list = others.map(pr => `#${pr.number} by ${pr.user?.login || 'unknown'}`).join(', ');
        return askGithubChoice(
            `This dataset is already being changed in another open pull request: ${list}. Yours may conflict with it.`,
            [
                { label: 'Open my pull request anyway', value: null },
                { label: 'Cancel', value: 'cancel' }
            ]
        );
    }
    return null;
}

async function findOpenPullRequests(token, branchName) {
    const found = [];
    for (let page = 1; ; page++) {
        const pullRequests = await githubRequest(token, `repos/${TARGET_REPO}/pulls?state=open&base=${TARGET_BRANCH}&per_page=100&page=${page}`);
        found.push(...pullRequests.filter(pr => isDatasetBranch(pr.head.ref, branchName)));
        if (pullRequests.length < 100) return found;
    }
}

// A branch is named after the dataset id, followed by a dot (which ids cannot have) and
// the time if that name was taken
function isDatasetBranch(ref, branchName) {
    const lowerRef = ref.toLowerCase();
    const lowerName = branchName.toLowerCase();
    return lowerRef === lowerName || lowerRef.startsWith(`${lowerName}.`);
}

/** Create the branch from the catalogue, leaving earlier work on a branch of that name untouched */
async function createBranch(token, repo, branchName, baseSha) {
    showGithubStatus('info', 'Creating branch in your fork...');
    const existing = await githubRequestOrNull(token, `repos/${repo}/git/ref/heads/${branchName}`);

    if (existing) {
        // A branch with nothing of its own can be moved forward
        const comparison = await githubRequestOrNull(token, `repos/${repo}/compare/${baseSha}...${existing.object.sha}`);
        if (comparison && ['identical', 'behind'].includes(comparison.status)) {
            if (comparison.status === 'behind') {
                await githubRequest(token, `repos/${repo}/git/refs/heads/${branchName}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ sha: baseSha, force: false })
                });
            }
            return branchName;
        }
        branchName = `${branchName}.${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`;
    }

    await githubRequest(token, `repos/${repo}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: baseSha
        })
    });
    return branchName;
}

/** The sha of a file, or null if it does not exist */
async function getFileSha(token, repo, path, ref) {
    const file = await githubRequestOrNull(token, `repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`);
    return file ? file.sha : null;
}

async function githubRequestOrNull(token, endpoint) {
    try {
        return await githubRequest(token, endpoint);
    } catch (error) {
        if (error.status === 404) return null;
        throw error;
    }
}

async function githubRequest(token, endpoint, options = {}) {
    const config = {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `token ${token}` } : {})
        },
        cache: 'no-store', // the answers decide what gets written
        ...options
    };

    const response = await fetch(`https://api.github.com/${endpoint}`, config);

    if (!response.ok) {
        const error = new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        error.status = response.status;
        throw error;
    }

    return await response.json();
}

function showGithubStatus(type, ...content) {
    const statusDiv = document.getElementById('githubConfigStatus');
    let className = 'mt-3 alert ';
    switch(type) {
        case 'success': className += 'alert-success'; break;
        case 'error': className += 'alert-danger'; break;
        case 'info': className += 'alert-info'; break;
        case 'warning': className += 'alert-warning'; break;
        default: className += 'alert-secondary';
    }
    statusDiv.className = className;
    statusDiv.replaceChildren(...content); // text is shown as text, never as HTML
    statusDiv.style.display = 'block';
    statusDiv.scrollIntoView({ block: 'nearest' });
}

function clearGithubStatus() {
    const statusDiv = document.getElementById('githubConfigStatus');
    statusDiv.className = 'mt-3';
    statusDiv.replaceChildren();
}

/** Ask a question in the publishing window. Closing the window counts as cancelling. */
function askGithubChoice(question, choices) {
    return new Promise(resolve => {
        const modalElement = document.getElementById('githubConfigModal');
        const onClose = () => answer('cancel');
        const answer = value => {
            modalElement.removeEventListener('hidden.bs.modal', onClose);
            showGithubStatus('info', 'Publishing...');
            resolve(value);
        };
        const buttons = document.createElement('div');
        buttons.className = 'd-flex flex-wrap gap-2 mt-2';
        choices.forEach(({ label, value }) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `btn btn-sm ${value === 'cancel' ? 'btn-outline-secondary' : 'btn-primary'}`;
            button.textContent = label;
            button.addEventListener('click', () => answer(value));
            buttons.appendChild(button);
        });
        modalElement.addEventListener('hidden.bs.modal', onClose);
        showGithubStatus('warning', question, buttons);
    });
}

// ================================
// DRAFTS, OPENING AND EDIT MODE
// ================================

/** An error whose message is meant to be shown as it is */
class UserFacingError extends Error {}

// The existing dataset being edited, or null when the form holds a new dataset:
// { id, sha, original, trailingNewline }
// sha is the git blob sha of the catalogue file that the edits are based on.
let editingDataset = null;

// Drafts are only written once what was stored has been read, so that an empty
// form never replaces unfinished work.
let storageReady = false;

const NEW_DRAFT_DATA_KEY = 'rdlsEditor_formData';
const NEW_DRAFT_SECTIONS_KEY = 'rdlsEditor_activeSections';

// Edits to an existing dataset are kept apart from the new dataset's draft and
// from the edits to other datasets.
function editDraftKey(id) {
    return `rdlsEditor_edit:${id}`;
}

function differsFromCatalog() {
    if (!editingDataset?.original) return true;
    return JSON.stringify(buildDatasetPackage()) !== JSON.stringify(cleanEmptyValues(editingDataset.original));
}

/** Save the form in the browser. Returns false if it could not be saved. */
function autoSave() {
    if (!storageReady) return true;
    try {
        if (!editingDataset) {
            localStorage.setItem(NEW_DRAFT_DATA_KEY, JSON.stringify(currentFormData));
            localStorage.setItem(NEW_DRAFT_SECTIONS_KEY, JSON.stringify([...activeSections]));
        } else if (differsFromCatalog()) {
            // Also kept after publishing, until the catalogue has the same content, so that
            // further edits to a pull request that is still open include the earlier ones
            localStorage.setItem(editDraftKey(editingDataset.id), JSON.stringify({
                formData: currentFormData,
                sections: [...activeSections],
                sha: editingDataset.sha
            }));
        } else {
            localStorage.removeItem(editDraftKey(editingDataset.id));
        }
        return true;
    } catch (error) {
        console.error('Could not save the draft:', error);
        showEditorNotice('warning', 'Your changes could not be saved in this browser. Export your metadata to keep them.');
        return false;
    }
}

/** Show a dataset in the form, with the sections it describes or the given ones */
function applyDataset(dataset, sections = null) {
    currentFormData = dataset;

    resetValidation();

    // Activate sections based on loaded data
    activeSections.clear();
    activeSections.add('general');

    SECTIONS.forEach(section => {
        const checkbox = document.getElementById(`${section}Check`);
        const isActive = sections ? sections.includes(section) : Boolean(dataset[section]);
        if (isActive) {
            activeSections.add(section);
            if (checkbox) checkbox.checked = true;
            // Only add tab if it doesn't already exist
            if (!document.getElementById(`${section}-tab`)) addSectionTab(section);
        } else {
            if (checkbox) checkbox.checked = false;
            removeSectionTab(section);
        }
    });
    document.getElementById('metadataTabs').style.display = activeSections.size > 1 ? 'flex' : 'none';

    if (!currentFormData.risk_data_type) updateRiskDataType();
    updatePreview();
    generateForm();
}

/** Restore the draft of a new dataset */
function loadFromStorage() {
    try {
        const savedData = localStorage.getItem(NEW_DRAFT_DATA_KEY);
        const savedSections = localStorage.getItem(NEW_DRAFT_SECTIONS_KEY);
        const sections = savedSections ? JSON.parse(savedSections) : [];
        applyDataset(savedData ? JSON.parse(savedData) : {}, sections);
    } catch (e) {
        console.warn('Could not load saved form data');
        applyDataset({}, []);
    }
}

/** Open what the page address asks for: ?dataset=<id>, or else the new dataset's draft */
async function openInitialDataset() {
    const requestedId = new URLSearchParams(window.location.search).get('dataset');
    if (!currentSchema) {
        if (requestedId !== null) {
            showEditorNotice('danger', 'The dataset could not be opened because the RDLS schema did not load. Check your connection and reload the page.');
        }
        return;
    }

    if (requestedId === null || !(await openCatalogDataset(requestedId))) {
        loadFromStorage();
    }
    storageReady = true;
}

/** Open an existing dataset for editing. Returns false, with a message shown, if it could not be opened. */
async function openCatalogDataset(id) {
    if (!DATASET_ID_PATTERN.test(id)) {
        showEditorNotice('danger', `No dataset was opened: “${id}” is not a valid dataset id. An id has only letters, digits, hyphens and underscores.`);
        return false;
    }

    updateFormStatus('info', 'Opening dataset…');
    showEditorNotice('info', `Opening dataset ${id} from the catalogue…`);

    const draft = readEditDraft(id);
    let file = null;
    let problem = null;
    try {
        file = await fetchCatalogDataset(id);
    } catch (error) {
        console.error('Could not open the dataset:', error);
        problem = error.message;
    }

    if (!file && !draft) {
        showEditorNotice('danger', `No dataset was opened. ${problem}`, [
            { label: 'Try again', action: () => window.location.reload() }
        ]);
        return false;
    }

    editingDataset = {
        id,
        sha: draft ? draft.sha : file.sha,
        original: file ? file.package : null,
        trailingNewline: file ? file.trailingNewline : false
    };
    let isRestored = Boolean(draft);
    if (draft) {
        applyDataset(draft.formData, draft.sections);
        if (file && !differsFromCatalog()) {
            // The catalogue has these changes by now
            localStorage.removeItem(editDraftKey(id));
            editingDataset.sha = file.sha;
            isRestored = false;
        }
    } else {
        // A copy: the form changes it, and the original is compared with the result
        applyDataset(JSON.parse(JSON.stringify(file.package.datasets[0])));
    }
    renderEditMode();

    const discard = { label: 'Discard my changes', action: discardEditDraft };
    if (!file) {
        showEditorNotice('warning', `Your changes were restored, but the catalogue version could not be read. ${problem}`, [discard]);
    } else if (isRestored && draft.sha !== file.sha) {
        showEditorNotice('warning', 'Your changes were restored, but the dataset has since changed in the catalogue. ' +
            'To avoid undoing that change they cannot be published as they are: export them, then discard them here to start from the current version.', [discard]);
    } else if (isRestored) {
        showEditorNotice('info', 'Your changes to this dataset, which are not yet in the catalogue, were restored.', [discard]);
    } else {
        clearEditorNotice();
    }
    return true;
}

// ---- Choosing a dataset by its address in the catalogue ----

let editDatasetRequest = 0;

function showEditDatasetModal() {
    document.getElementById('editDatasetUrl').value = '';
    showEditDatasetFeedback('', '');
    document.getElementById('confirmEditDataset').disabled = false;
    new bootstrap.Modal(document.getElementById('editDatasetModal')).show();
}

function showEditDatasetFeedback(className, message) {
    const feedback = document.getElementById('editDatasetFeedback');
    feedback.className = `mt-2 ${className}`;
    feedback.textContent = message;
}

/** The dataset id in the address of a dataset page, or in an id given as it is */
function parseDatasetReference(text) {
    const reference = text.trim();
    if (!reference) {
        throw new UserFacingError('Paste the URL of the dataset you want to edit.');
    }
    if (DATASET_ID_PATTERN.test(reference)) return reference;

    let url = null;
    try {
        url = new URL(/^https?:\/\//i.test(reference) ? reference : `https://${reference}`);
    } catch (e) {
        // Reported below, as any other text that is not a dataset address
    }
    const isCatalog = url && url.hostname === new URL(CATALOG_URL).hostname;
    const match = isCatalog ? url.pathname.match(/^\/datasets\/([^/]+)\/?$/) : null;
    if (!match || !DATASET_ID_PATTERN.test(match[1])) {
        throw new UserFacingError(`This is not the address of a dataset in the catalog. It should look like ${CATALOG_URL}/datasets/rdls_hzd-example/`);
    }
    return match[1];
}

async function submitEditDataset(event) {
    event.preventDefault();
    const request = ++editDatasetRequest;
    const button = document.getElementById('confirmEditDataset');
    button.disabled = true;
    try {
        const id = parseDatasetReference(document.getElementById('editDatasetUrl').value);
        if (!currentSchema) {
            throw new UserFacingError('The RDLS schema has not loaded yet. Please try again in a moment.');
        }
        if (editingDataset && editingDataset.id === id) {
            throw new UserFacingError('You are already editing this dataset.');
        }

        // Leave the current work only for a dataset that can be opened
        showEditDatasetFeedback('text-muted', 'Looking for the dataset…');
        await fetchCatalogDataset(id);
        if (request !== editDatasetRequest) return; // the window was closed meanwhile
        if (!autoSave()) {
            throw new UserFacingError('Your current work could not be saved in this browser. Export it before you open another dataset.');
        }
        window.location.assign(`${window.location.pathname}?dataset=${id}`);
    } catch (error) {
        if (request !== editDatasetRequest) return;
        console.error('Could not open the dataset:', error);
        showEditDatasetFeedback('text-danger', error instanceof UserFacingError ? error.message : `The dataset could not be opened: ${error.message}`);
        button.disabled = false;
    }
}

function readEditDraft(id) {
    try {
        const draft = JSON.parse(localStorage.getItem(editDraftKey(id)));
        return draft && draft.formData && Array.isArray(draft.sections) ? draft : null;
    } catch (e) {
        console.warn('Could not read the saved changes to this dataset');
        return null;
    }
}

/** Read the file of a dataset from the catalogue's repository */
async function fetchCatalogDataset(id) {
    const url = `https://raw.githubusercontent.com/${TARGET_REPO}/${TARGET_BRANCH}/${DATASETS_PATH}/${id}.json`;
    let bytes;
    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.status === 404) {
            throw new UserFacingError(`There is no dataset with the id ${id} in the catalogue. Ids are case-sensitive.`);
        }
        if (!response.ok) {
            throw new UserFacingError(`The catalogue answered with an error (HTTP ${response.status}) when asked for ${id}. Please try again later.`);
        }
        bytes = await response.arrayBuffer();
    } catch (error) {
        if (error instanceof UserFacingError) throw error;
        throw new UserFacingError(`The dataset ${id} could not be downloaded. Please check your internet connection.`);
    }

    const text = new TextDecoder('utf-8').decode(bytes);
    const { dataset, datasetCount } = parseDatasetText(text);
    if (datasetCount !== 1 || dataset.id !== id) {
        throw new UserFacingError(`The catalogue file of ${id} does not hold exactly that dataset, so it cannot be edited here.`);
    }
    return {
        package: { datasets: [dataset] },
        sha: await gitBlobSha(bytes),
        trailingNewline: text.endsWith('\n')
    };
}

/** The sha that git gives to a file, or null where the browser cannot compute it */
async function gitBlobSha(bytes) {
    if (!window.crypto?.subtle) return null;
    const header = new TextEncoder().encode(`blob ${bytes.byteLength}\0`);
    const content = new Uint8Array(header.length + bytes.byteLength);
    content.set(header);
    content.set(new Uint8Array(bytes), header.length);
    const digest = await window.crypto.subtle.digest('SHA-1', content);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function showEditorNotice(type, message, buttons = []) {
    const notice = document.getElementById('editorNotice');
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type} mb-0`;
    alertBox.style.whiteSpace = 'pre-line';
    alertBox.appendChild(document.createTextNode(message));
    buttons.forEach(({ label, action }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-sm btn-outline-secondary ms-2';
        button.textContent = label;
        button.addEventListener('click', action);
        alertBox.appendChild(button);
    });
    notice.replaceChildren(alertBox);
}

function clearEditorNotice() {
    document.getElementById('editorNotice').replaceChildren();
}

function createFixedIdField(id) {
    const container = document.createElement('div');
    container.className = 'form-field mb-3';
    const label = document.createElement('label');
    label.className = 'form-label';
    label.htmlFor = 'fixedDatasetId';
    label.textContent = 'Dataset ID';
    // No name: the id is not read from the form
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'fixedDatasetId';
    input.className = 'form-control';
    input.readOnly = true;
    input.value = id;
    const help = document.createElement('div');
    help.className = 'form-text';
    help.textContent = 'The id is the address of the dataset in the catalogue, so it cannot be changed.';
    container.append(label, input, help);
    return container;
}

/** Show or hide what tells that an existing dataset is being edited */
function renderEditMode() {
    const banner = document.getElementById('editBanner');
    const isEditing = Boolean(editingDataset);
    banner.style.display = isEditing ? 'block' : 'none';
    banner.replaceChildren();
    document.title = isEditing ? `Editing ${editingDataset.id} - RDLS Metadata Editor` : 'RDLS Metadata Editor';
    document.getElementById('publishGitHub').textContent = isEditing ? 'Publish update to RDL catalog' : 'Publish to RDL catalog';
    document.getElementById('resetForm').textContent = isEditing ? 'Discard My Changes' : 'Reset All Data';
    document.getElementById('publishToGithub').textContent = isEditing ? 'Publish Update' : 'Publish to Catalogue';
    if (!isEditing) return;

    const strong = document.createElement('strong');
    strong.textContent = 'Editing an existing dataset: ';
    const id = document.createElement('code');
    id.textContent = editingDataset.id;
    const view = document.createElement('a');
    view.href = `${CATALOG_URL}/datasets/${editingDataset.id}`;
    view.target = '_blank';
    view.rel = 'noopener noreferrer';
    view.className = 'btn btn-sm btn-outline-secondary ms-3';
    view.textContent = 'View in the catalogue';
    const stop = document.createElement('a');
    stop.href = window.location.pathname;
    stop.className = 'btn btn-sm btn-outline-secondary ms-2';
    stop.textContent = 'Stop editing';
    stop.title = 'Your changes are kept in this browser for when you open this dataset again';
    banner.append(strong, id, view, stop);
}

/** Drop the edits to the dataset and open the version in the catalogue */
function discardEditDraft() {
    if (!confirm(`Discard your changes to ${editingDataset.id} and go back to the version in the catalogue? This cannot be undone.`)) return;
    storageReady = false; // so that nothing is saved again before the page reloads
    localStorage.removeItem(editDraftKey(editingDataset.id));
    window.location.reload();
}

/** Leave edit mode without reloading. The edits stay saved in the browser. */
function stopEditing() {
    editingDataset = null;
    window.history.replaceState(null, '', window.location.pathname);
    clearEditorNotice();
    renderEditMode();
}

function saveProgress() {
    if (!autoSave()) return; // which shows a warning
    updateFormStatus('success', 'Progress saved in this browser');
}

function checkSchemaVersion(data) {
    // Extract the current editor schema version from the loaded schema
    const editorSchemaId = currentSchema.$id;
    const editorVersionMatch = editorSchemaId.match(/\/(\d+__\d+__\d+)\//);
    const editorVersion = editorVersionMatch ? editorVersionMatch[1].replace(/__/g, '.') : 'Unknown';

    // Check if data has links array with schema reference
    if (!data.links || !Array.isArray(data.links) || data.links.length === 0) {
        // No links field - might be an old v0.3 file or incomplete data
        return {
            compatible: false,
            editorVersion: editorVersion,
            dataVersion: null,
            message: 'The JSON file does not contain a schema version reference in the "links" field.\n\nThis file may have been created with an older version of the RDL schema.'
        };
    }

    // Get the schema URL from the first link (which should be the describedby link)
    const schemaLink = data.links.find(link => link.rel === 'describedby');
    if (!schemaLink || !schemaLink.href) {
        return {
            compatible: false,
            editorVersion: editorVersion,
            dataVersion: null,
            message: 'The JSON file does not contain a valid schema reference with rel="describedby" in the "links" field.'
        };
    }

    // Extract version from the schema URL
    const dataVersionMatch = schemaLink.href.match(/\/(\d+__\d+__\d+)\//);
    const dataVersion = dataVersionMatch ? dataVersionMatch[1].replace(/__/g, '.') : null;

    if (!dataVersion) {
        return {
            compatible: false,
            editorVersion: editorVersion,
            dataVersion: schemaLink.href,
            message: 'Could not determine the schema version from the links field.'
        };
    }

    // Compare versions - only accept exact match for major.minor version
    const editorMajorMinor = editorVersion.split('.').slice(0, 2).join('.');
    const dataMajorMinor = dataVersion.split('.').slice(0, 2).join('.');

    if (editorMajorMinor !== dataMajorMinor) {
        return {
            compatible: false,
            editorVersion: editorVersion,
            dataVersion: dataVersion,
            message: `The JSON file was created with RDL schema version ${dataVersion}, but this editor uses version ${editorVersion}.\n\nSchema versions must match (at least major.minor version).`
        };
    }

    // Compatible
    return {
        compatible: true,
        editorVersion: editorVersion,
        dataVersion: dataVersion,
        message: 'Schema versions are compatible.'
    };
}

/**
 * Read a dataset from the text of a JSON file, whether the file was chosen by the
 * user or comes from the catalogue. Throws a UserFacingError if it cannot be used.
 */
function parseDatasetText(text) {
    let loadedData;
    try {
        loadedData = JSON.parse(text);
    } catch (error) {
        throw new UserFacingError('Invalid JSON file: ' + error.message);
    }

    // Check if this is a package with datasets array
    let datasetCount = 1;
    if (loadedData?.datasets && Array.isArray(loadedData.datasets)) {
        datasetCount = loadedData.datasets.length;
        if (datasetCount === 0) {
            throw new UserFacingError('The package contains no datasets.');
        }
        // Load the first dataset
        loadedData = loadedData.datasets[0];
    }
    if (loadedData === null || typeof loadedData !== 'object' || Array.isArray(loadedData)) {
        throw new UserFacingError('The file does not contain a dataset.');
    }

    // Check schema version compatibility
    const versionCheck = checkSchemaVersion(loadedData);
    if (!versionCheck.compatible) {
        throw new UserFacingError(`Schema Version Mismatch\n\n${versionCheck.message}\n\nCurrent editor version: ${versionCheck.editorVersion}\nJSON file version: ${versionCheck.dataVersion || 'Unknown'}\n\nPlease use the appropriate editor version for this file.`);
    }

    return { dataset: loadedData, datasetCount };
}

/** Load a file chosen by the user into the form */
function loadDatasetFile(text) {
    const { dataset, datasetCount } = parseDatasetText(text);
    if (editingDataset && dataset.id === editingDataset.id) {
        if (!confirm(`Replace what is in the form with this version of ${dataset.id}?`)) return;
    } else if (editingDataset) {
        const hasNewDraft = localStorage.getItem(NEW_DRAFT_DATA_KEY) !== null;
        if (!confirm(`This file holds another dataset. Loading it stops the editing of ${editingDataset.id}; your changes to that dataset are kept in this browser.` +
            (hasNewDraft ? '\n\nIt also replaces the draft of a new dataset that is saved in this browser.' : ''))) return;
        if (!autoSave()) return; // the changes must be kept before leaving them
        stopEditing();
    }

    applyDataset(dataset);
    autoSave();
    if (datasetCount > 1) {
        showEditorNotice('info', `The file holds ${datasetCount} datasets. Only the first one was loaded.`);
    } else {
        clearEditorNotice();
    }
}

function loadData() {
    if (!currentSchema) {
        showEditorNotice('warning', 'Please wait for the schema to load before loading a file.');
        return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', async () => {
        if (!input.files[0]) return;
        try {
            loadDatasetFile(await input.files[0].text());
        } catch (error) {
            showEditorNotice('danger', error instanceof UserFacingError ? error.message : 'Invalid JSON file: ' + error.message);
        }
    });
    input.click();
}

function resetForm() {
    if (editingDataset) {
        discardEditDraft();
        return;
    }
    if (!confirm('Are you sure you want to reset all data? This will clear all form fields and cannot be undone.')) return;
    clearEditorNotice();
    applyDataset({}, []);
    localStorage.removeItem(NEW_DRAFT_DATA_KEY);
    localStorage.removeItem(NEW_DRAFT_SECTIONS_KEY);
    updateFormStatus('info', 'All data has been reset');
}
