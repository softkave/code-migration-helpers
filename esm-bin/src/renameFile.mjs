import caseJs from 'case';
import { rename } from 'fs/promises';
import path from 'path';
import { traverseAndProcessFilesInFolderpath } from './utils.mjs';
function replaceText(basename, from, fromIndex, to, preserveCase) {
    if (preserveCase) {
        const fromCase = caseJs.of(from);
        if (fromCase &&
            fromCase in caseJs &&
            typeof caseJs[fromCase] === 'function') {
            const caseFn = caseJs[fromCase];
            to = caseFn(to);
        }
    }
    return (basename.slice(0, fromIndex) + to + basename.slice(fromIndex + from.length));
}
export const renameFileTraverseHandler = async ({ filepath, args: [opts] }) => {
    const basename = path.basename(filepath);
    let newFilename = basename;
    opts.asksRegExp.some(ask => {
        const match = ask.from.exec(basename);
        if (match === null) {
            return false;
        }
        const matchedStr = match[0];
        const { index } = match;
        newFilename = replaceText(basename, matchedStr, index, ask.to, ask.preserveCase || false);
        return true;
    });
    if (basename === newFilename) {
        return false;
    }
    const dirname = path.dirname(filepath);
    const newFilepath = path.join(dirname, newFilename);
    await rename(filepath, newFilepath);
    return true;
};
function prepareRuntimeOpts(opts) {
    return {
        ...opts,
        asksRegExp: opts.asks.map(ask => ({
            ...ask,
            from: new RegExp(ask.from, ask.caseInsensitive ? 'i' : undefined),
        })),
    };
}
export async function renameFileCmd(folderpath, opts) {
    const rOpts = prepareRuntimeOpts(opts);
    await traverseAndProcessFilesInFolderpath({
        folderpath,
        handler: renameFileTraverseHandler,
        handlerArgs: [rOpts],
    });
}
//# sourceMappingURL=renameFile.js.map