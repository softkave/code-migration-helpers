import assert from 'assert';
import {writeFile} from 'fs/promises';
import path from 'path';
import * as ts from 'typescript';
import {kIndex, kPosixFolderSeparator} from './constants.js';
import {TraverseAndProcessFileHandler} from './types.js';
import {
  getDirAndBasename,
  getImportText,
  isFileOrFolder,
  isJSOrTSFilepath,
  isRelativeImportText,
  replaceNodeText,
  traverseAndProcessFilesInFolderpath,
} from './utils.js';

export interface AddExtOpts {
  from?: string;
  to?: string;
}

export async function getImportTextWithExt(
  dir: string,
  originalImportText: string,
  ext: string,
  checkExts: string[]
) {
  let importTextWithoutExt: string | undefined;

  if (isJSOrTSFilepath(originalImportText)) {
    importTextWithoutExt = getDirAndBasename(originalImportText);
  } else {
    importTextWithoutExt = originalImportText;
  }

  if (!importTextWithoutExt) {
    return;
  }

  const possibleFilepaths = checkExts.map(checkExt =>
    path.normalize(path.join(dir, importTextWithoutExt + checkExt))
  );
  const possibleFolderpaths = checkExts.map(checkExt =>
    path.normalize(
      path.join(
        dir,
        importTextWithoutExt + kPosixFolderSeparator + kIndex + checkExt
      )
    )
  );

  const resolvePossibleFolderpath = async (p: string) => {
    return (await isFileOrFolder(p)) === 'file' ? 'folder' : undefined;
  };

  const possibleImportTypes = await Promise.all([
    ...possibleFilepaths.map(p => isFileOrFolder(p)),
    ...possibleFolderpaths.map(p => resolvePossibleFolderpath(p)),
  ]);
  const importType = possibleImportTypes.find(item => !!item);
  const ending =
    importType === 'file'
      ? ext
      : importType === 'folder'
        ? kPosixFolderSeparator + kIndex + ext
        : undefined;

  if (!ending) {
    return;
  }

  return importTextWithoutExt + ending;
}

function determineQuoteTypeFromModuleSpecifier(
  sourceFile: ts.SourceFile,
  node: ts.Expression
) {
  return node.getText(sourceFile).startsWith("'") ? "'" : '"';
}

async function addExtToRelativeImportsInFilepath(
  filepath: string,
  opts: AddExtOpts
) {
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
      const originalImportText = getImportText(
        node.moduleSpecifier,
        sourceFile
      );
      const changedImportText = await getImportTextWithExt(
        parsedFilepath.dir,
        originalImportText
      );
      let replacementText = '';

      if (changedImportText) {
        const quotationType = determineQuoteTypeFromModuleSpecifier(
          sourceFile,
          node.moduleSpecifier
        );
        replacementText = quotationType + changedImportText + quotationType;
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

export const addExtTraverseHandler: TraverseAndProcessFileHandler<
  [AddExtOpts]
> = async (filepath: string, opts: AddExtOpts) => {
  if (!isJSOrTSFilepath(filepath)) {
    return false;
  }

  return await addExtToRelativeImportsInFilepath(filepath, opts);
};

export async function addExtCmd(folderpath: string, opts: AddExtOpts) {
  await traverseAndProcessFilesInFolderpath(
    folderpath,
    addExtTraverseHandler,
    opts
  );
}
