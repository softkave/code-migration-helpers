import { addEntryToCache } from './addEntryToCache.mjs';
import { checkFilepathExtension } from './checkFilepathExtension.mjs';
export const addIndexFileTraverseHandler = async ({ filepath, args: [opts] }) => {
    if (!checkFilepathExtension(filepath)) {
        return false;
    }
    await addEntryToCache(filepath, opts);
    return true;
};
//# sourceMappingURL=addIndexFileTraverseHandler.js.map