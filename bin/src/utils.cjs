"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkExtension = exports.countCharacters = exports.isRelativeImportOrExportNodeWithSpecifier = exports.replaceNodeText = exports.getImportText = exports.isRelativeImportText = exports.isFileOrFolder = exports.traverseAndProcessFilesInFolderpath = exports.getDirAndBasename = exports.isTSDeclarationFilepath = exports.isJSOrTSTestFilepath = exports.isJSOrTSFilepath = void 0;
const assert_1 = __importDefault(require("assert"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
const constants_js_1 = require("./constants.cjs");
const types_js_1 = require("./types.cjs");
function isJSOrTSFilepath(filepath) {
    return constants_js_1.kJSOrTSFilepathRegex.test(filepath);
}
exports.isJSOrTSFilepath = isJSOrTSFilepath;
function isJSOrTSTestFilepath(filepath) {
    return constants_js_1.kJSOrTSTestFilepathRegex.test(filepath);
}
exports.isJSOrTSTestFilepath = isJSOrTSTestFilepath;
function isTSDeclarationFilepath(filepath) {
    return filepath.endsWith(constants_js_1.kDTSExtension);
}
exports.isTSDeclarationFilepath = isTSDeclarationFilepath;
function getDirAndBasename(filepath) {
    var _a;
    const matches = constants_js_1.kCaptureDirAndBasenameFromJSOrTSFilepathRegex.exec(filepath);
    if (matches) {
        return (_a = matches.groups) === null || _a === void 0 ? void 0 : _a.dirAndBasename;
    }
    return undefined;
}
exports.getDirAndBasename = getDirAndBasename;
async function traverseAndProcessFilesInFolderpath(folderpath, handleFile, ...args) {
    const dirList = await fs_extra_1.default.readdir(folderpath, { withFileTypes: true });
    await Promise.all(dirList.map(async (entry) => {
        const entryPath = path_1.default.normalize(path_1.default.join(entry.path, entry.name));
        try {
            if (entry.isDirectory()) {
                await traverseAndProcessFilesInFolderpath(entryPath, handleFile, ...args);
            }
            else if (entry.isFile()) {
                const modifiedFile = await handleFile(entryPath, ...args);
                if (modifiedFile) {
                    console.log(`modified ${entryPath}`);
                }
            }
        }
        catch (error) {
            console.log(`error ${entryPath}`);
            console.error(error);
        }
    }));
}
exports.traverseAndProcessFilesInFolderpath = traverseAndProcessFilesInFolderpath;
async function isFileOrFolder(filepath) {
    try {
        const info = await fs_extra_1.default.stat(filepath);
        return info.isFile() ? 'file' : info.isDirectory() ? 'folder' : undefined;
    }
    catch (error) {
        return undefined;
    }
}
exports.isFileOrFolder = isFileOrFolder;
function isRelativeImportText(text) {
    return constants_js_1.kJSRelativeImportRegex.test(text);
}
exports.isRelativeImportText = isRelativeImportText;
function getImportText(node, sourceFile) {
    return node.getText(sourceFile).replaceAll(constants_js_1.kJSQuoteGlobalRegex, '');
}
exports.getImportText = getImportText;
function replaceNodeText(text, sourceFile, node, replacementText, offset) {
    const nodeText = node.getText(sourceFile);
    const trimmedNodeText = nodeText.trimStart();
    const start = node.getStart(sourceFile, false) +
        (nodeText.length - trimmedNodeText.length) +
        offset;
    const end = trimmedNodeText.length + start;
    const modifiedText = text.slice(0, start) + replacementText + text.slice(end);
    const newOffset = offset + (replacementText.length - trimmedNodeText.length);
    return { modifiedText, newOffset };
}
exports.replaceNodeText = replaceNodeText;
function isRelativeImportOrExportNodeWithSpecifier(sourceFile, node) {
    return !!((typescript_1.default.isExportDeclaration(node) || typescript_1.default.isImportDeclaration(node)) &&
        node.moduleSpecifier &&
        typescript_1.default.isStringLiteral(node.moduleSpecifier) &&
        isRelativeImportText(getImportText(node.moduleSpecifier, sourceFile)));
}
exports.isRelativeImportOrExportNodeWithSpecifier = isRelativeImportOrExportNodeWithSpecifier;
function countCharacters(text, from, to, exp) {
    let totalCount = 0;
    let numCharsToFirstOccurrence = 0;
    for (let i = from; i < text.length && i < to; i++) {
        if (text[i] === exp) {
            totalCount += 1;
        }
        else {
            if (totalCount === 0) {
                numCharsToFirstOccurrence += 1;
            }
        }
    }
    return { totalCount, numCharsToFirstOccurrence };
}
exports.countCharacters = countCharacters;
function checkExtension(argName, ext) {
    if (ext) {
        (0, assert_1.default)(constants_js_1.kExtensions.includes(ext), `Invalid ${argName} arg, expected one of ${Object.values(types_js_1.kProcessCmdType)
            .map(name => `"${name}"`)
            .join(' | ')}`);
    }
    return ext;
}
exports.checkExtension = checkExtension;
