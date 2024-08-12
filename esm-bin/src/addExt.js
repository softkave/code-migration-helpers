import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
import assert from 'assert';
import { pathExists } from 'fs-extra';
import { writeFile } from 'fs/promises';
import path from 'path';
import { kCJSExtension, kCTSExtension, kExtensions, kIndex, kJSExtension, kMJSExtension, kMTSExtension, kPosixFolderSeparator, kRequire, kTSExtension, } from './constants.js';
import { getDirAndBasename, getImportOrExportSource, isJSOrTSFilepath, isRelativeImportOrExportSource, replaceNodeText, traverseAndProcessFilesInFolderpath, } from './utils.js';
const ts = __require("typescript");
export async function getImportTextWithExt(dir, originalImportText, fromExt, toExt, checkExts) {
    if (fromExt && !originalImportText.endsWith(fromExt)) {
        return undefined;
    }
    let importTextWithoutExt;
    if (isJSOrTSFilepath(originalImportText)) {
        importTextWithoutExt = getDirAndBasename(originalImportText);
    }
    else {
        importTextWithoutExt = originalImportText;
    }
    if (!importTextWithoutExt) {
        return;
    }
    async function checkFn(filepath) {
        return (await pathExists(filepath)) ? filepath : undefined;
    }
    const checkPromises = [];
    checkExts.forEach(checkExt => {
        const filepath = path.normalize(path.join(dir, importTextWithoutExt + checkExt));
        const indexFilepath = path.normalize(path.join(dir, importTextWithoutExt + kPosixFolderSeparator + kIndex + checkExt));
        checkPromises.push(checkFn(filepath), checkFn(indexFilepath));
    });
    const fPaths = await Promise.all(checkPromises);
    const p0 = fPaths.find(p => !!p);
    const p0Ext = p0 ? path.extname(p0) : undefined;
    if (!toExt && p0Ext) {
        switch (p0Ext) {
            case kJSExtension:
            case kTSExtension:
                toExt = kJSExtension;
                break;
            case kMJSExtension:
            case kMTSExtension:
                toExt = kMJSExtension;
                break;
            case kCJSExtension:
            case kCTSExtension:
                toExt = kCJSExtension;
                break;
        }
    }
    if (!toExt) {
        return;
    }
    const isIndexFilepath = p0
        ? !importTextWithoutExt.endsWith(kIndex) && p0.endsWith(kIndex + p0Ext)
        : false;
    const fEnding = isIndexFilepath
        ? kPosixFolderSeparator + kIndex + toExt
        : toExt;
    return importTextWithoutExt + fEnding;
}
function determineQuoteTypeFromModuleSpecifier(sourceFile, node) {
    return node.getText(sourceFile).startsWith("'") ? "'" : '"';
}
async function addExtToRelativeImportsInFilepath(filepath, opts) {
    const program = ts.createProgram([filepath], { allowJs: true });
    const sourceFile = program.getSourceFile(filepath);
    assert(sourceFile);
    const importAndExportLiterals = [];
    const checkNode = (node) => {
        if ((ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier) &&
            isRelativeImportOrExportSource(getImportOrExportSource(node.moduleSpecifier, sourceFile))) {
            importAndExportLiterals.push(node.moduleSpecifier);
        }
        else if (ts.isCallExpression(node) &&
            node.expression.getText(sourceFile) === kRequire &&
            node.arguments.length > 0 &&
            isRelativeImportOrExportSource(getImportOrExportSource(node.arguments[0], sourceFile))) {
            importAndExportLiterals.push(node.arguments[0]);
        }
        ts.forEachChild(node, checkNode);
    };
    checkNode(sourceFile);
    if (importAndExportLiterals.length === 0) {
        return false;
    }
    const parsedFilepath = path.parse(filepath);
    const nodesAndReplacements = await Promise.all(importAndExportLiterals.map(async (node) => {
        const originalImportText = getImportOrExportSource(node, sourceFile);
        const changedImportText = await getImportTextWithExt(parsedFilepath.dir, originalImportText, opts.from, opts.to, kExtensions);
        let replacementText = '';
        if (changedImportText) {
            const quotationType = determineQuoteTypeFromModuleSpecifier(sourceFile, node);
            replacementText = quotationType + changedImportText + quotationType;
        }
        return { node, replacementText };
    }));
    let workingText = sourceFile.getFullText();
    let workingOffset = 0;
    nodesAndReplacements.forEach(({ node, replacementText }) => {
        if (replacementText) {
            ({ modifiedText: workingText, newOffset: workingOffset } = replaceNodeText(workingText, sourceFile, node, replacementText, workingOffset));
        }
    });
    await writeFile(filepath, workingText, 'utf-8');
    return true;
}
export const addExtTraverseHandler = async ({ filepath, args: [opts] }) => {
    if (!isJSOrTSFilepath(filepath)) {
        return false;
    }
    return await addExtToRelativeImportsInFilepath(filepath, opts);
};
export async function addExtCmd(folderpath, opts) {
    await traverseAndProcessFilesInFolderpath({
        folderpath,
        handler: addExtTraverseHandler,
        handlerArgs: [opts],
    });
}
//# sourceMappingURL=addExt.js.map