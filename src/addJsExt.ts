import assert from 'assert';
import {writeFile} from 'fs/promises';
import path from 'path';
import * as ts from 'typescript';
import {
  kIndex,
  kJSExtension,
  kPosixFolderSeparator,
  kTSExtension,
} from './constants.js';
import {TraverseAndProcessFileHandler} from './types.js';
import {
  getImportText,
  isFileOrFolder,
  isRelativeImportText,
  replaceNodeText,
  traverseAndProcessFilesInFolderpath,
} from './utils.js';

export async function decideExtension(dir: string, importText: string) {
  const possibleFilepaths = {
    js: path.normalize(path.join(dir, importText + kJSExtension)),
    ts: path.normalize(path.join(dir, importText + kTSExtension)),
  };
  const possibleFolderpaths = {
    indexJS: path.normalize(
      path.join(dir, importText + kPosixFolderSeparator + kIndex + kJSExtension)
    ),
    indexTS: path.normalize(
      path.join(dir, importText + kPosixFolderSeparator + kIndex + kTSExtension)
    ),
  };

  const resolvePossibleFolderpath = async (p: string) => {
    return (await isFileOrFolder(p)) === 'file' ? 'folder' : undefined;
  };

  const possibleImportTypes = await Promise.all([
    isFileOrFolder(possibleFilepaths.js),
    isFileOrFolder(possibleFilepaths.ts),
    resolvePossibleFolderpath(possibleFolderpaths.indexJS),
    resolvePossibleFolderpath(possibleFolderpaths.indexTS),
  ]);
  const importType = possibleImportTypes.find(item => !!item);

  return importType === 'file'
    ? kJSExtension
    : importType === 'folder'
      ? kPosixFolderSeparator + kIndex + kJSExtension
      : undefined;
}

function determineQuoteTypeFromModuleSpecifier(
  sourceFile: ts.SourceFile,
  node: ts.Expression
) {
  return node.getText(sourceFile).startsWith("'") ? "'" : '"';
}

async function addJsExtToRelativeImportsInFilepath(filepath: string) {
  const program = ts.createProgram([filepath], {allowJs: true});
  const sourceFile = program.getSourceFile(filepath);
  assert(sourceFile);

  const importAndExportNodes: (ts.ImportDeclaration | ts.ExportDeclaration)[] =
    [];

  ts.forEachChild(sourceFile, node => {
    if (
      (ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      isRelativeImportText(getImportText(node.moduleSpecifier, sourceFile))
    ) {
      importAndExportNodes.push(node);
    }
  });

  if (importAndExportNodes.length === 0) {
    return false;
  }

  const parsedFilepath = path.parse(filepath);
  const replacementTextList: string[] = [];
  await Promise.all(
    importAndExportNodes.map(async node => {
      assert(node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier));
      const importText = getImportText(node.moduleSpecifier, sourceFile);
      const extension = await decideExtension(parsedFilepath.dir, importText);
      let replacementText = '';

      if (extension) {
        const quotationType = determineQuoteTypeFromModuleSpecifier(
          sourceFile,
          node.moduleSpecifier
        );
        replacementText =
          quotationType + importText + extension + quotationType;
      }

      replacementTextList.push(replacementText);
    })
  );

  let workingText = sourceFile.getFullText();
  let workingOffset = 0;
  importAndExportNodes.forEach((node, index) => {
    assert(node.moduleSpecifier);
    const replacementText = replacementTextList[index];

    if (replacementText) {
      ({modifiedText: workingText, newOffset: workingOffset} = replaceNodeText(
        workingText,
        sourceFile,
        node.moduleSpecifier,
        replacementText,
        workingOffset
      ));
    }
  });

  await writeFile(filepath, workingText, 'utf-8');
  return true;
}

export const addJsExtTraverseHandler: TraverseAndProcessFileHandler = async (
  filepath: string
) => {
  return await addJsExtToRelativeImportsInFilepath(filepath);
};

export async function addJsExtCmd(folderpath: string) {
  await traverseAndProcessFilesInFolderpath(
    folderpath,
    addJsExtTraverseHandler
  );
}
