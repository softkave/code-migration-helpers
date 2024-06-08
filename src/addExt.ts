import assert from 'assert';
import {pathExists} from 'fs-extra';
import {writeFile} from 'fs/promises';
import path from 'path';
import {
  kCJSExtension,
  kCTSExtension,
  kExtensions,
  kIndex,
  kJSExtension,
  kMJSExtension,
  kMTSExtension,
  kPosixFolderSeparator,
  kRequire,
  kTSExtension,
} from './constants.js';
import {TraverseAndProcessFileHandler} from './types.js';
import {
  getDirAndBasename,
  getImportText,
  isJSOrTSFilepath,
  isRelativeImportText,
  replaceNodeText,
  traverseAndProcessFilesInFolderpath,
} from './utils.js';
import ts = require('typescript');

export interface AddExtOpts {
  from?: string;
  to?: string;
}

export async function getImportTextWithExt(
  dir: string,
  originalImportText: string,
  fromExt: string | undefined,
  toExt: string | undefined,
  checkExts: string[]
) {
  if (fromExt && !originalImportText.endsWith(fromExt)) {
    return undefined;
  }

  let importTextWithoutExt: string | undefined;

  if (isJSOrTSFilepath(originalImportText)) {
    importTextWithoutExt = getDirAndBasename(originalImportText);
  } else {
    importTextWithoutExt = originalImportText;
  }

  if (!importTextWithoutExt) {
    return;
  }

  async function checkFn(filepath: string) {
    return (await pathExists(filepath)) ? filepath : undefined;
  }

  const checkPromises: Promise<string | undefined>[] = [];
  checkExts.forEach(checkExt => {
    const filepath = path.normalize(
      path.join(dir, importTextWithoutExt + checkExt)
    );
    const indexFilepath = path.normalize(
      path.join(
        dir,
        importTextWithoutExt + kPosixFolderSeparator + kIndex + checkExt
      )
    );
    checkPromises.push(checkFn(filepath), checkFn(indexFilepath));
  });

  const fPaths = await Promise.all(checkPromises);
  const p0 = fPaths.find(p => !!p);
  const p0Ext = p0 ? path.extname(p0) : undefined;

  if (!toExt && p0Ext) {
    switch (p0Ext) {
      case kJSExtension:
      case kTSExtension:
        toExt = kJSExtension;
        break;

      case kMJSExtension:
      case kMTSExtension:
        toExt = kMJSExtension;
        break;

      case kCJSExtension:
      case kCTSExtension:
        toExt = kCJSExtension;
        break;
    }
  }

  if (!toExt) {
    return;
  }

  const isIndexFilepath = p0
    ? !importTextWithoutExt.endsWith(kIndex) && p0.endsWith(kIndex + p0Ext)
    : false;
  const fEnding = isIndexFilepath
    ? kPosixFolderSeparator + kIndex + toExt
    : toExt;

  return importTextWithoutExt + fEnding;
}

function determineQuoteTypeFromModuleSpecifier(
  sourceFile: ts.SourceFile,
  node: ts.Node
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

  const importAndExportLiterals: ts.Node[] = [];

  const checkNode = (node: ts.Node) => {
    if (
      (ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      isRelativeImportText(getImportText(node.moduleSpecifier, sourceFile))
    ) {
      importAndExportLiterals.push(node.moduleSpecifier);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.getText(sourceFile) === kRequire &&
      node.arguments.length > 0 &&
      isRelativeImportText(getImportText(node.arguments[0], sourceFile))
    ) {
      importAndExportLiterals.push(node.arguments[0]);
    }

    ts.forEachChild(node, checkNode);
  };

  checkNode(sourceFile);

  if (importAndExportLiterals.length === 0) {
    return false;
  }

  const parsedFilepath = path.parse(filepath);
  const replacementTextList: string[] = [];
  await Promise.all(
    importAndExportLiterals.map(async node => {
      const originalImportText = getImportText(node, sourceFile);
      const changedImportText = await getImportTextWithExt(
        parsedFilepath.dir,
        originalImportText,
        opts.from,
        opts.to,
        kExtensions
      );
      let replacementText = '';

      if (changedImportText) {
        const quotationType = determineQuoteTypeFromModuleSpecifier(
          sourceFile,
          node
        );
        replacementText = quotationType + changedImportText + quotationType;
      }

      replacementTextList.push(replacementText);
    })
  );

  let workingText = sourceFile.getFullText();
  let workingOffset = 0;
  importAndExportLiterals.forEach((node, index) => {
    // assert(node.moduleSpecifier);
    const replacementText = replacementTextList[index];

    if (replacementText) {
      ({modifiedText: workingText, newOffset: workingOffset} = replaceNodeText(
        workingText,
        sourceFile,
        node,
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
