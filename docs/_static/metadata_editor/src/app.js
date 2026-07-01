import { exportJsonData, exportXmlData } from './export.js';
import { checkGithubAuthState, publishDataToGithub } from './github.js';
import { fieldValidationStatus, validateDatasetRequirements,
         ConditionalValidator } from './validation.js';
import { getEnumValues, processSchemaData, SchemaNavigator,
         resolveReference, resolveReferenceSimple, resolveAllOfSchemas,
         convertValueBySchema, getPropertyFromSchema, checkSchemaVersion,
         getFilteredIMTOptions, updateIMTOptionsForHazard, loadSchema,
         updateSchemaStatus, CodelistManager, currentSchema } from './schema.js';
import { SECTIONS, generateUniqueId, parseMarkdownLinks, getNestedValue,
         setNestedValue, loadCountryNames, autoSave, sanitizeFilename,
         getFilteredFormData, loadJSONData, rebuildActiveSections } from './utils.js';
import { testDependenciesAfterLoad } from './tests.js';


let currentSchemaVersion = '1.0'; // Track current schema version for URL substitutions
let currentFormData = {};
let activeSections = new Set(['general']);
let hasRunFullValidation = false;

// Object editor state
let currentObjectEditor = {
    arrayName: null,
    objectIndex: null,
    objectSchema: null,
    arrayData: null,
    renderCallback: null
};

// Country names cache
let countryNames = {};

const FIELD_DEPENDENCIES = {
    // v1.0: hazard_primary/hazard_secondary are now Hazard objects (not strings)
    // So process and intensity_measure are nested within these objects
    'hazard_primary.process': 'hazard_primary.type',
    'hazard_primary.intensity_measure': 'hazard_primary.type',
    'hazard_secondary.process': 'hazard_secondary.type',
    'hazard_secondary.intensity_measure': 'hazard_secondary.type',

    // v1.0: loss.hazard is now a HazardWithTrigger object (which extends Hazard)
    'hazard.process': 'hazard.type',
    'hazard.intensity_measure': 'hazard.type',

    // Hazard section (hazards array)
    'hazards.process': 'hazards.type',
    'hazards.intensity_measure': 'hazards.type',

    // Modal and inline context dependencies (without full path prefix)
    'intensity_measure': 'type', // For inline/modal hazard objects
    'process': 'type', // For inline/modal hazard objects

    // v1.0: Measurement object - unit and valuation_year fields depend on quantity_kind
    'unit': 'quantity_kind',
    'measurement.unit': 'measurement.quantity_kind',
    'valuation_year': 'quantity_kind',
    'measurement.valuation_year': 'measurement.quantity_kind'
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

// ================================
// MAIN APPLICATION LOGIC
// ================================

// Direct currency monitoring system removed - unified system now handles everything

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('[INIT] DOMContentLoaded fired');
    setupEventListeners();
    console.log('[INIT] After setupEventListeners');
    // Auto-load v1.0 schema
    currentSchemaVersion = loadSchema('1.0', clearFormData, fieldValidationStatus, generateForm);
    loadFromStorage();
    loadCountryNames();
    updateRiskDataType();
});

function clearFormData() {
    currentFormData = {};
}

function setupEventListeners() {
    console.log('[SETUP] Setting up event listeners...');
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
            updateFormData();
            updateRiskDataType();
            generateForm();
        });
    });

    // File upload (custom schema UI may be hidden for public release)
    const schemaDropZone = document.getElementById('schemaDropZone');
    const schemaFileInput = document.getElementById('schemaFile');
    if (schemaDropZone && schemaFileInput) {
        schemaDropZone.addEventListener('click', () => schemaFileInput.click());
        schemaFileInput.addEventListener('change', handleSchemaFile);
        setupDragAndDrop();
    }

    // Buttons
    document.getElementById('exportJson').addEventListener('click', exportJson);
    document.getElementById('exportXml').addEventListener('click', exportXml);
    document.getElementById('saveProgress').addEventListener('click', saveProgress);
    document.getElementById('loadData').addEventListener('click', loadData);
    document.getElementById('validateForm').addEventListener('click', validateForm);
    document.getElementById('resetForm').addEventListener('click', resetForm);
    document.getElementById('publishGitHub').addEventListener('click', openGithubConfig);

    // GitHub modal event listeners
    document.getElementById('publishToGithub').addEventListener('click', publishToGithub);

    // Object editor modal
    const saveObjBtn = document.getElementById('saveObjectBtn');
    console.log('[SETUP] Save Object Button found:', !!saveObjBtn);
    if (saveObjBtn) {
        saveObjBtn.addEventListener('click', saveCurrentObject);
        console.log('[SETUP] Save Object Button listener attached');
    } else {
        console.error('[SETUP] Save Object Button NOT FOUND!');
    }
}

function setupDragAndDrop() {
    const dropZone = document.getElementById('schemaDropZone');
    if (!dropZone) return;
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('schemaFile').files = files;
            handleSchemaFile({target: {files: files}});
        }
    });
}

function updateFormData() {
    const allForms = document.querySelectorAll('#metadataTabContent form');
    const newFormData = {};

    allForms.forEach(form => {
        const formData = new FormData(form);

        for (let [key, value] of formData.entries()) {
            if (!key.includes('_0') && !key.includes('_1') && !key.includes('_2') && !key.includes('_3')) {
                // Convert to proper type based on schema
                const convertedValue = convertValueBySchema(key, value);
                setNestedValue(newFormData, key, convertedValue);
            }
        }

        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            setNestedValue(newFormData, cb.name, cb.checked);
        });

        const coordFields = form.querySelectorAll('input[name*="_0"], input[name*="_1"], input[name*="_2"], input[name*="_3"]');
        const coordGroups = {};
        coordFields.forEach(input => {
            const match = input.name.match(/(.+)_(\d+)$/);
            if (match) {
                const fieldName = match[1];
                const index = parseInt(match[2]);
                if (!coordGroups[fieldName]) coordGroups[fieldName] = [];
                coordGroups[fieldName][index] = input.value === '' ? null : parseFloat(input.value);
            }
        });

        Object.entries(coordGroups).forEach(([fieldName, values]) => {
            // Only set the coordinate array if user has specified at least one non-empty value
            const hasValue = values.some(v => v !== null && !isNaN(v));
            if (hasValue) {
                // Replace nulls with 0 only if some values were specified
                const filledValues = values.map(v => v === null ? 0 : v);
                setNestedValue(newFormData, fieldName, filledValues);
            }
            // If no values specified, don't add to newFormData (will be empty in output)
        });
    });

    // Preserve existing array-type fields that shouldn't be overwritten by form data
    const arrayFields = ['resources', 'sources', 'attributions', 'referenced_by', 'exposure'];
    arrayFields.forEach(fieldName => {
        if (currentFormData[fieldName] && Array.isArray(currentFormData[fieldName])) {
            newFormData[fieldName] = currentFormData[fieldName];
        }
    });

    // Preserve spatial.countries array if it exists
    if (currentFormData.spatial?.countries && Array.isArray(currentFormData.spatial.countries)) {
        if (!newFormData.spatial) newFormData.spatial = {};
        newFormData.spatial.countries = currentFormData.spatial.countries;
    }

    // Merge form data, but preserve array structure for known array fields
    Object.keys(newFormData).forEach(key => {
        if (currentSchema && currentSchema.properties && currentSchema.properties[key]) {
            const fieldSchema = currentSchema.properties[key];
            if (fieldSchema.type === 'array') {
                if (Array.isArray(newFormData[key]) || !currentFormData[key]) {
                    currentFormData[key] = newFormData[key];
                } else if (!Array.isArray(newFormData[key]) && Array.isArray(currentFormData[key])) {
                    console.warn(`Ignoring non-array value for array field ${key}:`, typeof newFormData[key], newFormData[key]);
                }
            } else if (fieldSchema.type === 'object' && key === 'spatial') {
                // Special handling for spatial object to preserve nested arrays
                if (!currentFormData[key]) currentFormData[key] = {};
                // Merge spatial properties but preserve the countries array
                Object.keys(newFormData[key] || {}).forEach(spatialKey => {
                    if (spatialKey !== 'countries') {
                        currentFormData[key][spatialKey] = newFormData[key][spatialKey];
                    }
                });
                // Remove stale flat coord keys that should only exist as arrays
                ['bbox_0','bbox_1','bbox_2','bbox_3','centroid_0','centroid_1'].forEach(k => {
                    delete currentFormData[key][k];
                });
                // Keep the countries array from preservation above
            } else {
                currentFormData[key] = newFormData[key];
            }
        } else {
            currentFormData[key] = newFormData[key];
        }
    });

    // Always purge flat coord keys from currentFormData (root and spatial),
    // regardless of whether the spatial merge branch ran.
    const _flatCoordKeys = ['bbox_0','bbox_1','bbox_2','bbox_3','centroid_0','centroid_1'];
    _flatCoordKeys.forEach(k => delete currentFormData[k]);
    if (currentFormData.spatial) {
        _flatCoordKeys.forEach(k => delete currentFormData.spatial[k]);
    }

    updatePreview();
    autoSave(currentFormData, activeSections);

    // Trigger dataset-level validation to keep publish button state updated
    validateDatasetRequirements(currentFormData, activeSections);
    updateValidationDisplay();
}

function createObjectSummaryCard(objectData, index, arrayName, arrayProperty, arrayData, renderCallback) {
    const card = document.createElement('div');
    card.className = 'object-summary-card';

    let objectSchema = arrayProperty.items;
    if (objectSchema.$ref) {
        objectSchema = resolveReference(objectSchema.$ref);
    } else if (objectSchema.allOf) {
        // Resolve allOf schemas - merge all schemas in the allOf array
        objectSchema = resolveAllOfSchemas(objectSchema);
    }

    const title = document.createElement('div');
    title.className = 'object-summary-title';

    let summaryText = `${arrayProperty.title || arrayName} ${index + 1}`;
    if (objectData) {
        if ((arrayName.includes('metric') || arrayName.includes('cost')) && objectData.dimension) {
            summaryText = `${objectData.dimension.charAt(0).toUpperCase() + objectData.dimension.slice(1)} ${arrayProperty.title || arrayName}`;
        } else if (arrayName.includes('exposure') && objectData.category) {
            summaryText = `${objectData.category.charAt(0).toUpperCase() + objectData.category.slice(1)} Exposure`;
        } else if (arrayName.includes('event_sets') && objectData.hazards && objectData.hazards.length > 0) {
            const hazard = objectData.hazards[0];
            let hazardDisplay = hazard.type ? hazard.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Hazard';
            if (hazard.processes && hazard.processes.length > 0) {
                const process = hazard.processes[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                hazardDisplay += ` / ${process}`;
            }
            summaryText = hazardDisplay;
        } else if (arrayName.includes('losses') && objectData.hazard && objectData.hazard.type) {
            summaryText = objectData.hazard.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Loss';
        } else if (arrayName.includes('socio_economic') && objectData.indicator_name) {
            summaryText = objectData.indicator_name;
        } else if (objectData.name) {
            summaryText = objectData.name;
        } else if (objectData.title) {
            summaryText = objectData.title;
        } else if (objectData.id) {
            summaryText = objectData.id;
        }
    }
    title.textContent = summaryText;

    const details = document.createElement('div');
    details.className = 'object-summary-details';

    if (objectData) {
        let keyFields = [];

        if (arrayName.includes('exposure')) {
            // v1.0: taxonomy field removed from Exposure_item
            // v1.0: Show category and asset_type instead
            if (objectData.category) {
                keyFields.push(`category: ${objectData.category}`);
            }
            if (objectData.asset_type && objectData.asset_type.name) {
                keyFields.push(`asset type: ${objectData.asset_type.name}`);
            }
            if (objectData.metrics && objectData.metrics.length > 0) {
                const metricCount = objectData.metrics.length;
                keyFields.push(`metrics: ${metricCount} metric${metricCount !== 1 ? 's' : ''}`);
            }
        }

        if (arrayName.includes('metric') && objectData.quantity_kind) {
            keyFields.push(`quantity: ${objectData.quantity_kind}`);
        }

        if (arrayName.includes('cost') && objectData.unit) {
            keyFields.push(`unit: ${objectData.unit}`);
        }

        if (arrayName.includes('event_sets')) {
            if (objectData.analysis_type) {
                keyFields.push(`analysis: ${objectData.analysis_type}`);
            }
            if (objectData.event_count) {
                keyFields.push(`events: ${objectData.event_count}`);
            }
            if (objectData.occurrence_range) {
                keyFields.push(`range: ${objectData.occurrence_range}`);
            }
        }

        if (arrayName.includes('losses')) {
            if (objectData.hazard_process) {
                keyFields.push(`process: ${objectData.hazard_process.replace(/_/g, ' ')}`);
            }
            if (objectData.category) {
                keyFields.push(`category: ${objectData.category}`);
            }
            if (objectData.type) {
                keyFields.push(`type: ${objectData.type}`);
            }
        }

        // Display other simple string fields
        const otherFields = ['description', 'format', 'role', 'url'].filter(field =>
            objectData[field] && !keyFields.some(kf => kf.includes(field))
        );
        keyFields = keyFields.concat(otherFields.map(field => `${field}: ${objectData[field]}`));

        if (keyFields.length > 0) {
            details.textContent = keyFields.join(' • ');
        } else {
            details.textContent = 'Click Edit to add details';
        }
    } else {
        details.textContent = 'New object - click Edit to configure';
    }

    const actions = document.createElement('div');
    actions.className = 'd-flex gap-2 mt-2';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-outline-primary btn-sm';
    editBtn.textContent = '✏️ Edit';
    editBtn.addEventListener('click', () => {
        openObjectEditor(arrayName, index, arrayProperty.items, arrayData, renderCallback);
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-danger btn-sm';
    removeBtn.textContent = '🗑️ Remove';
    removeBtn.addEventListener('click', () => {
        if (confirm(`Remove this ${arrayProperty.title || arrayName}?`)) {
            const fullArrayData = getNestedValue(currentFormData, arrayName) || [];
            fullArrayData.splice(index, 1);
            setNestedValue(currentFormData, arrayName, fullArrayData);
            updateFormData();
            generateForm();
        }
    });

    actions.appendChild(editBtn);
    actions.appendChild(removeBtn);

    card.appendChild(title);
    card.appendChild(details);
    card.appendChild(actions);

    return card;
}

function saveCurrentObject() {
    console.log('[SAVE OBJECT] Save button clicked');
    const form = document.getElementById('objectEditorForm');
    const formData = new FormData(form);
    console.log('[SAVE OBJECT] Form data collected');

    // v1.0: Handle root-level Entity objects (publisher, creator, contact_point)
    if (currentObjectEditor.isRootEntity) {
        const entityData = {};

        // Extract form data for Entity fields (name, email, url, affiliation)
        for (const [key, value] of formData.entries()) {
            const cleanKey = key.replace('modal_', '');
            if (value && value !== '') {
                // Handle nested fields like affiliation.name, affiliation.url
                if (cleanKey.includes('.')) {
                    const parts = cleanKey.split('.');
                    const parentKey = parts[0];
                    const childKey = parts[1];

                    // Initialize nested object if it doesn't exist
                    if (!entityData[parentKey]) {
                        entityData[parentKey] = {};
                    }

                    // Set the nested property
                    entityData[parentKey][childKey] = value;
                } else {
                    // Simple property
                    entityData[cleanKey] = value;
                }
            }
        }

        // Save to root level
        currentFormData[currentObjectEditor.fieldName] = entityData;

        // Re-render the attribution list
        if (currentObjectEditor.renderCallback) {
            currentObjectEditor.renderCallback();
        }

        // Close modal and update
        const modal = bootstrap.Modal.getInstance(document.getElementById('objectEditorModal'));
        modal.hide();
        updatePreview();
        updateFormStatus('success', `${currentObjectEditor.fieldName} saved successfully`);
        return;
    }

    // Start with the existing object data to preserve arrays that were modified
    let objectData = {};

    // First, try to get data from the live arrayData reference used by inline editors
    // This is more reliable than currentFormData for modal editing
    const fullArrayData = currentObjectEditor.arrayData || getNestedValue(currentFormData, currentObjectEditor.arrayName) || [];

    if (typeof currentObjectEditor.objectIndex === 'number' && fullArrayData[currentObjectEditor.objectIndex]) {
        // Copy existing object data, including any arrays that were modified in the modal
        objectData = JSON.parse(JSON.stringify(fullArrayData[currentObjectEditor.objectIndex]));
    }

    // Now we need to get the current state of any array fields that were edited in the modal
    // Find all array containers in the modal and extract their current data
    const arrayContainers = document.querySelectorAll('#objectEditorFields .array-field');
    arrayContainers.forEach(container => {
        // Skip array containers that are nested inside inline editor cards
        // These will be handled when processing the parent card
        const isNestedInCard = container.closest('.card[data-item-index]');
        if (isNestedInCard) {
            console.log(`[SAVE ARRAY] Skipping nested array container inside card`);
            return;
        }

        const containerId = container.querySelector('[id$="_items"]')?.id;
        if (containerId) {
            const fieldName = containerId.replace('modal_', '').replace('_items', '');

            // Check if this is a simple array (strings, numbers) or object array
            // IMPORTANT: Only select direct children to avoid selecting nested array cards
            const cards = Array.from(container.querySelectorAll('.card[data-item-index]')).filter(card =>
                card.parentElement === container || card.parentElement?.parentElement === container
            );
            const simpleItems = container.querySelectorAll('.array-item');

            if (cards.length > 0) {
                // Object array - handle as before
                // Get the existing array data from the first card's _arrayDataRef (live reference)
                // This is more reliable than objectData[fieldName] for unsaved objects
                const firstCard = cards[0];
                const liveArrayData = firstCard?._arrayDataRef;
                const existingArrayData = liveArrayData || objectData[fieldName] || [];
                const arrayData = [];

                console.log(`[SAVE ARRAY ${fieldName}] cards=${cards.length}, existing=${existingArrayData.length}`);

            cards.forEach((card, index) => {
                // Start with existing item data to preserve inline editor updates
                const existingItem = existingArrayData[index];
                const item = existingItem ? JSON.parse(JSON.stringify(existingItem)) : {};

                const fieldDivs = card.querySelectorAll('[data-field-name]');

                fieldDivs.forEach(fieldDiv => {
                    const fieldNameAttr = fieldDiv.getAttribute('data-field-name');
                    if (fieldNameAttr && fieldNameAttr !== 'id') {
                        // Get all inputs in this field (handles nested objects with multiple inputs)
                        const inputs = fieldDiv.querySelectorAll('input, select, textarea');

                        if (inputs.length > 0) {
                            // For each input, use its name/id to determine the exact field path
                            inputs.forEach(input => {
                                // Get the full field path from the input's name or id
                                const inputName = (input.name || input.id).replace('modal_', '');

                                if (inputName && inputName !== 'id') {
                                    const rawValue = input.type === 'checkbox' ? input.checked : input.value;

                                    // Only update if the value is not empty or if it's a checkbox
                                    // This preserves inline editor data for fields not in the DOM or that are empty
                                    if (input.type === 'checkbox' || rawValue !== '') {
                                        // Convert to proper type based on schema (only for non-checkbox fields)
                                        const convertedValue = input.type === 'checkbox' ? rawValue : convertValueBySchema(inputName, rawValue);

                                        // Use setNestedValue to handle nested properties like 'hazard.type' or 'occurrence.empirical.temporal.start'
                                        if (inputName.includes('.')) {
                                            setNestedValue(item, inputName, convertedValue);
                                        } else {
                                            item[inputName] = convertedValue;
                                        }
                                    }
                                }
                            });
                        }
                    }
                });

                // Handle bbox and centroid fields specially - they have names like fieldName_0, fieldName_1, etc.
                const coordInputs = card.querySelectorAll('input[name$="_0"], input[name$="_1"], input[name$="_2"], input[name$="_3"]');
                const coordGroups = {};
                coordInputs.forEach(input => {
                    const match = input.name.match(/(.+)_(\d+)$/);
                    if (match) {
                        const fieldName = match[1].replace('modal_', '');
                        const index = parseInt(match[2]);
                        if (!coordGroups[fieldName]) coordGroups[fieldName] = [];
                        coordGroups[fieldName][index] = parseFloat(input.value) || 0;
                    }
                });

                // Add bbox/centroid arrays to the item
                Object.entries(coordGroups).forEach(([fieldName, values]) => {
                    item[fieldName] = values;
                });

                // Process nested array containers within this card (e.g., disaster_identifiers within an event)
                const nestedArrayContainers = card.querySelectorAll('.array-field');
                nestedArrayContainers.forEach(nestedContainer => {
                    const nestedContainerId = nestedContainer.querySelector('[id$="_items"]')?.id;
                    if (nestedContainerId) {
                        const nestedFieldName = nestedContainerId.replace('modal_', '').replace('_items', '');
                        console.log(`[SAVE NESTED ARRAY] Processing ${nestedFieldName} inside ${fieldName}[${index}]`);

                        // Get the cards from this nested array
                        const nestedCards = Array.from(nestedContainer.querySelectorAll('.card[data-item-index]')).filter(c =>
                            c.parentElement === nestedContainer || c.parentElement?.parentElement === nestedContainer
                        );

                        if (nestedCards.length > 0) {
                            const nestedArrayData = [];
                            const nestedLiveData = nestedCards[0]?._arrayDataRef;

                            nestedCards.forEach((nestedCard, nestedIndex) => {
                                const nestedItem = nestedLiveData && nestedLiveData[nestedIndex] ?
                                    JSON.parse(JSON.stringify(nestedLiveData[nestedIndex])) : {};

                                // Capture all inputs in the nested card
                                const nestedInputs = nestedCard.querySelectorAll('input, select, textarea');
                                nestedInputs.forEach(input => {
                                    const inputName = (input.name || input.id).replace('modal_', '');
                                    if (inputName && inputName !== 'id') {
                                        const rawValue = input.type === 'checkbox' ? input.checked : input.value;
                                        if (input.type === 'checkbox' || rawValue !== '') {
                                            let convertedValue = input.type === 'checkbox' ? rawValue : convertValueBySchema(inputName, rawValue);

                                            // Ensure we're not saving objects for string fields (e.g., scheme)
                                            if (typeof convertedValue === 'object' && convertedValue !== null && !Array.isArray(convertedValue)) {
                                                convertedValue = convertedValue.code || convertedValue.title || String(convertedValue);
                                                console.log(`[SAVE NESTED] Field ${inputName} had object value, extracted string: ${convertedValue}`);
                                            }

                                            if (inputName.includes('.')) {
                                                setNestedValue(nestedItem, inputName, convertedValue);
                                            } else {
                                                nestedItem[inputName] = convertedValue;
                                            }
                                        }
                                    }
                                });

                                // Preserve ID
                                if (!nestedItem.id && nestedLiveData && nestedLiveData[nestedIndex]?.id) {
                                    nestedItem.id = nestedLiveData[nestedIndex].id;
                                }
                                // Only auto-generate ID for non-Classification objects
                                // Classification objects (like disaster_identifiers) require user-provided id
                                const isClassificationArray = nestedFieldName === 'disaster_identifiers' || nestedFieldName.endsWith('.disaster_identifiers');
                                if (!nestedItem.id && !isClassificationArray) {
                                    nestedItem.id = generateUniqueId('item');
                                }

                                // Skip empty Classification objects (no id means user didn't fill it in)
                                if (isClassificationArray && !nestedItem.id) {
                                    console.log(`[SAVE NESTED ARRAY] Skipping empty Classification object (no id provided)`);
                                } else {
                                    nestedArrayData.push(nestedItem);
                                }
                            });

                            item[nestedFieldName] = nestedArrayData;
                            console.log(`[SAVE NESTED ARRAY] Saved ${nestedArrayData.length} items to ${fieldName}[${index}].${nestedFieldName}`);
                        }
                    }
                });

                // Preserve the ID if it exists
                if (objectData[fieldName] && objectData[fieldName][index] && objectData[fieldName][index].id) {
                    item.id = objectData[fieldName][index].id;
                } else if (existingArrayData[index] && existingArrayData[index].id) {
                    // Use ID from existing array data (handles inline editor case)
                    item.id = existingArrayData[index].id;
                } else {
                    // Generate a new ID if needed
                    let idPrefix = 'item';
                    if (fieldName === 'metrics') idPrefix = 'metric';
                    else if (fieldName === 'cost') idPrefix = 'cost';
                    else if (fieldName === 'hazards') idPrefix = 'hazard';
                    else if (fieldName === 'events') idPrefix = 'event';
                    item.id = generateUniqueId(idPrefix);
                }

                arrayData.push(item);
            });

                // Update the object data with the current array state
                objectData[fieldName] = arrayData;
            } else if (simpleItems.length > 0) {
                // Simple array (strings, numbers, etc.)
                const arrayData = [];
                simpleItems.forEach(itemDiv => {
                    const input = itemDiv.querySelector('input, select, textarea');
                    if (input) {
                        const value = input.type === 'checkbox' ? input.checked : input.value;
                        if (value !== '' && value !== null && value !== undefined) {
                            arrayData.push(value);
                        }
                    }
                });
                objectData[fieldName] = arrayData;
            }
        }
    });

    // Collect regular form data (this will override any simple field values)
    for (let [key, value] of formData.entries()) {
        const fieldName = key.replace('modal_', '');

        // Convert to proper type based on schema
        const convertedValue = convertValueBySchema(fieldName, value);

        if (fieldName.includes('.')) {
            setNestedValue(objectData, fieldName, convertedValue);
        } else {
            // Don't override array fields that we just processed above
            const isArrayField = document.querySelector(`#objectEditorFields .array-field [id="modal_${fieldName}_items"]`);
            if (!isArrayField) {
                objectData[fieldName] = convertedValue;
            }
        }
    }

    // Collect checkbox data
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        const fieldName = cb.name.replace('modal_', '');
        if (fieldName.includes('.')) {
            setNestedValue(objectData, fieldName, cb.checked);
        } else {
            // Don't override array fields that we just processed above
            const isArrayField = document.querySelector(`#objectEditorFields .array-field [id="modal_${fieldName}_items"]`);
            if (!isArrayField) {
                objectData[fieldName] = cb.checked;
            }
        }
    });

    // Handle bbox and centroid fields in the main form (not inside array containers)
    const coordInputs = form.querySelectorAll('input[name$="_0"], input[name$="_1"], input[name$="_2"], input[name$="_3"]');
    const coordGroups = {};
    coordInputs.forEach(input => {
        // Skip if this coordinate input is inside an array container (already handled above)
        const isInArrayContainer = input.closest('.array-field');
        if (!isInArrayContainer) {
            const match = input.name.match(/(.+)_(\d+)$/);
            if (match) {
                const fieldName = match[1].replace('modal_', '');
                const index = parseInt(match[2]);
                if (!coordGroups[fieldName]) coordGroups[fieldName] = [];
                coordGroups[fieldName][index] = input.value === '' ? null : parseFloat(input.value);
            }
        }
    });

    // Add bbox/centroid arrays to the object data
    Object.entries(coordGroups).forEach(([fieldName, values]) => {
        // Only set the coordinate array if user has specified at least one non-empty value
        const hasValue = values.some(v => v !== null && !isNaN(v));
        if (hasValue) {
            // Replace nulls with 0 only if some values were specified
            const filledValues = values.map(v => v === null ? 0 : v);
            if (fieldName.includes('.')) {
                setNestedValue(objectData, fieldName, filledValues);
            } else {
                objectData[fieldName] = filledValues;
            }
        }
        // If no values specified, don't add to objectData (will be empty in output)
    });

    // Use the arrayData reference that was passed when opening the modal
    let fullArrayDataUpdated = currentObjectEditor.arrayData;
    console.log(`[SAVE MODAL ${currentObjectEditor.arrayName}] index=${currentObjectEditor.objectIndex}, array.length=${fullArrayDataUpdated?.length}`);

    if (!fullArrayDataUpdated) {
        fullArrayDataUpdated = getNestedValue(currentFormData, currentObjectEditor.arrayName) || [];
        setNestedValue(currentFormData, currentObjectEditor.arrayName, fullArrayDataUpdated);
        console.log(`[SAVE MODAL] Fallback: initialized empty array`);
    }

    // Ensure the object has an ID
    if (currentObjectEditor.objectIndex >= fullArrayDataUpdated.length) {
        let idPrefix = 'item';
        if (currentObjectEditor.arrayName === 'resources') idPrefix = 'resource';
        else if (currentObjectEditor.arrayName === 'sources') idPrefix = 'source';
        else if (currentObjectEditor.arrayName === 'attributions') idPrefix = 'attribution';
        else if (currentObjectEditor.arrayName === 'referenced_by') idPrefix = 'reference';
        else if (currentObjectEditor.arrayName.includes('event_sets')) idPrefix = 'event_set';
        else if (currentObjectEditor.arrayName.includes('losses')) idPrefix = 'loss';
        else if (currentObjectEditor.arrayName.includes('events')) idPrefix = 'event';

        objectData.id = generateUniqueId(idPrefix);
    } else {
        const existingObject = fullArrayDataUpdated[currentObjectEditor.objectIndex];
        if (existingObject && existingObject.id) {
            objectData.id = existingObject.id;
        } else {
            let idPrefix = 'item';
            if (currentObjectEditor.arrayName === 'resources') idPrefix = 'resource';
            else if (currentObjectEditor.arrayName === 'sources') idPrefix = 'source';
            else if (currentObjectEditor.arrayName === 'attributions') idPrefix = 'attribution';
            else if (currentObjectEditor.arrayName === 'referenced_by') idPrefix = 'reference';
            else if (currentObjectEditor.arrayName.includes('event_sets')) idPrefix = 'event_set';
            else if (currentObjectEditor.arrayName.includes('losses')) idPrefix = 'loss';
            else if (currentObjectEditor.arrayName.includes('events')) idPrefix = 'event';

            objectData.id = generateUniqueId(idPrefix);
        }
    }

    // Clean up ONLY nested objects within events (hazard, occurrence)
    // Don't remove events themselves or other important structures
    function cleanupEmptyNestedObjects(obj, depth = 0) {
        if (typeof obj !== 'object' || obj === null) return obj;

        // Don't process arrays at top level - we want to preserve events array
        if (Array.isArray(obj)) {
            // Clean each item in the array but keep the array itself
            obj.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                    cleanupEmptyNestedObjects(item, depth + 1);
                }
            });
            return obj;
        }

        // Clean nested objects and properties
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (Array.isArray(obj[key])) {
                    // Recursively process arrays
                    cleanupEmptyNestedObjects(obj[key], depth + 1);
                } else {
                    // Check if this nested object is empty (only has id or completely empty)
                    const nestedKeys = Object.keys(obj[key]);
                    const isEmpty = nestedKeys.length === 0 ||
                                  (nestedKeys.length === 1 && nestedKeys[0] === 'id') ||
                                  nestedKeys.every(k => {
                                      if (k === 'id') return true;
                                      const val = obj[key][k];
                                      return val === undefined || val === null || val === '' ||
                                             (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0);
                                  });

                    if (isEmpty) {
                        // Remove this empty nested object
                        delete obj[key];
                    } else {
                        // Recursively clean this nested object
                        cleanupEmptyNestedObjects(obj[key], depth + 1);
                    }
                }
            }
        }

        return obj;
    }

    // Apply cleanup - this will remove empty hazard/occurrence objects but preserve events
    cleanupEmptyNestedObjects(objectData);

    // Update the array
    if (currentObjectEditor.objectIndex >= fullArrayDataUpdated.length) {
        fullArrayDataUpdated.push(objectData);
    } else {
        fullArrayDataUpdated[currentObjectEditor.objectIndex] = objectData;
    }

    setNestedValue(currentFormData, currentObjectEditor.arrayName, fullArrayDataUpdated);
    updatePreview();

    // Call the render callback to update the array display
    if (currentObjectEditor.renderCallback) {
        console.log(`[SAVE MODAL] Calling renderCallback`);
        currentObjectEditor.renderCallback();
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('objectEditorModal'));
    modal.hide();

    updateFormStatus('success', 'Object saved successfully');
}

