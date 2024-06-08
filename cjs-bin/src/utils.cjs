"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countCharacters = exports.replaceNodeText = exports.getImportText = exports.isRelativeImportText = exports.traverseAndProcessFilesInFolderpath = exports.getDirAndBasename = exports.isJSOrTSFilepath = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const constants_js_1 = require("./constants.cjs");
function isJSOrTSFilepath(filepath) {
    return constants_js_1.kJSOrTSFilepathRegex.test(filepath);
}
exports.isJSOrTSFilepath = isJSOrTSFilepath;
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
    async function internalHandleFile(filepath) {
        try {
            const modifiedFile = await handleFile(filepath, ...args);
            if (modifiedFile) {
                console.log(`modified ${filepath}`);
            }
        }
        catch (error) {
            console.log(`error ${filepath}`);
            console.error(error);
        }
    }
    async function internalHandleFolder(folderpath) {
        try {
            await traverseAndProcessFilesInFolderpath(folderpath, handleFile, ...args);
        }
        catch (error) {
            console.log(`error ${folderpath}`);
            console.error(error);
        }
    }
    const stat = await fs_extra_1.default.stat(folderpath);
    if (stat.isDirectory()) {
        const dirList = await fs_extra_1.default.readdir(folderpath, { withFileTypes: true });
        await Promise.all(dirList.map(async (entry) => {
            const entryPath = path_1.default.normalize(path_1.default.join(entry.path, entry.name));
            if (entry.isDirectory()) {
                await internalHandleFolder(entryPath);
            }
            else if (entry.isFile()) {
                await internalHandleFile(entryPath);
            }
        }));
    }
    else {
        await internalHandleFile(folderpath);
    }
}
exports.traverseAndProcessFilesInFolderpath = traverseAndProcessFilesInFolderpath;
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
