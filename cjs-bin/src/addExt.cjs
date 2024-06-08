"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExtCmd = exports.addExtTraverseHandler = exports.getImportTextWithExt = void 0;
const assert_1 = __importDefault(require("assert"));
const fs_extra_1 = require("fs-extra");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const constants_js_1 = require("./constants.cjs");
const utils_js_1 = require("./utils.cjs");
const ts = require("typescript");
async function getImportTextWithExt(dir, originalImportText, fromExt, toExt, checkExts) {
    if (fromExt && !originalImportText.endsWith(fromExt)) {
        return undefined;
    }
    let importTextWithoutExt;
    if ((0, utils_js_1.isJSOrTSFilepath)(originalImportText)) {
        importTextWithoutExt = (0, utils_js_1.getDirAndBasename)(originalImportText);
    }
    else {
        importTextWithoutExt = originalImportText;
    }
    if (!importTextWithoutExt) {
        return;
    }
    async function checkFn(filepath) {
        return (await (0, fs_extra_1.pathExists)(filepath)) ? filepath : undefined;
    }
    const checkPromises = [];
    checkExts.forEach(checkExt => {
        const filepath = path_1.default.normalize(path_1.default.join(dir, importTextWithoutExt + checkExt));
        const indexFilepath = path_1.default.normalize(path_1.default.join(dir, importTextWithoutExt + constants_js_1.kPosixFolderSeparator + constants_js_1.kIndex + checkExt));
        checkPromises.push(checkFn(filepath), checkFn(indexFilepath));
    });
    const fPaths = await Promise.all(checkPromises);
    const p0 = fPaths.find(p => !!p);
    const p0Ext = p0 ? path_1.default.extname(p0) : undefined;
    if (!toExt && p0Ext) {
        switch (p0Ext) {
            case constants_js_1.kJSExtension:
            case constants_js_1.kTSExtension:
                toExt = constants_js_1.kJSExtension;
                break;
            case constants_js_1.kMJSExtension:
            case constants_js_1.kMTSExtension:
                toExt = constants_js_1.kMJSExtension;
                break;
            case constants_js_1.kCJSExtension:
            case constants_js_1.kCTSExtension:
                toExt = constants_js_1.kCJSExtension;
                break;
        }
    }
    if (!toExt) {
        return;
    }
    const isIndexFilepath = p0
        ? !importTextWithoutExt.endsWith(constants_js_1.kIndex) && p0.endsWith(constants_js_1.kIndex + p0Ext)
        : false;
    const fEnding = isIndexFilepath
        ? constants_js_1.kPosixFolderSeparator + constants_js_1.kIndex + toExt
        : toExt;
    return importTextWithoutExt + fEnding;
}
exports.getImportTextWithExt = getImportTextWithExt;
function determineQuoteTypeFromModuleSpecifier(sourceFile, node) {
    return node.getText(sourceFile).startsWith("'") ? "'" : '"';
}
async function addExtToRelativeImportsInFilepath(filepath, opts) {
    const program = ts.createProgram([filepath], { allowJs: true });
    const sourceFile = program.getSourceFile(filepath);
    (0, assert_1.default)(sourceFile);
    const importAndExportLiterals = [];
    const checkNode = (node) => {
        if ((ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier) &&
            (0, utils_js_1.isRelativeImportText)((0, utils_js_1.getImportText)(node.moduleSpecifier, sourceFile))) {
            importAndExportLiterals.push(node.moduleSpecifier);
        }
        else if (ts.isCallExpression(node) &&
            node.expression.getText(sourceFile) === constants_js_1.kRequire &&
            node.arguments.length > 0 &&
            (0, utils_js_1.isRelativeImportText)((0, utils_js_1.getImportText)(node.arguments[0], sourceFile))) {
            importAndExportLiterals.push(node.arguments[0]);
        }
        ts.forEachChild(node, checkNode);
    };
    checkNode(sourceFile);
    if (importAndExportLiterals.length === 0) {
        return false;
    }
    const parsedFilepath = path_1.default.parse(filepath);
    const replacementTextList = [];
    await Promise.all(importAndExportLiterals.map(async (node) => {
        const originalImportText = (0, utils_js_1.getImportText)(node, sourceFile);
        const changedImportText = await getImportTextWithExt(parsedFilepath.dir, originalImportText, opts.from, opts.to, constants_js_1.kExtensions);
        let replacementText = '';
        if (changedImportText) {
            const quotationType = determineQuoteTypeFromModuleSpecifier(sourceFile, node);
            replacementText = quotationType + changedImportText + quotationType;
        }
        replacementTextList.push(replacementText);
    }));
    let workingText = sourceFile.getFullText();
    let workingOffset = 0;
    importAndExportLiterals.forEach((node, index) => {
        const replacementText = replacementTextList[index];
        if (replacementText) {
            ({ modifiedText: workingText, newOffset: workingOffset } = (0, utils_js_1.replaceNodeText)(workingText, sourceFile, node, replacementText, workingOffset));
        }
    });
    await (0, promises_1.writeFile)(filepath, workingText, 'utf-8');
    return true;
}
const addExtTraverseHandler = async (filepath, opts) => {
    if (!(0, utils_js_1.isJSOrTSFilepath)(filepath)) {
        return false;
    }
    return await addExtToRelativeImportsInFilepath(filepath, opts);
};
exports.addExtTraverseHandler = addExtTraverseHandler;
async function addExtCmd(folderpath, opts) {
    await (0, utils_js_1.traverseAndProcessFilesInFolderpath)(folderpath, exports.addExtTraverseHandler, opts);
}
exports.addExtCmd = addExtCmd;
