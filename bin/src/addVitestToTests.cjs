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
exports.addVitestToTestCmd = exports.addVitestToTestTraverseHandler = void 0;
const assert_1 = __importDefault(require("assert"));
const promises_1 = require("fs/promises");
const ts = __importStar(require("typescript"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
function markContainedTestConstructs(sourceFile, node, importVitestConstructs) {
    if (ts.isIdentifier(node)) {
        const foundTestConstruct = constants_js_1.kExpectedTestConstructs.find(text => {
            return text === node.getText(sourceFile);
        });
        if (foundTestConstruct) {
            importVitestConstructs.add(foundTestConstruct);
        }
    }
}
function modifyPossibleJestUtil(sourceFile, node, importVitestConstructs, modifications) {
    if (ts.isPropertyAccessExpression(node) &&
        ts.isIdentifier(node.expression) &&
        constants_js_1.kJest === node.expression.getText(sourceFile)) {
        importVitestConstructs.add(constants_js_1.kVi);
        modifications.push({
            node: node.expression,
            replacementText: constants_js_1.kVi,
        });
    }
}
function getLastNonRelativeImportOrExportNode(sourceFile) {
    let lastNonRelativeImportNode;
    ts.forEachChild(sourceFile, node => {
        if ((ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier) &&
            !(0, utils_js_1.isRelativeImportText)((0, utils_js_1.getImportText)(node.moduleSpecifier, sourceFile))) {
            lastNonRelativeImportNode = node;
            return true;
        }
        return false;
    });
    return {
        lastNonRelativeImportNode,
    };
}
function decideInsertVitestImportLocation(sourceFile, text) {
    var _a;
    const firstNode = sourceFile.getChildAt(0, sourceFile);
    const { lastNonRelativeImportNode } = getLastNonRelativeImportOrExportNode(sourceFile);
    let start = 0;
    let includePreNewline = false;
    let includePostNewline = false;
    if (lastNonRelativeImportNode) {
        start = lastNonRelativeImportNode.end;
        includePreNewline = true;
    }
    else if (firstNode) {
        const commentRanges = ts.getLeadingCommentRanges(firstNode.getFullText(sourceFile), firstNode.getFullStart()) || [];
        const commentEnd = ((_a = commentRanges[commentRanges.length - 1]) === null || _a === void 0 ? void 0 : _a.end) || 0;
        if (commentEnd) {
            const { totalCount } = (0, utils_js_1.countCharacters)(text, commentEnd, firstNode.getStart(sourceFile, false), constants_js_1.kNewline);
            if (totalCount > 1) {
                start = firstNode.getStart(sourceFile, false);
                includePreNewline = false;
                includePostNewline = true;
            }
            else {
                start = firstNode.getFullStart();
                includePreNewline = false;
                includePostNewline = true;
            }
        }
        else {
            start = firstNode.getFullStart();
            includePreNewline = false;
            includePostNewline = true;
        }
    }
    return { start, includePreNewline, includePostNewline };
}
function containsVitestImport(sourceFile) {
    let hasVitestImport = false;
    ts.forEachChild(sourceFile, node => {
        if (ts.isImportDeclaration(node) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier) &&
            (0, utils_js_1.getImportText)(node.moduleSpecifier, sourceFile) === constants_js_1.kVitest) {
            hasVitestImport = true;
            return true;
        }
        return false;
    });
    return hasVitestImport;
}
function filterImportedTestConstructs(testConstructs, sourceFile) {
    const testConstructsMap = testConstructs.reduce((acc, next) => {
        acc[next] = next;
        return acc;
    }, {});
    ts.forEachChild(sourceFile, node => {
        if (ts.isNamedImports(node)) {
            node.elements.forEach(element => {
                const importedText = element.name.escapedText.toString();
                delete testConstructsMap[importedText];
            });
        }
    });
    return Object.keys(testConstructsMap);
}
function traverseNode(node, cb) {
    ts.forEachChild(node, cNode => {
        cb(cNode);
        traverseNode(cNode, cb);
    });
}
async function addVitestToTestInFilepath(filepath) {
    const program = ts.createProgram([filepath], { allowJs: true });
    const sourceFile = program.getSourceFile(filepath);
    (0, assert_1.default)(sourceFile);
    if (containsVitestImport(sourceFile)) {
        return false;
    }
    const importVitestConstructs = new Set();
    const modifications = [];
    traverseNode(sourceFile, node => {
        markContainedTestConstructs(sourceFile, node, importVitestConstructs);
        modifyPossibleJestUtil(sourceFile, node, importVitestConstructs, modifications);
    });
    if (!importVitestConstructs.size) {
        return false;
    }
    let testConstructsList = Array.from(importVitestConstructs.values());
    testConstructsList = filterImportedTestConstructs(testConstructsList, sourceFile);
    const importClauseText = `{${testConstructsList.join(', ')}}`;
    const importVitestText = `import ${importClauseText} from "${constants_js_1.kVitest}";`;
    const { start, includePostNewline, includePreNewline } = decideInsertVitestImportLocation(sourceFile, sourceFile.text);
    let offset = importVitestText.length +
        (includePreNewline ? constants_js_1.kNewline : '').length +
        (includePostNewline ? constants_js_1.kNewline : '').length;
    let modifiedText = sourceFile.text.slice(0, start) +
        (includePreNewline ? constants_js_1.kNewline : '') +
        importVitestText +
        (includePostNewline ? constants_js_1.kNewline : '') +
        sourceFile.text.slice(start);
    modifications.forEach(modification => {
        ({ modifiedText, newOffset: offset } = (0, utils_js_1.replaceNodeText)(modifiedText, sourceFile, modification.node, modification.replacementText, offset));
    });
    await (0, promises_1.writeFile)(filepath, modifiedText);
    return true;
}
const addVitestToTestTraverseHandler = async (filepath) => {
    if ((0, utils_js_1.isJSOrTSFilepath)(filepath)) {
        return await addVitestToTestInFilepath(filepath);
    }
    return false;
};
exports.addVitestToTestTraverseHandler = addVitestToTestTraverseHandler;
async function addVitestToTestCmd(folderpath) {
    await (0, utils_js_1.traverseAndProcessFilesInFolderpath)(folderpath, exports.addVitestToTestTraverseHandler);
}
exports.addVitestToTestCmd = addVitestToTestCmd;
