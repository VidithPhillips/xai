// Test setup file
import { JSDOM } from 'jsdom';
import { expect } from 'chai';
import sinon from 'sinon';

// Create DOM environment for tests
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Add testing utilities to global scope
global.expect = expect;
global.sinon = sinon; 