function updatePreview() {
    const filteredData = getFilteredFormData(currentFormData, activeSections);

    // v1.0 schema
    const schemaVersion = '1__0__0';
    const schemaUrl = `https://docs.riskdatalibrary.org/en/${schemaVersion}/rdls_schema.json`;

    // Ensure links array exists and has the schema reference
    if (!filteredData.links) {
        filteredData.links = [];
    }

    // Check if describedby link already exists
    const hasDescribedBy = filteredData.links.some(link => link.rel === 'describedby');

    if (!hasDescribedBy) {
        // Add schema reference as first link with rel="describedby"
        filteredData.links.unshift({
            href: schemaUrl,
            rel: 'describedby'
        });
    } else {
        // Update existing describedby link to current schema version
        const describedByIndex = filteredData.links.findIndex(link => link.rel === 'describedby');
        filteredData.links[describedByIndex].href = schemaUrl;
    }

    // Show preview as a complete package (matching export format)
    const previewData = {
        datasets: [filteredData]
    };

    document.getElementById('outputPreview').textContent = JSON.stringify(previewData, null, 2);
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

function validateForm() {
    updateFormData();

    // First, validate individual field inputs
    const allInputs = document.querySelectorAll('#metadataTabContent input, #metadataTabContent select, #metadataTabContent textarea');
    allInputs.forEach(input => {
        if (input.name) {
            const property = getPropertyFromSchema(input.name);
            if (property) {
                const value = input.type === 'checkbox' ? input.checked : input.value;
                const context = new FieldCreationContext('normal');
                context.validateField(input.name, value, property);
            }
        }
    });

    // Add complex dataset-level validations
    validateDatasetRequirements(currentFormData, activeSections);

    const totalFields = fieldValidationStatus.size;
    const validFields = Array.from(fieldValidationStatus.values()).filter(status => status.isValid).length;

    // Mark that full validation has been run
    hasRunFullValidation = true;

    // Update the validation display (including publish button state)
    updateValidationDisplay();

    if (validFields === totalFields && totalFields > 0) {
        updateFormStatus('success', 'RDLS Compliant ✓');
        alert('✅ All fields are valid! Your metadata is RDLS compliant.');
    } else {
        const invalidFields = Array.from(fieldValidationStatus.entries())
            .filter(([name, status]) => !status.isValid)
            .map(([name, status]) => `${name}: ${status.errorMessage}`);
        updateFormStatus('warning', `${validFields}/${totalFields} valid`);
        alert(`⚠️ ${invalidFields.length} field(s) need attention:\n\n• ${invalidFields.join('\n• ')}`);
    }
}

function loadFromStorage() {
    const savedData = localStorage.getItem('rdlsEditor_formData');
    const savedSections = localStorage.getItem('rdlsEditor_activeSections');
    
    if (savedData) {
        try {
            currentFormData = JSON.parse(savedData);
            updatePreview();
        } catch (e) {
            console.warn('Could not load saved form data');
        }
    }
    
    if (savedSections) {
        try {
            const sections = JSON.parse(savedSections);
            sections.forEach(section => {
                if (section !== 'general') {
                    activeSections.add(section);
                    document.getElementById(`${section}Check`).checked = true;
                    addSectionTab(section);
                }
            });
        } catch (e) {
            console.warn('Could not load saved sections');
        }
    }
}

function saveProgress() {
    autoSave(currentFormData, activeSections);
    alert('Progress saved to browser storage!');
}


function loadData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {

                    currentFormData = loadJSONData(event.target.result, checkSchemaVersion);

                    // Activate sections based on loaded data
                    hasRunFullValidation = rebuildActiveSections(currentFormData,
                                                                 activeSections,
                                                                 fieldValidationStatus,
                                                                 addSectionTab,
                                                                 removeSectionTab);

                    // Reset validation flag when loading new data
                    hasRunFullValidation = false;
                    fieldValidationStatus.clear();

                    // Activate sections based on loaded data
                    activeSections.clear();
                    activeSections.add('general');

                    SECTIONS.forEach(section => {
                        const checkbox = document.getElementById(`${section}Check`);
                        if (currentFormData[section]) {
                            activeSections.add(section);
                            if (checkbox) {
                                checkbox.checked = true;
                            }
                            // Only add tab if it doesn't already exist
                            const existingTab = document.getElementById(`${section}-tab`);
                            if (!existingTab) {
                                addSectionTab(section);
                            }
                        } else {
                            if (checkbox) {
                                checkbox.checked = false;
                            }
                            removeSectionTab(section);
                        }
                    });

                    updatePreview();
                    generateForm();
                } catch (error) {
                    alert('Invalid JSON file: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function resetForm() {
    if (confirm('Are you sure you want to reset all data? This will clear all form fields and cannot be undone.')) {
        // Clear form data
        currentFormData = {};
        
        // Clear validation status
        fieldValidationStatus.clear();
        hasRunFullValidation = false;

        // Reset active sections to just general
        activeSections.clear();
        activeSections.add('general');
        
        // Uncheck all section checkboxes except general
        SECTIONS.forEach(section => {
            const checkbox = document.getElementById(`${section}Check`);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
        
        // Remove all section tabs except general
        SECTIONS.forEach(section => {
            removeSectionTab(section);
        });
        
        // Hide tabs if only general is active
        document.getElementById('metadataTabs').style.display = 'none';
        
        // Clear localStorage
        localStorage.removeItem('rdlsEditor_formData');
        localStorage.removeItem('rdlsEditor_activeSections');
        
        // Clear preview
        document.getElementById('outputPreview').textContent = JSON.stringify({
            "message": "Refactored RDLS metadata will appear here..."
        }, null, 2);
        
        // Reset validation display
        document.getElementById('validFieldCount').textContent = '0';
        document.getElementById('totalFieldCount').textContent = '0';
        document.getElementById('validationProgress').style.width = '0%';
        document.getElementById('overallValidation').className = 'badge bg-secondary';
        document.getElementById('overallValidation').textContent = 'Not validated';

        // Reset GitHub publish button
        document.getElementById('publishGitHub').disabled = true;
        document.getElementById('publishGitHub').title = 'Run validation first to enable publishing';

        
        // Regenerate form
        if (currentSchema) {
            generateForm();
            updateFormStatus('info', 'Form Reset Complete');
        }
        
        // Show success message
        alert('✅ All data has been reset! The form is now back to its initial state.');
    }
}

function exportJson() {
    if (Object.keys(currentFormData).length === 0) {
        alert('No data to export. Please fill out the form first.');
        return;
    }
    exportJsonData(currentFormData, activeSections);
}

export function exportXml() {
    if (Object.keys(currentFormData).length === 0) {
        alert('No data to export. Please fill out the form first.');
        return;
    }
    exportXmlData(currentFormData, activeSections);
}

async function publishToGithub() {
    await publishDataToGithub(currentFormData, activeSections);
}

function handleSchemaFile(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                processSchemaData(e.target.result, clearFormData, ConditionalValidator, fieldValidationStatus, generateForm);
            } catch (error) {
                console.error('Schema loading error:', error);
                updateSchemaStatus('✗ Invalid JSON file: ' + error.message, 'text-danger');
            }
        };
        reader.readAsText(file);
    }
}

function initializeDependentFields() {
    // v1.0: license_url field no longer exists - license is now a direct URL field

    // Initialize countries field based on spatial scale value
    const scaleField = document.getElementById('spatial.scale');
    if (scaleField && scaleField.value) {
        const countriesContainer = document.querySelector('[data-array-name="spatial.countries"]');
        if (countriesContainer) {
            const isGlobal = scaleField.value.toLowerCase() === 'global';

            // Disable all inputs and buttons in the countries container
            const inputs = countriesContainer.querySelectorAll('input, select, button');
            inputs.forEach(input => {
                input.disabled = isGlobal;
            });

            // Add visual indication
            if (isGlobal) {
                countriesContainer.style.opacity = '0.5';
                countriesContainer.style.pointerEvents = 'none';
                // Add a note if not already present
                let note = countriesContainer.querySelector('.global-scale-note');
                if (!note) {
                    note = document.createElement('div');
                    note.className = 'global-scale-note alert alert-info mt-2';
                    note.innerHTML = '<small><strong>Note:</strong> Country selection is not required for global scale datasets.</small>';
                    countriesContainer.appendChild(note);
                }
            } else {
                countriesContainer.style.opacity = '1';
                countriesContainer.style.pointerEvents = 'auto';
                // Remove the note if present
                const note = countriesContainer.querySelector('.global-scale-note');
                if (note) {
                    note.remove();
                }
            }
        }
    }
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
                data-bs-target="#${section}" type="button" role="tab">
            ${section.charAt(0).toUpperCase() + section.slice(1)}
        </button>
    `;
    tabsContainer.appendChild(tabButton);

    const tabContent = document.createElement('div');
    tabContent.className = 'tab-pane fade';
    tabContent.id = section;
    tabContent.setAttribute('role', 'tabpanel');
    tabContent.innerHTML = `<div id="${section}Form"></div>`;
    contentContainer.appendChild(tabContent);
}

function removeSectionTab(section) {
    const tabButton = document.getElementById(`${section}-tab`);
    const tabContent = document.getElementById(section);

    // Check if the tab being removed is currently active
    const isActive = tabButton && tabButton.classList.contains('active');

    if (tabButton) tabButton.parentElement.remove();
    if (tabContent) tabContent.remove();

    // If the removed tab was active, switch to the general tab
    if (isActive) {
        const generalTab = document.getElementById('general-tab');
        const generalContent = document.getElementById('general');
        if (generalTab && generalContent) {
            // Activate the general tab
            generalTab.classList.add('active');
            generalContent.classList.add('show', 'active');
        }
    }

    if (activeSections.size === 1) {
        document.getElementById('metadataTabs').style.display = 'none';
    }
}

/**
 * Open Entity editor for root-level Entity fields (publisher, creator, contact_point)
 * v1.0: These are stored directly at root level, not in arrays
 */
function openEntityEditor(fieldName, entityData, entitySchema, renderCallback) {
    if (!currentSchema) {
        console.warn('Schema not loaded yet');
        alert('Please wait for the schema to load before opening the editor.');
        return;
    }

    // Store context for saving later
    currentObjectEditor = {
        fieldName: fieldName,
        entityData: entityData,
        entitySchema: entitySchema,
        renderCallback: renderCallback,
        isRootEntity: true // Flag to distinguish from array editing
    };

    const modalTitle = document.getElementById('objectEditorModalLabel');
    const label = fieldName.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    modalTitle.textContent = `Edit ${label}`;

    const saveBtn = document.getElementById('saveObjectBtn');
    saveBtn.textContent = `Save ${label}`;

    const fieldsContainer = document.getElementById('objectEditorFields');
    fieldsContainer.innerHTML = '';

    // Create modal context for fields
    const modalContext = new FieldCreationContext('modal', fieldsContainer);

    // Render Entity fields (name, email, url)
    if (entitySchema.properties) {
        Object.entries(entitySchema.properties).forEach(([key, property]) => {
            const fieldElement = modalContext.createField(key, property, entityData[key]);
            fieldsContainer.appendChild(fieldElement);
        });
    }

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('objectEditorModal'));
    modal.show();
}

function openObjectEditor(arrayName, objectIndex, objectSchema, arrayData, renderCallback) {
    // Ensure schema is loaded before opening the modal
    if (!currentSchema) {
        console.warn('Schema not loaded yet, cannot open object editor for:', arrayName);
        alert('Please wait for the schema to load before opening the editor.');
        return;
    }

    console.log(`[OPEN MODAL ${arrayName}] index=${objectIndex}, array.length=${arrayData?.length}`);

    if (objectSchema.$ref) {
        objectSchema = resolveReference(objectSchema.$ref);
    } else if (objectSchema.allOf) {
        // Resolve allOf schemas
        objectSchema = resolveAllOfSchemas(objectSchema);
    }

    currentObjectEditor = {
    arrayName: arrayName,
    objectIndex: objectIndex,
    objectSchema: objectSchema,
    arrayData: arrayData,
    renderCallback: renderCallback
    };


    const modalTitle = document.getElementById('objectEditorModalLabel');
    modalTitle.textContent = `Edit ${objectSchema.title || arrayName}`;

    // Update save button text based on what's being edited
    const saveBtn = document.getElementById('saveObjectBtn');
    if (arrayName.includes('events')) {
        saveBtn.textContent = 'Save Event';
    } else if (arrayName.includes('event_sets')) {
        saveBtn.textContent = 'Save Event Set';
    } else if (arrayName.includes('losses')) {
        saveBtn.textContent = 'Save Loss';
    } else {
        saveBtn.textContent = 'Save Changes';
    }

    // Use passed arrayData if available, otherwise get from currentFormData
    const fullArrayData = arrayData || getNestedValue(currentFormData, arrayName) || [];
    // Preload the object data from the array if it exists
    // Only clone the object if editing, otherwise use empty object for new
    let objectData = {};
    if (typeof objectIndex === 'number' && fullArrayData[objectIndex]) {
    objectData = { ...fullArrayData[objectIndex] };
    }


    const fieldsContainer = document.getElementById('objectEditorFields');
    fieldsContainer.innerHTML = '';

    // Create unified context for modal fields
    // Infer component type from array name for classification_scheme filtering
    console.log(`[MODAL CONTEXT] Opening modal for arrayName: ${arrayName}`);
    const inferredComponentType = arrayName ?
        (arrayName.toLowerCase().includes('exposure') ? 'exposure' :
         arrayName.toLowerCase().includes('hazard') ? 'hazard' :
         arrayName.toLowerCase().includes('vulnerabilit') ? 'vulnerability' :
         arrayName.toLowerCase().includes('loss') ? 'loss' : null) : null;
    console.log(`[MODAL CONTEXT] Inferred component type: ${inferredComponentType}`);
    const modalContext = new FieldCreationContext('modal', fieldsContainer, null, arrayName, inferredComponentType);

    if (objectSchema.properties) {
    console.log(`[MODAL FIELDS] Rendering fields for ${arrayName}, schema properties:`, Object.keys(objectSchema.properties));

    // Clean up misplaced disaster_identifiers from event_set level
    if (arrayName && arrayName.includes('event_sets') && objectData.disaster_identifiers) {
        console.log(`[MODAL FIELDS] Found misplaced disaster_identifiers at event_set level, removing...`);
        delete objectData.disaster_identifiers;
    }

    Object.entries(objectSchema.properties).forEach(([key, property]) => {
        // Skip disaster_identifiers at event_set level - it belongs to individual events
        if (arrayName && arrayName.includes('event_sets') && key === 'disaster_identifiers') {
            console.log(`[MODAL FIELDS] Skipping ${key} - belongs to Event, not EventSet`);
            return;
        }

        // If this property is an array, allow editing its items inline
        if (property.type === 'array') {
        // Use the array from objectData if present, ensuring we maintain existing data
        let arrayValue = objectData[key];
        if (!Array.isArray(arrayValue)) {
            arrayValue = [];
            // Initialize the array in objectData so changes are tracked
            objectData[key] = arrayValue;
        }
        const arrayField = modalContext.createField(key, property, arrayValue);
        fieldsContainer.appendChild(arrayField);
        } else {
        // For non-array properties, use the existing value from objectData
        const fieldElement = modalContext.createField(key, property, objectData[key]);
        fieldsContainer.appendChild(fieldElement);

        // Add currency field immediately after quantity_kind in modals
        if (key === 'quantity_kind') {
            const currencyProperty = {
                "type": "string",
                "enum": ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "BGN", "HRK"],
                "title": "Currency"
            };
            const savedCurrencyValue = objectData['currency'];
            const currencyElement = modalContext.createField('currency', currencyProperty, savedCurrencyValue);
            fieldsContainer.appendChild(currencyElement);

            // Ensure currency value is properly set after field creation
            if (savedCurrencyValue) {
                setTimeout(() => {
                    const currencyInput = currencyElement.querySelector('select, input');
                    if (currencyInput && currencyInput.value !== savedCurrencyValue) {
                        currencyInput.value = savedCurrencyValue;
                    }
                }, 100);
            }

            // Add valuation_year field after currency unit
            const valuationYearProperty = {
                "title": "Valuation year",
                "type": "string",
                "description": "The year of the monetary valuation (YYYY).",
                "pattern": "^[0-9]{4}$"
            };
            const savedValuationYear = objectData['valuation_year'];
            const valuationYearElement = modalContext.createField('valuation_year', valuationYearProperty, savedValuationYear);
            // Hide unless quantity_kind is already 'currency'
            if (objectData['quantity_kind'] !== 'currency') {
                valuationYearElement.style.display = 'none';
            }
            fieldsContainer.appendChild(valuationYearElement);

            // Currency field will be handled by the unified dependency system
        }
        }
    });
    }

    // Universal currency field restoration for nested structures (like loss.impact_and_losses.currency)
    setTimeout(() => {
        const allCurrencyFields = fieldsContainer.querySelectorAll('select[id*="currency"], input[id*="currency"]');

        allCurrencyFields.forEach(currencyField => {
            const fieldId = currencyField.id;
            const fieldName = fieldId.replace('modal_', '');
            const savedValue = getNestedValue(objectData, fieldName);

            if (savedValue && currencyField.value !== savedValue) {
                currencyField.value = savedValue;
            }
        });
    }, 150);

    const form = document.getElementById('objectEditorForm');
                form.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const inputs = form.querySelectorAll('input, select, textarea');
        const currentIndex = Array.from(inputs).indexOf(event.target);
        if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
        } else {
        document.getElementById('saveObjectBtn').click();
        }
    }
    });

    const modal = new bootstrap.Modal(document.getElementById('objectEditorModal'));
    modal.show();
}

function updateValidationDisplay() {
    const totalFields = fieldValidationStatus.size;
    const validFields = Array.from(fieldValidationStatus.values()).filter(status => status.isValid).length;

    const progressBar = document.getElementById('validationProgress');
    const progressPercent = totalFields > 0 ? (validFields / totalFields) * 100 : 0;
    progressBar.style.width = `${progressPercent}%`;

    document.getElementById('validFieldCount').textContent = validFields;
    document.getElementById('totalFieldCount').textContent = totalFields;

    const overallStatus = document.getElementById('overallValidation');
    const publishButton = document.getElementById('publishGitHub');

    if (totalFields === 0 || !hasRunFullValidation) {
        overallStatus.className = 'badge bg-secondary';
        overallStatus.textContent = 'Not validated';
        publishButton.disabled = true;
        publishButton.className = 'btn btn-warning btn-sm w-100 mb-2';
        publishButton.title = 'Run validation first to enable publishing';
    } else if (validFields === totalFields) {
        overallStatus.className = 'badge bg-success';
        overallStatus.textContent = 'All valid';
        publishButton.disabled = false;
        publishButton.className = 'btn btn-success btn-sm w-100 mb-2';
        publishButton.title = 'Publish validated dataset to RDL catalog';
    } else {
        overallStatus.className = 'badge bg-warning';
        overallStatus.textContent = `${validFields}/${totalFields} valid`;
        publishButton.disabled = true;
        publishButton.className = 'btn btn-warning btn-sm w-100 mb-2';
        publishButton.title = `Fix ${totalFields - validFields} validation error(s) to enable publishing`;
    }
}


function generateSectionForm(sectionName, properties, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const form = document.createElement('form');
    form.className = 'needs-validation';
    form.noValidate = true;

    form.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const inputs = form.querySelectorAll('input, select, textarea');
            const currentIndex = Array.from(inputs).indexOf(event.target);
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            }
        }
    });

    // Create unified context for normal form fields
    // Pass componentType for component sections (hazard, exposure, vulnerability, loss)
    const componentType = SECTIONS.includes(sectionName) ? sectionName : null;
    const context = new FieldCreationContext('normal', form, null, null, componentType);

    if (sectionName === 'general') {
        const title = document.createElement('h5');
        title.textContent = `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} Metadata`;
        title.className = 'mb-3 mt-3';
        form.appendChild(title);
        const requiredRoles = ['publisher', 'creator', 'contact_point'];

        // Fields to exclude from general tab (will be shown in Attribution section)
        const attributionFields = ['publisher', 'creator', 'contact_point', 'attributions'];

        // First, add all non-attribution fields
        Object.entries(properties).forEach(([key, property]) => {
            if (!SECTIONS.includes(key) && key !== 'links' && key !== 'risk_data_type' && !attributionFields.includes(key)) {
                const existingValue = currentFormData[key];
                const fieldElement = context.createField(key, property, existingValue);
                form.appendChild(fieldElement);
            }
        });

        // Create Attribution section (v1.0: unified UI for root-level + array attributions)
        const attributionSection = document.createElement('div');
        attributionSection.className = 'card mb-4';

        const attributionHeader = document.createElement('div');
        attributionHeader.className = 'card-header';
        attributionHeader.innerHTML = '<h6 class="mb-0">Attributions</h6><small class="text-muted">Entities responsible for this dataset</small>';

        const attributionBody = document.createElement('div');
        attributionBody.className = 'card-body';

        // Initialize data structures
        if (!currentFormData.attributions) {
            currentFormData.attributions = [];
        }

        // Get Entity schema definition
        const entitySchema = currentSchema.$defs?.Entity || {};

        // Function to render attribution list
        const renderAttributionList = () => {
            attributionBody.innerHTML = '';

            const requiredRoles = ['publisher', 'creator', 'contact_point'];

            // Section 1: Required Entities (stored at root level in v1.0)
            const requiredSection = document.createElement('div');
            requiredSection.className = 'mb-4';
            requiredSection.innerHTML = '<h6 class="text-primary mb-3">Required</h6>';

            requiredRoles.forEach(role => {
                const entity = currentFormData[role];
                const attrDiv = document.createElement('div');
                attrDiv.className = 'd-flex justify-content-between align-items-center mb-2 p-3 border rounded';

                const label = role.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                if (entity && entity.name) {
                    attrDiv.innerHTML = `
                        <div>
                            <strong>${label}</strong> <span class="badge bg-danger">Required</span><br>
                            <small class="text-muted">${entity.name}</small>
                            ${entity.email ? `<br><small class="text-muted">${entity.email}</small>` : ''}
                            ${entity.affiliation?.name ? `<br><small class="text-muted">Affiliation: ${entity.affiliation.name}</small>` : ''}
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-primary"
                                onclick="editRootEntity('${role}')">Edit</button>
                    `;
                } else {
                    attrDiv.innerHTML = `
                        <div>
                            <strong>${label}</strong> <span class="badge bg-danger">Required</span><br>
                            <small class="text-danger">Not set - click Add to configure</small>
                        </div>
                        <button type="button" class="btn btn-sm btn-primary"
                                onclick="editRootEntity('${role}')">Add</button>
                    `;
                }

                requiredSection.appendChild(attrDiv);
            });

            attributionBody.appendChild(requiredSection);

            // Section 2: Additional Attributions (stored in attributions array)
            const additionalSection = document.createElement('div');
            additionalSection.innerHTML = '<h6 class="text-secondary mb-3">Additional Attributions (Optional)</h6>';

            const additionalAttributions = currentFormData.attributions || [];

            additionalAttributions.forEach((attr, index) => {
                const attrDiv = document.createElement('div');
                attrDiv.className = 'd-flex justify-content-between align-items-center mb-2 p-3 border rounded bg-light';
                attrDiv.innerHTML = `
                    <div>
                        <strong>${attr.role ? attr.role.replace(/_/g, ' ').toUpperCase() : 'No role specified'}</strong><br>
                        <small class="text-muted">${attr.entity?.name || 'Unnamed entity'}</small>
                        ${attr.entity?.affiliation?.name ? `<br><small class="text-muted">Affiliation: ${attr.entity.affiliation.name}</small>` : ''}
                    </div>
                    <div>
                        <button type="button" class="btn btn-sm btn-outline-primary me-1"
                                onclick="editArrayAttribution(${index})">Edit</button>
                        <button type="button" class="btn btn-sm btn-outline-danger"
                                onclick="deleteArrayAttribution(${index})">Delete</button>
                    </div>
                `;
                additionalSection.appendChild(attrDiv);
            });

            // Add button for more attributions
            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'btn btn-outline-secondary mt-2';
            addButton.innerHTML = '+ Add More Attribution';
            addButton.addEventListener('click', () => addArrayAttribution());
            additionalSection.appendChild(addButton);

            attributionBody.appendChild(additionalSection);
        };

        // Global functions for Entity management (v1.0)
        window.editRootEntity = (role) => {
            // Initialize if not exists
            if (!currentFormData[role]) {
                currentFormData[role] = {};
            }
            // Open modal to edit root-level Entity object
            openEntityEditor(role, currentFormData[role], entitySchema, renderAttributionList);
        };

        window.editArrayAttribution = (index) => {
            const attribution = currentFormData.attributions[index];
            if (attribution && properties.attributions?.items) {
                openObjectEditor('attributions', index, properties.attributions.items, currentFormData.attributions, renderAttributionList);
            }
        };

        window.deleteArrayAttribution = (index) => {
            if (confirm('Are you sure you want to delete this attribution?')) {
                currentFormData.attributions.splice(index, 1);
                renderAttributionList();
                updatePreview();
            }
        };

        window.addArrayAttribution = () => {
            const newAttribution = {
                role: '',
                entity: {}
            };
            currentFormData.attributions.push(newAttribution);
            const index = currentFormData.attributions.length - 1;
            if (properties.attributions?.items) {
                openObjectEditor('attributions', index, properties.attributions.items, currentFormData.attributions, renderAttributionList);
            }
        };

        // Initial render
        renderAttributionList();

        attributionSection.appendChild(attributionHeader);
        attributionSection.appendChild(attributionBody);
        form.appendChild(attributionSection);
    } else {
        // Check if this section is an array type (like the new exposure structure)
        const sectionSchema = currentSchema.properties[sectionName];

        // Add section title for all non-general sections
        const titleContainer = document.createElement('div');
        titleContainer.className = 'd-flex align-items-center mb-2 mt-3';

        const title = document.createElement('h5');
        title.textContent = `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} Metadata`;
        title.className = 'mb-0';
        titleContainer.appendChild(title);

        // Add section description if it exists
        if (sectionSchema && sectionSchema.description) {
            // Add info icon button to toggle description
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'btn btn-outline-info btn-sm ms-2';
            toggleBtn.style.fontSize = '0.9rem';
            toggleBtn.style.padding = '0.25rem 0.5rem';
            toggleBtn.style.borderRadius = '0.25rem';
            toggleBtn.innerHTML = '<span class="toggle-icon">ℹ️ Instructions & Examples</span>';
            toggleBtn.title = 'Click to view instructions and examples for this component';

            const descriptionId = `${sectionName}-description`;

            // Create collapsible description
            const description = document.createElement('div');
            description.id = descriptionId;
            description.className = 'form-text text-muted mb-3 collapse';
            description.style.fontSize = '0.95rem';

            // Extended descriptions for main components
            const extendedDescriptions = {
                'hazard': 'This component covers different kinds of hazard descriptions, including observed hazard events, hazard maps and modelled scenarios used in probabilistic risk assessment.',
                'exposure': 'This component can represent assets location and size, in form of aggregated inventories or individual items.',
                'vulnerability': `Vulnerability metadata can describe two different kinds of datasets:<br>
