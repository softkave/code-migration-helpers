import {rename} from 'fs/promises';
import path from 'path';
import {
  kCJSExtension,
  kCTSExtension,
  kJSExtension,
  kTSExtension,
} from './constants.js';
import {TraverseAndProcessFileHandler} from './types.js';
import {
  isJSOrTSFilepath,
  isTSDeclarationFilepath,
  traverseAndProcessFilesInFolderpath,
} from './utils.js';

export const renameToCommonJsTraverseHandler: TraverseAndProcessFileHandler =
  async (filepath: string) => {
    if (!isJSOrTSFilepath(filepath) || isTSDeclarationFilepath(filepath)) {
      return false;
    }

    const actualExt = path.extname(filepath);
    const newExt =
      actualExt === kJSExtension
        ? kCJSExtension
        : actualExt === kTSExtension
          ? kCTSExtension
          : undefined;

    if (newExt) {
      const basename = path.basename(filepath, actualExt);
      const newFilename = `${basename}${newExt}`;
      const dirname = path.dirname(filepath);
      const newFilepath = path.join(dirname, newFilename);
      await rename(filepath, newFilepath);

      return true;
    }

    return false;
  };

export async function renameToCommonJsCmd(folderpath: string) {
  await traverseAndProcessFilesInFolderpath(
    folderpath,
    renameToCommonJsTraverseHandler
  );
}
