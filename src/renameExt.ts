import {rename} from 'fs/promises';
import path from 'path';
import {kDTSExtension} from './constants.js';
import {TraverseAndProcessFileHandler} from './types.js';
import {traverseAndProcessFilesInFolderpath} from './utils.js';

export interface RenameExtOpts {
  from: string;
  to: string;
}

export const renameExtTraverseHandler: TraverseAndProcessFileHandler<
  [RenameExtOpts]
> = async (filepath: string, opts: RenameExtOpts) => {
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

export async function renameExtCmd(folderpath: string, opts: RenameExtOpts) {
  await traverseAndProcessFilesInFolderpath(
    folderpath,
    renameExtTraverseHandler,
    opts
  );
}
