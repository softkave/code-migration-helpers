import fsExtra from 'fs-extra/esm';
import {appendFile} from 'fs/promises';
import path from 'path';
import {
  kIndexFilename,
  kNamesAndKeywords,
  kNewline,
  kTSExtension,
} from '../utils/constants.js';
import {getSourceFile} from '../utils/getSourceFile.js';
import {filterExistingExportSources} from './filterExistingExportSources.js';
import {getExportIdentifiers} from './getExportIdentifiers.js';
import {propagateIndexToParent} from './propagateIndexToParent.js';
import {stringifyExportIdentifiers} from './stringifyExportIdentifiers.js';
import {
  IAddIndexFileFolderpathEntries,
  IAddIndexFileRuntimeOpts,
} from './types.js';

export async function writeIndexFile(
  entries: IAddIndexFileFolderpathEntries,
  opts: IAddIndexFileRuntimeOpts,
  propagateToParent: boolean
) {
  const indexFilepath = path.join(
    entries.folderpath,
    kIndexFilename + kTSExtension
  );
  await fsExtra.ensureFile(indexFilepath);

  const sourceFile = getSourceFile(indexFilepath);
  if (!sourceFile) {
    return;
  }

  const rEntries = {
    ...entries,
    entries: entries.entries.map(entry =>
      entry.importSrc
        ? {...entry, importSrc: entry.importSrc}
        : {
            ...entry,
            importSrc:
              kNamesAndKeywords.dot +
              path.sep +
              path.basename(entry.filepath, path.extname(entry.filepath)),
          }
    ),
  };
  const {newExportEntries, exportNodes} = await filterExistingExportSources(
    sourceFile,
    rEntries
  );

  if (exportNodes.length === 0 && !opts.includeEmptyFiles) {
    return;
  }

  const strOrUndefinedEntries = await Promise.all(
    newExportEntries
      .filter(entry => entry.filepath !== indexFilepath)
      .map(async entry => {
        return stringifyExportIdentifiers(
          (await getExportIdentifiers(entry.filepath, opts)) || [],
          entry.importSrc
        );
      })
  );

  const strEntries = strOrUndefinedEntries
    .filter(entry => !!entry)
    .join(kNewline);
  await appendFile(indexFilepath, kNewline + strEntries, 'utf-8');

  if (propagateToParent) {
    await propagateIndexToParent(indexFilepath, opts);
  }
}