FUNCTIONS:</strong> the relationships between hazard intensity and expected impact for specific exposure categories. This covers damage functions, fragility curves, and other kinds of vulnerability models.<br>
SOCIO-ECONOMIC INDICES:</strong> descriptors of the social and economic characteristics of vulnerable populations or assets.`,
                'loss': 'This component is meant to cover both empirical disaster events, as well as probabilistic risk modelling outputs.'
            };

            // Example links for each component
            const exampleLinks = {
                'hazard': `<br><br><strong>Examples:</strong><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/hazard/flood_inundation/" target="_blank" rel="noopener noreferrer">• Flood hazard maps</a><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/hazard/tropical_cyclone/" target="_blank" rel="noopener noreferrer">• Probabilistic tropical cyclone model</a><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/hazard/earthquake_catalog/" target="_blank" rel="noopener noreferrer">• Historical earthquake catalog</a>`,
                'exposure': `<br><br><strong>Examples:</strong><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/exposure/building_inventory/" target="_blank" rel="noopener noreferrer">• Building inventory database</a><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/exposure/population_admin/" target="_blank" rel="noopener noreferrer">• Population dataset by administrative boundaries</a><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/exposure/service_accessibility/" target="_blank" rel="noopener noreferrer">• Service accessibility analysis over road networks</a>`,
                'vulnerability': `<br><br><strong>Examples:</strong><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/vulnerability/flood_damage_curves/" target="_blank" rel="noopener noreferrer">• Flood depth-damage functions</a><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/vulnerability/earthquake_fragility/" target="_blank" rel="noopener noreferrer">• Earthquake fragility curves for building structures</a><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/vulnerability/wealth_index/" target="_blank" rel="noopener noreferrer">• Relative wealth index</a>`,
                'loss': `<br><br><strong>Examples:</strong><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/loss/flood_risk/" target="_blank" rel="noopener noreferrer">• Flood risk model</a><br>
                    <a href="https://docs.riskdatalibrary.org/en/latest/guides/metadata/worked_examples/loss/earthquake_loss/" target="_blank" rel="noopener noreferrer">• Earthquake loss database</a>`
            };

            // Combine schema description with extended description and examples
            let fullDescription = parseMarkdownLinks(sectionSchema.description);
            if (extendedDescriptions[sectionName]) {
                fullDescription += ' ' + extendedDescriptions[sectionName];
            }
            if (exampleLinks[sectionName]) {
                fullDescription += exampleLinks[sectionName];
            }
            description.innerHTML = fullDescription;

            // Toggle functionality
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const isHidden = description.classList.contains('collapse');
                if (isHidden) {
                    description.classList.remove('collapse');
                    toggleBtn.innerHTML = '<span class="toggle-icon">▲ Hide Instructions</span>';
                    toggleBtn.className = 'btn btn-info btn-sm ms-2';
                } else {
                    description.classList.add('collapse');
                    toggleBtn.innerHTML = '<span class="toggle-icon">ℹ️ Instructions & Examples</span>';
                    toggleBtn.className = 'btn btn-outline-info btn-sm ms-2';
                }
            });

            titleContainer.appendChild(toggleBtn);
            form.appendChild(titleContainer);
            form.appendChild(description);
        } else {
            form.appendChild(titleContainer);
        }

        if (sectionSchema && sectionSchema.type === 'array') {
            // Handle array-type sections (like exposure)
            const existingValue = currentFormData[sectionName];
            const fieldElement = context.createField(sectionName, sectionSchema, existingValue, { hideLabel: true });
            form.appendChild(fieldElement);
        } else if (properties) {
            // Handle object-type sections (like vulnerability, loss, hazard)
            Object.entries(properties).forEach(([key, property]) => {
                const existingValue = currentFormData[sectionName] && currentFormData[sectionName][key];
                const fieldElement = context.createField(`${sectionName}.${key}`, property, existingValue);
                form.appendChild(fieldElement);

                // DIRECT FIX: Add currency field immediately after quantity_kind
                if (key === 'quantity_kind') {
                    console.log(`Adding currency field after quantity_kind in ${sectionName}`);
                    const currencyProperty = {
                        "type": "string",
                        "enum": ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "BGN", "HRK"],
                        "title": "Currency"
                    };
                    const currencyValue = currentFormData[sectionName] && currentFormData[sectionName]['currency'];
                    const currencyElement = context.createField(`${sectionName}.currency`, currencyProperty, currencyValue);

                    // Disable currency field by default
                    const currencyInput = currencyElement.querySelector('select, input');
                    if (currencyInput) {
                        currencyInput.disabled = true;
                        console.log(`Currency field disabled by default in ${sectionName}`);
                    }

                    // Currency field will be handled by the unified dependency system

                    form.appendChild(currencyElement);
                }
            });
        }
    }

    container.appendChild(form);
}


function generateForm() {
    if (!currentSchema) {
        updateFormStatus('warning', 'No schema loaded');
        return;
    }

    try {
        // Initialize array-type fields if they don't exist
        if (currentSchema.properties) {
            Object.entries(currentSchema.properties).forEach(([key, property]) => {
                if (property.type === 'array' && !currentFormData[key]) {
                    currentFormData[key] = [];
                }
            });
        }

        document.getElementById('metadataForm').innerHTML = '';
        SECTIONS.forEach(section => {
            const sectionForm = document.getElementById(`${section}Form`);
            if (sectionForm) sectionForm.innerHTML = '';
        });

        fieldValidationStatus.clear();

        generateSectionForm('general', currentSchema.properties, 'metadataForm');

        activeSections.forEach(section => {
            if (section !== 'general' && currentSchema.properties[section]) {
                const sectionSchema = currentSchema.properties[section];
                if (sectionSchema.type === 'array') {
                    generateSectionForm(section, null, `${section}Form`);
                } else {
                    generateSectionForm(section, sectionSchema.properties, `${section}Form`);
                }
            }
        });

        updateFormStatus('success', 'RDLS Form Ready');
        initializeDependentFields();
        updatePreview();
        updateValidationDisplay();

    } catch (error) {
        updateFormStatus('danger', 'Generation Error: ' + error.message);
        console.error('Form generation error:', error);
    }
}

// GitHub Integration Functions
export function openGithubConfig() {
    if (Object.keys(currentFormData).length === 0) {
        alert('No data to publish. Please fill out the form first.');
        return;
    }

    // Auto-fill dataset title from metadata
    const datasetTitle = currentFormData.title || currentFormData.name || 'rdls-dataset';
    document.getElementById('datasetTitle').value = sanitizeFilename(datasetTitle);

    // Check authentication state
    checkGithubAuthState();

    const modal = new bootstrap.Modal(document.getElementById('githubConfigModal'));
    modal.show();
}

// ================================
// TESTING AND DEBUGGING FUNCTIONS
// ================================

function testUnifiedSystem() {
    console.log('=== Testing Unified Field Creation System ===');
    console.log('Schema loaded:', !!currentSchema);
    console.log('Active sections:', [...activeSections]);
    
    // Test field creation contexts
    const normalContext = new FieldCreationContext('normal');
    const modalContext = new FieldCreationContext('modal');
    const inlineContext = new FieldCreationContext('inline');
    
    console.log('Normal context ID prefix:', normalContext.idPrefix);
    console.log('Modal context ID prefix:', modalContext.idPrefix);
    console.log('Inline context ID prefix:', inlineContext.idPrefix);
    
    // Test dependency system
    console.log('\n=== Dependency System Test ===');
    Object.entries(FIELD_DEPENDENCIES).forEach(([dependent, parent]) => {
        console.log(`${dependent} depends on ${parent}`);
        
        const dependentField = document.getElementById(dependent);
        const parentField = document.getElementById(parent);
        
        console.log(`  Dependent field exists: ${!!dependentField}`);
        console.log(`  Parent field exists: ${!!parentField}`);
    });
    
    // Test specific fixes
    console.log('\n=== Testing Specific Fixes ===');
    
    // Test 1: Currency field dependency
    console.log('1. Currency field dependency test:');
    const modalCurrencyDep = FIELD_DEPENDENCIES['currency'];
    console.log(`   Modal currency depends on: ${modalCurrencyDep}`);
    const normalCurrencyDep = FIELD_DEPENDENCIES['loss.impact_and_losses.currency'];
    console.log(`   Normal currency depends on: ${normalCurrencyDep}`);
    
    // Test 2: Hazard process dependencies 
    console.log('2. Hazard process dependency test:');
    const modalProcessDep = FIELD_DEPENDENCIES['processes'];
    console.log(`   Modal processes depends on: ${modalProcessDep}`);
    const lossProcessDep = FIELD_DEPENDENCIES['hazard.process'];
    console.log(`   Loss hazard_process depends on: ${lossProcessDep}`);
    
    // Test 3: Array context handling
    console.log('3. Array context test:');
    console.log(`   Inline context type: ${inlineContext.type}`);
    console.log(`   Inline context container:`, !!inlineContext.container);
    
    // Test unified factory
    console.log('\n=== Field Factory Test ===');
    const testProperty = {
        type: 'string',
        enum: ['option1', 'option2', 'option3'],
        title: 'Test Field'
    };
    
    const factory = new UnifiedFieldFactory(normalContext);
    console.log('Factory created successfully');
    
    // Test validation system
    console.log('\n=== Validation System Test ===');
    const validator = new UnifiedFieldValidator(normalContext);
    const validationResult = validator.validate('test_field', 'test_value', testProperty);
    console.log('Validation result:', validationResult);
    
    console.log('\n=== System Integration Complete ===');
    console.log('All three fixes should now be working:');
    console.log('✓ Inline array editing in modals');
    console.log('✓ Currency field dependency in all contexts');
    console.log('✓ Hazard process dependency in all tabs');
}

// ================================
// UNIFIED FIELD CREATION SYSTEM
// ================================

/**
 * Unified Field Creation Context
 * Handles all field creation needs across normal, modal, and array contexts
 */
class FieldCreationContext {
    constructor(type = 'normal', container = null, itemData = null, arrayName = null, componentType = null, itemSchema = null) {
        this.type = type; // 'normal', 'modal', 'inline', 'array'
        this.container = container;
        this.idPrefix = type === 'modal' ? 'modal_' : '';
        this.itemData = itemData; // For inline context, stores the item being edited
        this.arrayName = arrayName; // For inline context, stores the array name (e.g., 'hazards', 'losses')
        this.componentType = componentType; // Component type: 'hazard', 'exposure', 'vulnerability', 'loss'
        this.itemSchema = itemSchema; // For inline context, stores the item schema (for checking required fields)
    }

    createField(name, property, value, options = {}) {
        const factory = new UnifiedFieldFactory(this);
        return factory.createField(name, property, value, options);
    }

    getFieldId(name) {
        return this.idPrefix + name;
    }

    setupEventListeners(element, name, property, options = {}) {
        const handler = new UnifiedEventHandler(this);
        handler.setupListeners(element, name, property, options);
    }

    validateField(name, value, property) {
        const validator = new UnifiedFieldValidator(this);
        return validator.validate(name, value, property);
    }
}

/**
 * Unified Field Factory
 * Creates appropriate field elements based on property type and context
 */
class UnifiedFieldFactory {
    constructor(context) {
        this.context = context;
    }

