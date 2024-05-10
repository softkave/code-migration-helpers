import {ensureDir, ensureFile, remove} from 'fs-extra/esm';
import {readFile, writeFile} from 'fs/promises';
import path from 'path';
import {afterEach, assert, beforeEach, describe, expect, test} from 'vitest';
import {addExtTraverseHandler, getImportTextWithExt} from '../addExt.js';
import {
  kExtensions,
  kIndex,
  kMTSExtension,
  kPosixFolderSeparator,
} from '../constants.js';

const kTestLocalFsDir = './testdir';
const testDir = path.join(kTestLocalFsDir + '/' + Date.now());

beforeEach(async () => {
  await ensureDir(testDir);
});

afterEach(async () => {
  assert(testDir);
  await remove(testDir);
});

describe('getImportTextWithExt', () => {
  test('getImportTextWithExt', async () => {
    const dir = path.join(testDir, 'parent', 'wdir');
    const filepaths = {
      fileInFolder: './file',
      fileWithExistingExt: './file-with-ext',
      fileInChildFolder: './child-folder/file',
      fileInParentFolder: '../file',
      fileInParentFolderDepth02: '../depth02/file',
    };
    const indexPaths = {
      indexInChildFolder: './child',
      indexInParentFolder: '..',
      indexInParentFolderDepth02: '../depth02',
    };
    const filepathList = Object.values(filepaths);
    const indexPathList = Object.values(indexPaths);

    async function checkOnFilepath(
      importText: string,
      filepath: string,
      ext: string,
      endingText: string
    ) {
      await ensureFile(filepath);
      const modifiedImportText = await getImportTextWithExt(
        dir,
        importText,
        ext,
        /** checkExts */ [ext]
      );
      expect(modifiedImportText).toBe(endingText);
      await remove(filepath);
    }

    for (const ext of kExtensions) {
      // file
      for (const importText of filepathList) {
        const filepath = path.join(dir, importText + ext);
        await checkOnFilepath(importText, filepath, ext, importText + ext);
      }

      // import folder index
      for (const importText of indexPathList) {
        const filepath = path.join(
          dir,
          importText + kPosixFolderSeparator + kIndex + ext
        );
        await checkOnFilepath(
          importText,
          filepath,
          ext,
          importText + kPosixFolderSeparator + kIndex + ext
        );
      }

      // import .test file
      for (let importText of filepathList) {
        importText = importText + '.test';
        const filepath = path.join(dir, importText + ext);
        await checkOnFilepath(importText, filepath, ext, importText + ext);
      }

      // file with existing ext
      for (const importText of filepathList) {
        const filepath = path.join(dir, importText + ext);
        await checkOnFilepath(
          importText + kMTSExtension,
          filepath,
          ext,
          importText + ext
        );
      }
    }
  });
});

describe('addExtTraverseHandler', () => {
  test('addExtTraverseHandler', async () => {
    const dir = path.join(testDir, 'addExt', 'wdir');
    const filepath = path.join(dir, 'main.ts');
    const importFromFilepath = path.join(dir, 'importFromFile.ts');
    const importFromOuterFileFilepath = path.join(
      dir,
      '../importFromOuterFile.ts'
    );
    const importFromFolderIndexFilepath = path.join(
      dir,
      'importFromFolder/index.ts'
    );
    const importFromOuterFolderIndexFilepath = path.join(
      dir,
      '../importFromOuterFolder/index.ts'
    );
    const testCode = `
import fse from "fs-extra";
import importFromFile from "./importFromFile";
import importNonExistentFile from "./importNonExistentFile";
import importFromOuterFile from "../importFromOuterFile";
import importFromFolder from "./importFromFolder";
import importNonExistentFolder from "./importNonExistentFolder";
import importFromOuterFolder from "../importFromOuterFolder";

const num: number = 20;
const str: string = "str";
`;
    await ensureFile(filepath);
    await Promise.all([
      writeFile(filepath, testCode, 'utf-8'),
      ensureFile(importFromFilepath),
      ensureFile(importFromOuterFileFilepath),
      ensureFile(importFromFolderIndexFilepath),
      ensureFile(importFromOuterFolderIndexFilepath),
    ]);

    await addExtTraverseHandler(filepath);

    const actualCode = await readFile(filepath, 'utf-8');
    const expectedCode = `
import fse from "fs-extra";
import importFromFile from "./importFromFile.js";
import importNonExistentFile from "./importNonExistentFile";
import importFromOuterFile from "../importFromOuterFile.js";
import importFromFolder from "./importFromFolder/index.js";
import importNonExistentFolder from "./importNonExistentFolder";
import importFromOuterFolder from "../importFromOuterFolder/index.js";

const num: number = 20;
const str: string = "str";
`;

    expect(actualCode).toEqual(expectedCode);
  });
});
