import fsExtra from 'fs-extra';
import path from 'path';
import { kCaptureDirAndBasenameFromJSOrTSFilepathRegex, kJSOrTSFilepathRegex, kJSQuoteGlobalRegex, kJSRelativeImportOrExportSourceRegex, } from './utils/constants.mjs';
export function isJSOrTSFilepath(filepath) {
    return kJSOrTSFilepathRegex.test(filepath);
}
export function getDirAndBasename(filepath) {
    var _a;
    const matches = kCaptureDirAndBasenameFromJSOrTSFilepathRegex.exec(filepath);
    if (matches) {
        return (_a = matches.groups) === null || _a === void 0 ? void 0 : _a.dirAndBasename;
    }
    return undefined;
}
export async function traverseAndProcessFilesInFolderpath(props) {
    const { folderpath, handler: handleFile, handlerArgs, silent } = props;
    const stat = await fsExtra.stat(folderpath);
    let filepathList = [];
    const folderpathList = [];
    const kIterationMax = 20;
    async function internalHandleFile(filepath) {
        try {
            const isModifiedOrMsg = await handleFile({ filepath, args: handlerArgs });
            if (!silent) {
                if (typeof isModifiedOrMsg === 'boolean' && isModifiedOrMsg) {
                    console.log(`modified ${filepath}`);
                }
                else if (typeof isModifiedOrMsg === 'string') {
                    console.log(isModifiedOrMsg);
                }
            }
        }
        catch (error) {
            console.log(`error ${filepath}`);
            console.error(error);
        }
    }
    async function processNextFolderpath() {
        const nextFolderpath = folderpathList.shift();
        if (!nextFolderpath) {
            return;
        }
        try {
            const dirList = await fsExtra.readdir(nextFolderpath, {
                withFileTypes: true,
            });
            dirList.forEach(async (entry) => {
                const entryPath = path.normalize(path.join(entry.path, entry.name));
                if (entry.isDirectory()) {
                    folderpathList.push(entryPath);
                }
                else if (entry.isFile()) {
                    filepathList.push(entryPath);
                }
            });
        }
        catch (error) {
            console.log(`error ${nextFolderpath}`);
            console.error(error);
        }
    }
    async function processQueuedFiles() {
        for (let i = 0; i < filepathList.length; i += kIterationMax) {
            await Promise.all(filepathList
                .slice(i, kIterationMax)
                .map(filepath => internalHandleFile(filepath)));
        }
        filepathList = [];
    }
    if (stat.isDirectory()) {
        folderpathList.push(folderpath);
    }
    else {
        filepathList.push(folderpath);
    }
    while (folderpathList.length || filepathList.length) {
        // Some commands like `addIndexFile` relies on a folder's files being
        // processed before children folders are processed
        await processQueuedFiles();
        await processNextFolderpath();
    }
}
export function isRelativeImportOrExportSource(text) {
    return kJSRelativeImportOrExportSourceRegex.test(text);
}
export function getImportOrExportSource(node, sourceFile) {
    return node.getText(sourceFile).replaceAll(kJSQuoteGlobalRegex, '');
}
export function replaceNodeText(text, sourceFile, node, replacementText, offset) {
    const nodeText = node.getText(sourceFile);
    const trimmedNodeText = nodeText.trimStart();
    const start = node.getStart(sourceFile, /** includeJsDocComment */ false) +
        (nodeText.length - trimmedNodeText.length) +
        offset;
    const end = trimmedNodeText.length + start;
    const modifiedText = text.slice(0, start) + replacementText + text.slice(end);
    const newOffset = offset + (replacementText.length - trimmedNodeText.length);
    return { modifiedText, newOffset };
}
export function countCharacters(text, from, to, exp) {
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
//# sourceMappingURL=utils.js.map