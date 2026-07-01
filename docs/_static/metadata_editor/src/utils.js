export const SECTIONS = ['hazard', 'exposure', 'vulnerability', 'loss'];

export function cleanEmptyValues(obj) {
    // Recursively remove empty strings, empty arrays, and null/undefined values
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

// Auto-ID generation
export function generateUniqueId(prefix = 'item') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}_${result}`;
}

export function parseMarkdownLinks(text, currentSchemaVersion) {
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

export function getNestedValue(obj, path) {
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

export function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
}

function generateDatasetId(currentFormData) {
    // Format: rdls_{short_types}-{countries}_{shortname}_{items}
    // Example: rdls_hzd-ury_ucra_fl or rdls_exp+lss-ury+ita_project_fl+pl

    const parts = [];

    // 1. Build risk_data_type part (required) with short codes
    const riskDataTypes = currentFormData.risk_data_type || [];
    const typeMap = {
        'hazard': 'hzd',
        'exposure': 'exp',
        'vulnerability': 'vln',
        'loss': 'lss'
    };
    const shortTypes = riskDataTypes.map(type => typeMap[type] || type);
    let riskTypePart = shortTypes.length > 0 ? shortTypes.join('+') : 'data';

    // 2. Get country codes (optional)
    let countryCodes = [];
    if (currentFormData.spatial?.countries) {
        countryCodes = currentFormData.spatial.countries
            .map(c => c.toUpperCase())
            .sort();
    }

    // Combine risk_data_type with country using hyphen
    if (countryCodes.length > 0) {
        riskTypePart += '-' + countryCodes.join('+');
    }
    parts.push('rdls_' + riskTypePart);

    // 3. Get shortname from project or publisher (required)
    let shortname = 'dataset';
    if (currentFormData.project?.name) {
        shortname = currentFormData.project.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s-]+/g, '_')
            .substring(0, 15);
    } else if (currentFormData.attributions) {
        // Find publisher attribution
        const publisher = currentFormData.attributions.find(a => a.role === 'publisher');
        if (publisher?.name) {
            shortname = publisher.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/[\s-]+/g, '_')
                .substring(0, 15);
        }
    }
    parts.push(shortname);

    // 4. Get item (hazard type or exposure category) (optional)
    let items = [];

    // Try to get hazard types
    if (currentFormData.hazard) {
        const hazards = Array.isArray(currentFormData.hazard) ? currentFormData.hazard : [currentFormData.hazard];
        const hazardTypes = hazards
            .filter(h => h.type)
            .map(h => {
                // Convert hazard type to acronym (e.g., flood -> fl, earthquake -> eq)
                const typeMap = {
                    'flood': 'fl',
                    'coastal_flood': 'cf',
                    'earthquake': 'eq',
                    'tsunami': 'ts',
                    'volcano': 'vo',
                    'landslide': 'ls',
                    'cyclone': 'cy',
                    'tornado': 'to',
                    'wildfire': 'wf',
                    'drought': 'dr',
                    'extreme_temperature': 'et'
                };
                return typeMap[h.type] || h.type.substring(0, 2);
            });
        if (hazardTypes.length > 0) {
            items = [...new Set(hazardTypes)]; // Remove duplicates
        }
    }

    // If no hazard types, try exposure categories
    if (items.length === 0 && currentFormData.exposure) {
        const exposures = Array.isArray(currentFormData.exposure) ? currentFormData.exposure : [currentFormData.exposure];
        const expCategories = exposures
            .filter(e => e.category)
            .map(e => {
                // Convert category to short code (e.g., buildings -> bld, population -> pop)
                const catMap = {
                    'buildings': 'bld',
                    'population': 'pop',
                    'infrastructure': 'inf',
                    'agriculture': 'agr'
                };
                return catMap[e.category] || e.category.substring(0, 3);
            });
        if (expCategories.length > 0) {
            items = [...new Set(expCategories)]; // Remove duplicates
        }
    }

    if (items.length > 0) {
        parts.push(items.join('+'));
    }

    return parts.join('_');
}

export function packageDataset(datasetMetadata, currentFormData) {
    // Get the current schema version
    // v1.0 schema reference
    const schemaVersion = '1__0__0';
    const schemaUrl = `https://docs.riskdatalibrary.org/en/${schemaVersion}/rdls_schema.json`;

    // Generate unique dataset ID if not present
    if (!datasetMetadata.id) {
        datasetMetadata.id = generateDatasetId(currentFormData);
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

export function sanitizeFilename(filename) {
    return filename
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
}

export async function loadCountryNames() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=cca3,name');
        const countries = await response.json();
        let countryNames = {};
        countries.forEach(country => {
            countryNames[country.cca3] = country.name.common;
        });
        return countryNames;
    } catch (error) {
        console.warn('Could not load country names:', error);
    }
}

export function autoSave(currentFormData, activeSections) {
    localStorage.setItem('rdlsEditor_formData', JSON.stringify(currentFormData));
    localStorage.setItem('rdlsEditor_activeSections', JSON.stringify([...activeSections]));
}

export function getFilteredFormData(currentFormData, activeSections) {
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

export function loadJSONData(stringData, checkSchemaVersion) {
                    let loadedData = JSON.parse(stringData);

                    // Check if this is a package with datasets array
                    if (loadedData.datasets && Array.isArray(loadedData.datasets)) {
                        if (loadedData.datasets.length === 0) {
                            alert('The package contains no datasets.');
                            return;
                        }
                        // Alert if multiple datasets
                        if (loadedData.datasets.length > 1) {
                            alert('Package contains multiple datasets. Loading the first dataset only.');
                        }
                        // Load the first dataset
                        loadedData = loadedData.datasets[0];
                    }

                    // Check schema version compatibility
                    const versionCheck = checkSchemaVersion(loadedData);
                    if (!versionCheck.compatible) {
                        alert(`Schema Version Mismatch\n\n${versionCheck.message}\n\nCurrent editor version: ${versionCheck.editorVersion}\nJSON file version: ${versionCheck.dataVersion || 'Unknown'}\n\nPlease use the appropriate editor version for this file.`);
                        return;
                    }
    return loadedData;
}

export function rebuildActiveSections(currentFormData, activeSections, fieldValidationStatus, addSectionTab, removeSectionTab) {

                    // Reset validation flag when loading new data
                    let hasRunFullValidation = false;
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
    return hasRunFullValidation;
}
