import {TraverseAndProcessFileHandler} from '../utils/types.js';
import {addEntryToCache} from './addEntryToCache.js';
import {checkFilepathExtension} from './checkFilepathExtension.js';
import {IAddIndexFileRuntimeOpts} from './types.js';

export const addIndexFileTraverseHandler: TraverseAndProcessFileHandler<
  [IAddIndexFileRuntimeOpts]
> = async ({filepath, args: [opts]}) => {
  if (!checkFilepathExtension(filepath)) {
    return false;
  }

  await addEntryToCache(filepath, opts);
  return true;
};
