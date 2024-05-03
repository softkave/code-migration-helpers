import assert from 'assert';
import type {Dirent} from 'fs-extra';
import {
  kJSHasVitestImportRegex,
  kJestFnMockSignature,
  kTSTestFilepathEnding,
  kViFnMockSignature,
} from './constants.js';
import {
  FileTreeTraverseHandler,
  ProcessedFile,
  kProcessedFileOutcome,
} from './types.js';
import {
  isCommentEnd,
  isImportPart,
  logProcessedFiles,
  outputProcessedFiles,
  setProcessedFileWorkingParts,
  startProcessedFile,
  traverseAndProcessTSFilesInTree,
} from './utils.js';

// TODO: we should implement this using the Typscript SDK or take a look at the
// implementation of Prettier

function findLastImportPartIndex(parts: string[]) {
  for (let i = 0; i < parts.length; i++) {
    if (!isImportPart(parts[i])) {
      return i - 1;
    }
  }

  return -1;
}

function findLastOpeningCommentPartIndex(parts: string[]) {
  // What I'm calling "opening" comments are comments that come before import
  // statements

  for (let i = 0; i < parts.length; i++) {
    if (isCommentEnd(parts[i])) {
      continue;
    } else {
      return i - 1;
    }
  }

  return -1;
}

function findExistingVitestImportPartIndex(parts: string[]) {
  return parts.findIndex(part => kJSHasVitestImportRegex.test(part));
}

function findFirstJestMockFnPartIndex(parts: string[]) {
  return parts.findIndex(part => part.includes(kJestFnMockSignature));
}

function replaceJestFnMockInPart(part: string) {
  return part.replaceAll(kJestFnMockSignature, kViFnMockSignature);
}

function replacteJestFnMockFrom(f: ProcessedFile) {
  assert(f.outcome === kProcessedFileOutcome.processed);
  const fromIndex = findFirstJestMockFnPartIndex(f.workingParts);

  if (fromIndex === -1) {
    return false;
  }

  const modifiedParts = f.workingParts
    .slice(0, fromIndex)
    .concat(f.workingParts.slice(fromIndex).map(replaceJestFnMockInPart));
  setProcessedFileWorkingParts(f, modifiedParts, /** isModified */ true);

  return true;
}

function checkPartsIncludes(parts: string[], checks: string[]) {
  const found: string[] = [];

  for (const part of parts) {
    if (!checks.length) {
      break;
    }

    const foundCheckIndex = checks.findIndex(checkFor => {
      return part.includes(checkFor);
    });

    if (foundCheckIndex !== -1) {
      found.push(checks[foundCheckIndex]);
      checks.splice(foundCheckIndex, 1);
    }
  }

  return found;
}

function importVitest(f: ProcessedFile, shouldImportVi: boolean) {
  assert(f.outcome === kProcessedFileOutcome.processed);
  const existinVitestImportIndex = findExistingVitestImportPartIndex(
    f.workingParts
  );

  if (existinVitestImportIndex !== -1) {
    throw new Error(
      `Existing vitest import at line ${existinVitestImportIndex}`
    );
  }

  let lastCommentPartIndex = -1;
  let insertAfterIndex = findLastImportPartIndex(f.workingParts);

  if (insertAfterIndex === -1) {
    lastCommentPartIndex = insertAfterIndex = findLastOpeningCommentPartIndex(
      f.workingParts
    );
  }

  const checks = [
    'test',
    'describe',
    'expect',
    'beforeAll',
    'beforeEach',
    'afterEach',
    'afterAll',
  ];
  const foundChecks = checkPartsIncludes(f.workingParts, checks);

  if (shouldImportVi) {
    foundChecks.push('vi');
  }

  const importFollowing = foundChecks.join(', ');
  const partsToInsert = [`import {${importFollowing}} from 'vitest';`];

  if (lastCommentPartIndex !== -1) {
    // There are no imports in file so add a newline between comment and import,
    // and after import
    partsToInsert.unshift(''); // parts are joined with newline char \n
    partsToInsert.push('');
  } else if (insertAfterIndex === -1) {
    // There are no imports or comments, add a newline between import and code
    // body. Case where imports are present is not handled because we assume
    // imports are already spaced from code body, and if they're not, it seems
    // like a desired choice so maintain that
    partsToInsert.push('');
  }

  const insertIndex = insertAfterIndex + 1;
  const modifiedParts = f.workingParts
    .slice(0, insertIndex)
    .concat(partsToInsert)
    .concat(f.workingParts.slice(insertIndex));
  setProcessedFileWorkingParts(f, modifiedParts, /** isModified */ true);
}

export async function importVitestAndReplaceJestMocks(f: ProcessedFile) {
  const shouldImportVi = replacteJestFnMockFrom(f);
  importVitest(f, shouldImportVi);
}

export const importVitestAndReplaceJestMocksTraverseHandler: FileTreeTraverseHandler =
  async (dirent: Dirent, filepath: string) => {
    if (!filepath.endsWith(kTSTestFilepathEnding)) {
      return undefined;
    }

    const f = await startProcessedFile(filepath);
    importVitestAndReplaceJestMocks(f);

    return f;
  };

export async function jestToVitestCmd(folderpath: string) {
  const fList = await traverseAndProcessTSFilesInTree(
    folderpath,
    importVitestAndReplaceJestMocksTraverseHandler
  );
  await outputProcessedFiles(fList);
  logProcessedFiles(fList);
}
