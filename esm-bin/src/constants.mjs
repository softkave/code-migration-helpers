export const kJest = 'jest';
export const kVi = 'vi';
export const kVitest = 'vitest';
export const kJSRelativeImportRegex = /^\.{1,2}/;
export const kJSOrTSFilepathRegex = /\.(?:ts|js|mjs|mts|cjs|cts)$/;
export const kJSOrTSTestFilepathRegex = /\.(?:test|spec)\.(?:ts|js|mjs|mts|cjs|cts)$/;
export const kCaptureDirAndBasenameFromJSOrTSFilepathRegex = /^(?<dirAndBasename>.*)\.?\.(?:ts|js|mjs|mts|cjs|cts)$/;
export const kJSQuoteGlobalRegex = /["']/g;
export const kTSExtension = '.ts';
export const kDTSExtension = '.d.ts';
export const kJSExtension = '.js';
export const kCJSExtension = '.cjs';
export const kCTSExtension = '.cts';
export const kMJSExtension = '.mjs';
export const kMTSExtension = '.mts';
export const kIndex = 'index';
export const kPosixFolderSeparator = '/';
export const kExpectedTestConstructs = [
    'test',
    'describe',
    'expect',
    'beforeAll',
    'beforeEach',
    'afterEach',
    'afterAll',
];
export const kNewline = '\n';
export const kWhitespaceRegex = /[\s]+/;
export const kSemicolonRegex = /[;]+/;
export const kSemicolon = ';';
export const kExtensions = [
    kJSExtension,
    kTSExtension,
    kCJSExtension,
    kCTSExtension,
    kMJSExtension,
    kMTSExtension,
];
export const kAppliesToMessage = `Only considers files ending in [${kExtensions.join(', ')}].`;
export const kCmdVars = {
    folder: '-f',
    from: '--from',
    to: '--to',
};
export const kRPackageJsonFilepath = './rpackage.json';
export const kRequire = 'require';
//# sourceMappingURL=constants.js.map