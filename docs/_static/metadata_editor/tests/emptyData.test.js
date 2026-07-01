import { expect, test, beforeAll, describe } from 'vitest';
import _ from 'lodash';
import { loadFiles } from './setup.js';
import { loadJSONData } from '../src/utils.js';
import { loadSchema, currentSchema, checkSchemaVersion } from '../src/schema.js';
import { validateDatasetRequirements, fieldValidationStatus } from '../src/validation.js';

function alterElement(originalData, name, value) {
    const copiedData = _.cloneDeep(originalData);
    copiedData[name] = value;
    return copiedData;
}

describe('Testing invalid data', () => {
    let files;
    let activeSections;

    beforeAll(async () => {
        let currentFormData = {};
        function clearFormData() {
            currentFormData = {};
        }
        let fieldValidationStatus = new Map();
        function generateForm() {
            console.log("Generating form");
        }
        const currentSchemaVersion = await loadSchema('1.0', clearFormData, fieldValidationStatus, generateForm);
        files = loadFiles();
        activeSections = new Set(['general']);
    })

    test('check empty risk_data_type', async () => {
        let file = 'rdls_exp_world_settlemen_bld';
        let currentFormData = loadJSONData(files[file], checkSchemaVersion);
        let invalidData = alterElement(currentFormData, 'risk_data_type', []);
        validateDatasetRequirements(invalidData, activeSections);
        expect(fieldValidationStatus.get("dataset_risk_data_type")["isValid"]).toBe(false);
        expect(fieldValidationStatus.get("dataset_resources")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_attributions")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_exposure")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_loss")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_vulnerability")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_hazard")["isValid"]).toBe(true);
    });

    test('check empty resources', async () => {
        let file = 'rdls_hzd-F3_FCV';
        let currentFormData = loadJSONData(files[file], checkSchemaVersion);
        let invalidData = alterElement(currentFormData, 'resources', []);
        validateDatasetRequirements(invalidData, activeSections);
        expect(fieldValidationStatus.get("dataset_risk_data_type")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_resources")["isValid"]).toBe(false);
        expect(fieldValidationStatus.get("dataset_attributions")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_exposure")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_loss")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_vulnerability")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_hazard")["isValid"]).toBe(true);
    });

    test('check empty creator', async () => {
        let file = 'rdls_vln_ai_for_good';
        let currentFormData = loadJSONData(files[file], checkSchemaVersion);
        let invalidData = alterElement(currentFormData, 'creator', []);
        validateDatasetRequirements(invalidData, activeSections);
        expect(fieldValidationStatus.get("dataset_risk_data_type")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_resources")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_attributions")["isValid"]).toBe(false);
        expect(fieldValidationStatus.get("dataset_exposure")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_loss")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_vulnerability")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_hazard")["isValid"]).toBe(true);
    });

    test('check empty exposure', async () => {
        let file = 'rdls_exp_world_settlemen_bld';
        let currentFormData = loadJSONData(files[file], checkSchemaVersion);
        let invalidData = alterElement(currentFormData, 'exposure', []);
        activeSections = new Set(['general', 'exposure']);
        validateDatasetRequirements(invalidData, activeSections);
        expect(fieldValidationStatus.get("dataset_risk_data_type")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_resources")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_attributions")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_exposure")["isValid"]).toBe(false);
        expect(fieldValidationStatus.get("dataset_loss")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_vulnerability")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_hazard")["isValid"]).toBe(true);
    });

    test('check empty loss', async () => {
        let file = 'rdls_lss-lkaundrr_desinventar';
        let currentFormData = loadJSONData(files[file], checkSchemaVersion);
        let invalidData = alterElement(currentFormData, 'loss', []);
        activeSections = new Set(['general', 'loss']);
        validateDatasetRequirements(invalidData, activeSections);
        expect(fieldValidationStatus.get("dataset_risk_data_type")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_resources")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_attributions")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_exposure")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_loss")["isValid"]).toBe(false);
        expect(fieldValidationStatus.get("dataset_vulnerability")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_hazard")["isValid"]).toBe(true);
    });

    test('check empty vulnerability', async () => {
        let file = 'rdls_vln_dataset';
        let currentFormData = loadJSONData(files[file], checkSchemaVersion);
        let invalidData = alterElement(currentFormData, 'vulnerability', []);
        activeSections = new Set(['general', 'vulnerability']);
        validateDatasetRequirements(invalidData, activeSections);
        expect(fieldValidationStatus.get("dataset_risk_data_type")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_resources")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_attributions")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_exposure")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_loss")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_vulnerability")["isValid"]).toBe(false);
        expect(fieldValidationStatus.get("dataset_hazard")["isValid"]).toBe(true);
    });

    test('check empty hazard', async () => {
        let file = 'rdls_vln_dataset';
        let currentFormData = loadJSONData(files[file], checkSchemaVersion);
        let invalidData = alterElement(currentFormData, 'hazard', []);
        activeSections = new Set(['general', 'hazard']);
        validateDatasetRequirements(invalidData, activeSections);
        expect(fieldValidationStatus.get("dataset_risk_data_type")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_resources")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_attributions")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_exposure")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_loss")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_vulnerability")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_hazard")["isValid"]).toBe(false);
    });
})
