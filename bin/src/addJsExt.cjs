"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJsExtCmd = exports.addJsExtTraverseHandler = exports.decideExtension = void 0;
const assert_1 = __importDefault(require("assert"));
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const ts = __importStar(require("typescript"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
async function decideExtension(dir, importText) {
    const possibleFilepaths = {
        js: path_1.default.normalize(path_1.default.join(dir, importText + constants_js_1.kJSExtension)),
        ts: path_1.default.normalize(path_1.default.join(dir, importText + constants_js_1.kTSExtension)),
    };
    const possibleFolderpaths = {
        indexJS: path_1.default.normalize(path_1.default.join(dir, importText + constants_js_1.kPosixFolderSeparator + constants_js_1.kIndex + constants_js_1.kJSExtension)),
        indexTS: path_1.default.normalize(path_1.default.join(dir, importText + constants_js_1.kPosixFolderSeparator + constants_js_1.kIndex + constants_js_1.kTSExtension)),
    };
    const resolvePossibleFolderpath = async (p) => {
        return (await (0, utils_js_1.isFileOrFolder)(p)) === 'file' ? 'folder' : undefined;
    };
    const possibleImportTypes = await Promise.all([
        (0, utils_js_1.isFileOrFolder)(possibleFilepaths.js),
        (0, utils_js_1.isFileOrFolder)(possibleFilepaths.ts),
        resolvePossibleFolderpath(possibleFolderpaths.indexJS),
        resolvePossibleFolderpath(possibleFolderpaths.indexTS),
    ]);
    const importType = possibleImportTypes.find(item => !!item);
    return importType === 'file'
        ? constants_js_1.kJSExtension
        : importType === 'folder'
            ? constants_js_1.kPosixFolderSeparator + constants_js_1.kIndex + constants_js_1.kJSExtension
            : undefined;
}
exports.decideExtension = decideExtension;
function determineQuoteTypeFromModuleSpecifier(sourceFile, node) {
    return node.getText(sourceFile).startsWith("'") ? "'" : '"';
}
async function addJsExtToRelativeImportsInFilepath(filepath) {
    const program = ts.createProgram([filepath], { allowJs: true });
    const sourceFile = program.getSourceFile(filepath);
    (0, assert_1.default)(sourceFile);
    const importAndExportNodes = [];
    ts.forEachChild(sourceFile, node => {
        if ((ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier) &&
            (0, utils_js_1.isRelativeImportText)((0, utils_js_1.getImportText)(node.moduleSpecifier, sourceFile))) {
            importAndExportNodes.push(node);
        }
    });
    if (importAndExportNodes.length === 0) {
        return false;
    }
    const parsedFilepath = path_1.default.parse(filepath);
    const replacementTextList = [];
    await Promise.all(importAndExportNodes.map(async (node) => {
        (0, assert_1.default)(node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier));
        const importText = (0, utils_js_1.getImportText)(node.moduleSpecifier, sourceFile);
        const extension = await decideExtension(parsedFilepath.dir, importText);
        let replacementText = '';
        if (extension) {
            const quotationType = determineQuoteTypeFromModuleSpecifier(sourceFile, node.moduleSpecifier);
            replacementText =
                quotationType + importText + extension + quotationType;
        }
        replacementTextList.push(replacementText);
    }));
    let workingText = sourceFile.getFullText();
    let workingOffset = 0;
    importAndExportNodes.forEach((node, index) => {
        (0, assert_1.default)(node.moduleSpecifier);
        const replacementText = replacementTextList[index];
        if (replacementText) {
            ({ modifiedText: workingText, newOffset: workingOffset } = (0, utils_js_1.replaceNodeText)(workingText, sourceFile, node.moduleSpecifier, replacementText, workingOffset));
        }
    });
    await (0, promises_1.writeFile)(filepath, workingText, 'utf-8');
    return true;
}
const addJsExtTraverseHandler = async (filepath) => {
    if (!(0, utils_js_1.isJSOrTSFilepath)(filepath)) {
        return false;
    }
    return await addJsExtToRelativeImportsInFilepath(filepath);
};
exports.addJsExtTraverseHandler = addJsExtTraverseHandler;
async function addJsExtCmd(folderpath) {
    await (0, utils_js_1.traverseAndProcessFilesInFolderpath)(folderpath, exports.addJsExtTraverseHandler);
}
exports.addJsExtCmd = addJsExtCmd;