    createField(name, property, value, options = {}) {
        // Skip ID fields in certain contexts
        // ID fields are auto-generated and should not be editable
        // EXCEPT for Classification objects where 'id' is the user-provided classification code
        const isClassificationId = property && property.title === 'Classification identifier';
        if (!isClassificationId && (name === 'id' || (name.includes('.id') && (this.context.type === 'array' || this.context.type === 'inline')))) {
            return document.createElement('div');
        }

        // Skip trigger fields in loss/event/vulnerability contexts to avoid confusing nested UI
        // But ALLOW trigger in hazards array where it's meaningful for cascading hazards
        if (name.includes('trigger')) {
            // For inline context, check the array name to determine if trigger should be shown
            if (this.context.type === 'inline' && this.context.arrayName) {
                // Only show trigger in hazards array (event_sets.hazards)
                // Hide in losses, vulnerability, events arrays where it causes nested duplication
                const isHazardsArray = this.context.arrayName === 'hazards' || this.context.arrayName === 'event_sets.hazards';
                if (!isHazardsArray) {
                    return document.createElement('div');
                }
                // For hazards array, allow trigger field to be shown
            } else if (name.includes('losses.') || name.includes('hazard.')) {
                // For non-inline contexts (normal form), check field path
                return document.createElement('div');
            }
        }

        const container = this.createFieldContainer(name, property, options);
        
        // Resolve $ref if present
        const resolvedProperty = this.resolveProperty(property);
        if (!resolvedProperty || !resolvedProperty.type) {
            return container;
        }

        // Create label and description if not an object property
        const forceLabel = false;
        const isClassificationField = name.endsWith('.classification') || name === 'classification';
        const isAssetTypeField = name.endsWith('.asset_type') || name === 'asset_type';
        const isObjectProperty = resolvedProperty.type === 'object' && this.context.type !== 'modal' && this.context.type !== 'inline' && !name.includes('trigger') && !forceLabel;
        // Skip label/description for classification and asset_type fields - they have their own collapsible header
        const shouldShowLabel = !isObjectProperty && !isClassificationField && !isAssetTypeField && !(options && options.hideLabel);
        if (shouldShowLabel) {
            this.addLabelAndDescription(container, name, resolvedProperty, options);
        }

        // Create the input element
        const inputElement = this.createInputElement(name, resolvedProperty, value, options);
        
        // Add validation indicator
        if (this.context.type === 'normal') {
            this.addValidationIndicator(container, name);
        }

        container.appendChild(inputElement);

        // Add help text for intensity_measure fields (for select dropdowns)
        if (name.includes('intensity_measure') && inputElement.tagName === 'SELECT') {
            const helpText = document.createElement('small');
            helpText.className = 'form-text text-muted';
            helpText.style.display = 'block';
            helpText.style.marginTop = '0.25rem';
            helpText.innerHTML = 'An intensity measure is missing? Please <a href="https://github.com/GFDRR/rdl-standard/issues/new?template=change-proposal.md" target="_blank" rel="noopener noreferrer">submit a request</a> to add a new one.';
            container.appendChild(helpText);
        }

        // Add examples if available
        this.addExamples(container, resolvedProperty);

        // Handle dependencies
        this.handleDependencies(container, name, resolvedProperty, value);

        return container;
    }

    createFieldContainer(name, property, options) {
        const container = document.createElement('div');
        container.className = (this.context.type === 'modal' || this.context.type === 'inline') ? 'modal-form-field' : 'form-field';

        // Set data-field-name for inline context to enable data collection
        if (this.context.type === 'inline') {
            container.setAttribute('data-field-name', name);
        }

        // Handle required fields
        if (this.isRequiredField(name, property, options)) {
            container.classList.add('required');
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
            for (const option of property.anyOf) {
                if (option.format) {
                    // Create a merged property with the format from anyOf
                    return { ...property, format: option.format };
                }
            }
        }

        return property;
    }

    addLabelAndDescription(container, name, property, options) {
        const label = document.createElement('label');
        // Special handling for trigger field in hazards array - label as "Hazard trigger"
        const fieldBaseName = name.split('.').pop();
        // Convert snake_case to Title Case if no title provided
        const fallbackTitle = fieldBaseName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        let labelText = property.title || fallbackTitle;
        if (fieldBaseName === 'trigger' && this.context.type === 'inline' && this.context.arrayName === 'hazards') {
            labelText = 'Hazard trigger';
        }
        label.textContent = labelText;
        label.className = 'form-label';
        label.htmlFor = this.context.getFieldId(name);
        
        if (this.isRequiredField(name, property, options)) {
            label.innerHTML += ' <span class="text-danger">*</span>';
        }
        
        container.appendChild(label);
        
        if (property.description) {
            const description = document.createElement('small');
            description.className = 'form-text text-muted d-block mb-2';
            description.innerHTML = parseMarkdownLinks(property.description, currentSchemaVersion);
            container.appendChild(description);
        }
    }

    createInputElement(name, property, value, options) {
        switch (property.type) {
            case 'string':
                return this.createStringInput(name, property, value, options);
            case 'integer':
            case 'number':
                return this.createNumberInput(name, property, value, options);
            case 'boolean':
                return this.createBooleanInput(name, property, value, options);
            case 'array':
                return this.createArrayInput(name, property, value, options);
            case 'object':
                return this.createObjectInput(name, property, value, options);
            default:
                return this.createStringInput(name, property, value, options);
        }
    }

    createStringInput(name, property, value, options) {
        console.log(`[CREATE STRING] Creating string input for: ${name}, context: ${this.context.type}`);
        console.log(`[CREATE STRING]   has enum:`, !!getEnumValues(property, currentSchema));


        // v1.0: Check for conditional codelists FIRST (before dependency check)
        // Fields like 'unit' have conditional codelists and should be comboboxes, not dependent selects
        const hasConditionalCodelist = this.hasConditionalCodelist(name);
        console.log(`[CREATE STRING]   hasConditionalCodelist(${name}):`, hasConditionalCodelist);
        if (hasConditionalCodelist) {
            console.log(`[CREATE STRING]   has conditional codelist, creating combobox`);
            const enhancedProperty = { ...property, codelist: 'placeholder', openCodelist: true };
            return this.createCombobox(name, enhancedProperty, value, options);
        }

        // v1.0: Check for open codelists BEFORE checking dependencies
        // Fields like 'intensity_measure' have open codelists AND dependencies
        // They should be comboboxes (with filtered options), not dependent selects
        if (property.codelist && property.openCodelist) {
            console.log(`[CREATE STRING]   has open codelist, creating combobox (will be filtered by dependency if needed)`);
            // Open codelist fields get combobox with async loading
            // The dependency filtering will happen via loadCodelistForField
            return this.createCombobox(name, property, value, options);
        }

        // Check for dependencies (but only for fields that DON'T have open codelists)
        const dependsOn = FIELD_DEPENDENCIES[name];
        console.log(`[CREATE STRING]   checking FIELD_DEPENDENCIES['${name}']:`, dependsOn);
        if (dependsOn) {
            // Only create a dependent select if the field actually has options to populate.
            // Some fields (e.g. valuation_year) are in FIELD_DEPENDENCIES only for show/hide
            // logic and have no enum/codelist — they should fall through to a regular input.
            const hasSelectableOptions = !!(getEnumValues(property, currentSchema) || property.codelist || property.suggestions);
            if (hasSelectableOptions) {
                console.log(`[CREATE STRING]   has dependency on: ${dependsOn}, creating dependent select`);
                // For inline context, get parent value from itemData; otherwise from currentFormData
                let parentValue;
                if (this.context.type === 'inline' && this.context.itemData) {
                    parentValue = this.context.itemData[dependsOn];
                } else {
                    parentValue = getNestedValue(currentFormData, dependsOn);
                }
                return this.createDependentSelect(name, property, value, dependsOn, parentValue, options);
            }
            console.log(`[CREATE STRING]   dependency is show/hide only (no options), falling through to regular input`);
        }

        // Check for enum (handles both direct enum and $ref)
        const enumValues = getEnumValues(property, currentSchema);
        if (enumValues) {
            console.log(`[CREATE STRING]   creating select with ${enumValues.length} enum values`);
            return this.createSelect(name, property, value, options);
        } else if (property.suggestions && property.openCodelist) {
            // Legacy: suggestions-based combobox
            return this.createCombobox(name, property, value, options);
        } else if ((property.oneOf || property.anyOf) && this.isFlexibleDateField(property)) {
            // Handle flexible date fields (YYYY, YYYY-MM, or YYYY-MM-DD)
            return this.createFlexibleDateInput(name, property, value, options);
        } else if (property.format === 'date') {
            return this.createDateInput(name, property, value, options);
        } else if (property.format === 'email') {
            return this.createEmailInput(name, property, value, options);
        } else if (property.format === 'iri') {
            return this.createUrlInput(name, property, value, options);
        } else if (name.includes('description') || name.includes('purpose') || name.includes('notes') || name.includes('details') || name.includes('lineage') || name.includes('citation')) {
            return this.createTextareaInput(name, property, value, options);
        } else {
            return this.createTextInput(name, property, value, options);
        }
    }

    createTextInput(name, property, value, options) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control field-with-validation';
        // Don't set name/id for inline context to avoid polluting FormData
        if (this.context.type !== 'inline') {
            input.name = this.context.getFieldId(name);
            input.id = this.context.getFieldId(name);
        }
        input.value = value || '';

        if (property.minLength) input.minLength = property.minLength;
        if (property.maxLength) input.maxLength = property.maxLength;
        if (property.pattern) {
            input.pattern = property.pattern;
            // For digit-only fixed-length patterns like ^[0-9]{4}$, enforce in real time
            const digitsOnlyMatch = property.pattern.match(/^\^\[0-9\]\{(\d+)\}\$$/);
            if (digitsOnlyMatch) {
                const exactLength = parseInt(digitsOnlyMatch[1], 10);
                input.maxLength = exactLength;
                input.inputMode = 'numeric';
                input.addEventListener('input', () => {
                    input.value = input.value.replace(/[^0-9]/g, '').slice(0, exactLength);
                });
            }
        }

        this.context.setupEventListeners(input, name, property, options);
        wrapper.appendChild(input);
        
        // Setup autocomplete if not in modal or inline
        if (this.context.type !== 'modal' && this.context.type !== 'inline') {
            this.setupAutoComplete(input, name, property);
        }
        
