import assert from 'assert';
import type {Dirent} from 'fs-extra';
import path from 'path';
import {
  kJSExtractImportFromRegex,
  kJSHasEndingJsRegex,
  kJSRelativeImportRegex,
} from './constants.js';
import {
  ExplicitModification,
  FileTreeTraverseHandler,
  ProcessedFile,
  kProcessedFileOutcome,
} from './types.js';
import {
  isFile,
  logProcessedFiles,
  outputProcessedFiles,
  setProcessedFileExplicitModifications,
  startProcessedFile,
  traverseAndProcessTSFilesInTree,
} from './utils.js';

export async function addJsExtToRelativeImports(f: ProcessedFile) {
  assert(f.outcome === kProcessedFileOutcome.processed);
  const explicitModifications: ExplicitModification[] = [];
  const pathObject = path.parse(f.filepath);

  for (let i = 0; i < f.workingParts.length; i++) {
    const part = f.workingParts[i];

    if (part === '') {
      // We've worked through all imports so stop early. It assumes you do not
      // separate your imports by newlines
      break;
    }

    const importMatch = part.match(kJSExtractImportFromRegex);

    if (!importMatch) {
      continue;
    }

    const importFrom = importMatch[1];
    assert(importFrom, 'No import from');

    const isRelativeImport = kJSRelativeImportRegex.test(importFrom);
    const hasEndingJs = kJSHasEndingJsRegex.test(importFrom);

    if (!isRelativeImport || hasEndingJs) {
      continue;
    }

    // Check if imported entry is a file or folder with an index file
    const joinedDirAndImportFrom = path.join(
      pathObject.dir,
      importFrom.replaceAll(/['"]/g, '') + '.ts'
    );
    const importFromFilepath = path.normalize(joinedDirAndImportFrom);
    const isImportFromFile = await isFile(importFromFilepath);

    const ending = isImportFromFile ? '.js' : '/index.js';
    const importFromWithJsExt = importFrom + ending;
    const modificationIndex = part.indexOf(importFrom);
    assert(modificationIndex >= 0, 'Import from index not found');

    const modifiedPart =
      part.slice(0, modificationIndex) +
      importFromWithJsExt +
      part.slice(modificationIndex + importFrom.length);

    explicitModifications.push({
      modifiedPart,
      partIndex: i,
      prev: importFrom,
      originalPart: part,
      after: importFromWithJsExt,
    });
  }

  setProcessedFileExplicitModifications(f, explicitModifications);
}

export const addJsExtTraverseHandler: FileTreeTraverseHandler = async (
  dirent: Dirent,
  filepath: string
) => {
  const f = await startProcessedFile(filepath);
  addJsExtToRelativeImports(f);

  return f;
};

export async function addJsExtCmd(folderpath: string) {
  const fList = await traverseAndProcessTSFilesInTree(
    folderpath,
    addJsExtTraverseHandler
  );
  await outputProcessedFiles(fList);
  logProcessedFiles(fList);
}
