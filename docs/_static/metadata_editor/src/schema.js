import { testConditionalValidation } from './tests.js';
import { setNestedValue, autoSave } from './utils.js';


export let currentSchema = null;

// RDLS Schema Configuration
const RDLS_VERSIONS = {
    '1.0': 'https://docs.riskdatalibrary.org/en/1__0__0/rdls_schema.json'
};

// IMT mappings will be loaded from schema
let HAZARD_IMT_MAPPING = null;
let IMT_DEFINITIONS = {};

// Legacy hardcoded mapping (will be replaced by schema-based mapping)
const LEGACY_HAZARD_IMT_MAPPING = {
    'flood': [
        {code: 'flow_depth_ground:m', title: 'Flow depth above ground in meters'},
        {code: 'flow_depth_ground:cm', title: 'Flow depth above ground in centimeters'},
        {code: 'flow_depth_ground:dm', title: 'Flow depth above ground in decimeters'},
        {code: 'flow_depth_floor:m', title: 'Flow depth above floor level in meters'},
        {code: 'flow_depth_floor:cm', title: 'Flow depth above floor level in centimeters'},
        {code: 'flow_depth_floor:dm', title: 'Flow depth above floor level in decimeters'},
        {code: 'fv:m/s', title: 'Flow velocity (m/s)'},
        {code: 'fv:km/h', title: 'Flow velocity (km/h)'},
        {code: 'slr:cm', title: 'Sea Level Rise'},
        {code: 'pptn1:mm', title: '1-hour precipitation'},
        {code: 'pptn24:mm', title: '24-hour precipitation'},
        {code: 'pptn_tot:mm', title: 'Total event precipitation'}
    ],
    'tsunami': [
        {code: 'flow_depth_ground:m', title: 'Flow depth above ground in meters'},
        {code: 'flow_depth_ground:cm', title: 'Flow depth above ground in centimeters'},
        {code: 'flow_depth_ground:dm', title: 'Flow depth above ground in decimeters'},
        {code: 'flow_depth_floor:m', title: 'Flow depth above floor level in meters'},
        {code: 'flow_depth_floor:cm', title: 'Flow depth above floor level in centimeters'},
        {code: 'flow_depth_floor:dm', title: 'Flow depth above floor level in decimeters'},
        {code: 'fv:m/s', title: 'Flow velocity (m/s)'},
        {code: 'fv:km/h', title: 'Flow velocity (km/h)'},
        {code: 'Rh_tsi:m', title: 'Tsunami wave runup height'},
        {code: 'h_tsi:m', title: 'Tsunami inundation height'},
        {code: 'F_drag:kN', title: 'Hydrodynamic drag force'},
        {code: 'F_QS:kN', title: 'Quasi-static buoyant force'},
        {code: 'MF:m3/s2', title: 'Momentum flux'},
        {code: 'slr:cm', title: 'Sea Level Rise'}
    ],
    'coastal_flood': [
        {code: 'flow_depth_ground:m', title: 'Flow depth above ground in meters'},
        {code: 'flow_depth_ground:cm', title: 'Flow depth above ground in centimeters'},
        {code: 'flow_depth_ground:dm', title: 'Flow depth above ground in decimeters'},
        {code: 'flow_depth_floor:m', title: 'Flow depth above floor level in meters'},
        {code: 'flow_depth_floor:cm', title: 'Flow depth above floor level in centimeters'},
        {code: 'flow_depth_floor:dm', title: 'Flow depth above floor level in decimeters'},
        {code: 'fv:m/s', title: 'Flow velocity (m/s)'},
        {code: 'fv:km/h', title: 'Flow velocity (km/h)'},
        {code: 'slr:cm', title: 'Sea Level Rise'}
    ],
    'earthquake': [
        {code: 'PGA:g', title: 'Peak ground acceleration in g'},
        {code: 'PGA:gal', title: 'Peak ground acceleration in gal'},
        {code: 'PGA:m/s2', title: 'Peak ground acceleration in m/s^2'},
        {code: 'PGV:m/s', title: 'Peak ground velocity in m/s'},
        {code: 'PGV:cm/s', title: 'Peak ground velocity in cm/s'},
        {code: 'AvgSa:m/s2', title: 'Average spectral acceleration in m/s^2'},
        {code: 'Sa_1:m/s2', title: 'Spectral acceleration (period: 1 sec) in m/s^2'},
        {code: 'Sd(T1):m', title: 'Spectral displacement'},
        {code: 'Sv(T1):m/s', title: 'Spectral velocity'},
        {code: 'PGDf:m', title: 'Permanent ground deformation'},
        {code: 'D:s', title: 'Significant duration'},
        {code: 'D_B:s', title: 'Bracketed duration'},
        {code: 'IA:m/s', title: 'Arias intensity'},
        {code: 'CAV:m/s', title: 'Cumulative absolute velocity'},
        {code: 'MMI:-', title: 'Modified Mercalli Intensity'},
        {code: 'EMS:-', title: 'European macroseismic scale'}
    ],
    'strong_wind': [
        {code: 'sustained_wind_speed:m/s', title: 'Sustained wind speed in m/s'},
        {code: 'sustained_wind_speed:km/h', title: 'Sustained wind speed in km/h'},
        {code: 'sustained_wind_speed:mph', title: 'Sustained wind speed in mph'},
        {code: 'peak_wind_gust:m/s', title: 'Peak wind gust in m/s'},
        {code: 'peak_wind_gust:km/h', title: 'Peak wind gust in km/h'},
        {code: 'peak_wind_gust:mph', title: 'Peak wind gust in mph'}
    ],
    'convective_storm': [
        {code: 'sustained_wind_speed:m/s', title: 'Sustained wind speed in m/s'},
        {code: 'sustained_wind_speed:km/h', title: 'Sustained wind speed in km/h'},
        {code: 'sustained_wind_speed:mph', title: 'Sustained wind speed in mph'},
        {code: 'peak_wind_gust:m/s', title: 'Peak wind gust in m/s'},
        {code: 'peak_wind_gust:km/h', title: 'Peak wind gust in km/h'},
        {code: 'peak_wind_gust:mph', title: 'Peak wind gust in mph'},
        {code: 'ImpactE:J', title: 'Impact Energy (Joules)'},
        {code: 'EF:-', title: 'Enhanced Fujita Scale'},
        {code: 'TPL:m', title: 'Tornado Path Length'},
        {code: 'TPW:m', title: 'Tornado Path Width'},
        {code: 'HSI:-', title: 'Hail Size Index'},
        {code: 'HlMaxSz:mm', title: 'Maximum hail size'},
        {code: 'HlProb:%', title: 'Hail probability'},
        {code: 'HlD:mm', title: 'Hail depth'}
    ],
    'drought': [
        {code: 'SPI:-', title: 'Standard Precipitation Index'},
        {code: 'SPEI:-', title: 'Standard Precipitation Evapotranspiration Index'},
        {code: 'PDSI:-', title: 'Palmer Drought Severity Index'},
        {code: 'CMI:-', title: 'Crop Moisture Index'},
        {code: 'NDVI:-', title: 'Normalized Difference Vegetation Index'},
        {code: 'VCI:-', title: 'Vegetation Condition Index'}
    ],
    'extreme_temperature': [
        {code: 'AirTemp:C', title: 'Air Temperature (°C)'},
        {code: 'AirTemp:F', title: 'Air Temperature (°F)'},
        {code: 'WBGT:C', title: 'Wet Bulb Globe Temperature in Celsius'},
        {code: 'HI:-', title: 'Heat Index'},
        {code: 'EHF:-', title: 'Excess Heat Factor'},
        {code: 'CDD:-', title: 'Cooling Degree Days'}
    ],
    'landslide': [
        {code: 'flow_depth_ground:m', title: 'Flow depth above ground in meters'},
        {code: 'flow_depth_ground:cm', title: 'Flow depth above ground in centimeters'},
        {code: 'flow_depth_ground:dm', title: 'Flow depth above ground in decimeters'},
        {code: 'fv:m/s', title: 'Flow velocity (m/s)'},
        {code: 'fv:km/h', title: 'Flow velocity (km/h)'},
        {code: 'ls_mfd:m', title: 'Maximum foundation displacement'},
        {code: 'SD_lsl:m', title: 'Surface displacement from landslide'},
        {code: 'I_DF:m3/s2', title: 'Debris flow intensity'},
        {code: 'rf_KE:kJ', title: 'Rockfall kinetic energy'},
        {code: 'LSI:-', title: 'Landslide Susceptibility Index'},
        {code: 'DP:-', title: 'Destructive Potential'},
        {code: 'AvSize:-', title: 'Avalanche Size'},
        {code: 'Rdist:m', title: 'Runout Distance'},
        {code: 'Vol:m3', title: 'Volume'}
    ],
    'volcanic': [
        {code: 'flow_depth_ground:m', title: 'Flow depth above ground in meters'},
        {code: 'flow_depth_ground:cm', title: 'Flow depth above ground in centimeters'},
        {code: 'flow_depth_ground:dm', title: 'Flow depth above ground in decimeters'},
        {code: 'fv:m/s', title: 'Flow velocity (m/s)'},
        {code: 'fv:km/h', title: 'Flow velocity (km/h)'},
        {code: 'Rdist:m', title: 'Runout Distance'},
        {code: 'h_vaf:mm', title: 'Volcanic ash fall thickness'},
        {code: 'vei:-', title: 'Volcanic Explosivity Index'},
        {code: 'ImpactE:kJ', title: 'Impact Energy'},
        {code: 'Vbal_size:m', title: 'Volcanic ballistic size'},
        {code: 'Vbal_Lprob:%', title: 'Volcanic ballistic landing probability'},
        {code: 'ImpactE:J', title: 'Impact Energy (Joules)'}
    ],
    'wildfire': [
        {code: 'burned_area:ha', title: 'Burned area in hectares'},
        {code: 'burned_area:km2', title: 'Burned area in square kilometers'},
        {code: 'FWI:-', title: 'Fire Weather Index'}
    ]
};

