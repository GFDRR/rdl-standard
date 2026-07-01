import { resolveReferenceSimple } from './schema.js';


export let fieldValidationStatus = new Map();

export function validateDatasetRequirements(currentFormData, activeSections) {
    // 1. Validate at least one risk_data_type
    const riskDataTypes = currentFormData.risk_data_type || [];
    const riskDataTypeValid = riskDataTypes.length > 0 && !riskDataTypes.every(type => !type || type.trim() === '');

    if (!riskDataTypeValid) {
        fieldValidationStatus.set('dataset_risk_data_type', {
            isValid: false,
            errorMessage: 'Dataset must have at least one risk data type'
        });
    } else {
        fieldValidationStatus.set('dataset_risk_data_type', {
            isValid: true,
            errorMessage: ''
        });
    }


    // 2. Validate at least one resource with required fields
    const resources = currentFormData.resources || [];
    let resourcesValid = true;
    let resourceError = '';

    if (!resources.length) {
        resourcesValid = false;
        resourceError = 'Dataset must have at least one resource';
    } else {
        // Check each resource for required fields
        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i];
            const resourceNum = i + 1;

            if (!resource.title || resource.title.trim() === '') {
                resourcesValid = false;
                resourceError = `Resource ${resourceNum} is missing required title`;
                break;
            }
            if (!resource.description || resource.description.trim() === '') {
                resourcesValid = false;
                resourceError = `Resource ${resourceNum} is missing required description`;
                break;
            }
            if ((!resource.download_url || resource.download_url.trim() === '') &&
                (!resource.access_url || resource.access_url.trim() === '')) {
                resourcesValid = false;
                resourceError = `Resource ${resourceNum} must have either download_url or access_url`;
                break;
            }
            if ((!resource.media_type || resource.media_type.trim() === '') &&
                (!resource.format || resource.format.trim() === '')) {
                resourcesValid = false;
                resourceError = `Resource ${resourceNum} must have either media_type or format`;
                break;
            }
        }
    }

    fieldValidationStatus.set('dataset_resources', {
        isValid: resourcesValid,
        errorMessage: resourceError
    });


    // 3. Validate attribution entities (v1.0: publisher, creator, contact_point are root-level Entity objects)
    let attributionsValid = true;
    let attributionError = '';

    // Check required root-level Entity fields
    const requiredRoles = ['publisher', 'creator', 'contact_point'];
    const missingRoles = [];

    for (const role of requiredRoles) {
        const entity = currentFormData[role];
        if (!entity || !entity.name || entity.name.trim() === '') {
            missingRoles.push(role);
        }
    }

    if (missingRoles.length > 0) {
        attributionsValid = false;
        if (missingRoles.length === 1) {
            attributionError = `Required attribution role missing: ${missingRoles[0].replace(/_/g, ' ')}`;
        } else {
            const formattedRoles = missingRoles.map(r => r.replace(/_/g, ' ')).join(', ');
            attributionError = `Required attribution roles missing: ${formattedRoles}`;
        }
    }

    // Then validate that each required role entity has email or url
    if (attributionsValid) {
        for (const role of requiredRoles) {
            const entity = currentFormData[role];
            if (entity) {
                // Check that at least one of email or url is provided
                const hasEmail = entity.email && entity.email.trim() !== '';
                const hasUrl = entity.url && entity.url.trim() !== '';
                if (!hasEmail && !hasUrl) {
                    attributionsValid = false;
                    attributionError = `${role.replace(/_/g, ' ')} entity must have either an email or URL`;
                    break;
                }
            }
        }
    }

    // Also validate additional attributions in the attributions array (if any)
    if (attributionsValid) {
        const attributions = currentFormData.attributions || [];
        for (let i = 0; i < attributions.length; i++) {
            const attribution = attributions[i];
            const attrNum = i + 1;

            // Check if entity exists and has required fields
            if (!attribution.entity) {
                attributionsValid = false;
                attributionError = `Additional attribution ${attrNum} is missing entity information`;
                break;
            }
            if (!attribution.entity.name || attribution.entity.name.trim() === '') {
                attributionsValid = false;
                attributionError = `Additional attribution ${attrNum} is missing required entity name`;
                break;
            }
            // Check that at least one of email or url is provided
            const hasEmail = attribution.entity.email && attribution.entity.email.trim() !== '';
            const hasUrl = attribution.entity.url && attribution.entity.url.trim() !== '';
            if (!hasEmail && !hasUrl) {
                attributionsValid = false;
                attributionError = `Additional attribution ${attrNum} entity must have either an email or URL`;
                break;
            }
        }
    }

    fieldValidationStatus.set('dataset_attributions', {
        isValid: attributionsValid,
        errorMessage: attributionError
    });

    // 4. Validate exposure data (if exposure is in risk_data_type AND exposure section is active)
    const hasExposureType = riskDataTypes.some(type => type && type.toLowerCase().includes('exposure'));
    const exposureSectionActive = activeSections.has('exposure');
    let exposureValid = true;
    let exposureError = '';

    // Check if exposure section is active - if so, it must have data AND be in risk_data_type
    if (exposureSectionActive) {
        if (!hasExposureType) {
            exposureValid = false;
            exposureError = 'Exposure component is active but "exposure" is not selected in risk_data_type';
        } else {
            const exposures = currentFormData.exposure || [];

            if (!exposures.length) {
                exposureValid = false;
                exposureError = 'Dataset with exposure risk_data_type must have at least one exposure item';
            } else {
            // Check each exposure item
            for (let i = 0; i < exposures.length; i++) {
                const exposure = exposures[i];
                const expNum = i + 1;

                // Check for required category
                if (!exposure.category || exposure.category.trim() === '') {
                    exposureValid = false;
                    exposureError = `Exposure ${expNum} is missing required category`;
                    break;
                }

                // Check for at least one metric
                const metrics = exposure.metrics || [];
                if (!metrics.length) {
                    exposureValid = false;
                    exposureError = `Exposure ${expNum} must have at least one metric`;
                    break;
                }

                // Check each metric for required fields
                for (let j = 0; j < metrics.length; j++) {
                    const metric = metrics[j];
                    const metricNum = j + 1;

                    if (!metric.dimension || metric.dimension.trim() === '') {
                        exposureValid = false;
                        exposureError = `Exposure ${expNum}, Metric ${metricNum} is missing required dimension`;
                        break;
                    }

                    // Check measurement object exists and has at least one property (minProperties: 1)
                    if (!metric.measurement || typeof metric.measurement !== 'object') {
                        exposureValid = false;
                        exposureError = `Exposure ${expNum}, Metric ${metricNum} is missing required measurement`;
                        break;
                    }

                    // Measurement must have at least one property (quantity_kind or unit)
                    const hasMeasurementProperty = (metric.measurement.quantity_kind && metric.measurement.quantity_kind.trim() !== '') ||
                                                  (metric.measurement.unit && metric.measurement.unit.trim() !== '');
                    if (!hasMeasurementProperty) {
                        exposureValid = false;
                        exposureError = `Exposure ${expNum}, Metric ${metricNum} measurement must have at least quantity_kind or unit`;
                        break;
                    }
                }

                if (!exposureValid) break;
            }
            }
        }
    }

    fieldValidationStatus.set('dataset_exposure', {
        isValid: exposureValid,
        errorMessage: exposureError
    });


    // 5. Validate loss data (if loss is in risk_data_type AND loss section is active)
    const hasLossType = riskDataTypes.some(type => type && type.toLowerCase().includes('loss'));
    const lossSectionActive = activeSections.has('loss');
    let lossValid = true;
    let lossError = '';

    // Check if loss section is active - if so, it must have data AND be in risk_data_type
    if (lossSectionActive) {
        if (!hasLossType) {
            lossValid = false;
            lossError = 'Loss component is active but "loss" is not selected in risk_data_type';
        } else {
            const losses = (currentFormData.loss && currentFormData.loss.losses) || [];

            if (!losses.length) {
                lossValid = false;
                lossError = 'Dataset with loss risk_data_type must have at least one loss item';
            } else {
            // Define required loss attributes with correct field paths
            const requiredLossAttributes = [
                { field: 'hazard.type', name: 'hazard type' },
                { field: 'asset_category', name: 'asset category' },
                { field: 'asset_dimension', name: 'asset dimension' },
                { field: 'impact_and_losses.impact_type', name: 'impact type' },
                { field: 'impact_and_losses.impact_modelling', name: 'impact modelling' },
                { field: 'impact_and_losses.impact_metric', name: 'impact metric' },
                { field: 'impact_and_losses.measurement.quantity_kind', name: 'quantity kind' },
                { field: 'impact_and_losses.loss_type', name: 'loss type' },
                { field: 'impact_and_losses.loss_approach', name: 'loss approach' },
                { field: 'impact_and_losses.loss_frequency_type', name: 'loss frequency type' }
            ];

            // Check each loss item
            for (let i = 0; i < losses.length; i++) {
                const loss = losses[i];
                const lossNum = i + 1;

                // Check each required attribute
                for (const attr of requiredLossAttributes) {
                    // Handle nested field paths (e.g., 'impact_and_losses.impact_type', 'impact_and_losses.measurement.quantity_kind')
                    let fieldValue;
                    if (attr.field.includes('.')) {
                        const parts = attr.field.split('.');
                        // Navigate through nested object properties
                        fieldValue = loss;
                        for (const part of parts) {
                            fieldValue = fieldValue && fieldValue[part];
                            if (!fieldValue) break;
                        }
                    } else {
                        fieldValue = loss[attr.field];
                    }

                    if (!fieldValue || fieldValue.toString().trim() === '') {
                        lossValid = false;
                        lossError = `Loss ${lossNum} is missing required ${attr.name}`;
                        break;
                    }
                }

                if (!lossValid) break;
            }
            }
        }
    }

    fieldValidationStatus.set('dataset_loss', {
        isValid: lossValid,
        errorMessage: lossError
    });

    // 6. Validate vulnerability data (if vulnerability is in risk_data_type AND vulnerability section is active)
    const hasVulnerabilityType = riskDataTypes.some(type => type && type.toLowerCase().includes('vulnerability'));
    const vulnerabilitySectionActive = activeSections.has('vulnerability');
    let vulnerabilityValid = true;
    let vulnerabilityError = '';

    // Check if vulnerability section is active - if so, it must have data AND be in risk_data_type
    if (vulnerabilitySectionActive) {
        if (!hasVulnerabilityType) {
            vulnerabilityValid = false;
            vulnerabilityError = 'Vulnerability component is active but "vulnerability" is not selected in risk_data_type';
        } else {
            const vulnerability = currentFormData.vulnerability;

            if (!vulnerability) {
                vulnerabilityValid = false;
                vulnerabilityError = 'Dataset with vulnerability risk_data_type must have vulnerability metadata';
            } else {
            // Check which approach is being used
            // hasFunctions should only be true if there are actual non-empty function arrays
            const hasFunctions = vulnerability.functions && Object.keys(vulnerability.functions).some(key => {
                const funcArray = vulnerability.functions[key];
                return Array.isArray(funcArray) && funcArray.length > 0;
            });
            const hasSocioEconomic = vulnerability.socio_economic && vulnerability.socio_economic.length > 0;

            if (!hasFunctions && !hasSocioEconomic) {
                vulnerabilityValid = false;
                vulnerabilityError = 'Vulnerability must specify at least one approach: vulnerability functions, fragility functions, damage-to-loss functions, engineering demand functions, or socio-economic indicators';
            } else if (hasSocioEconomic && !hasFunctions) {
                // Socio-economic only: validate that each indicator has required fields
                for (let i = 0; i < vulnerability.socio_economic.length; i++) {
                    const indicator = vulnerability.socio_economic[i];
                    const requiredFields = [
                        { field: 'indicator_name', name: 'indicator name' },
                        { field: 'indicator_code', name: 'indicator code' },
                        { field: 'description', name: 'description' },
                        { field: 'reference_year', name: 'reference year' }
                    ];

                    for (const attr of requiredFields) {
                        if (!indicator[attr.field] || indicator[attr.field].toString().trim() === '') {
                            vulnerabilityValid = false;
                            vulnerabilityError = `Socio-economic indicator ${i + 1} is missing required ${attr.name}`;
                            break;
                        }
                    }
                    if (!vulnerabilityValid) break;
                }
            } else if (hasFunctions) {
                // Function-based approach: validate required vulnerability attributes
                const requiredVulnerabilityAttributes = [
                    { field: 'hazard_primary', name: 'primary hazard type' },
                    { field: 'hazard_primary.intensity_measure', name: 'hazard intensity measurement' },
                    { field: 'category', name: 'exposure category' },
                    { field: 'impact.type', name: 'impact type' },
                    { field: 'impact.modelling', name: 'impact modelling' },
                    { field: 'impact.metric', name: 'impact metric' },
                    { field: 'impact.measurement.quantity_kind', name: 'quantity kind' }
                ];

                // Check each function type (vulnerability, fragility, damage_to_loss, engineering_demand)
                for (const funcType of Object.keys(vulnerability.functions)) {
                    const funcArray = vulnerability.functions[funcType];
                    if (Array.isArray(funcArray) && funcArray.length > 0) {
                        // Validate each function in the array
                        for (let i = 0; i < funcArray.length; i++) {
                            const func = funcArray[i];
                            const funcNum = i + 1;

                            // Check each required attribute
                            for (const attr of requiredVulnerabilityAttributes) {
                                // Handle nested field paths (e.g., 'impact.type', 'impact.measurement.quantity_kind')
                                let fieldValue;
                                if (attr.field.includes('.')) {
                                    const parts = attr.field.split('.');
                                    // Navigate through nested object properties
                                    fieldValue = func;
                                    for (const part of parts) {
                                        fieldValue = fieldValue && fieldValue[part];
                                        if (!fieldValue) break;
                                    }
                                } else {
                                    fieldValue = func[attr.field];
                                }

                                if (!fieldValue || fieldValue.toString().trim() === '') {
                                    vulnerabilityValid = false;
                                    vulnerabilityError = `${funcType} function ${funcNum} is missing required ${attr.name}`;
                                    break;
                                }
                            }

                            if (!vulnerabilityValid) break;
                        }
                    }

                    if (!vulnerabilityValid) break;
                }
            }
            }
        }
    }

    fieldValidationStatus.set('dataset_vulnerability', {
        isValid: vulnerabilityValid,
        errorMessage: vulnerabilityError
    });

    // 7. Validate hazard event inheritance (if hazard is in risk_data_type AND hazard section is active)
    const hasHazardType = riskDataTypes.some(type => type && type.toLowerCase().includes('hazard'));
    const hazardSectionActive = activeSections.has('hazard');
    let hazardValid = true;
    let hazardError = '';

    // Check if hazard section is active - if so, it must have data AND be in risk_data_type
    if (hazardSectionActive) {
        if (!hasHazardType) {
            hazardValid = false;
            hazardError = 'Hazard component is active but "hazard" is not selected in risk_data_type';
        } else {
            // Check if hazard has event_sets with at least one event_set
            const eventSets = (currentFormData.hazard && currentFormData.hazard.event_sets) || [];

            if (!eventSets.length) {
                hazardValid = false;
                hazardError = 'Dataset with hazard risk_data_type must have at least one event_set';
            } else {
                for (let i = 0; i < eventSets.length; i++) {
                const eventSet = eventSets[i];
                const eventSetNum = i + 1;
                const events = eventSet.events || [];

                if (events.length === 0) continue; // Skip validation if no events

                // Check if event_set has hazard information
                const hasEventSetHazards = eventSet.hazards && eventSet.hazards.length > 0;
                const hasEventSetCalculationMethod = eventSet.calculation_method && eventSet.calculation_method.trim() !== '';

                // Get first hazard from event_set (if exists)
                const eventSetHazard = hasEventSetHazards ? eventSet.hazards[0] : null;
                const hasEventSetType = eventSetHazard && eventSetHazard.type && eventSetHazard.type.trim() !== '';
                const hasEventSetProcess = eventSetHazard && eventSetHazard.process && eventSetHazard.process.trim() !== '';

                // Validate each event
                for (let j = 0; j < events.length; j++) {
                    const event = events[j];
                    const eventNum = j + 1;

                    // Check if event has its own hazard and calculation_method
                    const hasEventHazard = event.hazard && typeof event.hazard === 'object';
                    const hasEventType = hasEventHazard && event.hazard.type && event.hazard.type.trim() !== '';
                    const hasEventProcess = hasEventHazard && event.hazard.process && event.hazard.process.trim() !== '';
                    const hasEventCalculationMethod = event.calculation_method && event.calculation_method.trim() !== '';

                    // Rule: If event_set doesn't have type, process, or calculation_method,
                    // then events MUST have them
                    if (!hasEventSetType && !hasEventType) {
                        hazardValid = false;
                        hazardError = `Event set ${eventSetNum}, Event ${eventNum}: hazard type must be specified either at event_set level or event level`;
                        break;
                    }

                    if (!hasEventSetProcess && !hasEventProcess) {
                        hazardValid = false;
                        hazardError = `Event set ${eventSetNum}, Event ${eventNum}: hazard process must be specified either at event_set level or event level`;
                        break;
                    }

                    if (!hasEventSetCalculationMethod && !hasEventCalculationMethod) {
                        hazardValid = false;
                        hazardError = `Event set ${eventSetNum}, Event ${eventNum}: calculation_method must be specified either at event_set level or event level`;
                        break;
                    }
                }

                if (!hazardValid) break;
                }
            }
        }
    }

    fieldValidationStatus.set('dataset_hazard', {
        isValid: hazardValid,
        errorMessage: hazardError
    });

    // v1.0: license_url field removed - license is now a direct IRI/URL field
    // License validation is handled by the standard IRI format validation

}

