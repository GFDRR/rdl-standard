import { expect, test, beforeEach, describe } from 'vitest';
import { loadSchema, currentSchema } from '../src/schema.js';

describe('math operations', () => {

  test('load schema version 1.0', async () => {
    let currentFormData = {};
    function clearFormData() {
        currentFormData = {};
    }
    let fieldValidationStatus = new Map();
    function generateForm() {
        console.log("Generating form");
    }
    const currentSchemaVersion = await loadSchema('1.0', clearFormData, fieldValidationStatus, generateForm);
    expect(currentSchemaVersion).toBe("1.0");
  })
})