// Universal IMT options that apply to multiple hazards
let UNIVERSAL_IMTS = [
    {code: 'affected_area:m2', title: 'Affected area in square meters'},
    {code: 'affected_area:km2', title: 'Affected area in square kilometers'},
    {code: 'affected_area:ha', title: 'Affected area in hectares'},
    {code: 'riskidx:-', title: 'Risk Index'},
    {code: 'MHI:-', title: 'Multi-hazard Index'}
];

// ================================
// SCHEMA REFERENCE RESOLUTION
// ================================

/**
 * Resolve $ref pointers in schema
 * @param {string} ref - Reference string like "#/$defs/codelist_country"
 * @param {object} schema - Full schema object
 * @returns {object} - Resolved schema fragment
 */
export function resolveSchemaRef(ref, schema) {
    if (!ref || !ref.startsWith('#/')) {
        return null;
    }

    const path = ref.substring(2).split('/'); // Remove '#/' and split
    let current = schema;

    for (const segment of path) {
        if (!current || !current[segment]) {
            console.warn(`Cannot resolve $ref: ${ref}`);
            return null;
        }
        current = current[segment];
    }

    return current;
}

/**
 * Get enum values from a property, resolving $ref if needed
 * @param {object} property - Property schema
 * @param {object} schema - Full schema object
 * @returns {array} - Enum values or null
 */