/**
 * Conditional Validation Engine for JSON Schema if-then rules
 * Handles v1.0 schema's 66+ conditional validation rules
 */
export class ConditionalValidator {
    /**
     * Evaluate if-then-else conditions from schema allOf rules
     * @param {Object} schemaDefinition - The schema definition object containing allOf
     * @param {Object} data - The current data object to validate against
     * @param {String} basePath - The base path for nested objects (e.g., 'spatial', 'hazards')
     * @returns {Object} - { applicableRules: [], errors: [] }
     */
    static evaluateConditionals(schemaDefinition, data, basePath = '') {
        const result = {
            applicableRules: [],
            errors: [],
            additionalValidations: []
        };

        if (!schemaDefinition || !schemaDefinition.allOf) {
            return result;
        }

        // Process each allOf item looking for if-then patterns
        schemaDefinition.allOf.forEach((allOfItem, allOfIndex) => {
            // If allOf item is a $ref, resolve it first
            let resolvedItem = allOfItem;
            if (allOfItem.$ref) {
                resolvedItem = resolveReferenceSimple(allOfItem.$ref);
                if (!resolvedItem) return; // Skip if can't resolve

                // If the resolved item also has allOf, recurse into it
                if (resolvedItem.allOf) {
                    const nestedResult = this.evaluateConditionals(resolvedItem, data, basePath);
                    result.applicableRules.push(...nestedResult.applicableRules);
                    result.errors.push(...nestedResult.errors);
                    result.additionalValidations.push(...nestedResult.additionalValidations);
                    return;
                }
            }

            // Now check for if/then in the resolved item
            const rule = resolvedItem;
            const index = allOfIndex;

            if (rule.if && rule.then) {
                const conditionMet = this.evaluateCondition(rule.if, data, basePath);

                if (conditionMet) {
                    result.applicableRules.push({
                        index,
                        condition: rule.if,
                        schema: rule.then
                    });

                    // Extract validation requirements from 'then' clause
                    if (rule.then.required) {
                        rule.then.required.forEach(field => {
                            result.additionalValidations.push({
                                field,
                                type: 'required',
                                rule: 'if-then'
                            });
                        });
                    }

                    if (rule.then.properties) {
                        Object.keys(rule.then.properties).forEach(propName => {
                            const propSchema = rule.then.properties[propName];
                            result.additionalValidations.push({
                                field: propName,
                                type: 'conditional_property',
                                schema: propSchema,
                                rule: 'if-then'
                            });
                        });
                    }

                    // Handle 'not' clause (disallowed fields)
                    if (rule.then.not && rule.then.not.required) {
                        rule.then.not.required.forEach(field => {
                            result.additionalValidations.push({
                                field,
                                type: 'forbidden',
                                rule: 'if-then-not'
                            });
                        });
                    }
                } else if (rule.else) {
                    // Evaluate else clause if condition not met
                    const elseResult = this.extractValidations(rule.else);
                    result.additionalValidations.push(...elseResult);
                }
            }
        });

        return result;
    }

