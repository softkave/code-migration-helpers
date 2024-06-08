import fsExtra from 'fs-extra';
import path from 'path';
import ts from 'typescript';
import {
  kCaptureDirAndBasenameFromJSOrTSFilepathRegex,
  kJSOrTSFilepathRegex,
  kJSQuoteGlobalRegex,
  kJSRelativeImportRegex,
} from './constants.js';
import {TraverseAndProcessFileHandler} from './types.js';

export function isJSOrTSFilepath(filepath: string) {
  return kJSOrTSFilepathRegex.test(filepath);
}

export function getDirAndBasename(filepath: string) {
  const matches = kCaptureDirAndBasenameFromJSOrTSFilepathRegex.exec(filepath);

  if (matches) {
    return matches.groups?.dirAndBasename;
  }

  return undefined;
}

export async function traverseAndProcessFilesInFolderpath<
  TArgs extends unknown[],
>(
  folderpath: string,
  handleFile: TraverseAndProcessFileHandler<TArgs>,
  ...args: TArgs
) {
  async function internalHandleFile(filepath: string) {
    try {
      const modifiedFile = await handleFile(filepath, ...args);

      if (modifiedFile) {
        console.log(`modified ${filepath}`);
      }
    } catch (error) {
      console.log(`error ${filepath}`);
      console.error(error);
    }
  }

  async function internalHandleFolder(folderpath: string) {
    try {
      await traverseAndProcessFilesInFolderpath(
        folderpath,
        handleFile,
        ...args
      );
    } catch (error) {
      console.log(`error ${folderpath}`);
      console.error(error);
    }
  }

  const stat = await fsExtra.stat(folderpath);

  if (stat.isDirectory()) {
    const dirList = await fsExtra.readdir(folderpath, {withFileTypes: true});
    await Promise.all(
      dirList.map(async entry => {
        const entryPath = path.normalize(path.join(entry.path, entry.name));

        if (entry.isDirectory()) {
          await internalHandleFolder(entryPath);
        } else if (entry.isFile()) {
          await internalHandleFile(entryPath);
        }
      })
    );
  } else {
    await internalHandleFile(folderpath);
  }
}

export function isRelativeImportText(text: string) {
  return kJSRelativeImportRegex.test(text);
}

export function getImportText(node: ts.Node, sourceFile: ts.SourceFile) {
  return node.getText(sourceFile).replaceAll(kJSQuoteGlobalRegex, '');
}

export function replaceNodeText(
  text: string,
  sourceFile: ts.SourceFile,
  node: ts.Node,
  replacementText: string,
  offset: number
) {
  const nodeText = node.getText(sourceFile);
  const trimmedNodeText = nodeText.trimStart();
  const start =
    node.getStart(sourceFile, /** includeJsDocComment */ false) +
    (nodeText.length - trimmedNodeText.length) +
    offset;
  const end = trimmedNodeText.length + start;
  const modifiedText = text.slice(0, start) + replacementText + text.slice(end);
  const newOffset = offset + (replacementText.length - trimmedNodeText.length);

  return {modifiedText, newOffset};
}

export function countCharacters(
  text: string,
  from: number,
  to: number,
  exp: string
) {
  let totalCount = 0;
  let numCharsToFirstOccurrence = 0;

  for (let i = from; i < text.length && i < to; i++) {
    if (text[i] === exp) {
      totalCount += 1;
    } else {
      if (totalCount === 0) {
        numCharsToFirstOccurrence += 1;
      }
    }
  }

  return {totalCount, numCharsToFirstOccurrence};
}
