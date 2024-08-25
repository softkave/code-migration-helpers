import { exists } from 'fs-extra';
import path from 'path';
import { kIndexFilename, kTSExtension } from '../utils/constants.js';
import { shouldIncludeEntry } from './shouldIncludeEntry.js';
import { writeIndexFile } from './writeIndexFile.js';
export async function propagateIndexToParent(indexFilepath, opts) {
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
        entries: [
            {
                filepath: indexFilepath,
                importSrc: '.' +
                    path.sep +
                    path.join(path.basename(folderpath), kIndexFilename),
            },
        ],
    }, opts, 
    /** propagateToParent */ false);
}
//# sourceMappingURL=propagateIndexToParent.js.map