    /**
     * Evaluate an if condition against data
     * @param {Object} ifCondition - The if clause from schema
     * @param {Object} data - The data to check
     * @param {String} basePath - Base path for nested objects
     * @returns {Boolean} - Whether condition is met
     */
    static evaluateCondition(ifCondition, data, basePath = '') {
        if (!ifCondition || !data) return false;

        // Handle properties-based conditions
        if (ifCondition.properties) {
            for (const [propName, propCondition] of Object.entries(ifCondition.properties)) {
                const dataValue = data[propName];

                // Check const condition
                if (propCondition.const !== undefined) {
                    if (dataValue !== propCondition.const) {
                        return false;
                    }
                }

                // Check enum condition
                if (propCondition.enum && Array.isArray(propCondition.enum)) {
                    if (!propCondition.enum.includes(dataValue)) {
                        return false;
                    }
                }

                // Check pattern condition
                if (propCondition.pattern && typeof dataValue === 'string') {
                    const regex = new RegExp(propCondition.pattern);
                    if (!regex.test(dataValue)) {
                        return false;
                    }
                }
            }
            return true; // All property conditions met
        }

        // Handle required-based conditions
        if (ifCondition.required) {
            return ifCondition.required.every(field => {
                const value = data[field];
                return value !== undefined && value !== null && value !== '';
            });
        }

        return false;
    }

