import { afterAll, beforeAll } from 'vitest';
import { JSDOM } from "jsdom";

beforeAll(() => {
  const dom = new JSDOM('<!DOCTYPE html><body><div id="schemaStatus">Status</div></body>');
  global.document = dom.window.document;
  global.window = dom.window;
});

afterAll(() => {
  delete global.document;
  delete global.window;
});
