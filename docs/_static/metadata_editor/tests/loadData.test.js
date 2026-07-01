import { expect, test, beforeAll, describe } from 'vitest';
import { loadFiles } from './setup.js';
import { loadJSONData } from '../src/utils.js';
import { loadSchema, currentSchema, checkSchemaVersion } from '../src/schema.js';

describe('Testing loading data', () => {
    let files;

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
    })

    test.each([
                 ['rdls_exp_world_settlemen_bld'],
                 ['rdls_exp_ghsl_global_hum_pop'],
                 ['rdls_hevl-kentmrwcities_nairobi'],
                 ['rdls_hzd-F3_FCV'],
                 ['rdls_hzd-SSD_dataset'],
                 ['rdls_lss-GIRI_AAL'],
                 ['rdls_lss-lkaundrr_desinventar'],
                 ['rdls_vln_dataset'],
                 ['rdls_vln_ai_for_good']
                ])('loading %i.json data', (file) => {
        let currentFormData = loadJSONData(files[file], checkSchemaVersion);
        expect(currentFormData['id']).toBe(file);
    });
})
