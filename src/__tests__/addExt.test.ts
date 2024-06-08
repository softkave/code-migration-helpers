import {ensureDir, ensureFile, remove} from 'fs-extra/esm';
import {readFile, writeFile} from 'fs/promises';
import path from 'path';
import {afterEach, assert, beforeEach, describe, expect, test} from 'vitest';
import {addExtTraverseHandler, getImportTextWithExt} from '../addExt.js';
import {
  kCJSExtension,
  kCTSExtension,
  kIndex,
  kJSExtension,
  kMJSExtension,
  kMTSExtension,
  kPosixFolderSeparator,
  kTSExtension,
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
      fromExt: string | undefined,
      toExt: string | undefined,
      checkExts: string[],
      endingText: string | undefined,
      not = false
    ) {
      await ensureFile(filepath);
      const modifiedImportText = await getImportTextWithExt(
        dir,
        importText,
        fromExt,
        toExt,
        checkExts
      );

      if (not) {
        expect(modifiedImportText).not.toBe(endingText);
      } else {
        expect(modifiedImportText).toBe(endingText);
      }

      await remove(filepath);
    }

    for (const importText of filepathList) {
      // infer toExt and affect import text
      await checkOnFilepath(
        importText,
        /** filepath */ path.join(dir, importText + kTSExtension),
        /** fromExt */ undefined,
        /** toExt */ undefined,
        /** checkExt */ [kTSExtension],
        /** expectedText */ importText + kJSExtension
      );
      await checkOnFilepath(
        importText,
        /** filepath */ path.join(dir, importText + kCTSExtension),
        /** fromExt */ undefined,
        /** toExt */ undefined,
        /** checkExt */ [kCTSExtension],
        /** expectedText */ importText + kCJSExtension
      );
      await checkOnFilepath(
        importText,
        /** filepath */ path.join(dir, importText + kMTSExtension),
        /** fromExt */ undefined,
        /** toExt */ undefined,
        /** checkExt */ [kMTSExtension],
        /** expectedText */ importText + kMJSExtension
      );
      await checkOnFilepath(
        importText,
        /** filepath */ path.join(dir, importText + kTSExtension),
        /** fromExt */ undefined,
        /** toExt */ undefined,
        /** checkExt */ [kTSExtension],
        /** expectedText */ importText + kJSExtension
      );

      // supplied toExt and affect import text
      await checkOnFilepath(
        importText,
        /** filepath */ path.join(dir, importText + kTSExtension),
        /** fromExt */ undefined,
        /** toExt */ kCJSExtension,
        /** checkExt */ [kTSExtension],
        /** expectedText */ importText + kCJSExtension
      );

      // infer toExt and affect supplied ext
      await checkOnFilepath(
        importText + kTSExtension,
        /** filepath */ path.join(dir, importText + kJSExtension),
        /** fromExt */ kTSExtension,
        /** toExt */ undefined,
        /** checkExt */ [kJSExtension],
        /** expectedText */ importText + kJSExtension
      );

      // do not affect import text because fromExt is missing
      await checkOnFilepath(
        importText,
        /** filepath */ path.join(dir, importText + kJSExtension),
        /** fromExt */ kJSExtension,
        /** toExt */ undefined,
        /** checkExt */ [kJSExtension],
        /** expectedText */ undefined
      );
      await checkOnFilepath(
        importText + kJSExtension,
        /** filepath */ path.join(dir, importText + kJSExtension),
        /** fromExt */ kTSExtension,
        /** toExt */ undefined,
        /** checkExt */ [kJSExtension],
        /** expectedText */ undefined
      );
    }

    // import folder index
    for (const importText of indexPathList) {
      const filepath = path.join(
        dir,
        importText + kPosixFolderSeparator + kIndex + kTSExtension
      );
      await checkOnFilepath(
        importText,
        filepath,
        /** fromExt */ undefined,
        /** toExt */ undefined,
        /** checkExt */ [kTSExtension],
        /** expectedText */ importText +
          kPosixFolderSeparator +
          kIndex +
          kJSExtension
      );
    }

    // import .test file
    for (let importText of filepathList) {
      importText = importText + '.test';
      await checkOnFilepath(
        importText,
        /** filepath */ path.join(dir, importText + kTSExtension),
        /** fromExt */ undefined,
        /** toExt */ undefined,
        /** checkExt */ [kTSExtension],
        /** expectedText */ importText + kJSExtension
      );
    }

    // file with existing ext
    for (const importText of filepathList) {
      await checkOnFilepath(
        importText + kMTSExtension,
        /** filepath */ path.join(dir, importText + kTSExtension),
        /** fromExt */ undefined,
        /** toExt */ undefined,
        /** checkExt */ [kTSExtension],
        /** expectedText */ importText + kJSExtension
      );
    }
  });
});

describe('addExtTraverseHandler', () => {
  test('using import', async () => {
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

    await addExtTraverseHandler(filepath, /** opts */ {});

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

  test('using require', async () => {
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
const fse = require("fs-extra");
const importFromFile = require("./importFromFile");
const importNonExistentFile = require("./importNonExistentFile");
const importFromOuterFile = require("../importFromOuterFile");
const importFromFolder = require("./importFromFolder");
const importNonExistentFolder = require("./importNonExistentFolder");
const importFromOuterFolder = require("../importFromOuterFolder");

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

    await addExtTraverseHandler(filepath, /** opts */ {});

    const actualCode = await readFile(filepath, 'utf-8');
    const expectedCode = `
const fse = require("fs-extra");
const importFromFile = require("./importFromFile.js");
const importNonExistentFile = require("./importNonExistentFile");
const importFromOuterFile = require("../importFromOuterFile.js");
const importFromFolder = require("./importFromFolder/index.js");
const importNonExistentFolder = require("./importNonExistentFolder");
const importFromOuterFolder = require("../importFromOuterFolder/index.js");

const num: number = 20;
const str: string = "str";
`;

    expect(actualCode).toEqual(expectedCode);
  });
});