export function getEnumValues(property, schema) {
    if (!property || !schema) {
        return null;
    }

    // Direct enum
    if (property.enum) {
        return property.enum;
    }

    // Enum in items (for arrays)
    if (property.items && property.items.enum) {
        return property.items.enum;
    }

    // Resolve $ref
    if (property.$ref) {
        const resolved = resolveSchemaRef(property.$ref, schema);
        if (resolved && resolved.enum) {
            return resolved.enum;
        }
    }

    // Resolve $ref in items
    if (property.items && property.items.$ref) {
        const resolved = resolveSchemaRef(property.items.$ref, schema);
        if (resolved && resolved.enum) {
            return resolved.enum;
        }
    }

    return null;
}

/**
 * WARNING: Not currently used
 * Get codelist metadata from a property
 * @param {object} property - Property schema
 * @param {object} schema - Full schema object
 * @returns {object} - Object with enum, titles, and descriptions or null
 */
function getCodelistMetadata(property, schema) {
    if (!property || !schema) {
        return null;
    }

    let codelistDef = null;

    // Resolve $ref
    if (property.$ref) {
        codelistDef = resolveSchemaRef(property.$ref, schema);
    } else if (property.items && property.items.$ref) {
        codelistDef = resolveSchemaRef(property.items.$ref, schema);
    }

    if (codelistDef && codelistDef.enum) {
        return {
            enum: codelistDef.enum,
            titles: codelistDef.enumTitles || codelistDef.enum,
            descriptions: codelistDef.enumDescriptions || []
        };
    }

    // Fallback to direct enum
    if (property.enum) {
        return {
            enum: property.enum,
            titles: property.enumTitles || property.enum,
            descriptions: property.enumDescriptions || []
        };
    }

    return null;
}

/* WARNING: Not currently used */
function loadSchemaVersions() {
    const select = document.getElementById('schemaVersionSelect');
    select.innerHTML = '<option value="">Select RDLS version...</option>';
    
    Object.keys(RDLS_VERSIONS).forEach(version => {
        const option = document.createElement('option');
        option.value = version;
        const isLatest = version === '1.0';
        option.textContent = `RDLS ${version}${isLatest ? ' (latest)' : ''}`;
        select.appendChild(option);
    });

    // Auto-select the latest version
    select.value = '1.0';
    loadSelectedSchema();
}

export function updateSchemaStatus(message, className) {
    const status = document.getElementById('schemaStatus');
    status.textContent = message;
    status.className = `schema-status ${className}`;
}

