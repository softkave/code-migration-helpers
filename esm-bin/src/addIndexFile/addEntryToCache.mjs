import path from 'path';
import { shouldIncludeEntry } from './shouldIncludeEntry.mjs';
import { writeIndexFile } from './writeIndexFile.mjs';
export async function addEntryToCache(filepath, opts) {
    if (!shouldIncludeEntry(filepath, opts)) {
        return;
    }
    const folderpath = path.dirname(filepath);
    if (!opts.fEntries) {
        opts.fEntries = { folderpath, entries: [] };
    }
    if (opts.fEntries.entries.length >= opts.maxCacheEntries ||
        opts.fEntries.folderpath !== folderpath) {
        await writeIndexFile(opts.fEntries, opts, /** propagateToParent */ true);
        opts.fEntries = { folderpath, entries: [] };
    }
    opts.fEntries.entries.push({ filepath });
}
//# sourceMappingURL=addEntryToCache.js.map