import { expect, test, beforeAll, describe } from 'vitest';
import { loadFiles } from './setup.js';
import { loadJSONData } from '../src/utils.js';
import { loadSchema, currentSchema, checkSchemaVersion } from '../src/schema.js';
import { validateDatasetRequirements, fieldValidationStatus } from '../src/validation.js';

describe('Testing validate data', () => {
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

    test.each([
                 ['rdls_exp_ghsl_global_hum_pop'],
                 ['rdls_exp_world_settlemen_bld'],
                 ['rdls_hevl-kentmrwcities_nairobi'],
                 ['rdls_hzd-F3_FCV'],
                 ['rdls_hzd-SSD_dataset'],
                 ['rdls_lss-GIRI_AAL'],
                 ['rdls_lss-lkaundrr_desinventar'],
                 ['rdls_vln_ai_for_good'],
                 ['rdls_vln_dataset']
                ])('loading %s data', (file) => {
        let currentFormData = loadJSONData(files[file], checkSchemaVersion);
        validateDatasetRequirements(currentFormData, activeSections);
        expect(fieldValidationStatus.get("dataset_risk_data_type")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_resources")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_attributions")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_exposure")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_loss")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_vulnerability")["isValid"]).toBe(true);
        expect(fieldValidationStatus.get("dataset_hazard")["isValid"]).toBe(true);
    });
})