export function processSchemaData(schemaData, clearFormData, ConditionalValidator, fieldValidationStatus, generateForm) {
                currentSchema = JSON.parse(schemaData);
                const isV21 = currentSchema.title && (currentSchema.title.includes('v3.0') || currentSchema.$id && currentSchema.$id.includes('0__2__1'));
                const isV20 = currentSchema.title && (currentSchema.title.includes('v2.0') || currentSchema.$id && currentSchema.$id.includes('0__2__0'));
                let statusMessage = '✓ Custom schema loaded';
                
                if (isV21) {
                    statusMessage = '✓ RDLS v3.0 schema loaded (enhanced with combobox fields)';
                } else if (isV20) {
                    statusMessage = '✓ RDLS v2.0 schema loaded';
                }

                // Load IMT definitions from custom schema
                if (currentSchema.intensity_measure_definitions) {
                    IMT_DEFINITIONS = currentSchema.intensity_measure_definitions;
                    console.log('Loaded', Object.keys(IMT_DEFINITIONS).length, 'IMT definitions from custom schema');
                }

                // Load IMT mappings from custom schema (or use legacy if not available)
                if (currentSchema.intensity_measure_mappings) {
                    HAZARD_IMT_MAPPING = {};
                    for (const [hazardType, imtCodes] of Object.entries(currentSchema.intensity_measure_mappings)) {
                        // Handle universal metrics separately
                        if (hazardType === 'universal') {
                            UNIVERSAL_IMTS = imtCodes.map(code => {
                                const def = IMT_DEFINITIONS[code];
                                return {
                                    code: code,
                                    title: def ? def.title : code,
                                    description: def ? def.description : ''
                                };
                            });
                        } else {
                            HAZARD_IMT_MAPPING[hazardType] = imtCodes.map(code => {
                                const def = IMT_DEFINITIONS[code];
                                return {
                                    code: code,
                                    title: def ? def.title : code,
                                    description: def ? def.description : ''
                                };
                            });
                        }
                    }
                    console.log('Loaded IMT mappings from custom schema');
                }

                // Reset form data when loading custom schema
                clearFormData();
                fieldValidationStatus.clear();

                // Test conditional validation engine
                console.log('\n=== Testing Conditional Validation Engine ===');
                testConditionalValidation(currentSchema, ConditionalValidator, SchemaNavigator);

                updateSchemaStatus(statusMessage, 'text-success');
                generateForm();
}

