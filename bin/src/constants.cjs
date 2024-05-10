"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kSemicolon = exports.kSemicolonRegex = exports.kWhitespaceRegex = exports.kNewline = exports.kExpectedTestConstructs = exports.kPosixFolderSeparator = exports.kIndex = exports.kMTSExtension = exports.kMJSExtension = exports.kCTSExtension = exports.kCJSExtension = exports.kJSExtension = exports.kDTSExtension = exports.kTSExtension = exports.kJSQuoteGlobalRegex = exports.kJSOrTSTestFilepathRegex = exports.kJSOrTSFilepathRegex = exports.kJSRelativeImportRegex = exports.kVitest = exports.kVi = exports.kJest = void 0;
exports.kJest = 'jest';
exports.kVi = 'vi';
exports.kVitest = 'vitest';
exports.kJSRelativeImportRegex = /^\.{1,2}/;
exports.kJSOrTSFilepathRegex = /\.(?:ts|js|mjs|mts|cjs|cts)$/;
exports.kJSOrTSTestFilepathRegex = /\.(?:test|spec)\.(?:ts|js|mjs|mts|cjs|cts)$/;
exports.kJSQuoteGlobalRegex = /["']/g;
exports.kTSExtension = '.ts';
exports.kDTSExtension = '.d.ts';
exports.kJSExtension = '.js';
exports.kCJSExtension = '.cjs';
exports.kCTSExtension = '.cts';
exports.kMJSExtension = '.mjs';
exports.kMTSExtension = '.mts';
exports.kIndex = 'index';
exports.kPosixFolderSeparator = '/';
exports.kExpectedTestConstructs = [
    'test',
    'describe',
    'expect',
    'beforeAll',
    'beforeEach',
    'afterEach',
    'afterAll',
];
exports.kNewline = '\n';
exports.kWhitespaceRegex = /[\s]+/;
exports.kSemicolonRegex = /[;]+/;
exports.kSemicolon = ';';
