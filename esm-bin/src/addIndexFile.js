import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
import assert from 'assert';
import fsExtra, { exists } from 'fs-extra';
import { appendFile } from 'fs/promises';
import path from 'path';
import { kDTSExtension, kIndexFilename, kJSOrTSFilepathRegex, kNewline, kRequire, kTSExtension, } from './constants.js';
import { getImportOrExportSource, isRelativeImportOrExportSource, traverseAndProcessFilesInFolderpath, } from './utils.js';
const ts = __require("typescript");
const kDefaultIncludeStrOrRegex = ['\\.(ts|mts|cts|js|mjs|cjs|d\\.ts)$'];
const kDefaultExcludeStrOrRegex = [
    '__test__',
    '__tests__',
    '\\.test\\.(ts|mts|cts|js|mjs|cjs|d\\.ts)$',
    '\\.spec\\.(ts|mts|cts|js|mjs|cjs|d\\.ts)$',
    'node_modules',
];
// const kIntermediateIndexFilename = (
//   Math.random().toString() + Math.random().toString()
// ).replaceAll('.', '-');
let fEntries;
const kMaxEntriesToWriteCount = 50;
function getFolderpathFromFilepath(filepath) {
    return path.dirname(filepath);
}
async function getExistingExportSources(filepath) {
    const program = ts.createProgram([filepath], { allowJs: true });
    const sourceFile = program.getSourceFile(filepath);
    assert(sourceFile);
    const exportLiterals = new Set();
    const checkIsExportNode = (node) => {
        let specifier;
        if (ts.isExportDeclaration(node) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)) {
            specifier = node.moduleSpecifier;
        }
        else if (ts.isCallExpression(node) &&
            node.expression.getText(sourceFile) === kRequire &&
            node.arguments.length > 0) {
            specifier = node.arguments[0];
        }
        if (specifier) {
            const exportText = getImportOrExportSource(specifier, sourceFile);
            if (isRelativeImportOrExportSource(exportText)) {
                exportLiterals.add(exportText);
            }
        }
        ts.forEachChild(node, checkIsExportNode);
    };
    checkIsExportNode(sourceFile);
    return exportLiterals;
}
async function filterExistingExportSources(entries, indexFilepath) {
    const seenExportSources = await getExistingExportSources(indexFilepath);
    return entries.entries.filter(entry => {
        const match = !seenExportSources.has(entry);
        seenExportSources.add(entry);
        return match;
    });
}
// async function checkContainsExport(filepath: string) {
//   const program = ts.createProgram([filepath], {allowJs: true});
//   const sourceFile = program.getSourceFile(filepath);
//   assert(sourceFile);
//   const checkIsExportNode = (node: ts.Node) => {
//     if (
//       ts.isExpressionStatement(node) &&
//       ts.isBinaryExpression(node.expression) &&
//       ts.isPropertyAccessExpression(node.expression.left) &&
//       node.expression.left.expression.getText(sourceFile) === kModuleText &&
//       node.expression.left.name.getText(sourceFile) === kExportsText
//     ) {
//       return true;
//     }
//     return false;
//   };
//   const firstExportNode = ts.forEachChild(sourceFile, checkIsExportNode);
//   return !!firstExportNode;
// }
// async function filterEntriesWithExport(entries: string[]) {
//   const entriesWithExports = await Promise.all(
//     entries.map(async entry => {
//       const containsExport = await checkContainsExport(entry);
//       return containsExport ? entry : undefined;
//     })
//   );
//   return entriesWithExports.filter(entry => !!entry);
// }
async function propagateIndexToParent(indexFilepath, opts) {
    const folderpath = path.dirname(indexFilepath);
    const parentFolderpath = path.dirname(folderpath);
    if (!parentFolderpath.startsWith(opts.absFolderpath)) {
        return;
    }
    const parentFolderpathIndexFilepath = path.join(parentFolderpath, kIndexFilename + kTSExtension);
    const checks = await Promise.all([
        exists(parentFolderpathIndexFilepath),
        shouldIncludeEntry(parentFolderpathIndexFilepath, opts),
    ]);
    if (!checks.every(Boolean)) {
        return;
    }
    await writeIndexFile(
    /** entries */ {
        folderpath: parentFolderpath,
        entries: [indexFilepath],
    }, opts, 
    /** propagateToParent */ false);
}
async function writeIndexFile(entries, opts, propagateToParent) {
    const indexFilepath = path.join(entries.folderpath, kIndexFilename + kTSExtension);
    await fsExtra.ensureFile(indexFilepath);
    const newUniqueEntries = await filterExistingExportSources(entries, indexFilepath);
    const strEntries = newUniqueEntries
        .map(entry => `export * from "${entry}";`)
        .join(kNewline);
    await appendFile(indexFilepath, strEntries, 'utf-8');
    if (propagateToParent) {
        await propagateIndexToParent(indexFilepath, opts);
    }
}
// async function writeIntermediateIndexFile(entries: IFolderpathEntries) {
//   const intermediateIndexFilepath = path.join(
//     entries.folderpath,
//     kIntermediateIndexFilename
//   );
//   await fsExtra.ensureFile(intermediateIndexFilepath);
//   const strEntries = entries.entries.join(kNewline);
//   await appendFile(intermediateIndexFilepath, strEntries, 'utf-8');
// }
function shouldIncludeEntry(entry, opts) {
    const matchedExclude = opts.excludeRegex.some(regexp => regexp.test(entry));
    if (matchedExclude) {
        return false;
    }
    const matchedInclude = opts.includeRegex.some(regexp => regexp.test(entry));
    return matchedInclude;
}
async function addEntryToCache(filepath, opts) {
    const folderpath = getFolderpathFromFilepath(filepath);
    if (!fEntries) {
        fEntries = { folderpath, entries: [] };
    }
    if (fEntries.entries.length >= kMaxEntriesToWriteCount ||
        fEntries.folderpath !== folderpath) {
        await writeIndexFile(fEntries, opts, /** propagateToParent */ true);
    }
    if (shouldIncludeEntry(filepath, opts)) {
        fEntries.entries.push(filepath);
    }
}
function checkFilepathExtension(filepath) {
    const ext = path.extname(filepath);
    return kJSOrTSFilepathRegex.test(ext) || ext === kDTSExtension;
}
export const addIndexFileTraverseHandler = async ({ filepath, args: [opts] }) => {
    if (!checkFilepathExtension(filepath)) {
        return false;
    }
    await addEntryToCache(filepath, opts);
    return true;
};
function prepareRuntimeOpts(opts) {
    opts.includeStrOrRegex = opts.includeStrOrRegex || kDefaultIncludeStrOrRegex;
    opts.excludeStrOrRegex = opts.excludeStrOrRegex || kDefaultExcludeStrOrRegex;
    return {
        ...opts,
        includeRegex: opts.includeStrOrRegex.map(str => new RegExp(str)),
        excludeRegex: opts.excludeStrOrRegex.map(str => new RegExp(str)),
    };
}
export async function addIndexFileCmd(opts) {
    const rOpts = prepareRuntimeOpts(opts);
    await traverseAndProcessFilesInFolderpath({
        folderpath: opts.absFolderpath,
        handler: addIndexFileTraverseHandler,
        handlerArgs: [rOpts],
    });
    if (fEntries === null || fEntries === void 0 ? void 0 : fEntries.entries.length) {
        await writeIndexFile(fEntries, rOpts, /** propagateToParent */ true);
    }
}
//# sourceMappingURL=addIndexFile.js.map