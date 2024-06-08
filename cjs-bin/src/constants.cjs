"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kRequire = exports.kRPackageJsonFilepath = exports.kCmdVars = exports.kAppliesToMessage = exports.kExtensions = exports.kSemicolon = exports.kSemicolonRegex = exports.kWhitespaceRegex = exports.kNewline = exports.kExpectedTestConstructs = exports.kPosixFolderSeparator = exports.kIndex = exports.kMTSExtension = exports.kMJSExtension = exports.kCTSExtension = exports.kCJSExtension = exports.kJSExtension = exports.kDTSExtension = exports.kTSExtension = exports.kJSQuoteGlobalRegex = exports.kCaptureDirAndBasenameFromJSOrTSFilepathRegex = exports.kJSOrTSTestFilepathRegex = exports.kJSOrTSFilepathRegex = exports.kJSRelativeImportRegex = exports.kVitest = exports.kVi = exports.kJest = void 0;
exports.kJest = 'jest';
exports.kVi = 'vi';
exports.kVitest = 'vitest';
exports.kJSRelativeImportRegex = /^\.{1,2}/;
exports.kJSOrTSFilepathRegex = /\.(?:ts|js|mjs|mts|cjs|cts)$/;
exports.kJSOrTSTestFilepathRegex = /\.(?:test|spec)\.(?:ts|js|mjs|mts|cjs|cts)$/;
exports.kCaptureDirAndBasenameFromJSOrTSFilepathRegex = /^(?<dirAndBasename>.*)\.?\.(?:ts|js|mjs|mts|cjs|cts)$/;
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
exports.kExtensions = [
    exports.kJSExtension,
    exports.kTSExtension,
    exports.kCJSExtension,
    exports.kCTSExtension,
    exports.kMJSExtension,
    exports.kMTSExtension,
];
exports.kAppliesToMessage = `Only considers files ending in [${exports.kExtensions.join(', ')}].`;
exports.kCmdVars = {
    folder: '-f',
    from: '--from',
    to: '--to',
};
exports.kRPackageJsonFilepath = './rpackage.json';
exports.kRequire = 'require';
