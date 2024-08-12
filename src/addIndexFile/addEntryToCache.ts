import path from 'path';
import {shouldIncludeEntry} from './shouldIncludeEntry.js';
import {IAddIndexFileRuntimeOpts} from './types.js';
import {writeIndexFile} from './writeIndexFile.js';

export async function addEntryToCache(
  filepath: string,
  opts: IAddIndexFileRuntimeOpts
) {
  if (!shouldIncludeEntry(filepath, opts)) {
    return;
  }

  const folderpath = path.dirname(filepath);

  if (!opts.fEntries) {
    opts.fEntries = {folderpath, entries: []};
  }

  if (
    opts.fEntries.entries.length >= opts.maxCacheEntries ||
    opts.fEntries.folderpath !== folderpath
  ) {
    await writeIndexFile(opts.fEntries, opts, /** propagateToParent */ true);
    opts.fEntries = {folderpath, entries: []};
  }

  opts.fEntries.entries.push({filepath});
}
