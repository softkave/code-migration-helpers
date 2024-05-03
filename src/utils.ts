import assert from 'assert';
import fsExtra from 'fs-extra';
import path from 'path';
import {
  kJSExtractImportFromRegex,
  kJSMultilineCommentEnd,
  kJSSingleLineCommentStart,
  kNewlineChar,
  kTSFilepathRegex,
} from './constants.js';
import {
  ExplicitModification,
  FileTreeTraverseHandler,
  ProcessedFile,
  kProcessedFileOutcome,
} from './types.js';

export function isImportPart(part: string) {
  return kJSExtractImportFromRegex.test(part);
}

export function isCommentEnd(part: string) {
  return (
    part.startsWith(kJSSingleLineCommentStart) ||
    part.endsWith(kJSMultilineCommentEnd)
  );
}

export async function startProcessedFile(
  filepath: string
): Promise<ProcessedFile> {
  const raw = await fsExtra.readFile(filepath, 'utf-8');
  const parts = raw.split(kNewlineChar);

  return {
    filepath,
    outcome: kProcessedFileOutcome.processed,
    originalParts: parts,
    workingParts: parts,
    isModified: false,
  };
}

export function startErrorProcessedFile(
  filepath: string,
  error: unknown
): ProcessedFile {
  return {
    error,
    filepath,
    outcome: kProcessedFileOutcome.error,
  };
}

export function startSkippedProcessedFile(
  filepath: string,
  skipReason: string
): ProcessedFile {
  return {
    filepath,
    skipReason,
    outcome: kProcessedFileOutcome.skip,
  };
}

export function setProcessedFileWorkingParts(
  f: ProcessedFile,
  parts: string[],
  isModified: boolean
) {
  assert(f.outcome === kProcessedFileOutcome.processed);
  f.workingParts = parts;
  f.isModified = isModified;
}

export function setProcessedFileExplicitModifications(
  f: ProcessedFile,
  mods: ExplicitModification[]
) {
  if (!mods.length) {
    return;
  }

  assert(f.outcome === kProcessedFileOutcome.processed);
  f.explicitModifications = mods;
  f.workingParts = mods.map(mod => mod.modifiedPart);
  f.isModified = true;
}

export async function writeProcessedFile(f: ProcessedFile) {
  assert(f.outcome === kProcessedFileOutcome.processed);

  if (!f.isModified) {
    return;
  }

  const raw = f.workingParts.join(kNewlineChar);
  await fsExtra.writeFile(f.filepath, raw);
}

export function isTSFilepath(filepath: string) {
  return kTSFilepathRegex.test(filepath);
}

export async function traverseAndProcessTSFilesInTree(
  folderpath: string,
  handleFile: FileTreeTraverseHandler
) {
  // TODO: we may want to output the processed files are we traverse for
  // memory's sake

  let fList: ProcessedFile[] = [];
  const dirList = await fsExtra.readdir(folderpath, {withFileTypes: true});

  await Promise.all(
    dirList.map(async entry => {
      const entryPath = path.normalize(path.join(entry.path, entry.name));
      let f: ProcessedFile | undefined;

      try {
        if (entry.isDirectory()) {
          const result = await traverseAndProcessTSFilesInTree(
            entryPath,
            handleFile
          );
          fList = fList.concat(result);
        } else if (entry.isFile()) {
          if (isTSFilepath(entryPath)) {
            f = await handleFile(entry, entryPath);
          }
        }
      } catch (error: unknown) {
        f = startErrorProcessedFile(entryPath, error);
      } finally {
        if (f) {
          fList.push(f);
        }
      }
    })
  );

  return fList;
}

export async function outputProcessedFiles(fList: ProcessedFile[]) {
  await Promise.all(fList.map(writeProcessedFile));
}

export async function logProcessedFiles(fList: ProcessedFile[]) {
  fList.forEach(f => {
    switch (f.outcome) {
      case kProcessedFileOutcome.skip:
        console.log('skipped ' + f.filepath);
        console.log('\t' + f.skipReason);
        break;

      case kProcessedFileOutcome.error:
        console.log('error ' + f.filepath);
        console.error('\t' + f.error);
        break;

      case kProcessedFileOutcome.processed:
        console.log('skipped ' + f.filepath);

        if (f.explicitModifications?.length) {
          f.explicitModifications.forEach(mod => {
            // TODO: partIndex may not be correct anymore, because further
            // processing could have been done past setting
            // explicitModifications
            console.log(`\tL${mod.partIndex} ${mod.prev} >> ${mod.after}`);
          });
        }
    }
  });
}

export async function isFile(filepath: string) {
  try {
    const info = await fsExtra.stat(filepath);
    return info.isFile();
  } catch (error: unknown) {
    // console.error(error);
    return false;
  }
}