export function resolveReference(ref) {
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
export function resolveReferenceSimple(ref) {
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

export function resolveAllOfSchemas(schema) {
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

export function convertValueBySchema(fieldName, value) {
    // Empty strings should remain empty
    if (value === '') {
        return value;
    }

    // Get the property schema for this field
    let property = getPropertyFromSchema(fieldName);

    // If not found directly, try to find it within array item schemas
    // This handles cases like resources, hazard event_sets, etc.
    if (!property && currentSchema) {
        // Check if this is a field within an array type
        const arrayTypes = ['resources', 'sources', 'attributions', 'referenced_by', 'exposure', 'hazard', 'vulnerability', 'loss'];
        for (const arrayType of arrayTypes) {
            if (currentSchema.properties && currentSchema.properties[arrayType]) {
                const arraySchema = currentSchema.properties[arrayType];
                // Check if it's an array with items
                if (arraySchema.type === 'array' && arraySchema.items) {
                    const itemSchema = arraySchema.items.$ref
                        ? resolveReference(arraySchema.items.$ref)
                        : arraySchema.items;

                    if (itemSchema && itemSchema.properties && itemSchema.properties[fieldName]) {
                        property = itemSchema.properties[fieldName];
                        break;
                    }
                }
                // Check if it's an object (like hazard)
                else if (arraySchema.type === 'object' && arraySchema.properties) {
                    // Check within nested properties (e.g., hazard.event_sets)
                    for (const [key, prop] of Object.entries(arraySchema.properties)) {
                        if (prop.type === 'array' && prop.items) {
                            const itemSchema = prop.items.$ref
                                ? resolveReference(prop.items.$ref)
                                : prop.items;

                            if (itemSchema && itemSchema.properties && itemSchema.properties[fieldName]) {
                                property = itemSchema.properties[fieldName];
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    // Special handling for known integer fields when schema lookup fails
    const integerFields = ['central_year', 'event_count'];
    const baseName = fieldName.split('.').pop();

    if (!property && integerFields.includes(baseName)) {
        const intValue = parseInt(value, 10);
        return isNaN(intValue) ? value : intValue;
    }

    if (!property) {
        return value;
    }

    // Convert based on type
    if (property.type === 'number') {
        const numValue = parseFloat(value);
        return isNaN(numValue) ? value : numValue;
    } else if (property.type === 'integer') {
        const intValue = parseInt(value, 10);
        return isNaN(intValue) ? value : intValue;
    }

    return value;
}

export function getPropertyFromSchema(fieldName) {
    if (!currentSchema) return null;
    
    const parts = fieldName.split('.');
    let current = currentSchema.properties;
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (current && current[part]) {
            if (i === parts.length - 1) {
                if (current[part].$ref) {
                    return resolveReference(current[part].$ref);
                }
                return current[part];
            } else {
                if (current[part].properties) {
                    current = current[part].properties;
                } else if (current[part].$ref) {
                    const resolved = resolveReference(current[part].$ref);
                    if (resolved && resolved.properties) {
                        current = resolved.properties;
                    } else {
                        return current[part];
                    }
                } else {
                    return null;
                }
            }
        } else {
            return null;
        }
    }
    
    return current;
}

// Migration function to convert old field names to new format
export function checkSchemaVersion(data) {
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

// Function to get filtered IMT options based on hazard type (using schema conditionals)
export async function getFilteredIMTOptions(selectedHazardType, ConditionalValidator) {
    if (!currentSchema || !selectedHazardType) {
        // Fallback to legacy mapping if no schema or hazard type
        const mapping = HAZARD_IMT_MAPPING || LEGACY_HAZARD_IMT_MAPPING;
        const allIMTs = [];
        if (mapping) {
            Object.values(mapping).forEach(imts => allIMTs.push(...imts));
        }
        allIMTs.push(...UNIVERSAL_IMTS);

        const uniqueIMTs = allIMTs.filter((imt, index, self) =>
            index === self.findIndex(i => i.code === imt.code)
        );
        return uniqueIMTs;
    }

    // Get Hazard definition from schema
    const hazardDef = SchemaNavigator.getDefinitionAtPath(currentSchema, '$defs.Hazard');

    if (!hazardDef || !hazardDef.allOf) {
        // Fallback to legacy if schema doesn't have conditional logic
        const mapping = HAZARD_IMT_MAPPING || LEGACY_HAZARD_IMT_MAPPING;
        if (mapping && mapping[selectedHazardType]) {
            return [...mapping[selectedHazardType], ...UNIVERSAL_IMTS];
        }
        return UNIVERSAL_IMTS;
    }

    // Use schema's conditional logic to get IMT codelist
    try {
        const imtOptions = await CodelistManager.getConditionalCodelist(
            hazardDef,
            ConditionalValidator,
            'intensity_measure',
            { type: selectedHazardType }
        );

        // Convert to format expected by UI (array of {code, title} objects)
        const formattedOptions = imtOptions.map(code => ({
            code: code,
            title: code // Could be enhanced with descriptions from codelist
        }));

        // Add universal IMTs
        formattedOptions.push(...UNIVERSAL_IMTS);
        return formattedOptions;
    } catch (error) {
        console.error('Error loading IMT options from schema:', error);
        // Fallback to legacy mapping
        const mapping = HAZARD_IMT_MAPPING || LEGACY_HAZARD_IMT_MAPPING;
        if (mapping && mapping[selectedHazardType]) {
            return [...mapping[selectedHazardType], ...UNIVERSAL_IMTS];
        }
        return UNIVERSAL_IMTS;
    }
}

// Function to update IMT dropdowns when hazard changes
export async function updateIMTOptionsForHazard(hazardType, currentFormData, activeSections, updateFormData, ConditionalValidator) {
    const filteredOptions = await getFilteredIMTOptions(hazardType, ConditionalValidator);

    // Find all intensity_measure fields and update them
    // This includes both select elements and combobox inputs
    document.querySelectorAll('select[id*="intensity_measure"], input[id*="intensity_measure"]').forEach(element => {
        if (element.tagName === 'SELECT') {
            // Handle select dropdowns
            const currentValue = element.value;

            // Clear existing options except the first empty option
            const firstOption = element.firstElementChild;
            element.innerHTML = '';
            if (firstOption && firstOption.value === '') {
                element.appendChild(firstOption);
            } else {
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = 'Select intensity measure...';
                element.appendChild(emptyOption);
            }

            // Add filtered options
            filteredOptions.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.code;
                // Display only title (unit is already included in title)
                optionElement.textContent = option.title;
                if (option.description) {
                    optionElement.setAttribute('title', option.description);
                }
                element.appendChild(optionElement);
            });

            // Restore previous value if still valid
            if (filteredOptions.some(opt => opt.code === currentValue)) {
                element.value = currentValue;
            } else {
                element.value = '';
                // Update form data to reflect cleared value
                const fieldPath = element.getAttribute('data-field');
                if (fieldPath) {
                    setNestedValue(currentFormData, fieldPath, '');
                    autoSave(currentFormData, activeSections);
                }
            }
        } else if (element.tagName === 'INPUT') {
            // Handle combobox inputs - update their dropdown menu
            const wrapper = element.closest('.combobox-wrapper');
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
                        // Display only title (unit is already included in title)
                        link.textContent = option.title;
                        if (option.description) {
                            link.setAttribute('title', option.description);
                        }
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            element.value = option.code;
                            updateFormData();
                            // Validate the field
                            const fieldName = element.id.replace(/^modal_/, '');
                            const property = {}; // We'd need to get this from schema, but basic validation should work
                            // TODO: Add validation here if needed
                        });
                        item.appendChild(link);
                        dropdownMenu.appendChild(item);
                    });

                    // Add separator and custom value option
                    if (filteredOptions.length > 0) {
                        const separator = document.createElement('li');
                        separator.innerHTML = '<hr class="dropdown-divider">';
                        dropdownMenu.appendChild(separator);

                        const customItem = document.createElement('li');
                        customItem.innerHTML = '<span class="dropdown-item-text text-muted"><em>💡 You can also type a custom value</em></span>';
                        dropdownMenu.appendChild(customItem);
                    }
                }
            }

            // Check if current value is still valid
            const currentValue = element.value;
            if (currentValue && !filteredOptions.some(opt => opt.code === currentValue)) {
                // Current value is no longer valid for this hazard type
                element.value = '';
                updateFormData();
            }
        }
    });
}

export async function loadSchema(version, clearFormData, fieldValidationStatus, generateForm, ConditionalValidator) {
    if (!version) version = '1.0';

    // Store the version to return for URL substitutions
    let currentSchemaVersion = version;

    updateSchemaStatus('Loading RDLS v1.0 schema...', 'text-info');

    try {
        const response = await fetch(RDLS_VERSIONS[version]);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

        currentSchema = await response.json();

        // Add currency field definitions where needed - comprehensive search
        function addCurrencyFields(obj, path = '') {
            if (!obj || typeof obj !== 'object') return;

            for (const key in obj) {
                if (obj[key] && typeof obj[key] === 'object') {
                    // Check if this is a properties object containing quantity_kind
                    if (key === 'properties' && obj[key].quantity_kind) {
                        console.log(`Adding currency field at: ${path}.${key}`);
                        obj[key].currency = {
                            "type": "string",
                            "enum": ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "BGN", "HRK"],
                            "title": "Currency"
                        };
                    }

                    // Also check if this object directly contains quantity_kind (for different schema structures)
                    if (obj[key].quantity_kind && !obj[key].currency) {
                        console.log(`Adding currency field directly at: ${path}.${key}`);
                        obj[key].currency = {
                            "type": "string",
                            "enum": ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "BGN", "HRK"],
                            "title": "Currency"
                        };
                    }

                    // Recurse into nested objects
                    addCurrencyFields(obj[key], path ? `${path}.${key}` : key);
                }
            }
        }

        console.log('Using direct currency field insertion during form generation');

        // Ensure mappings are available
        if (!currentSchema.hazard_process_mappings) {
            currentSchema.hazard_process_mappings = {
                "drought": ["agricultural_drought", "hydrological_drought", "meteorological_drought", "socioeconomic_drought"],
                "flood": ["fluvial_flood", "pluvial_flood", "groundwater_flood", "coastal_flood", "glacial_lake_outburst"],
                "earthquake": ["rupture", "ground_motion", "liquefaction", "subsidence_uplift"],
                "extreme_temperature": ["extreme_cold", "extreme_heat"],
                "strong_wind": ["extratropical_cyclone", "tropical_cyclone", "tornado", "storm_surge"],
                "wildfire": ["wildfire", "wildfire_smoke"],
                "landslide": ["snow_avalanche", "landslide_general", "landslide_rockslide", "landslide_mudflow", "landslide_rockfall"],
                "tsunami": ["tsunami"],
                "volcanic": ["ashfall", "volcano_ballistics", "lahar", "lava", "pyroclastic_flow", "volcano_gas_aerosols"],
                "convective_storm": ["tornado", "lightning", "thunderstorm", "hail"],
                "dust_sand_storm": ["dust_sand_storm"],
                "erosion": ["coastal_erosion", "soil_erosion"],
                "sea_level_rise": ["sea_level_rise"],
                "pest_infestation": ["pest"],
            };
        }

        // v1.0: IMT mappings removed from schema (now in conditional codelists)
        // TODO: Implement codelist loading from external CSV files based on hazard type
        // For now, use legacy mappings as fallback for UI functionality
        if (currentSchema.intensity_measure_definitions) {
            IMT_DEFINITIONS = currentSchema.intensity_measure_definitions;
            console.log('Loaded', Object.keys(IMT_DEFINITIONS).length, 'IMT definitions from schema');
        } else {
            console.log('v1.0: IMT definitions not in schema (will load from codelists)');
        }

        // RDLS v1.0 uses conditional logic in $defs.Hazard.allOf for IMT mappings
        // IMT options are loaded dynamically via CodelistManager.getConditionalCodelist()
        // Legacy mappings kept as fallback only
        console.log('IMT mappings will be loaded dynamically from schema conditional logic');

        // Reset form data when switching schema versions
        clearFormData();
        fieldValidationStatus.clear();

        // Test conditional validation engine
        console.log('\n=== Testing Conditional Validation Engine ===');
        testConditionalValidation(currentSchema, ConditionalValidator, SchemaNavigator);

        updateSchemaStatus(`✓ RDLS v1.0 loaded successfully`, 'text-success');
        generateForm();
    } catch (error) {
        updateSchemaStatus(`✗ Failed to load schema: ${error.message}`, 'text-danger');
        console.error('Schema loading error:', error);
    }
    return currentSchemaVersion;
}

