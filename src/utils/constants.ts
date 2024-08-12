export const kJest = 'jest';
export const kVi = 'vi';
export const kVitest = 'vitest';
export const kJSRelativeImportOrExportSourceRegex = /^\.{1,2}/;
export const kJSOrTSFilepathRegex = /\.(?:ts|js|mjs|mts|cjs|cts|tsx|jsx)$/;
export const kJSOrTSTestFilepathRegex =
  /\.(?:test|spec)\.(?:ts|js|mjs|mts|cjs|cts|tsx|jsx)$/;
export const kCaptureDirAndBasenameFromJSOrTSFilepathRegex =
  /^(?<dirAndBasename>.*)\.?\.(?:ts|js|mjs|mts|cjs|cts|tsx|jsx)$/;
export const kJSQuoteGlobalRegex = /["']/g;
export const kTSExtension = '.ts';
export const kTSXExtension = '.tsx';
export const kDTSExtension = '.d.ts';
export const kJSExtension = '.js';
export const kJSXExtension = '.jsx';
export const kCJSExtension = '.cjs';
export const kCTSExtension = '.cts';
export const kMJSExtension = '.mjs';
export const kMTSExtension = '.mts';
export const kIndex = 'index';
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
  kTSXExtension,
  kJSXExtension,
];
export const kAppliesToMessage = `Only considers files ending in [${kExtensions.join(
  ', '
)}].`;
export const kCmdVars = {
  folder: '-f',
  from: '--from',
  to: '--to',
  include: '--in',
  exclude: '--ex',
  preserveCase: '-p',
} as const;
export const kRequire = 'require';
export const kIndexFilename = 'index';
export const kModuleText = 'module';
export const kExportsText = 'exports';
export const kNamesAndKeywords = {
  public: 'public',
  asterisk: '*',
  comma: ',',
  dot: '.',
} as const;
