import { traverseAndProcessFilesInFolderpath } from '../utils.mjs';
import { addIndexFileTraverseHandler } from './addIndexFileTraverseHandler.mjs';
import { kAddIndexFileConstants } from './constants.mjs';
import { prepareRuntimeOpts } from './prepareRuntimeOpts.mjs';
import { writeIndexFile } from './writeIndexFile.mjs';
export async function addIndexFileCmd(opts) {
    var _a;
    const rOpts = prepareRuntimeOpts(opts, kAddIndexFileConstants.maxEntriesToWriteCount);
    await traverseAndProcessFilesInFolderpath({
        folderpath: opts.absFolderpath,
        handler: addIndexFileTraverseHandler,
        handlerArgs: [rOpts],
    });
    if ((_a = rOpts.fEntries) === null || _a === void 0 ? void 0 : _a.entries.length) {
        await writeIndexFile(rOpts.fEntries, rOpts, /** propagateToParent */ true);
    }
}
//# sourceMappingURL=addIndexFileCmd.js.map