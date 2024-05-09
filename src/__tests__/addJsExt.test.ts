import {ensureDir, ensureFile, remove} from 'fs-extra/esm';
import {readFile, writeFile} from 'fs/promises';
import path from 'path';
import {afterEach, assert, beforeEach, describe, expect, test} from 'vitest';
import {addJsExtTraverseHandler, decideExtension} from '../addJsExt.js';
import {
  kIndex,
  kJSExtension,
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

describe('decideExtension', () => {
  describe('in folder', () => {
    test('js file in folder', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const filename = './js-file';
      const filepath = path.join(dir, filename + kJSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, filename);

      expect(extension).toBe(kJSExtension);
    });

    test('ts file in folder', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const filename = './ts-file';
      const filepath = path.join(dir, filename + kTSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, filename);

      expect(extension).toBe(kJSExtension);
    });
  });

  describe('in child folder', () => {
    test('js file in child folder', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const filename = './js-child-folder/js-file';
      const filepath = path.join(dir, filename + kJSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, filename);

      expect(extension).toBe(kJSExtension);
    });

    test('ts file in child folder', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const filename = './ts-child-folder/ts-file';
      const filepath = path.join(dir, filename + kTSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, filename);

      expect(extension).toBe(kJSExtension);
    });
  });

  describe('in parent folder', () => {
    test('js file in parent folder', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const filename = '../js-file';
      const filepath = path.join(dir, filename + kJSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, filename);

      expect(extension).toBe(kJSExtension);
    });

    test('ts file in parent folder', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const filename = '../ts-file';
      const filepath = path.join(dir, filename + kTSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, filename);

      expect(extension).toBe(kJSExtension);
    });
  });

  describe('in parent folder depth01', () => {
    test('js file in parent folder depth 02', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const filename = '../js-depth02/js-file';
      const filepath = path.join(dir, filename + kJSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, filename);

      expect(extension).toBe(kJSExtension);
    });

    test('ts file in child folder depth 02', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const filename = '../ts-depth02/ts-file';
      const filepath = path.join(dir, filename + kTSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, filename);

      expect(extension).toBe(kJSExtension);
    });
  });

  describe('index in child folder', () => {
    test('js index file in child folder', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const foldername = './js-child';
      const filename = foldername + '/index';
      const filepath = path.join(dir, filename + kJSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, foldername);

      expect(extension).toBe(kPosixFolderSeparator + kIndex + kJSExtension);
    });

    test('ts index file in child folder', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const foldername = './ts-child';
      const filename = foldername + '/index';
      const filepath = path.join(dir, filename + kTSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, foldername);

      expect(extension).toBe(kPosixFolderSeparator + kIndex + kJSExtension);
    });
  });

  describe('index in parent folder', () => {
    test('js index file in parent folder', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const foldername = '..';
      const filename = foldername + '/index';
      const filepath = path.join(dir, filename + kJSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, foldername);

      expect(extension).toBe(kPosixFolderSeparator + kIndex + kJSExtension);
    });

    test('ts index file in parent folder', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const foldername = '..';
      const filename = foldername + '/index';
      const filepath = path.join(dir, filename + kTSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, foldername);

      expect(extension).toBe(kPosixFolderSeparator + kIndex + kJSExtension);
    });
  });

  describe('index in parent folder depth02', () => {
    test('js index file in parent folder depth02', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const foldername = '../js-depth02';
      const filename = foldername + '/index';
      const filepath = path.join(dir, filename + kJSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, foldername);

      expect(extension).toBe(kPosixFolderSeparator + kIndex + kJSExtension);
    });

    test('ts index file in parent folder depth02', async () => {
      const dir = path.join(testDir, 'parent', 'wdir');
      const foldername = '../ts-depth02';
      const filename = foldername + '/index';
      const filepath = path.join(dir, filename + kTSExtension);
      await ensureFile(filepath);

      const extension = await decideExtension(dir, foldername);

      expect(extension).toBe(kPosixFolderSeparator + kIndex + kJSExtension);
    });
  });
});

describe('addJsExtTraverseHandler', () => {
  test('addJsExtTraverseHandler', async () => {
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

    await addJsExtTraverseHandler(filepath);

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
