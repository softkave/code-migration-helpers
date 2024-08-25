import {traverseAndProcessFilesInFolderpath} from '../utils.js';
import {addIndexFileTraverseHandler} from './addIndexFileTraverseHandler.js';
import {kAddIndexFileConstants} from './constants.js';
import {prepareRuntimeOpts} from './prepareRuntimeOpts.js';
import {IAddIndexFileOpts} from './types.js';
import {writeIndexFile} from './writeIndexFile.js';

export async function addIndexFileCmd(opts: IAddIndexFileOpts) {
  const rOpts = prepareRuntimeOpts(
    opts,
    kAddIndexFileConstants.maxEntriesToWriteCount
  );
  await traverseAndProcessFilesInFolderpath({
    folderpath: opts.absFolderpath,
    handler: addIndexFileTraverseHandler,
    handlerArgs: [rOpts],
  });

  if (rOpts.fEntries?.entries.length) {
    await writeIndexFile(rOpts.fEntries, rOpts, /** propagateToParent */ true);
  }
}
