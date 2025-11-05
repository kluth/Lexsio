import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import '@testing-library/jest-dom/vitest';
import 'zone.js';
import 'zone.js/testing';

// Initialize the Angular testing environment
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Setup global test utilities
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = <T>(val: T): T => JSON.parse(JSON.stringify(val)) as T;
}
