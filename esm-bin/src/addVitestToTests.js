import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
import assert from 'assert';
import { writeFile } from 'fs/promises';
import { kExpectedTestConstructs, kJest, kNewline, kVi, kVitest, } from './constants.js';
import { countCharacters, getImportOrExportSource, isJSOrTSFilepath, isRelativeImportOrExportSource, replaceNodeText, traverseAndProcessFilesInFolderpath, } from './utils.js';
const ts = __require("typescript");
function markContainedTestConstructs(sourceFile, node, importVitestConstructs) {
    if (ts.isIdentifier(node)) {
        const foundTestConstruct = kExpectedTestConstructs.find(text => {
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
        kJest === node.expression.getText(sourceFile)) {
        importVitestConstructs.add(kVi);
        modifications.push({
            node: node.expression,
            replacementText: kVi,
        });
    }
}
function getLastNonRelativeImportOrExportNode(sourceFile) {
    let lastNonRelativeImportNode;
    ts.forEachChild(sourceFile, node => {
        if ((ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier) &&
            !isRelativeImportOrExportSource(getImportOrExportSource(node.moduleSpecifier, sourceFile))) {
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
            // Some leading comments can be file-wide comments, not belonging to the
            // first node, so we use the presence of multiple newlines to determine
            // this. This license information or file explainers. If leading comment
            // is file-wide, we use the first node's actual code start, other wise, we
            // use the node's full start (plus comment)
            const { totalCount } = countCharacters(text, commentEnd, firstNode.getStart(sourceFile, /** includeJsDocComment */ false), kNewline);
            if (totalCount > 1) {
                start = firstNode.getStart(sourceFile, 
                /** includeJsDocComment */ false);
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
            getImportOrExportSource(node.moduleSpecifier, sourceFile) === kVitest) {
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
    assert(sourceFile);
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
    const importVitestText = `import ${importClauseText} from "${kVitest}";`;
    const { start, includePostNewline, includePreNewline } = decideInsertVitestImportLocation(sourceFile, sourceFile.text);
    // Assumes all modifications come after imports
    let offset = importVitestText.length +
        (includePreNewline ? kNewline : '').length +
        (includePostNewline ? kNewline : '').length;
    let modifiedText = sourceFile.text.slice(0, start) +
        (includePreNewline ? kNewline : '') +
        importVitestText +
        (includePostNewline ? kNewline : '') +
        sourceFile.text.slice(start);
    modifications.forEach(modification => {
        ({ modifiedText, newOffset: offset } = replaceNodeText(modifiedText, sourceFile, modification.node, modification.replacementText, offset));
    });
    await writeFile(filepath, modifiedText);
    return true;
}
export const addVitestToTestTraverseHandler = async ({ filepath }) => {
    if (isJSOrTSFilepath(filepath)) {
        return await addVitestToTestInFilepath(filepath);
    }
    return false;
};
export async function addVitestToTestCmd(folderpath) {
    await traverseAndProcessFilesInFolderpath({
        folderpath,
        handler: addVitestToTestTraverseHandler,
        handlerArgs: [],
    });
}
//# sourceMappingURL=addVitestToTests.js.map