/**
 * Codelist Manager - Handles loading and caching of codelist CSV files
 */
export class CodelistManager {
    static get cache() {
        if (!CodelistManager._cache) {
            CodelistManager._cache = new Map();
        }
        return CodelistManager._cache;
    }

    static get baseUrl() {
        return 'https://docs.riskdatalibrary.org/en/latest/codelists/open/';
    }

    /**
     * Parse CSV text to array of objects with code and title
     * Expected format: CSV with 'Code' and 'Title' columns (minimum)
     * Returns: [{code: 'value', title: 'Display Name', category: 'Category'}, ...]
     */
    static parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length === 0) return [];

        // Parse header to find 'Code', 'Title', 'Category', and 'Valid Until' columns (case-insensitive)
        const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const codeIndex = header.findIndex(h => h.toLowerCase() === 'code');
        const titleIndex = header.findIndex(h => h.toLowerCase() === 'title');
        const categoryIndex = header.findIndex(h => h.toLowerCase() === 'category');
        const validUntilIndex = header.findIndex(h => h.toLowerCase() === 'valid until');

        if (codeIndex === -1) {
            console.warn('CSV does not have a "Code" column, using first column');
            // Fallback: use first column for both code and title
            return lines.slice(1)
                .map(line => {
                    const val = line.split(',')[0].trim().replace(/^"|"$/g, '');
                    return { code: val, title: val };
                })
                .filter(item => item.code && item.code.length > 0);
        }

        // Extract code, title, and category from CSV
        return lines.slice(1)
            .map(line => {
                // Use a more robust CSV parsing to handle commas in quoted fields
                const cells = [];
                let currentCell = '';
                let inQuotes = false;

                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        cells.push(currentCell.trim().replace(/^"|"$/g, ''));
                        currentCell = '';
                    } else {
                        currentCell += char;
                    }
                }
                cells.push(currentCell.trim().replace(/^"|"$/g, ''));

                const code = cells[codeIndex] || null;
                const title = titleIndex !== -1 ? cells[titleIndex] : code;
                const category = categoryIndex !== -1 ? cells[categoryIndex] : null;
                const validUntil = validUntilIndex !== -1 ? cells[validUntilIndex] : null;

                const item = { code, title: title || code };
                if (category) {
                    item.category = category;
                }
                if (validUntil) {
                    item.validUntil = validUntil;
                }
                return code ? item : null;
            })
            .filter(item => item !== null);
    }

    /**
     * Load codelist from CSV file
     * @param {string} codelistName - e.g., "imt_earthquake.csv"
     * @returns {Promise<Array<string>>} - Array of codelist values
     */
    static async loadCodelist(codelistName) {
        // Check cache first
        if (this.cache.has(codelistName)) {
            console.log(`[LOAD CODELIST] Using cached ${codelistName} (${this.cache.get(codelistName).length} items)`);
            return this.cache.get(codelistName);
        }

        try {
            // Determine if this is a closed codelist
            // Closed codelists: unit_currency.csv and others that should not be extended
            const closedCodelists = ['unit_currency.csv'];
            const isClosed = closedCodelists.includes(codelistName);

            // Build URL: use closed/ directory for closed codelists, open/ for others
            const baseUrlPath = 'https://docs.riskdatalibrary.org/en/latest/codelists/';
            const subdirectory = isClosed ? 'closed/' : 'open/';
            const url = baseUrlPath + subdirectory + codelistName;

            console.log(`[LOAD CODELIST] Loading ${codelistName} from: ${url} (${isClosed ? 'closed' : 'open'})`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const csvText = await response.text();
            console.log(`[LOAD CODELIST] Fetched ${csvText.length} characters of CSV data`);

            const values = this.parseCSV(csvText);

            // Cache the result
            this.cache.set(codelistName, values);

            console.log(`[LOAD CODELIST] Loaded ${values.length} values from ${codelistName}`);
            if (values.length > 0) {
                console.log(`[LOAD CODELIST] First few values:`, values.slice(0, 3));
            }
            return values;
        } catch (error) {
            console.error(`[LOAD CODELIST] Failed to load codelist ${codelistName}:`, error);
            // Return empty array on error (graceful degradation)
            this.cache.set(codelistName, []);
            return [];
        }
    }

    /**
     * Get codelist for a field based on conditional rules
     * @param {object} schemaDefinition - Schema definition containing allOf rules
     * @param {string} fieldName - Field to get codelist for
     * @param {object} parentData - Parent object data for conditional evaluation
     * @returns {Promise<Array<string>>} - Array of codelist values
     */
    static async getConditionalCodelist(schemaDefinition, ConditionalValidator, fieldName, parentData) {
        console.log(`[GET CONDITIONAL CODELIST] Field: ${fieldName}, parentData:`, parentData);

        // First, get the codelist name from conditional rules
        let codelistName = null;
        try {
            console.log(`[GET CONDITIONAL CODELIST] About to call ConditionalValidator.getConditionalCodelist`);
            codelistName = ConditionalValidator.getConditionalCodelist(
                schemaDefinition,
                fieldName,
                parentData
            );
            console.log(`[GET CONDITIONAL CODELIST] Call completed successfully`);
        } catch (error) {
            console.error(`[GET CONDITIONAL CODELIST] Error calling ConditionalValidator:`, error);
            codelistName = null;
        }

        console.log(`[GET CONDITIONAL CODELIST] ConditionalValidator returned codelist: ${codelistName}`);

        if (!codelistName) {
            // No conditional codelist, check base definition
            if (schemaDefinition.properties &&
                schemaDefinition.properties[fieldName] &&
                schemaDefinition.properties[fieldName].codelist) {
                const baseCodelist = schemaDefinition.properties[fieldName].codelist;
                console.log(`[GET CONDITIONAL CODELIST] Using base codelist: ${baseCodelist}`);
                return await this.loadCodelist(baseCodelist);
            }
            console.log(`[GET CONDITIONAL CODELIST] No codelist found, returning empty array`);
            return [];
        }

        // Load the conditional codelist
        console.log(`[GET CONDITIONAL CODELIST] Loading conditional codelist: ${codelistName}`);
        return await this.loadCodelist(codelistName);
    }

    /**
     * Filter classification schemes based on field purpose
     * @param {Array} schemes - Array of scheme objects with category property
     * @param {string} fieldPurpose - Field purpose (disaster_identifier, hazard_classification, building_taxonomy, socioeconomic_index)
     * @returns {Array} - Filtered array of schemes
     */
    static filterClassificationSchemes(schemes, fieldPurpose) {
        if (!fieldPurpose || !schemes || schemes.length === 0) {
            return schemes;
        }

        // Category to field purpose mapping based on user requirements
        const categoryMapping = {
            'Disaster identifier': ['disaster_identifier'],
            'Hazard classification': ['hazard_classification'],
            'Building taxonomy': ['building_taxonomy'],
            'Socio-economic index': ['socioeconomic_index']
        };

        const purposeLower = fieldPurpose.toLowerCase();

        return schemes.filter(scheme => {
            if (!scheme.category) {
                // If no category specified, include it for all field purposes
                return true;
            }

            const allowedPurposes = categoryMapping[scheme.category];
            if (!allowedPurposes) {
                // Unknown category, include it to be safe
                return true;
            }

            return allowedPurposes.includes(purposeLower);
        });
    }

    /**
     * Clear cache (useful for testing or reload)
     */
    static clearCache() {
        this.cache.clear();
    }
}

