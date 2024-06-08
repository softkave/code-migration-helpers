import { rename } from 'fs/promises';
import path from 'path';
import { kDTSExtension } from './constants.mjs';
import { traverseAndProcessFilesInFolderpath } from './utils.mjs';
export const renameExtTraverseHandler = async (filepath, opts) => {
    if (!filepath.endsWith(opts.from) || filepath.endsWith(kDTSExtension)) {
        return false;
    }
    const actualExt = path.extname(filepath);
    const basename = path.basename(filepath, actualExt);
    const newFilename = `${basename}${opts.to}`;
    const dirname = path.dirname(filepath);
    const newFilepath = path.join(dirname, newFilename);
    await rename(filepath, newFilepath);
    return true;
};
export async function renameExtCmd(folderpath, opts) {
    await traverseAndProcessFilesInFolderpath(folderpath, renameExtTraverseHandler, opts);
}
//# sourceMappingURL=renameExt.js.map