    /**
     * Extract validations from a schema clause
     */
    static extractValidations(schemaClause) {
        const validations = [];

        if (schemaClause.required) {
            schemaClause.required.forEach(field => {
                validations.push({
                    field,
                    type: 'required',
                    rule: 'extracted'
                });
            });
        }

        if (schemaClause.properties) {
            Object.keys(schemaClause.properties).forEach(propName => {
                validations.push({
                    field: propName,
                    type: 'conditional_property',
                    schema: schemaClause.properties[propName],
                    rule: 'extracted'
                });
            });
        }

        return validations;
    }

    /**
     * Get conditional codelist for a field based on current data context
     * Used for intensity_measure codelists that depend on hazard type
     */
    static getConditionalCodelist(schemaDefinition, fieldName, parentData) {
        console.log(`[CONDITIONAL VALIDATOR] getConditionalCodelist called for field: ${fieldName}`);
        console.log(`[CONDITIONAL VALIDATOR] parentData:`, parentData);
        console.log(`[CONDITIONAL VALIDATOR] schemaDefinition has allOf:`, !!(schemaDefinition && schemaDefinition.allOf));

        if (!schemaDefinition || !schemaDefinition.allOf) {
            console.log(`[CONDITIONAL VALIDATOR] No schema or allOf, returning null`);
            return null;
        }

        // Find applicable if-then rule
        const result = this.evaluateConditionals(schemaDefinition, parentData);
        console.log(`[CONDITIONAL VALIDATOR] evaluateConditionals returned ${result.applicableRules.length} applicable rules`);

        for (const rule of result.applicableRules) {
            console.log(`[CONDITIONAL VALIDATOR] Checking rule, has properties:`, !!(rule.schema && rule.schema.properties));
            if (rule.schema.properties && rule.schema.properties[fieldName]) {
                let fieldSchema = rule.schema.properties[fieldName];
                console.log(`[CONDITIONAL VALIDATOR] Found rule for field ${fieldName}`);
                console.log(`[CONDITIONAL VALIDATOR] fieldSchema object:`, JSON.stringify(fieldSchema, null, 2));

                // If fieldSchema is a $ref, resolve it first
                if (fieldSchema.$ref) {
                    console.log(`[CONDITIONAL VALIDATOR] fieldSchema has $ref: ${fieldSchema.$ref}, resolving...`);
                    const resolved = resolveReferenceSimple(fieldSchema.$ref);
                    if (resolved) {
                        fieldSchema = resolved;
                        console.log(`[CONDITIONAL VALIDATOR] Resolved $ref to:`, JSON.stringify(fieldSchema, null, 2));
                    } else {
                        console.log(`[CONDITIONAL VALIDATOR] Failed to resolve $ref`);
                    }
                }

                console.log(`[CONDITIONAL VALIDATOR] has codelist:`, !!fieldSchema.codelist, `has enum:`, !!fieldSchema.enum);
                console.log(`[CONDITIONAL VALIDATOR] codelist value:`, fieldSchema.codelist);
                if (fieldSchema.codelist) {
                    console.log(`[CONDITIONAL VALIDATOR] Returning codelist: ${fieldSchema.codelist}`);
                    return fieldSchema.codelist;
                }
            }
        }

        console.log(`[CONDITIONAL VALIDATOR] No matching rule found, returning null`);
        return null;
    }

    /**
     * Check if a field is conditionally required
     */
    static isConditionallyRequired(schemaDefinition, fieldName, parentData) {
        const result = this.evaluateConditionals(schemaDefinition, parentData);

        return result.additionalValidations.some(validation =>
            validation.field === fieldName && validation.type === 'required'
        );
    }

    /**
     * Check if a field is conditionally forbidden
     */
    static isConditionallyForbidden(schemaDefinition, fieldName, parentData) {
        const result = this.evaluateConditionals(schemaDefinition, parentData);

        return result.additionalValidations.some(validation =>
            validation.field === fieldName && validation.type === 'forbidden'
        );
    }
}
