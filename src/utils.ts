import fsExtra from 'fs-extra';
import path from 'path';
import ts from 'typescript';
import {
  kCaptureDirAndBasenameFromJSOrTSFilepathRegex,
  kDTSExtension,
  kJSOrTSFilepathRegex,
  kJSOrTSTestFilepathRegex,
  kJSQuoteGlobalRegex,
  kJSRelativeImportRegex,
} from './constants.js';
import {TraverseAndProcessFileHandler} from './types.js';

export function isJSOrTSFilepath(filepath: string) {
  return kJSOrTSFilepathRegex.test(filepath);
}

export function isJSOrTSTestFilepath(filepath: string) {
  return kJSOrTSTestFilepathRegex.test(filepath);
}

export function isTSDeclarationFilepath(filepath: string) {
  return filepath.endsWith(kDTSExtension);
}

export function getDirAndBasename(filepath: string) {
  const matches = kCaptureDirAndBasenameFromJSOrTSFilepathRegex.exec(filepath);

  if (matches) {
    return matches.groups?.dirAndBasename;
  }

  return undefined;
}

export async function traverseAndProcessFilesInFolderpath(
  folderpath: string,
  handleFile: TraverseAndProcessFileHandler
) {
  const dirList = await fsExtra.readdir(folderpath, {withFileTypes: true});

  await Promise.all(
    dirList.map(async entry => {
      const entryPath = path.normalize(path.join(entry.path, entry.name));

      try {
        if (entry.isDirectory()) {
          await traverseAndProcessFilesInFolderpath(entryPath, handleFile);
        } else if (entry.isFile()) {
          const modifiedFile = await handleFile(entryPath);

          if (modifiedFile) {
            console.log(`modified ${entryPath}`);
          }
        }
      } catch (error: unknown) {
        console.log(`error ${entryPath}`);
        console.error(error);
      }
    })
  );
}

export async function isFileOrFolder(filepath: string) {
  try {
    const info = await fsExtra.stat(filepath);
    return info.isFile() ? 'file' : info.isDirectory() ? 'folder' : undefined;
  } catch (error: unknown) {
    return undefined;
  }
}

export function isRelativeImportText(text: string) {
  return kJSRelativeImportRegex.test(text);
}

export function getImportText(
  node: ts.StringLiteral,
  sourceFile: ts.SourceFile
) {
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

export function isRelativeImportOrExportNodeWithSpecifier(
  sourceFile: ts.SourceFile,
  node: ts.Node
): node is ts.ImportDeclaration | ts.ExportDeclaration {
  return !!(
    (ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) &&
    node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier) &&
    isRelativeImportText(getImportText(node.moduleSpecifier, sourceFile))
  );
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