        return wrapper;
    }

    createTextareaInput(name, property, value, options) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';

        const textarea = document.createElement('textarea');
        textarea.className = 'form-control field-with-validation';
        // Don't set name/id for inline context to avoid polluting FormData
        if (this.context.type !== 'inline') {
            textarea.name = this.context.getFieldId(name);
            textarea.id = this.context.getFieldId(name);
        }
        textarea.value = value || '';
        textarea.rows = 3;
        textarea.style.resize = 'vertical';
        textarea.style.minHeight = '80px';

        if (property.minLength) textarea.minLength = property.minLength;

        // Set character limits for specific fields
        const fieldBaseName = name.split('.').pop();
        if (fieldBaseName === 'description') {
            textarea.maxLength = 2500;
        } else if (fieldBaseName === 'details') {
            textarea.maxLength = 5000;
        } else if (fieldBaseName === 'purpose') {
            textarea.maxLength = 1500;
        } else if (fieldBaseName === 'citation') {
            textarea.maxLength = 1500;
        } else if (property.maxLength) {
            textarea.maxLength = property.maxLength;
        }

        // Add character counter if maxLength is set
        let charCounter = null;
        if (textarea.maxLength && textarea.maxLength > 0) {
            charCounter = document.createElement('small');
            charCounter.className = 'form-text text-muted';
            charCounter.style.display = 'block';
            charCounter.style.textAlign = 'right';
            charCounter.style.marginTop = '0.25rem';

            const updateCounter = () => {
                const remaining = textarea.maxLength - textarea.value.length;
                charCounter.textContent = `${textarea.value.length} / ${textarea.maxLength} characters`;
                if (remaining < 100) {
                    charCounter.style.setProperty('color', '#dc3545', 'important'); // Red when close to limit
                } else if (remaining < 500) {
                    charCounter.style.setProperty('color', '#fd7e14', 'important'); // Orange
                } else {
                    charCounter.style.setProperty('color', '#6c757d', 'important'); // Gray
                }
            };

            textarea.addEventListener('input', updateCounter);
            updateCounter(); // Initial counter
        }

        // Auto-resize functionality
        const autoResize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
        };

        textarea.addEventListener('input', autoResize);
        textarea.addEventListener('focus', autoResize);

        // Initial resize
        setTimeout(autoResize, 0);

        this.context.setupEventListeners(textarea, name, property, options);
        wrapper.appendChild(textarea);
        if (charCounter) wrapper.appendChild(charCounter);

        return wrapper;
    }

    createEmailInput(name, property, value, options) {
        const input = document.createElement('input');
        input.type = 'email';
        input.className = 'form-control field-with-validation';
        // Don't set name/id for inline context to avoid polluting FormData
        if (this.context.type !== 'inline') {
            input.name = this.context.getFieldId(name);
            input.id = this.context.getFieldId(name);
        }
        input.value = value || '';
        
        this.context.setupEventListeners(input, name, property, options);
        return input;
    }

    createUrlInput(name, property, value, options) {
        const input = document.createElement('input');
        input.type = 'url';
        input.className = 'form-control field-with-validation';
        // Don't set name/id for inline context to avoid polluting FormData
        if (this.context.type !== 'inline') {
            input.name = this.context.getFieldId(name);
            input.id = this.context.getFieldId(name);
        }
        input.value = value || '';
        
        this.context.setupEventListeners(input, name, property, options);
        return input;
    }

    createDateInput(name, property, value, options) {
        const input = document.createElement('input');
        input.type = 'date';
        input.className = 'form-control field-with-validation';
        // Don't set name/id for inline context to avoid polluting FormData
        if (this.context.type !== 'inline') {
            input.name = this.context.getFieldId(name);
            input.id = this.context.getFieldId(name);
        }
        input.value = value || '';

        this.context.setupEventListeners(input, name, property, options);
        return input;
    }

    isFlexibleDateField(property) {
        // Check if the oneOf or anyOf array contains date format patterns
        const schemas = property.oneOf || property.anyOf;
        if (!schemas || !Array.isArray(schemas)) return false;

        // Look for date format or year/year-month patterns
        return schemas.some(schema =>
            schema.format === 'date' ||
            (schema.pattern && (
                schema.pattern.includes('\\d{4}') ||
                schema.pattern.includes('\\\\d{4}')
            ))
        );
    }

    createFlexibleDateInput(name, property, value, options) {
        console.log(`[CREATE FLEXIBLE DATE] Field: ${name}, value:`, value, `(type: ${typeof value})`);
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control field-with-validation';
        input.placeholder = 'YYYY, YYYY-MM, or YYYY-MM-DD';
        // Don't set name/id for inline context to avoid polluting FormData
        if (this.context.type !== 'inline') {
            input.name = this.context.getFieldId(name);
            input.id = this.context.getFieldId(name);
        }
        // Only set value if there is one - otherwise placeholder won't show
        if (value) {
            input.value = value;
            console.log(`[CREATE FLEXIBLE DATE] Set value: "${input.value}"`);
        } else {
            console.log(`[CREATE FLEXIBLE DATE] No value set, placeholder should be visible`);
        }

        // Add pattern for basic validation (year, year-month, or full date)
        input.pattern = '^\\d{4}(-\\d{2}(-\\d{2})?)?$';
        input.title = 'Enter a year (YYYY), year-month (YYYY-MM), or full date (YYYY-MM-DD)';

        // Add helper text
        const helpText = document.createElement('small');
        helpText.className = 'form-text text-muted';
        helpText.textContent = 'Format: YYYY (e.g., 2024), YYYY-MM (e.g., 2024-01), or YYYY-MM-DD (e.g., 2024-01-15)';
        helpText.style.display = 'block';
        helpText.style.marginTop = '0.25rem';

        this.context.setupEventListeners(input, name, property, options);

        wrapper.appendChild(input);
        wrapper.appendChild(helpText);
        return wrapper;
    }

    createNumberInput(name, property, value, options) {
        const input = document.createElement('input');
        input.type = property.type === 'integer' ? 'number' : 'number';
        input.className = 'form-control field-with-validation';
        // Don't set name/id for inline context to avoid polluting FormData
        if (this.context.type !== 'inline') {
            input.name = this.context.getFieldId(name);
            input.id = this.context.getFieldId(name);
        }
        input.value = value || '';
        
        if (property.minimum !== undefined) input.min = property.minimum;
        if (property.maximum !== undefined) input.max = property.maximum;
        if (property.type === 'integer') input.step = '1';
        
        this.context.setupEventListeners(input, name, property, options);
        return input;
    }

    createBooleanInput(name, property, value, options) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-check';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'form-check-input';
        // Don't set name/id for inline context to avoid polluting FormData
        if (this.context.type !== 'inline') {
            input.name = this.context.getFieldId(name);
            input.id = this.context.getFieldId(name);
        }
        input.checked = value || false;
        
        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = this.context.getFieldId(name);
        label.textContent = property.title || name;
        
        this.context.setupEventListeners(input, name, property, options);
        
        wrapper.appendChild(input);
        wrapper.appendChild(label);
        return wrapper;
    }

    createSelect(name, property, value, options) {
        const select = document.createElement('select');
        select.className = 'form-select field-with-validation';
        console.log(`[CREATE SELECT] Creating select for "${name}", context type: "${this.context.type}"`);
        // Don't set name/id for inline context to avoid polluting FormData
        // Always set ID (needed for dependency system), but only set name for non-inline context
        select.id = this.context.getFieldId(name);
        if (this.context.type !== 'inline') {
            console.log(`[CREATE SELECT] Context is NOT inline, setting name attribute`);
            select.name = this.context.getFieldId(name);
        } else {
            console.log(`[CREATE SELECT] Context IS inline, skipping name attribute (but keeping ID)`);
        }
        
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Select an option...';
        select.appendChild(emptyOption);

        // Get enum values (handles both direct enum and $ref)
        const enumValues = getEnumValues(property, currentSchema);
        if (!enumValues) {
            console.warn(`No enum values found for field: ${name}`);
            return select;
        }

        // Handle country dropdowns
        if (name.includes('countries') || (property.items && property.items.enum && property.items.enum.includes('USA'))) {
            enumValues.forEach((option) => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                const countryName = countryNames[option] || option;
                optionElement.textContent = `${option} - ${countryName}`;
                if (value === option) optionElement.selected = true;
                select.appendChild(optionElement);
            });
        } else {
            enumValues.forEach((option, index) => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                // Use enumNames if available, otherwise check if option contains parentheses (e.g., "CSV (csv)")
                // If it has parentheses, use as-is; otherwise apply capitalization transformation
                if (property.enumNames) {
                    optionElement.textContent = property.enumNames[index];
                } else if (option.includes('(') && option.includes(')')) {
                    optionElement.textContent = option;
                } else {
                    optionElement.textContent = option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
                if (value === option) optionElement.selected = true;
                select.appendChild(optionElement);
            });
        }

        // Handle disabled option
        if (options.disabled) {
            select.disabled = true;
        }

        this.context.setupEventListeners(select, name, property, options);
        return select;
    }

    createDependentSelect(name, property, value, dependsOn, parentValue, options) {
        const select = document.createElement('select');
        select.className = 'form-select field-with-validation';
        // Always set ID (needed for dependency system), but only set name for non-inline context
        // (name attribute causes FormData collection, which we want to avoid for inline fields)
        select.id = this.context.getFieldId(name);
        if (this.context.type !== 'inline') {
            select.name = this.context.getFieldId(name);
        }
        select.setAttribute('data-depends-on', dependsOn);

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Select an option...';
        select.appendChild(emptyOption);

        // Start with all available options (handles $ref resolution)
        let availableOptions = getEnumValues(property, currentSchema) || [];

        // v1.0: Filter options based on parent value using conditional schema rules
        if (parentValue) {
            // Get parent context data
            const parentData = this.context.itemData || {};
            parentData[dependsOn] = parentValue;

            // Try to get conditional enum from schema
            if (name.includes('process')) {
                // Get unexpanded schema to access allOf rules
                const hazardSchemaRaw = resolveReferenceSimple('#/$defs/SimpleHazard');

                if (hazardSchemaRaw && hazardSchemaRaw.allOf) {
                    const result = ConditionalValidator.evaluateConditionals(hazardSchemaRaw, parentData);

                    // Find the applicable rule that modifies process field
                    for (const rule of result.applicableRules) {
                        if (rule.schema.properties && rule.schema.properties.process && rule.schema.properties.process.enum) {
                            availableOptions = rule.schema.properties.process.enum;
                            break;
                        }
                    }
                }

                // If still no options found, use the default enum from property
                const defaultEnum = getEnumValues(property, currentSchema) || [];
                if (availableOptions.length === 0 || JSON.stringify(availableOptions) === JSON.stringify(defaultEnum)) {
                    availableOptions = defaultEnum;
                }
            } else if (name.includes('intensity_measure')) {
                // intensity_measure uses open codelist, handled by combobox not dependent select
                const filteredIMTs = getFilteredIMTOptions(parentValue, ConditionalValidator);
                availableOptions = filteredIMTs.map(opt => opt.code);
            }
        }

        // Populate options
        availableOptions.forEach((option, index) => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            // Use enumNames if available, otherwise check if option contains parentheses
            if (property.enumNames) {
                optionElement.textContent = property.enumNames[index];
            } else if (option.includes('(') && option.includes(')')) {
                optionElement.textContent = option;
            } else {
                optionElement.textContent = option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            if (value === option) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        this.context.setupEventListeners(select, name, property, options);
        return select;
    }

    createCombobox(name, property, value, options) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.className = 'combobox-wrapper';

        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control field-with-validation';
        // Don't set name/id for inline context to avoid polluting FormData
        if (this.context.type !== 'inline') {
            input.name = this.context.getFieldId(name);
            input.id = this.context.getFieldId(name);
        }
        input.value = value || '';
        input.placeholder = 'Type or select from suggestions...';

        if (property.minLength) input.minLength = property.minLength;
        if (property.maxLength) input.maxLength = property.maxLength;
        if (property.pattern) input.pattern = property.pattern;

        const dropdownBtn = document.createElement('button');
        dropdownBtn.type = 'button';
        dropdownBtn.className = 'btn btn-outline-secondary dropdown-toggle';
        dropdownBtn.setAttribute('data-bs-toggle', 'dropdown');

        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'dropdown-menu';
        dropdownMenu.style.maxHeight = '200px';
        dropdownMenu.style.overflowY = 'auto';

        // Show loading indicator initially
        const loadingItem = document.createElement('li');
        loadingItem.innerHTML = '<span class="dropdown-item-text text-muted"><em>Loading options...</em></span>';
        dropdownMenu.appendChild(loadingItem);

        inputGroup.appendChild(input);
        inputGroup.appendChild(dropdownBtn);
        inputGroup.appendChild(dropdownMenu);

        this.context.setupEventListeners(input, name, property, options);
        wrapper.appendChild(inputGroup);

        // Add help text for intensity_measure and open codelist fields
        if (property.openCodelist) {
            const helpText = document.createElement('small');
            helpText.className = 'form-text text-muted';
            helpText.style.display = 'block';
            helpText.style.marginTop = '0.25rem';
            if (name.includes('intensity_measure')) {
                helpText.innerHTML = 'An intensity measure is missing? Please <a href="https://github.com/GFDRR/rdl-standard/issues/new?template=proposal" target="_blank" rel="noopener noreferrer">submit a request</a> to add a new one.';
            } else {
                helpText.textContent = 'You can select from suggestions or type a custom value.';
            }
            wrapper.appendChild(helpText);
        }

        if (this.context.type !== 'modal' && this.context.type !== 'inline') {
            this.setupAutoComplete(input, name, property);
        }

        // Load codelist asynchronously
        this.loadCodelistForField(name, property, dropdownMenu, input);

        return wrapper;
    }

    async loadCodelistForField(fieldName, property, dropdownMenu, input) {
        try {
            let suggestions = [];

            // Check if this field has a conditional codelist (e.g., intensity_measure)
            if (property.codelist && property.openCodelist) {
                // Get parent context data for conditional evaluation
                const parentData = this.getParentDataForConditional(fieldName);

                // Check if there's a schema definition with conditional rules
                const schemaPath = this.getSchemaPathForField(fieldName);
                if (schemaPath && parentData) {
                    const schemaDefinition = SchemaNavigator.getDefinitionAtPath(currentSchema, schemaPath);
                    if (schemaDefinition && schemaDefinition.allOf) {
                        // Load conditional codelist
                        suggestions = await CodelistManager.getConditionalCodelist(
                            schemaDefinition,
                            fieldName.split('.').pop(),
                            parentData
                        );
                    }
                }

                // If no conditional codelist found, load the default codelist
                // Skip if codelist is 'placeholder' (used for conditional codelists)
                if (suggestions.length === 0 && property.codelist && property.codelist !== 'placeholder') {
                    suggestions = await CodelistManager.loadCodelist(property.codelist);
                }

                // Special handling for classification_scheme: filter by field purpose
                if (property.codelist === 'classification_scheme.csv' && suggestions.length > 0) {
                    // Detect field purpose from field path
                    console.log(`[CLASSIFICATION SCHEME] Field name: ${fieldName}, Codelist: ${property.codelist}`);
                    const fieldPurpose = this.getClassificationFieldPurpose(fieldName);
                    console.log(`[CLASSIFICATION SCHEME] Detected field purpose: ${fieldPurpose}`);
                    if (fieldPurpose) {
                        console.log(`[CLASSIFICATION SCHEME] Filtering ${suggestions.length} schemes for purpose: ${fieldPurpose}`);
                        const beforeCount = suggestions.length;
                        suggestions = CodelistManager.filterClassificationSchemes(suggestions, fieldPurpose);
                        console.log(`[CLASSIFICATION SCHEME] Filtered from ${beforeCount} to ${suggestions.length} schemes`);
                    } else {
                        console.log(`[CLASSIFICATION SCHEME] No field purpose detected, showing all ${suggestions.length} schemes`);
                    }
                }
            } else if (property.suggestions) {
                // Use static suggestions if provided
                suggestions = property.suggestions;
            }

            // Clear dropdown and populate with suggestions
            dropdownMenu.innerHTML = '';

            if (suggestions && suggestions.length > 0) {
                // Check if this is a unit field with currency codelist
                const isUnitField = fieldName === 'unit' || fieldName.endsWith('.unit');
                const isCurrencyCodelist = property.codelist === 'unit_currency.csv';
                const showCodeInDropdown = isUnitField && isCurrencyCodelist;

                suggestions.forEach(suggestion => {
                    const item = document.createElement('li');
                    const link = document.createElement('a');
                    link.className = 'dropdown-item';
                    link.href = '#';

                    // Handle both string arrays (legacy) and {code, title} objects (v1.0)
                    const suggestionCode = typeof suggestion === 'object' ? suggestion.code : suggestion;
                    const suggestionTitle = typeof suggestion === 'object' ? suggestion.title : suggestion;

                    // Display format: "[Code] Title (valid until YYYY-MM)" for currency unit fields
                    const validUntilSuffix = (typeof suggestion === 'object' && suggestion.validUntil) ? ` (valid until ${suggestion.validUntil})` : '';
                    if (showCodeInDropdown && typeof suggestion === 'object' && suggestion.code && suggestion.title && suggestion.code !== suggestion.title) {
                        link.textContent = `[${suggestionCode}] ${suggestionTitle}${validUntilSuffix}`;
                    } else {
                        link.textContent = suggestionTitle + validUntilSuffix;
                    }
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        input.value = suggestionCode; // Save code value
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    item.appendChild(link);
                    dropdownMenu.appendChild(item);
                });

                const separator = document.createElement('li');
                separator.innerHTML = '<hr class="dropdown-divider">';
                dropdownMenu.appendChild(separator);

                const customItem = document.createElement('li');
                customItem.innerHTML = '<span class="dropdown-item-text text-muted"><em>💡 You can also type a custom value</em></span>';
                dropdownMenu.appendChild(customItem);
            } else {
                const emptyItem = document.createElement('li');
                emptyItem.innerHTML = '<span class="dropdown-item-text text-muted"><em>No suggestions available. Type a custom value.</em></span>';
                dropdownMenu.appendChild(emptyItem);
            }
        } catch (error) {
            console.error(`Failed to load codelist for ${fieldName}:`, error);
            dropdownMenu.innerHTML = '<li><span class="dropdown-item-text text-danger"><em>Failed to load options</em></span></li>';
        }
    }

    getParentDataForConditional(fieldName) {
        // Extract parent context based on field path
        if (this.context.type === 'inline' && this.context.itemData) {
            return this.context.itemData;
        }

        const parts = fieldName.split('.');
        if (parts.length === 1) {
            return currentFormData;
        }

        let obj = currentFormData;
        for (let i = 0; i < parts.length - 1; i++) {
            if (obj && obj[parts[i]]) {
                obj = obj[parts[i]];
            } else {
                return null;
            }
        }
        return obj;
    }

    getSchemaPathForField(fieldName) {
        // Map field names to their schema paths
        // This is a simplified version - may need expansion
        if (fieldName.includes('intensity_measure')) {
            return '$defs.Hazard';
        }
        if (fieldName.includes('unit')) {
            return '$defs.Measurement';
        }
        // Add more mappings as needed
        return null;
    }

    getComponentTypeFromFieldName(fieldName) {
        // First priority: use componentType from context if available
        if (this.context.componentType) {
            console.log(`[COMPONENT DETECTION] Using componentType from context: ${this.context.componentType}`);
            return this.context.componentType;
        }

        // Extract component type from field path
        // Field names like: "hazard.classification.scheme", "exposure.classification.scheme", etc.
        const parts = fieldName.split('.');

        // Check for main component types in field path
        if (parts.includes('hazard') || parts.includes('hazards')) {
            return 'hazard';
        }
        if (parts.includes('exposure') || parts.includes('exposures')) {
            return 'exposure';
        }
        if (parts.includes('vulnerability') || parts.includes('vulnerabilities')) {
            return 'vulnerability';
        }
        if (parts.includes('loss') || parts.includes('losses')) {
            return 'loss';
        }

        // For inline context, check the array name from context
        if (this.context.type === 'inline' && this.context.arrayName) {
            const arrayName = this.context.arrayName.toLowerCase();
            if (arrayName.includes('hazard')) return 'hazard';
            if (arrayName.includes('exposure')) return 'exposure';
            if (arrayName.includes('vulnerabilit')) return 'vulnerability';
            if (arrayName.includes('loss')) return 'loss';
        }

        // Fallback: use signature fields to detect component type
        // These are unique fields that only appear in specific components
        const signatureFields = {
            'asset_type': 'exposure',
            'taxonomy': 'exposure',
            'intensity_measure': 'hazard',
            'process': 'hazard',
            'trigger': 'hazard',
            'vulnerability_function': 'vulnerability',
            'impact_function': 'vulnerability',
            'loss_approach': 'loss',
            'loss_frequency_type': 'loss'
        };

        // Check if any part of the field path matches a signature field
        for (const part of parts) {
            if (signatureFields[part]) {
                return signatureFields[part];
            }
        }

        return null;
    }

    getClassificationFieldPurpose(fieldName) {
        // Determine what TYPE of thing is being classified based on field path and context
        // Returns: 'disaster_identifier', 'hazard_classification', 'building_taxonomy', or 'socioeconomic_index'

        console.log(`[FIELD PURPOSE] Field name: ${fieldName}`);
        console.log(`[FIELD PURPOSE] Context type: ${this.context?.type}, arrayName: ${this.context?.arrayName}`);

        const parts = fieldName.split('.');

        // For inline/modal contexts, the arrayName tells us what type of object is being edited
        // arrayName can be a full path like "vulnerability.socio_economic" or just "disaster_identifiers"
        if (this.context && this.context.arrayName) {
            const arrayName = this.context.arrayName.toLowerCase();
            console.log(`[FIELD PURPOSE] Checking arrayName: ${arrayName}`);

            // Disaster identifiers - used to identify disasters
            if (arrayName.includes('disaster_identifier')) {
                console.log(`[FIELD PURPOSE] Detected disaster_identifier from arrayName`);
                return 'disaster_identifier';
            }

            // Asset types - used to classify buildings/assets
            if (arrayName.includes('asset_type')) {
                console.log(`[FIELD PURPOSE] Detected building_taxonomy from arrayName (asset_type)`);
                return 'building_taxonomy';
            }

            // Socioeconomic indices - used for socioeconomic classification
            // Can be "indicators", "socio_economic", or similar
            if (arrayName.includes('indicator') || arrayName.includes('socio_economic') || arrayName.includes('socioeconomic')) {
                console.log(`[FIELD PURPOSE] Detected socioeconomic_index from arrayName`);
                return 'socioeconomic_index';
            }

            // Taxonomy - used for building classification (in vulnerability context)
            if (arrayName.includes('taxonomy')) {
                console.log(`[FIELD PURPOSE] Detected building_taxonomy from arrayName (taxonomy)`);
                return 'building_taxonomy';
            }

            // Note: If we reach here with an arrayName set but not matched above,
            // it might be a nested object edit (not an array item)
            console.log(`[FIELD PURPOSE] arrayName set but not matched: ${arrayName}`);
        }

        // Check field path patterns for each classification type
        // Order matters: check more specific patterns first!

        // 1. DISASTER IDENTIFIER - identifies a disaster event
        // Pattern: *.disaster_identifiers[*].scheme
        if (parts.includes('disaster_identifiers')) {
            console.log(`[FIELD PURPOSE] Detected disaster_identifier from field path (disaster_identifiers)`);
            return 'disaster_identifier';
        }

        // 2. SOCIOECONOMIC INDEX - classifies socioeconomic factors
        // Pattern: vulnerability.*.indicators[*].scheme OR *.socio_economic.*
        if (parts.includes('indicators') || parts.includes('socio_economic') || parts.includes('socioeconomic')) {
            console.log(`[FIELD PURPOSE] Detected socioeconomic_index from field path`);
            return 'socioeconomic_index';
        }

        // 3. BUILDING TAXONOMY - classifies buildings/assets
        // Pattern: exposure.*.asset_type[*].scheme OR vulnerability.*.taxonomy
        if (parts.includes('asset_type') || parts.includes('taxonomy')) {
            console.log(`[FIELD PURPOSE] Detected building_taxonomy from field path`);
            return 'building_taxonomy';
        }

        // 4. HAZARD CLASSIFICATION - classifies hazard types
        // Pattern: *.classification.* (in hazard, vulnerability/hazard, loss/hazard contexts)
        // This is found in: hazard.classification.scheme, vulnerability.hazard.classification.scheme, loss.hazard.classification.scheme
        // Must check this AFTER checking for disaster_identifiers to avoid conflicts
        if (parts.includes('classification')) {
            console.log(`[FIELD PURPOSE] Detected hazard_classification from field path (classification)`);
            return 'hazard_classification';
        }

        // If fieldName is just "scheme" and we haven't detected context yet,
        // we need to check what object we're inside based on sibling fields or parent context
        // For now, this shouldn't happen if arrayName is set correctly
        if (fieldName === 'scheme') {
            console.log(`[FIELD PURPOSE] Field is just 'scheme' with no clear context - returning null`);
            console.log(`[FIELD PURPOSE] This suggests arrayName is not being set correctly in the context`);
            return null;
        }

        console.log(`[FIELD PURPOSE] Could not detect field purpose - returning null`);
        return null;
    }

    createArrayInput(name, property, value, options) {
        if (name.includes('bbox')) {
            return this.createBboxInput(name, property, value, options);
        } else if (name.includes('centroid')) {
            return this.createCentroidInput(name, property, value, options);
        } else {
            return this.createGenericArrayInput(name, property, value, options);
        }
    }

    createBboxInput(name, property, value, options) {
        const container = document.createElement('div');
        container.className = 'bbox-field border p-3 rounded bg-light';

        const title = document.createElement('h6');
        title.textContent = 'Bounding Box Coordinates (SW Longitude, SW Latitude, NE Longitude, NE Latitude)';
        title.className = 'mb-3';
        container.appendChild(title);

        const bboxData = value || ['', '', '', ''];
        const labels = ['SW Longitude', 'SW Latitude', 'NE Longitude', 'NE Latitude'];

        const inputsContainer = document.createElement('div');
        inputsContainer.className = 'row g-2';

        function updateBboxPreview() {
            const currentBbox = getNestedValue(currentFormData, name);
            const previewInput = container.querySelector('.bbox-preview');
            if (previewInput) {
                if (currentBbox && Array.isArray(currentBbox)) {
                    previewInput.value = `[${currentBbox.join(', ')}]`;
                } else {
                    previewInput.value = 'Not specified';
                }
            }
        }

        for (let i = 0; i < 4; i++) {
            const col = document.createElement('div');
            col.className = 'col-md-6';

            const label = document.createElement('label');
            label.textContent = labels[i];
            label.className = 'form-label';

            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.className = 'form-control';
            input.name = `${this.context.getFieldId(name)}_${i}`;
            input.value = (Array.isArray(value) && value[i] !== undefined) ? value[i] : '';
            input.placeholder = i % 2 === 0 ? 'Longitude' : 'Latitude';

            input.addEventListener('input', function() {
                const currentBbox = getNestedValue(currentFormData, name) || ['', '', '', ''];
                currentBbox[i] = this.value === '' ? '' : parseFloat(this.value);
                setNestedValue(currentFormData, name, currentBbox);
                updateFormData();
                updateBboxPreview();
            });

            col.appendChild(label);
            col.appendChild(input);
            inputsContainer.appendChild(col);
        }

        container.appendChild(inputsContainer);

        const previewContainer = document.createElement('div');
        previewContainer.className = 'mt-3';

        const previewLabel = document.createElement('label');
        previewLabel.textContent = 'Bounding Box Array Format:';
        previewLabel.className = 'form-label';

        const previewInput = document.createElement('input');
        previewInput.type = 'text';
        previewInput.className = 'form-control bbox-preview';
        previewInput.readOnly = true;
        if (Array.isArray(value) && value.length > 0) {
            previewInput.value = `[${value.join(', ')}]`;
        } else {
            previewInput.value = 'Not specified';
        }
        previewInput.style.backgroundColor = '#f8f9fa';
        previewInput.style.fontFamily = 'monospace';

        previewContainer.appendChild(previewLabel);
        previewContainer.appendChild(previewInput);
        container.appendChild(previewContainer);

        return container;
    }

    createCentroidInput(name, property, value, options) {
        const container = document.createElement('div');
        container.className = 'bbox-field border p-3 rounded bg-light';

        const title = document.createElement('h6');
        title.textContent = 'Centroid Coordinates (Longitude, Latitude)';
        title.className = 'mb-3';
        container.appendChild(title);

        const centroidData = value || ['', ''];
        const labels = ['Longitude', 'Latitude'];

        const inputsContainer = document.createElement('div');
        inputsContainer.className = 'row g-2';

        function updateCentroidPreview() {
            const currentCentroid = getNestedValue(currentFormData, name);
            const previewInput = container.querySelector('.centroid-preview');
            if (previewInput) {
                if (currentCentroid && Array.isArray(currentCentroid)) {
                    previewInput.value = `Centroid point [${currentCentroid.join(', ')}]`;
                } else {
                    previewInput.value = 'Not specified';
                }
            }
        }

        for (let i = 0; i < 2; i++) {
            const col = document.createElement('div');
            col.className = 'col-md-6';

            const label = document.createElement('label');
            label.textContent = labels[i];
            label.className = 'form-label';

            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.className = 'form-control';
            input.name = `${this.context.getFieldId(name)}_${i}`;
            input.value = (Array.isArray(value) && value[i] !== undefined) ? value[i] : '';
            input.placeholder = labels[i];

            input.addEventListener('input', function() {
                const currentCentroid = getNestedValue(currentFormData, name) || ['', ''];
                currentCentroid[i] = this.value === '' ? '' : parseFloat(this.value);
                setNestedValue(currentFormData, name, currentCentroid);
                updateFormData();
                updateCentroidPreview();
            });

            col.appendChild(label);
            col.appendChild(input);
            inputsContainer.appendChild(col);
        }

        container.appendChild(inputsContainer);

        const previewContainer = document.createElement('div');
        previewContainer.className = 'mt-3';

        const previewLabel = document.createElement('label');
        previewLabel.textContent = 'Centroid Display:';
        previewLabel.className = 'form-label';

        const previewInput = document.createElement('input');
        previewInput.type = 'text';
        previewInput.className = 'form-control centroid-preview';
        previewInput.readOnly = true;
        if (Array.isArray(value) && value.length > 0) {
            previewInput.value = `Centroid point [${value.join(', ')}]`;
        } else {
            previewInput.value = 'Not specified';
        }
        previewInput.style.backgroundColor = '#f8f9fa';
        previewInput.style.fontFamily = 'monospace';

        previewContainer.appendChild(previewLabel);
        previewContainer.appendChild(previewInput);
        container.appendChild(previewContainer);

        return container;
    }

    createGenericArrayInput(name, property, value, options) {
        const container = document.createElement('div');
        container.className = 'array-field';
        container.setAttribute('data-array-name', name);
        
        // Ensure arrayData is always an array and maintains reference to original data
        let arrayData;
        if (Array.isArray(value)) {
            arrayData = value;
        } else {
            arrayData = [];
            // Initialize the array in currentFormData for normal context
            if (this.context.type === 'normal') {
                setNestedValue(currentFormData, name, arrayData);
            } else if (this.context.type === 'modal') {
                // Set the empty array in the source data so it gets properly saved
                if (name && typeof name === 'string') {
                    // This will be handled by the modal save function
                }
            }
        }
        
        const itemsContainer = document.createElement('div');
        itemsContainer.id = `${this.context.getFieldId(name)}_items`;
        
        const renderArrayItems = () => {
            console.log(`[RENDER ${name}] length=${arrayData.length}, items:`, JSON.parse(JSON.stringify(arrayData)));
            itemsContainer.innerHTML = '';

            // Check if items are objects (handles $ref, type: 'object', or allOf with object schemas)
            // Need to resolve $ref first to check the actual type
            let resolvedItems = property.items;
            if (resolvedItems && resolvedItems.$ref) {
                resolvedItems = resolveReference(resolvedItems.$ref);
            }

            const isObjectArray = resolvedItems && (
                resolvedItems.type === 'object' ||
                (resolvedItems.allOf && resolvedItems.allOf.some(schema =>
                    schema.type === 'object' || schema.$ref
                ))
            );

            if (isObjectArray) {
                // Check if this is a problematic nested array that should be inline
                const isProblematicArray = name.endsWith('.disaster_identifiers') ||
                                         name === 'disaster_identifiers';

                // For problematic arrays or modal context, create inline editing instead of opening new modals
                if (this.context.type === 'modal' || isProblematicArray) {
                    arrayData.forEach((item, index) => {
                        const itemCard = this.createInlineObjectEditor(item, index, name, property, arrayData, renderArrayItems);
                        itemsContainer.appendChild(itemCard);
                    });
                } else {
                    arrayData.forEach((item, index) => {
                        const objectCard = createObjectSummaryCard(item, index, name, property, arrayData, renderArrayItems);
                        itemsContainer.appendChild(objectCard);
                    });
                }
            } else {
                arrayData.forEach((item, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'array-item d-flex gap-2 align-items-center mb-2';
                    
                    let input;
                    let itemSchema = property.items;
                    if (!itemSchema && property.$ref) {
                        itemSchema = resolveReference(property.$ref);
                    }
                    // If itemSchema has a $ref, resolve it (e.g., countries -> codelist_country)
                    if (itemSchema && itemSchema.$ref) {
                        itemSchema = resolveReference(itemSchema.$ref);
                    }

                    if (itemSchema && itemSchema.type === 'string') {
                        if (itemSchema.enum) {
                            input = document.createElement('select');
                            input.className = 'form-select';
                            
                            const emptyOption = document.createElement('option');
                            emptyOption.value = '';
                            emptyOption.textContent = 'Select...';
                            input.appendChild(emptyOption);
                            
                            if (itemSchema.enum.includes('USA') || itemSchema.enum.includes('GBR')) {
                                itemSchema.enum.forEach((option) => {
                                    const optionElement = document.createElement('option');
                                    optionElement.value = option;
                                    const countryName = countryNames[option] || option;
                                    optionElement.textContent = `${option} - ${countryName}`;
                                    if (item === option) optionElement.selected = true;
                                    input.appendChild(optionElement);
                                });
                            } else {
                                itemSchema.enum.forEach((option, idx) => {
                                    const optionElement = document.createElement('option');
                                    optionElement.value = option;
                                    if (itemSchema.enumNames) {
                                        optionElement.textContent = itemSchema.enumNames[idx];
                                    } else if (option.includes('(') && option.includes(')')) {
                                        optionElement.textContent = option;
                                    } else {
                                        optionElement.textContent = option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                    }
                                    if (item === option) optionElement.selected = true;
                                    input.appendChild(optionElement);
                                });
                            }
                        } else {
                            input = document.createElement('input');
                            input.type = 'text';
                            input.className = 'form-control';
                            input.value = item;
                        }
                        
                        input.addEventListener('change', (e) => {
                            if (Array.isArray(arrayData) && index < arrayData.length) {
                                arrayData[index] = e.target.value;
                                if (this.context.type === 'normal') {
                                    updateFormData();
                                    // Trigger validation for spatial fields when countries array changes
                                    if (name === 'spatial.countries') {
                                        this.context.validateField(name, arrayData, property);
                                        // Also validate scale field
                                        if (currentSchema?.properties?.spatial?.properties?.scale) {
                                            this.context.validateField('spatial.scale', currentFormData.spatial?.scale, currentSchema.properties.spatial.properties.scale);
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        input = document.createElement('input');
                        input.type = 'text';
                        input.className = 'form-control';
                        input.value = item || '';
                        
                        input.addEventListener('change', (e) => {
                            arrayData[index] = e.target.value;
                            if (this.context.type === 'normal') {
                                updateFormData();
                                // Trigger validation for spatial fields when countries array changes
                                if (name === 'spatial.countries') {
                                    this.context.validateField(name, arrayData, property);
                                    // Also validate scale field
                                    if (currentSchema?.properties?.spatial?.properties?.scale) {
                                        this.context.validateField('spatial.scale', currentFormData.spatial?.scale, currentSchema.properties.spatial.properties.scale);
                                    }
                                }
                            }
                        });
                    }
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'btn btn-outline-danger btn-sm';
                    removeBtn.textContent = '×';
                    removeBtn.addEventListener('click', () => {
                        arrayData.splice(index, 1);
                        renderArrayItems();
                        if (this.context.type === 'normal') {
                            updateFormData();
                            // Trigger validation for spatial fields when countries array changes
                            if (name === 'spatial.countries') {
                                this.context.validateField(name, arrayData, property);
                                // Also validate scale field
                                if (currentSchema?.properties?.spatial?.properties?.scale) {
                                    this.context.validateField('spatial.scale', currentFormData.spatial?.scale, currentSchema.properties.spatial.properties.scale);
                                }
                            }
                        }
                    });
                    
                    itemDiv.appendChild(input);
                    itemDiv.appendChild(removeBtn);
                    itemsContainer.appendChild(itemDiv);
                });
            }
        };
        
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'btn btn-outline-primary btn-sm mb-2';
        addBtn.textContent = `+ Add ${property.title || name}`;
        addBtn.addEventListener('click', () => {
            // Check if items are objects (handles $ref, type: 'object', or allOf with object schemas)
            // Need to resolve $ref first to check the actual type
            let resolvedItems = property.items;
            if (resolvedItems && resolvedItems.$ref) {
                resolvedItems = resolveReference(resolvedItems.$ref);
            }

            const isObjectArray = resolvedItems && (
                resolvedItems.type === 'object' ||
                (resolvedItems.allOf && resolvedItems.allOf.some(schema =>
                    schema.type === 'object' || schema.$ref
                ))
            );

            if (isObjectArray) {
                // Check if this is a problematic array that should be inline
                const isProblematicArray = name.endsWith('.disaster_identifiers') ||
                                         name === 'disaster_identifiers';

                // For modal context or problematic arrays, add inline object instead of opening new modal
                if (this.context.type === 'modal' || isProblematicArray) {
                    const newItem = {};

                    // Initialize with appropriate ID based on object type
                    // EXCEPT for Classification objects (disaster_identifiers) where id is user-provided
                    const isClassificationArray = name.endsWith('.disaster_identifiers') || name === 'disaster_identifiers';

                    if (!isClassificationArray) {
                        if (name === 'metrics') {
                            newItem.id = generateUniqueId('metric');
                        } else if (name === 'cost') {
                            newItem.id = generateUniqueId('cost');
                        } else if (name === 'hazards') {
                            newItem.id = generateUniqueId('hazard');
                        } else if (name === 'events' || name.includes('.events')) {
                            newItem.id = generateUniqueId('event');
                        } else {
                            newItem.id = generateUniqueId('item');
                        }
                    }
                    // For Classification objects, leave id empty for user input
                    
                    console.log(`[ADD ITEM] Adding to ${name}, arrayData was ${arrayData.length}, pushing:`, newItem);
                    const newIndex = arrayData.length;
                    arrayData.push(newItem);
                    console.log(`[ADD ITEM] After push, arrayData is now ${arrayData.length}`);
                    renderArrayItems();
                    // Auto-scroll to the newly added item
                    setTimeout(() => {
                        const items = itemsContainer.querySelectorAll('.card, .array-item');
                        const newItem = items[newIndex];
                        if (newItem) {
                            newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            // Add a subtle highlight effect
                            newItem.style.transition = 'background-color 0.5s';
                            const originalBg = newItem.style.backgroundColor;
                            newItem.style.backgroundColor = '#fff3cd';
                            setTimeout(() => {
                                newItem.style.backgroundColor = originalBg;
                            }, 1000);
                        }
                    }, 100);
                } else {
                    openObjectEditor(name, arrayData.length, property.items, arrayData, renderArrayItems);
                }
            } else if (resolvedItems && resolvedItems.type === 'string') {
                const newIndex = arrayData.length;
                arrayData.push('');
                renderArrayItems();
                // Auto-scroll to the newly added item
                setTimeout(() => {
                    const items = itemsContainer.querySelectorAll('.array-item');
                    const newItem = items[newIndex];
                    if (newItem) {
                        newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        const input = newItem.querySelector('input, select');
                        if (input) input.focus();
                    }
                }, 100);
                if (this.context.type === 'normal') {
                    updateFormData();
                    // Trigger validation for spatial fields when countries array changes
                    if (name === 'spatial.countries') {
                        this.context.validateField(name, arrayData, property);
                        // Also validate scale field
                        if (currentSchema?.properties?.spatial?.properties?.scale) {
                            this.context.validateField('spatial.scale', currentFormData.spatial?.scale, currentSchema.properties.spatial.properties.scale);
                        }
                    }
                }
            } else {
                const newIndex = arrayData.length;
                arrayData.push({});
                renderArrayItems();
                // Auto-scroll to the newly added item
                setTimeout(() => {
                    const items = itemsContainer.querySelectorAll('.card, .array-item');
                    const newItem = items[newIndex];
                    if (newItem) {
                        newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }, 100);
                if (this.context.type === 'normal') {
                    updateFormData();
                    // Trigger validation for spatial fields when countries array changes
                    if (name === 'spatial.countries') {
                        this.context.validateField(name, arrayData, property);
                        // Also validate scale field
                        if (currentSchema?.properties?.spatial?.properties?.scale) {
                            this.context.validateField('spatial.scale', currentFormData.spatial?.scale, currentSchema.properties.spatial.properties.scale);
                        }
                    }
                }
            }
        });
        
        container.appendChild(addBtn);
        container.appendChild(itemsContainer);
        
        renderArrayItems();
        return container;
    }

    createInlineObjectEditor(item, index, arrayName, arrayProperty, arrayData, renderCallback) {
        console.log(`[CREATE CARD] Creating card for ${arrayName}[${index}], item data:`, JSON.parse(JSON.stringify(item)));
        console.log(`[CREATE CARD] arrayData for ${arrayName} has ${arrayData.length} items`);

        const card = document.createElement('div');
        card.className = 'card mb-2';
        card.setAttribute('data-item-index', index);
        card.setAttribute('data-array-name', arrayName); // Store array name to distinguish nested arrays
        card._arrayDataRef = arrayData; // Store reference for handleFieldChange
        card._arrayName = arrayName; // Store array name for debugging
        console.log(`[CREATE CARD] Stored _arrayDataRef for ${arrayName}[${index}], ref length: ${card._arrayDataRef?.length}`);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-3';

        // Get the resolved schema for the object
        let itemSchema = arrayProperty.items;
        if (itemSchema && itemSchema.$ref) {
            itemSchema = resolveReference(itemSchema.$ref);
        } else if (itemSchema && itemSchema.allOf) {
            // Resolve allOf schemas
            itemSchema = resolveAllOfSchemas(itemSchema);
        }

        // Create inline fields for properties
        if (itemSchema && itemSchema.properties) {
            console.log(`[INLINE EDITOR ${arrayName}] Creating inline editor with properties:`, Object.keys(itemSchema.properties));
            // Sort properties for better UI ordering
            const propertyEntries = Object.entries(itemSchema.properties);
            const requiredFields = itemSchema.required || [];

            // Define preferred ordering for hazard-type objects
            const hazardFieldOrder = ['id', 'type', 'process', 'intensity_measure', 'classification', 'trigger'];

            propertyEntries.sort(([keyA], [keyB]) => {
                // Check if this looks like a hazard object (has type, process, intensity_measure)
                const hasHazardFields = propertyEntries.some(([k]) => k === 'type') &&
                                      propertyEntries.some(([k]) => k === 'intensity_measure');

                if (hasHazardFields && hazardFieldOrder.includes(keyA) && hazardFieldOrder.includes(keyB)) {
                    return hazardFieldOrder.indexOf(keyA) - hazardFieldOrder.indexOf(keyB);
                }

                // Otherwise, required fields first
                const aRequired = requiredFields.includes(keyA);
                const bRequired = requiredFields.includes(keyB);
                if (aRequired && !bRequired) return -1;
                if (!aRequired && bRequired) return 1;

                // Keep original order for other fields
                return 0;
            });

            propertyEntries.forEach(([key, prop]) => {
                // Resolve $ref if present to get the full property schema
                // Preserve original title and description when resolving
                let resolvedProp = prop;
                if (prop.$ref) {
                    const resolved = resolveReference(prop.$ref);
                    if (resolved) {
                        resolvedProp = { ...resolved, title: prop.title || resolved.title, description: prop.description || resolved.description };
                    }
                }

                // Skip ID field EXCEPT for Classification objects where id is user-provided
                const isClassificationId = resolvedProp && resolvedProp.title === 'Classification identifier';
                if (key === 'id' && !isClassificationId) return;

                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'mb-2';
                fieldDiv.setAttribute('data-field-name', key);

                // Create a sub-context for inline editing
                // Don't use ID/name attributes to avoid polluting FormData
                // Pass item data so dependent fields can look up parent values
                // Pass array name to help with context-specific field handling (e.g., trigger visibility)
                // Infer component type from array name for classification_scheme filtering
                const inferredComponentType = arrayName ?
                    (arrayName.toLowerCase().includes('exposure') ? 'exposure' :
                     arrayName.toLowerCase().includes('hazard') ? 'hazard' :
                     arrayName.toLowerCase().includes('vulnerabilit') ? 'vulnerability' :
                     arrayName.toLowerCase().includes('loss') ? 'loss' : null) : null;
                const inlineContext = new FieldCreationContext('inline', fieldDiv, item, arrayName, inferredComponentType, itemSchema);
                // Use resolvedProp instead of prop to ensure nested object schemas are fully expanded
                const fieldElement = inlineContext.createField(key, resolvedProp, item[key]);

                // Only set up simple change listener for non-object and non-array fields
                // Object fields and array fields contain multiple nested inputs that need special handling
                if (resolvedProp.type !== 'object' && resolvedProp.type !== 'array') {
                    // Set up change listener to update the item data
                    const input = fieldElement.querySelector('input, select, textarea');
                    if (input) {
                        // Set initial value if item has data
                        if (item[key] !== undefined && item[key] !== null) {
                            if (input.type === 'checkbox') {
                                input.checked = item[key];
                            } else {
                                // Handle case where value might be an object (e.g., {code, title})
                                // Extract just the code string for display and update the item data
                                let displayValue = item[key];
                                console.log(`[INLINE LOAD ${arrayName}] Field ${key}[${index}] type: ${typeof displayValue}, value:`, displayValue);

                                if (typeof displayValue === 'object' && displayValue !== null && !Array.isArray(displayValue)) {
                                    displayValue = displayValue.code || displayValue.title || '';
                                    console.log(`[INLINE LOAD] Extracted from object: ${displayValue}`);
                                    // Clean up the item data to store string instead of object
                                    item[key] = displayValue;
                                    arrayData[index][key] = displayValue;
                                }
                                input.value = displayValue || '';
                            }
                        }

                        input.addEventListener('change', (e) => {
                            const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                            console.log(`[INLINE HANDLER] Field changed: ${key} in ${arrayName}[${index}], new value: ${newValue}`);
                            console.log(`[INLINE HANDLER] Captured arrayData length: ${arrayData.length}, for array: ${arrayName}, updating index: ${index}`);
                            console.log(`[INLINE HANDLER] arrayData full contents:`, JSON.parse(JSON.stringify(arrayData)));

                            item[key] = newValue;

                            // Also update arrayData to ensure persistence
                            arrayData[index][key] = newValue;
                            console.log(`[INLINE HANDLER] arrayData[${index}] after update:`, JSON.parse(JSON.stringify(arrayData[index])));
                            console.log(`[INLINE HANDLER] Full arrayData after update:`, JSON.parse(JSON.stringify(arrayData)));

                            // DON'T call updateFormData() for inline fields - they update the item object directly
                            // which is already a reference in the arrayData

                            // Note: Dependency handling (like currency toggle) is now handled by the framework's
                            // UnifiedEventHandler.handleDependentFields, which is triggered via the 'input' event
                        });
                    }
                } else {
                    // For object fields, set up change listeners on each nested input
                    // Initialize the object structure if needed
                    if (!item[key] || typeof item[key] !== 'object' || Array.isArray(item[key])) {
                        item[key] = {};
                    }
                    if (!arrayData[index][key] || typeof arrayData[index][key] !== 'object' || Array.isArray(arrayData[index][key])) {
                        arrayData[index][key] = {};
                    }

                    // Auto-generate ID for nested objects if they need one
                    // Check if the nested object schema has an 'id' property in its required fields
                    if (resolvedProp.required && resolvedProp.required.includes('id')) {
                        // Only generate ID if the object has other meaningful data
                        // For example, don't create an empty hazard object with just an ID
                        const hasOtherData = Object.keys(item[key]).some(k => k !== 'id' && item[key][k] !== undefined && item[key][k] !== '');

                        if (hasOtherData && !item[key].id) {
                            // Determine prefix based on the field name
                            let idPrefix = 'item';
                            if (key === 'hazard') idPrefix = 'hazard';
                            else if (key === 'trigger') idPrefix = 'trigger';
                            item[key].id = generateUniqueId(idPrefix);

                            if (!arrayData[index][key].id) {
                                arrayData[index][key].id = item[key].id; // Use the same ID
                            }
                            console.log(`[INLINE HANDLER] Auto-generated ID for nested object ${key}: ${item[key].id}`);
                        }
                    }

                    // Find all inputs and match them to nested properties by label text
                    const inputs = fieldElement.querySelectorAll('input, select, textarea');
                    if (resolvedProp.properties) {
                        inputs.forEach(input => {
                            // Find the label associated with this input
                            const fieldContainer = input.closest('.modal-form-field, .form-field');
                            const label = fieldContainer?.querySelector('label');
                            const labelText = label?.textContent?.trim()?.toLowerCase();

                            // Match label text to property schema
                            for (const [propKey, propSchema] of Object.entries(resolvedProp.properties)) {
                                const propTitle = propSchema.title?.toLowerCase() || propKey.toLowerCase().replace(/_/g, ' ');

                                if (labelText && (labelText === propTitle || labelText.includes(propTitle) || propTitle.includes(labelText))) {
                                    console.log(`[INLINE HANDLER] Matched input with label "${labelText}" to nested property: ${key}.${propKey}`);

                                    // Set initial value from nested object
                                    if (item[key] && item[key][propKey] !== undefined) {
                                        if (input.type === 'checkbox') {
                                            input.checked = item[key][propKey];
                                        } else {
                                            input.value = item[key][propKey];
                                        }
                                    }

                                    // Set up change listener for this nested property
                                    input.addEventListener('change', (e) => {
                                        const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                                        console.log(`[INLINE HANDLER] Nested field changed: ${key}.${propKey} in ${arrayName}[${index}], new value: ${newValue}`);

                                        // Update nested property in both references
                                        if (!item[key]) item[key] = {};
                                        item[key][propKey] = newValue;

                                        if (!arrayData[index][key]) arrayData[index][key] = {};
                                        arrayData[index][key][propKey] = newValue;

                                        // Auto-generate ID if this nested object now has meaningful data and needs an ID
                                        if (resolvedProp.required && resolvedProp.required.includes('id') && !item[key].id) {
                                            const hasOtherData = Object.keys(item[key]).some(k => k !== 'id' && item[key][k] !== undefined && item[key][k] !== '');
                                            if (hasOtherData) {
                                                let idPrefix = 'item';
                                                if (key === 'hazard') idPrefix = 'hazard';
                                                else if (key === 'trigger') idPrefix = 'trigger';
                                                item[key].id = generateUniqueId(idPrefix);
                                                arrayData[index][key].id = item[key].id;
                                                console.log(`[INLINE HANDLER] Auto-generated ID for nested object ${key}: ${item[key].id}`);
                                            }
                                        }

                                        console.log(`[INLINE HANDLER] Updated ${arrayName}[${index}].${key}:`, JSON.parse(JSON.stringify(arrayData[index][key])));
                                    });

                                    break; // Found the match, move to next input
                                }
                            }
                        });
                    }
                }
                
                fieldDiv.appendChild(fieldElement);
                cardBody.appendChild(fieldDiv);

            });
        }
        
        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'd-flex justify-content-end gap-2 mt-2';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-outline-danger btn-sm';
        removeBtn.textContent = '🗑️ Remove';
        removeBtn.addEventListener('click', () => {
            arrayData.splice(index, 1);
            renderCallback();
        });
        
        actions.appendChild(removeBtn);
        cardBody.appendChild(actions);

        card.appendChild(cardBody);

        return card;
    }

    createObjectInput(name, property, value, options) {
        console.log(`[CREATE OBJECT] Creating object input for: ${name}`);
        console.log(`[CREATE OBJECT]   property has $ref:`, !!property.$ref);
        console.log(`[CREATE OBJECT]   property.properties:`, property.properties ? Object.keys(property.properties) : 'undefined');

        const container = document.createElement('div');
        container.className = 'object-field';

        // Resolve $ref if the property itself is a reference (e.g., hazard_primary -> Hazard)
        let resolvedProperty = property;
        if (property.$ref) {
            console.log(`[CREATE OBJECT] Resolving $ref: ${property.$ref}`);
            resolvedProperty = resolveReference(property.$ref);
            if (!resolvedProperty) {
                console.warn(`Could not resolve $ref for ${name}:`, property.$ref);
                return container;
            }
            console.log(`[CREATE OBJECT]   resolved.properties:`, resolvedProperty.properties ? Object.keys(resolvedProperty.properties) : 'undefined');
            // Keep original title and description if present
            if (property.title) resolvedProperty.title = property.title;
            if (property.description) resolvedProperty.description = property.description;
        } else {
            console.log(`[CREATE OBJECT] No $ref to resolve, using property directly`);
        }

        const isDirectFormProperty = !name.includes('.') || name.split('.').length <= 2;
        const isSpatialField = name === 'spatial';
        const isTemporalField = name === 'temporal';
        const isLineageField = name === 'lineage';
        const isClassificationField = name.endsWith('.classification') || name === 'classification';
        const isAssetTypeField = name.endsWith('.asset_type') || name === 'asset_type';
        const isCollapsibleField = isClassificationField || isAssetTypeField;

        // Always show title for spatial field, temporal field, lineage field, classification fields, asset_type, or for nested objects
        if (!isDirectFormProperty || isSpatialField || isTemporalField || isLineageField || isCollapsibleField) {
            const title = document.createElement('h6');
            // Special handling for trigger field in hazards array - label as "Hazard trigger"
            const fieldBaseName = name.split('.').pop();
            // Convert snake_case to Title Case if no title provided
            const fallbackTitle = fieldBaseName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            let titleText = resolvedProperty.title || property.title || fallbackTitle;
            if (fieldBaseName === 'trigger' && this.context.type === 'inline' && this.context.arrayName === 'hazards') {
                titleText = 'Hazard trigger';
            }
            title.textContent = titleText;
            title.className = 'mb-3';

            // Add some styling for main spatial, temporal, and lineage sections
            if (isSpatialField || isTemporalField || isLineageField) {
                title.className = 'mb-3 mt-3';
                title.style.borderBottom = '1px solid #dee2e6';
                title.style.paddingBottom = '0.5rem';
            }

            // Make classification and asset_type sections collapsible and closed by default
            if (isCollapsibleField) {
                title.style.cursor = 'pointer';
                title.style.userSelect = 'none';
                // Add collapse indicator
                const collapseIcon = document.createElement('span');
                collapseIcon.textContent = ' ▶';
                collapseIcon.style.fontSize = '0.8em';
                collapseIcon.style.marginLeft = '0.5rem';
                title.appendChild(collapseIcon);
            }

            container.appendChild(title);
        }

        console.log(`[CREATE OBJECT] Final resolvedProperty.properties:`, resolvedProperty.properties ? Object.keys(resolvedProperty.properties) : 'undefined');

        // Create collapsible wrapper for classification and asset_type sections
        let contentContainer = container;
        if (isCollapsibleField && resolvedProperty.properties) {
            const collapseWrapper = document.createElement('div');
            collapseWrapper.style.display = 'none'; // Closed by default
            collapseWrapper.className = 'classification-content';

            // Add description inside the collapsible wrapper if it exists
            if (resolvedProperty.description || property.description) {
                const description = document.createElement('small');
                description.className = 'form-text text-muted d-block mb-2';
                description.innerHTML = parseMarkdownLinks(resolvedProperty.description || property.description, currentSchemaVersion);
                collapseWrapper.appendChild(description);
            }

            container.appendChild(collapseWrapper);
            contentContainer = collapseWrapper;

            // Add click handler to title to toggle collapse
            const titleElement = container.querySelector('h6');
            if (titleElement) {
                titleElement.addEventListener('click', () => {
                    const icon = titleElement.querySelector('span');
                    if (collapseWrapper.style.display === 'none') {
                        collapseWrapper.style.display = 'block';
                        if (icon) icon.textContent = ' ▼';
                    } else {
                        collapseWrapper.style.display = 'none';
                        if (icon) icon.textContent = ' ▶';
                    }
                });
            }
        }

        if (resolvedProperty.properties) {
            console.log(`[CREATE OBJECT] Iterating through ${Object.keys(resolvedProperty.properties).length} properties for ${name}`);

            // Sort properties for better UI ordering
            // Priority: required fields first, then specific ordering for hazard objects
            const propertyEntries = Object.entries(resolvedProperty.properties);
            const requiredFields = resolvedProperty.required || [];

            // Define preferred ordering for hazard-type objects
            const hazardFieldOrder = ['type', 'process', 'intensity_measure', 'classification'];

            propertyEntries.sort(([keyA], [keyB]) => {
                // If this looks like a hazard object (has type, process, intensity_measure)
                const hasHazardFields = propertyEntries.some(([k]) => k === 'type') &&
                                      propertyEntries.some(([k]) => k === 'intensity_measure');

                if (hasHazardFields) {
                    const indexA = hazardFieldOrder.indexOf(keyA);
                    const indexB = hazardFieldOrder.indexOf(keyB);

                    // Both keys are in the hazard field order - sort by that order
                    if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB;
                    }
                    // Only A is in the order - A comes first
                    if (indexA !== -1) return -1;
                    // Only B is in the order - B comes first
                    if (indexB !== -1) return 1;
                    // Neither is in the order - fall through to required field logic
                }

                // Otherwise, required fields first
                const aRequired = requiredFields.includes(keyA);
                const bRequired = requiredFields.includes(keyB);
                if (aRequired && !bRequired) return -1;
                if (!aRequired && bRequired) return 1;

                // Keep original order for other fields
                return 0;
            });

            console.log(`[CREATE OBJECT] Property order after sorting:`, propertyEntries.map(([k]) => k));

            propertyEntries.forEach(([key, prop]) => {
                console.log(`[CREATE OBJECT]   Creating field: ${name}.${key}`);
                const fieldValue = value && value[key] ? value[key] : null;

                // Resolve $ref if present to ensure full schema with conditional properties
                let resolvedProp = prop;
                if (prop.$ref) {
                    resolvedProp = resolveReference(prop.$ref);
                }

                // Pass itemData to sub-context so nested fields can access parent item data for dependencies
                // Also pass componentType so classification_scheme filtering works correctly
                const subContext = new FieldCreationContext(this.context.type, this.context.container, this.context.itemData || value, this.context.arrayName, this.context.componentType);
                // Use resolvedProp to ensure nested properties get full schema with allOf expanded
                const field = subContext.createField(`${name}.${key}`, resolvedProp || prop, fieldValue, options);
                console.log(`[CREATE OBJECT]   Appending field to container, field tagName: ${field.tagName}, className: ${field.className}`);

                // valuation_year is only applicable when quantity_kind = 'currency'
                if (key === 'valuation_year') {
                    const currentQuantityKind = value && value['quantity_kind'];
                    if (currentQuantityKind !== 'currency') {
                        field.style.display = 'none';
                    }
                }

                contentContainer.appendChild(field);
            });
        }

        console.log(`[CREATE OBJECT] Returning container with ${container.children.length} children`);
        return container;
    }

    addValidationIndicator(container, name) {
        const validationIndicator = document.createElement('span');
        validationIndicator.className = 'validation-indicator';
        validationIndicator.id = `validation-${name}`;
        container.appendChild(validationIndicator);
    }

    addExamples(container, property) {
        if (property.examples && property.examples.length > 0) {
            const hint = document.createElement('div');
            hint.className = 'field-hint';
            hint.innerHTML = `<strong>Examples:</strong> ${property.examples.slice(0, 3).join(', ')}`;
            container.appendChild(hint);
        }
    }

    handleDependencies(container, name, property, value) {
        // Legacy currency field handling removed - currency is now part of the unit field
        // with conditional codelist based on quantity_kind
    }

    resolveSchemaRef(ref) {
        if (!ref || !ref.startsWith('#/$defs/')) return null;
        if (!currentSchema || !currentSchema.$defs) {
            console.warn('Schema not loaded yet, cannot resolve ref:', ref);
            return null;
        }
        const defName = ref.replace('#/$defs/', '');
        return currentSchema.$defs[defName] || null;
    }

    hasConditionalCodelist(name) {
        // Check if this field has conditional codelists defined via allOf rules
        // For example, 'unit' field in Measurement has codelists added conditionally
        const fieldBaseName = name.split('.').pop();
        console.log(`[HAS CONDITIONAL] Checking: ${name}, baseName: ${fieldBaseName}`);

        // Known fields that have conditional codelists
        if (fieldBaseName === 'unit') {
            const dependsOn = FIELD_DEPENDENCIES[name] || FIELD_DEPENDENCIES[fieldBaseName];
            console.log(`[HAS CONDITIONAL] Unit field detected, dependsOn:`, dependsOn);

            if (dependsOn) {
                const schemaPath = this.getSchemaPathForField(name);
                console.log(`[HAS CONDITIONAL] schemaPath:`, schemaPath);

                if (schemaPath) {
                    // Direct access since SchemaNavigator.getDefinitionAtPath is failing
                    let schema = null;
                    if (schemaPath === '$defs.Measurement' && currentSchema.$defs) {
                        schema = currentSchema.$defs.Measurement;
                    } else if (schemaPath === '$defs.Hazard' && currentSchema.$defs) {
                        schema = currentSchema.$defs.Hazard;
                    }
                    console.log(`[HAS CONDITIONAL] schema found:`, !!schema, 'has allOf:', !!(schema && schema.allOf));

                    if (schema && schema.allOf) {
                        // Check if any allOf rule adds codelist to this field
                        // Need to resolve $ref in allOf first
                        for (const allOfItem of schema.allOf) {
                            let conditionalSchema = allOfItem;

                            // If allOf item is a $ref, resolve it
                            if (allOfItem.$ref) {
                                console.log(`[HAS CONDITIONAL] Resolving allOf $ref:`, allOfItem.$ref);
                                conditionalSchema = resolveReferenceSimple(allOfItem.$ref);
                                if (!conditionalSchema) {
                                    console.log(`[HAS CONDITIONAL] Failed to resolve $ref`);
                                    continue;
                                }
                                console.log(`[HAS CONDITIONAL] Resolved, has allOf:`, !!(conditionalSchema.allOf));
                            }

                            // Now check if this conditional schema has rules for our field
                            if (conditionalSchema.allOf) {
                                console.log(`[HAS CONDITIONAL] Checking ${conditionalSchema.allOf.length} conditional rules`);
                                for (const rule of conditionalSchema.allOf) {
                                    if (rule.then && rule.then.properties && rule.then.properties[fieldBaseName]) {
                                        const fieldSchema = rule.then.properties[fieldBaseName];
                                        console.log(`[HAS CONDITIONAL] Found rule for ${fieldBaseName}, has codelist:`, !!(fieldSchema.codelist || fieldSchema.$ref));
                                        if (fieldSchema.codelist || fieldSchema.$ref) {
                                            console.log(`[HAS CONDITIONAL] RETURNING TRUE`);
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        console.log(`[HAS CONDITIONAL] RETURNING FALSE`);
        return false;
    }

    getSchemaPathForField(fieldName) {
        // Map field names to their schema paths for conditional codelist detection
        if (fieldName.includes('unit')) {
            return '$defs.Measurement';
        }
        if (fieldName.includes('intensity_measure')) {
            return '$defs.Hazard';
        }
        return null;
    }

    isRequiredField(name, property, options) {
        // For inline context, check the itemSchema passed through context
        if (this.context.type === 'inline' && this.context.itemSchema) {
            const requiredFields = this.context.itemSchema.required || [];
            return requiredFields.includes(name);
        }

        // Spatial scale is always mandatory when spatial coverage is included
        if (name === 'spatial.scale') {
            return true;
        }

        // The spatial section itself should NOT have red bar
        if (name === 'spatial') {
            return false;
        }

        // Other spatial fields are NOT mandatory (except countries, which depends on scale)
        // Only spatial.scale should show the red bar
        if (name.startsWith('spatial.') && name !== 'spatial.scale' && name !== 'spatial.countries') {
            return false;
        }

        // spatial.countries is not directly required (its requirement depends on scale value)
        if (name === 'spatial.countries') {
            return false;
        }

        // For modal context (array item editors), we need to check the item schema
        if (this.context.type === 'modal' && currentObjectEditor && currentObjectEditor.arrayName) {
            const arrayName = currentObjectEditor.arrayName;

            // Navigate to the array schema (handle nested paths like "loss.losses")
            const arrayParts = arrayName.split('.');
            let arraySchema = currentSchema.properties;

            // Navigate through the nested path
            for (const part of arrayParts) {
                if (arraySchema && arraySchema[part]) {
                    arraySchema = arraySchema[part];
                } else if (arraySchema && arraySchema.properties && arraySchema.properties[part]) {
                    // Check in properties for object schemas
                    arraySchema = arraySchema.properties[part];
                } else {
                    arraySchema = null;
                    break;
                }
            }

            let itemSchema = null;

            // Handle direct items schema or $ref
            if (arraySchema && arraySchema.items) {
                if (arraySchema.items.$ref) {
                    itemSchema = this.resolveSchemaRef(arraySchema.items.$ref);
                } else {
                    itemSchema = arraySchema.items;
                }
            }

            // Check if this field is required in the item schema
            if (itemSchema && itemSchema.required && itemSchema.required.includes(name)) {
                return true;
            }

            // Handle nested required fields (like impact_and_losses fields in loss items)
            if (name.includes('.') && itemSchema && itemSchema.properties) {
                const parts = name.split('.');
                const fieldName = parts[parts.length - 1];

                let current = itemSchema;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (current.properties && current.properties[parts[i]]) {
                        current = current.properties[parts[i]];
                    }
                }

                if (current && current.required && current.required.includes(fieldName)) {
                    return true;
                }
            }

            // Don't check nested object required fields here - they are handled by nested field names (e.g., "hazard.process")
            // The buggy check below was incorrectly marking ALL fields named 'process' as required
            // just because 'hazard' object has 'process' in its required array
            // This has been removed to fix incorrect required field highlighting
        }

        // Check top-level required fields (general section)
        // Only check for fields without dots (top-level fields only)
        if (!name.includes('.') && currentSchema.required && currentSchema.required.includes(name)) {
            return true;
        }

        // Check section-specific required fields
        if (name.includes('.')) {
            const parts = name.split('.');
            const sectionName = parts[0];
            const fieldName = parts[parts.length - 1];

            // Check if this section has a schema with required fields
            if (currentSchema.properties && currentSchema.properties[sectionName]) {
                const sectionSchema = currentSchema.properties[sectionName];

                // For nested object fields (e.g., project.name), only mark as required
                // if the parent object itself is required at the dataset level
                if (sectionSchema.type === 'object' && sectionSchema.required && sectionSchema.required.includes(fieldName)) {
                    // Check if parent object is required at dataset level
                    const isParentRequired = currentSchema.required && currentSchema.required.includes(sectionName);
                    if (isParentRequired) {
                        return true;
                    }
                    // If parent is not required at dataset level, nested field is also not required
                    return false;
                }

                // Direct section required fields (for non-object types)
                if (sectionSchema.required && sectionSchema.required.includes(fieldName)) {
                    return true;
                }

                // For nested objects (like exposure items, loss items, etc.)
                if (sectionSchema.type === 'array' && sectionSchema.items) {
                    let itemsSchema = sectionSchema.items;

                    // Resolve $ref if present
                    if (itemsSchema.$ref) {
                        itemsSchema = this.resolveSchemaRef(itemsSchema.$ref);
                    }

                    if (itemsSchema && itemsSchema.required && itemsSchema.required.includes(fieldName)) {
                        return true;
                    }
                }

                // For complex nested paths (like loss.losses.*)
                if (parts.length > 2 && sectionSchema.properties) {
                    let current = sectionSchema;
                    for (let i = 1; i < parts.length - 1; i++) {
                        if (current.properties && current.properties[parts[i]]) {
                            current = current.properties[parts[i]];
                            // Handle items with $ref (like loss.losses items)
                            if (current.items) {
                                if (current.items.$ref) {
                                    current = this.resolveSchemaRef(current.items.$ref);
                                } else {
                                    current = current.items;
                                }
                            }
                        } else if (current.items) {
                            if (current.items.$ref) {
                                current = this.resolveSchemaRef(current.items.$ref);
                            } else {
                                current = current.items;
                            }
                        }
                    }
                    if (current && current.required && current.required.includes(fieldName)) {
                        return true;
                    }
                }
            }
        }


        return false;
    }

    setupAutoComplete(input, fieldName, property) {
        let suggestions = [];
        
        if (property.suggestions && property.suggestions.length > 0) {
            suggestions = [...property.suggestions];
        }
        
        if (property.examples && property.examples.length > 0) {
            suggestions = [...suggestions, ...property.examples];
        }
        
        if (AUTO_COMPLETE_SUGGESTIONS[fieldName]) {
            suggestions = [...suggestions, ...AUTO_COMPLETE_SUGGESTIONS[fieldName]];
        }
        
        suggestions = [...new Set(suggestions)];
        
        if (suggestions.length === 0) return;

        const container = input.parentElement;
        let suggestionContainer = container;
        if (container.classList.contains('input-group')) {
            suggestionContainer = container.parentElement;
        }
        
        if (!suggestionContainer) return;
        
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'autocomplete-suggestions';
        suggestionContainer.appendChild(suggestionsDiv);

        input.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const matches = suggestions.filter(s => s.toLowerCase().includes(value));
            
            if (matches.length > 0 && value.length > 0) {
                suggestionsDiv.innerHTML = '';
                matches.slice(0, 8).forEach(match => {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-suggestion';
                    div.textContent = match;
                    div.addEventListener('click', () => {
                        input.value = match;
                        suggestionsDiv.style.display = 'none';
                        updateFormData();
                    });
                    suggestionsDiv.appendChild(div);
                });
                suggestionsDiv.style.display = 'block';
            } else {
                suggestionsDiv.style.display = 'none';
            }
        });

        input.addEventListener('blur', function() {
            setTimeout(() => {
                suggestionsDiv.style.display = 'none';
            }, 150);
        });
    }
}

/**
 * Unified Event Handler
 * Handles events consistently across all contexts
 */
class UnifiedEventHandler {
    constructor(context) {
        this.context = context;
    }

    setupListeners(element, name, property, options = {}) {
        const eventHandler = async (e) => {
            await this.handleFieldChange(e, name, property, options);
        };

        if (element.tagName === 'SELECT') {
            // For SELECT elements, listen to both 'change' and 'input' for immediate dropdown response
            element.addEventListener('change', eventHandler);
            element.addEventListener('input', eventHandler);
        } else if (element.type === 'checkbox') {
            element.addEventListener('change', eventHandler);
        } else {
            element.addEventListener('input', eventHandler);
        }
    }

    // getEventType method removed - event handling now done directly in setupListeners

    async handleFieldChange(event, name, property, options) {
        // ASYNC VERSION - Updated for v1.0 IMT loading
        const value = this.getFieldValue(event.target);
        console.log(`[SETUP LISTENERS] handleFieldChange called for field: ${name}, context: ${this.context.type}, value: ${value}`);

        // Update form data
        if (this.context.type === 'normal') {
            updateFormData();
        } else if (this.context.type === 'modal') {
            // Handle modal-specific updates
            this.handleModalFieldChange(name, value, property);
        } else if (this.context.type === 'inline') {
            // For inline context, find the item object and update it directly
            const card = event.target.closest('.card[data-item-index]');
            if (card) {
                const index = parseInt(card.getAttribute('data-item-index'));
                const arrayName = card.getAttribute('data-array-name') || card._arrayName || 'unknown';
                // Find the arrayData reference - it's passed when the field was created
                // We need to store it on the card element
                const arrayData = card._arrayDataRef;
                if (arrayData && arrayData[index]) {
                    console.log(`[INLINE UPDATE] Updating ${name} in ${arrayName}[${index}] to: ${value}`);
                    // Use setNestedValue to properly handle dotted paths like "occurrence.empirical.temporal.start"
                    setNestedValue(arrayData[index], name, value);
                    console.log(`[INLINE UPDATE] ${arrayName}[${index}] now:`, JSON.parse(JSON.stringify(arrayData[index])));
                } else {
                    console.warn(`[INLINE UPDATE] Could not find arrayData reference for ${arrayName}[${index}]`);
                }
            }
        }

        // Validate field
        this.context.validateField(name, value, property);

        // Cross-validate spatial fields (scale and countries are interdependent)
        // Handle both normal context (spatial.scale) and modal context (scale)
        const isScaleField = name === 'spatial.scale' || name === 'scale';
        const isCountriesField = name === 'spatial.countries' || name === 'countries';

        if (isScaleField || isCountriesField) {
            const relatedField = isScaleField ?
                (name === 'spatial.scale' ? 'spatial.countries' : 'countries') :
                (name === 'spatial.countries' ? 'spatial.scale' : 'scale');

            const relatedValue = isScaleField
                ? (name === 'spatial.scale' ? currentFormData.spatial?.countries : null)
                : (name === 'spatial.countries' ? currentFormData.spatial?.scale : null);

            // Find the related field's property definition
            if (currentSchema?.properties?.spatial?.properties) {
                const relatedFieldName = relatedField.split('.').pop();
                const relatedProperty = currentSchema.properties.spatial.properties[relatedFieldName];
                if (relatedProperty) {
                    this.context.validateField(relatedField, relatedValue, relatedProperty);
                }
            }

            // Disable/enable countries field based on scale value
            if (isScaleField) {
                const isGlobal = value && value.toLowerCase() === 'global';

                // Find countries container - search within modal if in modal context, otherwise search globally
                let countriesContainer = null;

                if (this.context.type === 'modal') {
                    // In modal context, search within the modal for the countries field
                    const modal = event.target.closest('.modal');
                    if (modal) {
                        // Try both with and without spatial prefix
                        countriesContainer = modal.querySelector('[data-array-name="spatial.countries"]') ||
                                           modal.querySelector('[data-array-name="countries"]');
                    }
                } else {
                    // In normal context, search for spatial.countries
                    countriesContainer = document.querySelector('[data-array-name="spatial.countries"]');
                }

                if (countriesContainer) {
                    // Disable all inputs and buttons in the countries container
                    const inputs = countriesContainer.querySelectorAll('input, select, button');
                    inputs.forEach(input => {
                        input.disabled = isGlobal;
                    });

                    // Add visual indication
                    if (isGlobal) {
                        countriesContainer.style.opacity = '0.5';
                        countriesContainer.style.pointerEvents = 'none';
                        // Add a note if not already present
                        let note = countriesContainer.querySelector('.global-scale-note');
                        if (!note) {
                            note = document.createElement('div');
                            note.className = 'global-scale-note alert alert-info mt-2';
                            note.innerHTML = '<small><strong>Note:</strong> Country selection is not required for global scale datasets.</small>';
                            countriesContainer.appendChild(note);
                        }
                    } else {
                        countriesContainer.style.opacity = '1';
                        countriesContainer.style.pointerEvents = 'auto';
                        // Remove the note if present
                        const note = countriesContainer.querySelector('.global-scale-note');
                        if (note) {
                            note.remove();
                        }
                    }
                }
            }
        }

        // Handle dependencies
        this.handleDependentFields(name, value, event.target);
    }

    getFieldValue(element) {
        if (element.type === 'checkbox') return element.checked;
        return element.value;
    }

    handleModalFieldChange(name, value, property) {
        // Modal-specific data handling can be added here
        console.log(`Modal field changed: ${name} = ${value}`);
    }

    handleDependentFields(changedFieldName, newValue, element) {
        // Handle field dependencies
        const dependents = this.findDependentFields(changedFieldName);

        console.log(`[DEPENDENCY] Field "${changedFieldName}" changed to "${newValue}", context: ${this.context.type}`);
        console.log(`[DEPENDENCY] Found ${dependents.length} dependents:`, dependents);

        dependents.forEach(dependentFieldName => {
            // For inline context, find dependent fields within the same card
            if (this.context.type === 'inline') {
                const currentCard = element.closest('.card[data-item-index]');
                console.log(`[DEPENDENCY] Looking for dependent "${dependentFieldName}" in inline context`);
                console.log(`[DEPENDENCY] Found card:`, !!currentCard);

                if (currentCard) {
                    const cardBody = currentCard.querySelector(':scope > .card-body');
                    console.log(`[DEPENDENCY] Card body found:`, !!cardBody);

                    // Try to find the dependent field by data-field-name
                    // For nested objects (like trigger.hazard_process), we need to search more flexibly
                    let dependentFieldDiv = null;
                    let fullDependentFieldName = dependentFieldName;

                    if (cardBody) {
                        // For nested fields (e.g., changedFieldName is "trigger.type"),
                        // we need to construct the full dependent field name (e.g., "trigger.hazard_process")
                        if (changedFieldName.includes('.')) {
                            const pathParts = changedFieldName.split('.');
                            pathParts.pop(); // Remove the last part (e.g., "type")
                            const pathPrefix = pathParts.join('.'); // Get prefix (e.g., "trigger")

                            // Only apply prefix if the dependent field doesn't already start with it
                            // This prevents double-prefixing like "impact_and_losses.impact_and_losses.currency"
                            if (!dependentFieldName.startsWith(pathPrefix + '.')) {
                                fullDependentFieldName = `${pathPrefix}.${dependentFieldName}`;
                                console.log(`[DEPENDENCY] Constructed full dependent name: "${fullDependentFieldName}" from prefix "${pathPrefix}"`);
                            } else {
                                console.log(`[DEPENDENCY] Dependent "${dependentFieldName}" already has prefix "${pathPrefix}", not adding it again`);
                            }
                        }

                        // First try exact match with the full constructed name (for nested fields like trigger.hazard_process)
                        dependentFieldDiv = cardBody.querySelector(`[data-field-name="${fullDependentFieldName}"]`);
                        console.log(`[DEPENDENCY] Exact match for full name "${fullDependentFieldName}":`, !!dependentFieldDiv);

                        // If not found and we constructed a full name, it might be because the field doesn't have data-field-name
                        // In that case, skip to the fallback ID-based lookup
                        if (!dependentFieldDiv && fullDependentFieldName === dependentFieldName) {
                            // Only try base name if we didn't construct a full name
                            dependentFieldDiv = cardBody.querySelector(`[data-field-name="${dependentFieldName}"]`);
                            console.log(`[DEPENDENCY] Exact match for base name "${dependentFieldName}":`, !!dependentFieldDiv);
                        }
                    }

                    if (dependentFieldDiv) {
                        const dependentField = dependentFieldDiv.querySelector('select, input');
                        console.log(`[DEPENDENCY] Found dependent field element:`, !!dependentField);
                        if (dependentField) {
                            if (dependentFieldName.includes('hazard_process') || dependentFieldName.includes('process')) {
                                console.log(`[DEPENDENCY] Rebuilding process dropdown with value "${newValue}"`);
                                this.rebuildDependentDropdown(dependentField, fullDependentFieldName, newValue);
                            } else if (dependentFieldName.includes('intensity_measure')) {
                                console.log(`[DEPENDENCY] Updating IMT field with hazard type "${newValue}"`);
                                this.updateIMTField(dependentField, newValue).catch(err => {
                                    console.error('[DEPENDENCY] Error updating IMT field:', err);
                                });
                            } else if (dependentFieldName.includes('unit')) {
                                console.log(`[DEPENDENCY] Reloading unit codelist with quantity_kind "${newValue}"`);
                                // Reset the unit field value when quantity_kind changes
                                dependentField.value = '';
                                dependentField.dispatchEvent(new Event('input', { bubbles: true }));
                                dependentField.dispatchEvent(new Event('change', { bubbles: true }));
                                this.reloadComboboxCodelist(dependentField, fullDependentFieldName, newValue);
                            } else if (dependentFieldName.includes('valuation_year')) {
                                const fieldWrapper = dependentField.closest('.form-field, .modal-form-field');
                                if (fieldWrapper) {
                                    if (newValue === 'currency') {
                                        fieldWrapper.style.display = '';
                                    } else {
                                        fieldWrapper.style.display = 'none';
                                        dependentField.value = '';
                                        dependentField.dispatchEvent(new Event('input', { bubbles: true }));
                                    }
                                }
                            }
                        }
                    } else {
                        console.warn(`[DEPENDENCY] Could not find dependent field "${fullDependentFieldName}" in card using data-field-name`);

                        // FALLBACK: Try ID-based lookup for nested objects (like trigger fields)
                        // which don't have data-field-name attributes
                        // IMPORTANT: Search within the current card, not globally, to avoid ID collisions
                        // Note: fullDependentFieldName is already constructed above
                        console.log(`[DEPENDENCY] Trying ID-based fallback for: "${fullDependentFieldName}"`);

                        const dependentFieldId = this.context.getFieldId(fullDependentFieldName);
                        console.log(`[DEPENDENCY] Fallback: Constructed field ID: "${dependentFieldId}"`);

                        // List all elements with IDs in the card for debugging
                        const allElementsWithIds = currentCard.querySelectorAll('[id]');
                        console.log(`[DEPENDENCY] Fallback: Found ${allElementsWithIds.length} elements with IDs in card:`);
                        allElementsWithIds.forEach(el => {
                            console.log(`[DEPENDENCY] Fallback:   - ID: "${el.id}", tag: ${el.tagName}`);
                        });

                        // Search for the field within the current card to avoid ID collisions across multiple cards
                        const dependentField = currentCard.querySelector(`#${CSS.escape(dependentFieldId)}`);
                        console.log(`[DEPENDENCY] Fallback: Looking for ID "${dependentFieldId}" within card, found: ${!!dependentField}`);

                        if (dependentField) {
                            if (dependentFieldName.includes('hazard_process') || dependentFieldName.includes('process')) {
                                console.log(`[DEPENDENCY] Fallback: Rebuilding process dropdown`);
                                this.rebuildDependentDropdown(dependentField, fullDependentFieldName, newValue);
                            } else if (dependentFieldName.includes('intensity_measure')) {
                                console.log(`[DEPENDENCY] Fallback: Updating IMT field`);
                                this.updateIMTField(dependentField, newValue).catch(err => {
                                    console.error('[DEPENDENCY] Fallback: Error updating IMT field:', err);
                                });
                            } else if (dependentFieldName.includes('unit')) {
                                console.log(`[DEPENDENCY] Fallback: Reloading unit codelist`);
                                // Reset the unit field value when quantity_kind changes
                                dependentField.value = '';
                                dependentField.dispatchEvent(new Event('input', { bubbles: true }));
                                dependentField.dispatchEvent(new Event('change', { bubbles: true }));
                                this.reloadComboboxCodelist(dependentField, fullDependentFieldName, newValue);
                            } else if (dependentFieldName.includes('valuation_year')) {
                                const fieldWrapper = dependentField.closest('.form-field, .modal-form-field');
                                if (fieldWrapper) {
                                    if (newValue === 'currency') {
                                        fieldWrapper.style.display = '';
                                    } else {
                                        fieldWrapper.style.display = 'none';
                                        dependentField.value = '';
                                        dependentField.dispatchEvent(new Event('input', { bubbles: true }));
                                    }
                                }
                            }
                        } else {
                            console.error(`[DEPENDENCY] Fallback: Failed to find dependent field with ID "${dependentFieldId}"`);
                        }
                    }
                }
            } else {
                // For normal and modal context, use ID-based lookup
                // If the changed field has a path prefix (e.g., "trigger.type"),
                // we need to apply the same prefix to the dependent field
                let fullDependentFieldName = dependentFieldName;
                if (changedFieldName.includes('.')) {
                    const pathParts = changedFieldName.split('.');
                    const baseChangedField = pathParts.pop(); // Remove the last part (e.g., "type")
                    const pathPrefix = pathParts.join('.'); // Get the prefix (e.g., "trigger")

                    // Only apply prefix if the dependent field doesn't already start with it
                    // This prevents double-prefixing like "impact_and_losses.impact_and_losses.currency"
                    if (!dependentFieldName.startsWith(pathPrefix + '.')) {
                        fullDependentFieldName = `${pathPrefix}.${dependentFieldName}`;
                        console.log(`[DEPENDENCY] Changed field has path: "${changedFieldName}", applying prefix "${pathPrefix}" to dependent "${dependentFieldName}" → "${fullDependentFieldName}"`);
                    } else {
                        console.log(`[DEPENDENCY] Changed field has path: "${changedFieldName}", dependent "${dependentFieldName}" already has the prefix, not adding it again`);
                    }
                }

                const dependentFieldId = this.context.getFieldId(fullDependentFieldName);
                const dependentField = document.getElementById(dependentFieldId);
                console.log(`[DEPENDENCY] Looking for dependent field with ID: "${dependentFieldId}", found: ${!!dependentField}`);

                if (!dependentField) {
                    // DEBUG: List all elements with IDs to help diagnose
                    console.log(`[DEPENDENCY] Could not find dependent field. Listing all elements with IDs containing "process":`);
                    document.querySelectorAll('[id*="process"]').forEach(el => {
                        console.log(`[DEPENDENCY]   - ID: "${el.id}", tag: ${el.tagName}, type: ${el.type || 'N/A'}`);
                    });
                }

                if (dependentField) {
                    console.log(`[DEPENDENCY] Found dependent field, tagName: ${dependentField.tagName}, type: ${dependentField.type || 'N/A'}`);
                    if (dependentFieldName.includes('hazard_process') || dependentFieldName.includes('process')) {
                        console.log(`[DEPENDENCY] Calling rebuildDependentDropdown(element, "${fullDependentFieldName}", "${newValue}")`);
                        this.rebuildDependentDropdown(dependentField, fullDependentFieldName, newValue);
                    } else if (dependentFieldName.includes('intensity_measure')) {
                        // Use specialized IMT filtering based on hazard type
                        this.updateIMTField(dependentField, newValue).catch(err => {
                            console.error('[DEPENDENCY] Error updating IMT field:', err);
                        });
                    } else if (dependentFieldName.includes('unit')) {
                        // v1.0: unit is a combobox with conditional codelist based on quantity_kind
                        // Only works if the combobox dropdown was properly created
                        if (dependentField.closest('.combobox-wrapper') || dependentField.closest('.input-group')) {
                            // Reset the unit field value when quantity_kind changes
                            dependentField.value = '';
                            dependentField.dispatchEvent(new Event('input', { bubbles: true }));
                            dependentField.dispatchEvent(new Event('change', { bubbles: true }));
                            this.reloadComboboxCodelist(dependentField, fullDependentFieldName, newValue);
                        } else {
                            console.log(`[DEPENDENCY] Unit field doesn't have combobox structure, skipping reload`);
                        }
                    } else if (dependentFieldName.includes('valuation_year')) {
                        const fieldWrapper = dependentField.closest('.form-field, .modal-form-field');
                        if (fieldWrapper) {
                            if (newValue === 'currency') {
                                fieldWrapper.style.display = '';
                            } else {
                                fieldWrapper.style.display = 'none';
                                dependentField.value = '';
                                dependentField.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }
                    }
                }
            }
        });

        // Special handling for hazard type changes to filter IMT options
        const isHazardTypeField = (changedFieldName.includes('type') && !changedFieldName.includes('impact_unit') && !changedFieldName.includes('risk_data_type')) ||
                                changedFieldName.includes('hazard_primary') ||
                                changedFieldName.includes('hazard_secondary') ||
                                changedFieldName.includes('hazard_type');

        if (isHazardTypeField) {
            // This is a hazard type field change that should trigger IMT filtering
            const isRelevantHazardField = changedFieldName === 'hazards.type' ||
                                        changedFieldName === 'type' ||
                                        changedFieldName === 'vulnerability.hazard_primary' ||
                                        changedFieldName === 'vulnerability.hazard_secondary' ||
                                        changedFieldName === 'hazard_primary' ||
                                        changedFieldName === 'hazard_secondary' ||
                                        changedFieldName.includes('hazard_type');

            if (isRelevantHazardField) {
                console.log(`[ASYNC CHECK] Hazard type changed: ${changedFieldName} = ${newValue}`);
                // Call async function without await - allows it to run in background
                updateIMTOptionsForHazard(newValue, currentFormData, activeSections, updateFormData, ConditionalValidator).catch(err => {
                    console.error('Error updating IMT options:', err);
                });
            }
        }


        // v1.0: No special handling for license field - it's now a simple IRI/URL field with codelist suggestions

        // REMOVED: This special handling is now redundant - dependencies are handled by
        // the main handleDependentFields logic above. This was looking for "processes" (old array field)
        // instead of "hazard_process" (new singular field).
    }

    findDependentFields(parentFieldName) {
        const dependents = [];

        // Extract the base field name (e.g., "type" from "trigger.type")
        const baseParentFieldName = parentFieldName.includes('.') ?
            parentFieldName.split('.').pop() : parentFieldName;

        Object.entries(FIELD_DEPENDENCIES).forEach(([dependent, parent]) => {
            // Check both full field name and base field name
            if (parent === parentFieldName || parent === baseParentFieldName) {
                dependents.push(dependent);
            }
        });

        // For IMT, add it if parent is 'type' or ends with 'type'
        if (baseParentFieldName === 'type') {
            if (!dependents.includes('intensity_measure')) {
                dependents.push('intensity_measure');
            }
        }

        return dependents;
    }

    rebuildDependentDropdown(selectElement, fieldName, parentValue) {
        console.log(`[REBUILD DROPDOWN] ===== START =====`);
        console.log(`[REBUILD DROPDOWN] Called with: fieldName="${fieldName}", parentValue="${parentValue}"`);
        console.log(`[REBUILD DROPDOWN] selectElement:`, selectElement);
        console.log(`[REBUILD DROPDOWN] selectElement tagName: ${selectElement?.tagName}`);

        if (!parentValue) {
            console.log(`[REBUILD DROPDOWN] No parent value provided, exiting`);
            return;
        }

        console.log(`[REBUILD DROPDOWN] Rebuilding dropdown: ${fieldName} based on parent value: ${parentValue}`);

        const currentValue = selectElement.value;

        // Clear existing options
        selectElement.innerHTML = '';

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Select an option...';
        selectElement.appendChild(emptyOption);

        // Get available options based on parent value
        let availableOptions = [];

        // v1.0: Use conditional validation system to get filtered options
        if (fieldName.includes('process') || fieldName === 'processes') {
            console.log(`[REBUILD DROPDOWN] Processing 'process' field rebuild`);

            // Get the conditional schema that contains the if/then rules
            const conditionalSchemaRaw = resolveReferenceSimple('#/$defs/conditional_hazard_type_to_process');
            console.log(`[REBUILD DROPDOWN] conditional_hazard_type_to_process schema:`, conditionalSchemaRaw ? 'found' : 'NOT FOUND');

            if (conditionalSchemaRaw && conditionalSchemaRaw.allOf) {
                // Build parent data context
                const parentData = { type: parentValue };
                console.log(`[REBUILD DROPDOWN] Evaluating conditionals with:`, parentData);
                console.log(`[REBUILD DROPDOWN] Number of conditional rules:`, conditionalSchemaRaw.allOf.length);

                // Evaluate conditional rules
                const result = ConditionalValidator.evaluateConditionals(conditionalSchemaRaw, parentData);
                console.log(`[REBUILD DROPDOWN] Evaluation result:`, result);
                console.log(`[REBUILD DROPDOWN] Applicable rules:`, result.applicableRules?.length || 0);

                // Find the applicable rule that modifies process field
                for (const rule of result.applicableRules) {
                    console.log(`[REBUILD DROPDOWN] Checking rule:`, rule);
                    if (rule.schema.properties && rule.schema.properties.process && rule.schema.properties.process.enum) {
                        availableOptions = rule.schema.properties.process.enum;
                        console.log(`[REBUILD DROPDOWN] Found ${availableOptions.length} process options for type="${parentValue}":`, availableOptions);
                        break;
                    }
                }
            }

            // Fallback to default enum from schema if no conditional rules found
            if (availableOptions.length === 0) {
                const hazardSchemaRaw = resolveReferenceSimple('#/$defs/SimpleHazard');
                if (hazardSchemaRaw && hazardSchemaRaw.properties && hazardSchemaRaw.properties.process) {
                    availableOptions = hazardSchemaRaw.properties.process.enum || [];
                    console.log(`[REBUILD DROPDOWN] No conditional rules found, using default enum with ${availableOptions.length} options`);
                }
            }
        }

        // Populate new options
        availableOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            // Check if option contains parentheses (e.g., "CSV (csv)") and preserve as-is
            if (option.includes('(') && option.includes(')')) {
                optionElement.textContent = option;
            } else {
                optionElement.textContent = option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }

            if (currentValue === option) {
                optionElement.selected = true;
            }

            selectElement.appendChild(optionElement);
        });

        // If previous selection is no longer valid, clear it
        if (currentValue && !availableOptions.includes(currentValue)) {
            selectElement.value = '';
            selectElement.dispatchEvent(new Event('change'));
        }

        console.log(`[REBUILD DROPDOWN] Dropdown rebuilt with ${availableOptions.length} options`);
    }

    async updateIMTField(element, hazardType) {
        // Update a single intensity_measure field with filtered options based on hazard type
        console.log(`[UPDATE IMT] Loading IMT options for hazard type: ${hazardType}`);
        const filteredOptions = await getFilteredIMTOptions(hazardType, ConditionalValidator);
        console.log(`[UPDATE IMT] Loaded ${filteredOptions.length} IMT options`);

        if (element.tagName === 'SELECT') {
            // Handle select dropdowns
            const currentValue = element.value;

            // Clear existing options except the first empty option
            element.innerHTML = '';
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Select intensity measure...';
            element.appendChild(emptyOption);

            // Add filtered options
            filteredOptions.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.code;
                optionElement.textContent = option.title;
                if (option.description) {
                    optionElement.setAttribute('title', option.description);
                }
                element.appendChild(optionElement);
            });

            // Restore previous value if still valid, otherwise clear
            if (filteredOptions.some(opt => opt.code === currentValue)) {
                element.value = currentValue;
            } else {
                element.value = '';
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        } else if (element.tagName === 'INPUT') {
            // Handle combobox inputs - update their dropdown menu
            const wrapper = element.closest('.combobox-wrapper') || element.closest('.input-group');
            if (wrapper) {
                const dropdownMenu = wrapper.querySelector('.dropdown-menu');
                if (dropdownMenu) {
                    // Clear existing options
                    dropdownMenu.innerHTML = '';

                    // Add filtered options
                    filteredOptions.forEach(option => {
                        const item = document.createElement('li');
                        const link = document.createElement('a');
                        link.className = 'dropdown-item';
                        link.href = '#';
                        link.textContent = option.title;
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            element.value = option.code;
                            element.dispatchEvent(new Event('input', { bubbles: true }));
                            element.dispatchEvent(new Event('change', { bubbles: true }));
                        });
                        item.appendChild(link);
                        dropdownMenu.appendChild(item);
                    });

                    // Add custom value note
                    if (filteredOptions.length > 0) {
                        const separator = document.createElement('li');
                        separator.innerHTML = '<hr class="dropdown-divider">';
                        dropdownMenu.appendChild(separator);

                        const customItem = document.createElement('li');
                        customItem.innerHTML = '<span class="dropdown-item-text text-muted"><em>You can also type a custom value</em></span>';
                        dropdownMenu.appendChild(customItem);
                    }
                }
            }
        }
    }

    async reloadComboboxCodelist(inputElement, fieldName, parentValue) {
        console.log(`[RELOAD COMBOBOX] ===== START =====`);
        console.log(`[RELOAD COMBOBOX] fieldName: ${fieldName}, parentValue: ${parentValue}`);
        console.log(`[RELOAD COMBOBOX] inputElement:`, inputElement);

        if (!parentValue || !inputElement) {
            console.log(`[RELOAD COMBOBOX] Missing parentValue or inputElement, exiting`);
            return;
        }

        // Find the dropdown menu associated with this combobox input
        let dropdownMenu = null;

        // First try: dropdown menu is a sibling within the input-group
        const inputGroup = inputElement.closest('.input-group');
        if (inputGroup) {
            dropdownMenu = inputGroup.querySelector('.dropdown-menu');
        }

        // Second try: dropdown might be a sibling in the parent element
        if (!dropdownMenu && inputElement.parentElement) {
            dropdownMenu = inputElement.parentElement.querySelector('.dropdown-menu');
        }

        // Third try: look in combobox-wrapper
        if (!dropdownMenu) {
            const comboboxWrapper = inputElement.closest('.combobox-wrapper');
            if (comboboxWrapper) {
                dropdownMenu = comboboxWrapper.querySelector('.dropdown-menu');
            }
        }

        // Fourth try: look in closest form-field/modal-form-field
        if (!dropdownMenu) {
            const container = inputElement.closest('.form-field, .modal-form-field');
            if (container) {
                dropdownMenu = container.querySelector('.dropdown-menu');
            }
        }

        // Fifth try: traverse siblings to find dropdown-menu
        if (!dropdownMenu && inputElement.parentElement) {
            for (let sibling of inputElement.parentElement.children) {
                if (sibling.classList && sibling.classList.contains('dropdown-menu')) {
                    dropdownMenu = sibling;
                    break;
                }
            }
        }

        // Sixth try: for dependent select (not combobox), the field is a <select> element
        // Check if this is actually a select dropdown, not a combobox
        if (!dropdownMenu && inputElement.tagName === 'SELECT') {
            console.log(`[RELOAD COMBOBOX] Field is a SELECT element, not a combobox - using rebuildDependentDropdown instead`);
            // This is not a combobox, it's a regular select dropdown
            // The reload should have been handled by rebuildDependentDropdown
            return;
        }

        if (!dropdownMenu) {
            console.warn(`[RELOAD COMBOBOX] Could not find dropdown menu for field: ${fieldName}`);
            console.warn(`[RELOAD COMBOBOX] Input element:`, inputElement);
            console.warn(`[RELOAD COMBOBOX] All attempts failed. Try using browser DevTools to inspect the input element structure.`);
            return;
        }

        console.log(`[RELOAD COMBOBOX] Found dropdown menu:`, dropdownMenu);

        try {
            // Get parent context data
            const fieldBaseName = fieldName.split('.').pop();
            const fieldParts = fieldName.split('.');
            console.log(`[RELOAD COMBOBOX] fieldBaseName: ${fieldBaseName}, fieldParts:`, fieldParts);

            // For nested fields like "measurement.unit", we need the measurement object data
            let parentData;
            if (fieldParts.length > 1) {
                // Get the parent object (e.g., "measurement" from "measurement.unit")
                const parentObjectName = fieldParts[0];
                const itemData = this.context.itemData || currentFormData;

                // If the parent object exists in itemData, use it; otherwise create it
                if (itemData[parentObjectName]) {
                    parentData = itemData[parentObjectName];
                } else {
                    parentData = {};
                }

                // Set the parent value in the correct structure
                const parentFieldName = FIELD_DEPENDENCIES[fieldName] || FIELD_DEPENDENCIES[fieldBaseName];
                if (parentFieldName) {
                    const parentFieldBaseName = parentFieldName.split('.').pop();
                    parentData[parentFieldBaseName] = parentValue;
                }
            } else {
                // For top-level fields, use itemData directly
                parentData = this.context.itemData || currentFormData;
                const parentFieldName = FIELD_DEPENDENCIES[fieldName] || FIELD_DEPENDENCIES[fieldBaseName];
                if (parentFieldName) {
                    const parentFieldBaseName = parentFieldName.split('.').pop();
                    parentData[parentFieldBaseName] = parentValue;
                }
            }

            // Get schema definition for conditional codelist
            let schemaPath = null;
            if (fieldName.includes('unit')) {
                schemaPath = '$defs.Measurement';
            } else if (fieldName.includes('intensity_measure')) {
                schemaPath = '$defs.Hazard';
            }

            let suggestions = [];

            console.log(`[RELOAD COMBOBOX] schemaPath: ${schemaPath}`);
            console.log(`[RELOAD COMBOBOX] parentData:`, parentData);

            if (schemaPath) {
                // Direct access since SchemaNavigator.getDefinitionAtPath is failing
                let schemaDefinition = null;
                if (schemaPath === '$defs.Measurement' && currentSchema.$defs) {
                    schemaDefinition = currentSchema.$defs.Measurement;
                } else if (schemaPath === '$defs.Hazard' && currentSchema.$defs) {
                    schemaDefinition = currentSchema.$defs.Hazard;
                }

                console.log(`[RELOAD COMBOBOX] schemaDefinition found:`, !!schemaDefinition, 'has allOf:', !!(schemaDefinition && schemaDefinition.allOf));

                if (schemaDefinition && schemaDefinition.allOf) {
                    console.log(`[RELOAD COMBOBOX] Calling CodelistManager.getConditionalCodelist...`);
                    suggestions = await CodelistManager.getConditionalCodelist(
                        schemaDefinition,
                        fieldBaseName,
                        parentData
                    );
                    console.log(`[RELOAD COMBOBOX] Got ${suggestions.length} suggestions:`, suggestions);
                }
            }

            // Clear and repopulate dropdown
            dropdownMenu.innerHTML = '';
            console.log(`[RELOAD COMBOBOX] Cleared dropdown, populating with ${suggestions.length} suggestions`);

            if (suggestions && suggestions.length > 0) {
                // Check if this is a currency unit field
                const isUnitField = fieldBaseName === 'unit';
                const isCurrency = parentValue === 'currency';
                const showCodeInDropdown = isUnitField && isCurrency;

                suggestions.forEach(suggestion => {
                    const item = document.createElement('li');
                    const link = document.createElement('a');
                    link.className = 'dropdown-item';
                    link.href = '#';

                    // Handle both string arrays and {code, title} objects
                    const suggestionCode = typeof suggestion === 'object' ? suggestion.code : suggestion;
                    const suggestionTitle = typeof suggestion === 'object' ? suggestion.title : suggestion;

                    // Display format: "[Code] Title (valid until YYYY-MM)" for currency unit fields
                    const validUntilSuffix = (typeof suggestion === 'object' && suggestion.validUntil) ? ` (valid until ${suggestion.validUntil})` : '';
                    if (showCodeInDropdown && typeof suggestion === 'object' && suggestion.code && suggestion.title && suggestion.code !== suggestion.title) {
                        link.textContent = `[${suggestionCode}] ${suggestionTitle}${validUntilSuffix}`;
                    } else {
                        link.textContent = suggestionTitle + validUntilSuffix;
                    }
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        inputElement.value = suggestionCode;
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    item.appendChild(link);
                    dropdownMenu.appendChild(item);
                });

                const separator = document.createElement('li');
                separator.innerHTML = '<hr class="dropdown-divider">';
                dropdownMenu.appendChild(separator);

                const customItem = document.createElement('li');
                customItem.innerHTML = '<span class="dropdown-item-text text-muted"><em>💡 You can also type a custom value</em></span>';
                dropdownMenu.appendChild(customItem);
            } else {
                const emptyItem = document.createElement('li');
                emptyItem.innerHTML = '<span class="dropdown-item-text text-muted">No suggestions available</span>';
                dropdownMenu.appendChild(emptyItem);
            }
        } catch (error) {
            console.error(`[RELOAD COMBOBOX] Error reloading codelist for ${fieldName}:`, error);
        }
    }

}

/**
 * Unified Field Validator
 * Handles validation consistently across all contexts
 */
class UnifiedFieldValidator {
    constructor(context) {
        this.context = context;
    }

    validate(fieldName, value, property, parentData = null) {
        let isValid = true;
        let errorMessage = '';

        // Get parent object data for conditional validation
        const contextData = parentData || this.getContextData(fieldName);

        // Check if this is a required field from schema
        const isSchemaRequired = currentSchema.required && currentSchema.required.includes(fieldName);

        // Check conditional requirements from if-then rules
        let isConditionallyRequired = false;
        let isConditionallyForbidden = false;

        if (property && property.allOf && contextData) {
            isConditionallyRequired = ConditionalValidator.isConditionallyRequired(
                property,
                fieldName.split('.').pop(), // Get the last part of the field name
                contextData
            );

            isConditionallyForbidden = ConditionalValidator.isConditionallyForbidden(
                property,
                fieldName.split('.').pop(),
                contextData
            );
        }

        // Check if field is conditionally forbidden
        else if (isConditionallyForbidden) {
            if (value && value !== '') {
                isValid = false;
                errorMessage = 'Field not allowed with current configuration';
            }
        }
        // Check schema-required or conditionally required fields
        else if (isSchemaRequired || isConditionallyRequired) {
            if (!value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
                isValid = false;
                errorMessage = isConditionallyRequired ? 'Required by conditional rule' : 'Required field';
            }
        }

        // Format and length validations
        if (value && typeof value === 'string') {
            if (property.minLength && value.length < property.minLength) {
                isValid = false;
                errorMessage = `Minimum ${property.minLength} characters`;
            }
            if (property.format === 'email' && value && !this.isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Invalid email format';
            }
            if (property.format === 'iri' && value && !this.isValidUrl(value)) {
                isValid = false;
                errorMessage = 'Invalid URL format';
            }
            if (property.format === 'duration' && value && !this.isValidDuration(value)) {
                isValid = false;
                errorMessage = 'Invalid ISO 8601 duration format (e.g., P1Y, P3M, PT2H)';
            }
        }

        // Number validations
        if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value) && value !== '')) {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            if (property.minimum !== undefined && numValue < property.minimum) {
                isValid = false;
                errorMessage = `Minimum value: ${property.minimum}`;
            }
            if (property.maximum !== undefined && numValue > property.maximum) {
                isValid = false;
                errorMessage = `Maximum value: ${property.maximum}`;
            }
            if (property.exclusiveMinimum !== undefined && numValue <= property.exclusiveMinimum) {
                isValid = false;
                errorMessage = `Must be greater than ${property.exclusiveMinimum}`;
            }
            if (property.exclusiveMaximum !== undefined && numValue >= property.exclusiveMaximum) {
                isValid = false;
                errorMessage = `Must be less than ${property.exclusiveMaximum}`;
            }
        }

        // Spatial scale and countries validation (applies to all schema versions)
        if (isValid) {
            const spatialValidation = this.validateSpatialRelationship(fieldName, value);
            if (!spatialValidation.isValid) {
                isValid = false;
                errorMessage = spatialValidation.errorMessage;
            }
        }

        // Only update validation indicators for normal context
        if (this.context.type === 'normal') {
            fieldValidationStatus.set(fieldName, { isValid, errorMessage });
            this.updateValidationIndicator(fieldName, isValid, errorMessage);
            updateValidationDisplay();
        }

        return { isValid, errorMessage };
    }

    /**
     * Get context data for conditional validation
     */
    getContextData(fieldName) {
        // Extract the parent object from fieldName
        const parts = fieldName.split('.');
        if (parts.length === 1) {
            return currentFormData; // Root level
        }

        // Navigate to parent object
        let obj = currentFormData;
        for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
            if (!obj) return null;
        }
        return obj;
    }

    /**
     * Validate ISO 8601 duration format
     */
    isValidDuration(duration) {
        // Basic ISO 8601 duration pattern: P[n]Y[n]M[n]DT[n]H[n]M[n]S
        const durationPattern = /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/;
        return durationPattern.test(duration);
    }

    validateSpatialRelationship(fieldName, value) {
        let isValid = true;
        let errorMessage = '';

        // Check if we're validating spatial.scale or spatial.countries
        if (fieldName === 'spatial.scale' || fieldName === 'spatial.countries') {
            // Get scale - use passed value if validating scale, otherwise get from currentFormData
            let scale;
            if (fieldName === 'spatial.scale') {
                scale = value;
            } else {
                scale = currentFormData.spatial?.scale;
            }

            // Get countries - use passed value if validating countries, otherwise get from currentFormData
            let countries;
            if (fieldName === 'spatial.countries') {
                // When validating countries, the value passed is the array
                countries = value;
            } else {
                // When validating scale, get countries from currentFormData
                countries = currentFormData.spatial?.countries;
            }

            if (scale) {
                // Filter out empty strings and count only non-empty country codes
                const validCountries = Array.isArray(countries)
                    ? countries.filter(c => c && typeof c === 'string' && c.trim() !== '')
                    : [];
                const countriesCount = validCountries.length;

                switch (scale.toLowerCase()) {
                    case 'global':
                        // Global scale: no country specification needed
                        break;
                    case 'regional':
                        // Regional scale: at least 2 countries expected
                        if (countriesCount < 2) {
                            isValid = false;
                            errorMessage = fieldName === 'spatial.scale'
                                ? 'Regional scale requires at least 2 countries'
                                : 'At least 2 countries required for regional scale';
                        }
                        break;
                    case 'national':
                    case 'subnational':
                    case 'sub-national':
                    case 'urban':
                        // National, subnational, or urban: at least 1 country expected
                        if (countriesCount < 1) {
                            isValid = false;
                            errorMessage = fieldName === 'spatial.scale'
                                ? `${scale} scale requires at least 1 country`
                                : `At least 1 country required for ${scale} scale`;
                        }
                        break;
                }
            }
        }

        return { isValid, errorMessage };
    }

    updateValidationIndicator(fieldName, isValid, errorMessage) {
        const indicator = document.getElementById(`validation-${fieldName}`);
        if (indicator) {
            if (isValid) {
                indicator.className = 'validation-indicator valid';
                indicator.textContent = '✓';
                indicator.title = 'Valid';
            } else {
                indicator.className = 'validation-indicator invalid';
                indicator.textContent = '✗';
                indicator.title = errorMessage;
            }
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Call test functions
setTimeout(() => {
    if (typeof testUnifiedSystem === 'function') {
        testUnifiedSystem();
    }
    if (typeof testDependenciesAfterLoad === 'function') {
        testDependenciesAfterLoad();
    }
}, 2000);