/**
 * Schema Navigator - Helper to traverse and extract schema definitions
 */
export class SchemaNavigator {
    /**
     * Get schema definition for a specific path (e.g., 'spatial', 'hazards', 'properties.type')
     */
    static getDefinitionAtPath(schema, path) {
        if (!schema || !path) return null;

        const parts = path.split('.');
        let current = schema;

        for (const part of parts) {
            if (part === 'properties' && current.properties) {
                current = current.properties;
            } else if (part === '$defs' && current.$defs) {
                current = current.$defs;
            } else if (current.properties && current.properties[part]) {
                current = current.properties[part];
            } else if (current.$defs && current.$defs[part]) {
                current = current.$defs[part];
            } else if (current.$ref) {
                // Follow $ref
                current = this.resolveRef(schema, current.$ref);
                if (current && current.properties && current.properties[part]) {
                    current = current.properties[part];
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        // Resolve final $ref if present
        if (current && current.$ref) {
            return this.resolveRef(schema, current.$ref);
        }

        return current;
    }

    /**
     * Resolve a $ref pointer (e.g., "#/$defs/Entity")
     */
    static resolveRef(schema, ref) {
        if (!ref || !ref.startsWith('#/')) return null;

        const path = ref.substring(2); // Remove '#/'
        const parts = path.split('/');

        let current = schema;
        for (const part of parts) {
            if (current[part]) {
                current = current[part];
            } else {
                return null;
            }
        }

        return current;
    }
}
