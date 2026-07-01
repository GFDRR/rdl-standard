import { CodelistManager } from './schema.js';

/**
 * Test the conditional validation engine with real schema data
 */
export function testConditionalValidation(currentSchema, ConditionalValidator, SchemaNavigator) {
    if (!currentSchema) {
        console.log('No schema loaded for testing');
        return;
    }

    console.log('Testing conditional validation with v1.0 schema...');

    // Test 1: Hazard type → intensity_measure codelist
    console.log('\nTest 1: Hazard type conditional codelists');
    const hazardDef = SchemaNavigator.getDefinitionAtPath(currentSchema, '$defs.Hazard');
    if (hazardDef && hazardDef.allOf) {
        const testDataEarthquake = { type: 'earthquake' };
        const resultEq = ConditionalValidator.evaluateConditionals(hazardDef, testDataEarthquake);
        console.log('  Earthquake hazard conditionals:', resultEq);

        const codelistEq = ConditionalValidator.getConditionalCodelist(hazardDef, 'intensity_measure', testDataEarthquake);
        console.log('  Earthquake intensity_measure codelist:', codelistEq);

        const testDataFlood = { type: 'flood' };
        const codelistFlood = ConditionalValidator.getConditionalCodelist(hazardDef, 'intensity_measure', testDataFlood);
        console.log('  Flood intensity_measure codelist:', codelistFlood);
    }

    // Test 2: Schema navigator
    console.log('\nTest 2: Schema Navigator');
    const entityDef = SchemaNavigator.getDefinitionAtPath(currentSchema, '$defs.Entity');
    console.log('  Entity definition found:', entityDef ? 'Yes' : 'No');
    if (entityDef) {
        console.log('  Entity properties:', Object.keys(entityDef.properties || {}));
    }

    console.log('=== Conditional Validation Tests Complete ===\n');

    // Test 3: Codelist loading (async, non-blocking)
    testCodelistLoading(currentSchema, SchemaNavigator).catch(err =>
        console.error('Codelist loading test failed:', err)
    );
}

// Additional helper function to test dependencies after form loads
export function testDependenciesAfterLoad() {
    setTimeout(() => {
        console.log('\n=== Post-Load Dependency Test ===');
        
        // Test hazard type -> process dependencies in all contexts
        const hazardTypeFields = [
            'vulnerability.hazard_primary',
            'loss.hazard.type',
            'hazards.type'
        ];
        
        hazardTypeFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                console.log(`Found hazard type field: ${fieldName}`);
                
                // Find its corresponding process field
                let processFieldName;
                if (fieldName.includes('vulnerability')) {
                    processFieldName = fieldName.replace('hazard_primary', 'hazard_process_primary');
                } else if (fieldName.includes('loss')) {
                    processFieldName = fieldName.replace('hazard.type', 'hazard.process');
                } else if (fieldName.includes('hazards')) {
                    processFieldName = fieldName.replace('type', 'processes');
                }
                
                const processField = document.getElementById(processFieldName);
                console.log(`  Corresponding process field ${processFieldName}: ${!!processField}`);
                
                if (processField) {
                    console.log(`  Process field has ${processField.options.length} options`);
                }
            }
        });
        
        // Test currency fields
        const currencyFields = [
            'loss.impact_and_losses.currency',
            'modal_currency'
        ];
        
        currencyFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                const container = field.closest('.form-field, .modal-form-field');
                console.log(`Found currency field: ${fieldName}, visible: ${container ? container.style.display !== 'none' : 'no container'}`);
            }
        });
        
    }, 3000);
}

async function testCodelistLoading(currentSchema, SchemaNavigator) {
    console.log('\n=== Testing Codelist Loading ===');

    try {
        // Test loading a specific codelist
        console.log('Test 1: Loading imt_earthquake.csv...');
        const earthquakeIMTs = await CodelistManager.loadCodelist('imt_earthquake.csv');
        console.log(`  Loaded ${earthquakeIMTs.length} earthquake intensity measures`);
        if (earthquakeIMTs.length > 0) {
            const samples = earthquakeIMTs.slice(0, 5).map(item =>
                typeof item === 'object' ? `${item.code} (${item.title})` : item
            ).join(', ');
            console.log(`  Sample values: ${samples}`);
        }

        // Test conditional codelist loading
        console.log('\nTest 2: Conditional codelist loading...');
        const hazardDef = SchemaNavigator.getDefinitionAtPath(currentSchema, '$defs.Hazard');
        if (hazardDef) {
            const floodData = { type: 'flood' };
            const floodIMTs = await CodelistManager.getConditionalCodelist(
                hazardDef,
                'intensity_measure',
                floodData
            );
            console.log(`  Flood hazard: ${floodIMTs.length} intensity measures`);
            if (floodIMTs.length > 0) {
                const samples = floodIMTs.slice(0, 5).map(item =>
                    typeof item === 'object' ? `${item.code} (${item.title})` : item
                ).join(', ');
                console.log(`  Sample values: ${samples}`);
            }

            const tsunamiData = { type: 'tsunami' };
            const tsunamiIMTs = await CodelistManager.getConditionalCodelist(
                hazardDef,
                'intensity_measure',
                tsunamiData
            );
            console.log(`  Tsunami hazard: ${tsunamiIMTs.length} intensity measures`);
        }

        console.log('\n=== Codelist Loading Tests Complete ===\n');
    } catch (error) {
        console.error('Codelist loading test failed:', error);
    }
}
