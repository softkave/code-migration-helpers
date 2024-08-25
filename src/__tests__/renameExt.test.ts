import {faker} from '@faker-js/faker';
import {ensureDir, ensureFile, pathExists} from 'fs-extra/esm';
import {rm} from 'fs/promises';
import {concat} from 'lodash-es';
import path from 'path';
import {afterEach, assert, beforeEach, describe, expect, test} from 'vitest';
import {renameExtCmd, renameExtTraverseHandler} from '../renameExt.js';
import {GenFileGenFn, genFiles} from '../testUtils/genFiles.js';
import {genFolders} from '../testUtils/genFolders.js';
import {
  kCJSExtension,
  kCTSExtension,
  kDTSExtension,
  kJSExtension,
  kTSExtension,
} from '../utils/constants.js';

const testDir = '.' + path.sep + 'testdir/renameExt';

beforeEach(async () => {
  await ensureDir(testDir);
});

afterEach(async () => {
  assert(testDir);
  await rm(testDir, {recursive: true, force: true});
});

describe('renameExt', () => {
  test('renameExtTraverseHandler for .js & .ts', async () => {
    const filename = Date.now();
    const paths = {
      ts: path.join(testDir, filename + kTSExtension),
      js: path.join(testDir, filename + kJSExtension),
      cts: path.join(testDir, filename + kCTSExtension),
      cjs: path.join(testDir, filename + kCJSExtension),
    };
    await Promise.all([ensureFile(paths.ts), ensureFile(paths.js)]);

    await Promise.all([
      renameExtTraverseHandler({
        filepath: paths.ts,
        args: [/** opts */ {from: kTSExtension, to: kCTSExtension}],
      }),
      renameExtTraverseHandler({
        filepath: paths.js,
        args: [/** opts */ {from: kJSExtension, to: kCJSExtension}],
      }),
    ]);

    const [ctsExists, cjsExists, tsExists, jsExists] = await Promise.all([
      pathExists(paths.cts),
      pathExists(paths.cjs),
      pathExists(paths.ts),
      pathExists(paths.js),
    ]);
    expect(ctsExists).toBeTruthy();
    expect(cjsExists).toBeTruthy();
    expect(tsExists).toBeFalsy();
    expect(jsExists).toBeFalsy();
  });

  test('renameExtTraverseHandler not .js or .ts or .d.ts', async () => {
    const filename = Date.now();
    const paths = {dts: path.join(testDir, filename + kDTSExtension)};
    await ensureFile(paths.dts);

    await renameExtTraverseHandler({
      filepath: paths.dts,
      args: [/** opts */ {from: kTSExtension, to: kCJSExtension}],
    });

    const [dtsExists] = await Promise.all([pathExists(paths.dts)]);
    expect(dtsExists).toBeTruthy();
  });

  test('deep traversal', async () => {
    const count = 10;
    const genFn: GenFileGenFn = () => ({
      name: faker.number.int({min: 1}).toString() + '.js',
      content: 'fimidara',
    });
    const folder01 = path.join(testDir, faker.number.int({min: 1}).toString());
    const folderList02 = await genFolders([folder01], count);
    const fileList02 = await genFiles([folder01], count, genFn);
    const folderList03 = await genFolders(folderList02, count);
    const fileList03 = await genFiles(folderList02, count, genFn);
    // const folderList04 = await genFolders(folderList03, count);
    const fileList04 = await genFiles(folderList03, count, genFn);

    await renameExtCmd(folder01, {from: '.js', to: '.mjs', silent: true});

    const fullFileList = concat(fileList02, fileList03, fileList04);
    const [oldFilesExistList, newFilesExist] = await Promise.all([
      Promise.all(fullFileList.map(f => pathExists(f))),
      Promise.all(
        fullFileList.map(f =>
          pathExists(
            path.join(path.dirname(f), path.basename(f, '.js')) + '.mjs'
          )
        )
      ),
    ]);

    fullFileList.forEach((f, i) => {
      const newF = path.join(path.dirname(f), path.basename(f, '.js')) + '.mjs';
      expect(oldFilesExistList[i], `${f} not renamed`).toBeFalsy();
      expect(newFilesExist[i], `${newF} does not exist`).toBeTruthy();
    });
  });
});
