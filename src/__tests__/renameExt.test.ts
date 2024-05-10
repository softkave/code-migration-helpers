import {ensureDir, ensureFile, pathExists, remove} from 'fs-extra/esm';
import path from 'path';
import {afterEach, assert, beforeEach, describe, expect, test} from 'vitest';
import {
  kCJSExtension,
  kCTSExtension,
  kDTSExtension,
  kJSExtension,
  kMJSExtension,
  kMTSExtension,
  kTSExtension,
} from '../constants.js';
import {renameExtTraverseHandler} from '../renameExt.js';

const kTestLocalFsDir = './testdir';
const testDir = path.join(kTestLocalFsDir + '/' + Date.now());

beforeEach(async () => {
  await ensureDir(testDir);
});

afterEach(async () => {
  assert(testDir);
  await remove(testDir);
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
      renameExtTraverseHandler(paths.ts),
      renameExtTraverseHandler(paths.js),
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
    const paths = {
      mts: path.join(testDir, filename + kMTSExtension),
      mjs: path.join(testDir, filename + kMJSExtension),
      cts: path.join(testDir, filename + kCTSExtension),
      cjs: path.join(testDir, filename + kCJSExtension),
      dts: path.join(testDir, filename + kDTSExtension),
    };
    await Promise.all([
      ensureFile(paths.mts),
      ensureFile(paths.mjs),
      ensureFile(paths.cts),
      ensureFile(paths.cjs),
      ensureFile(paths.dts),
    ]);

    await Promise.all([
      renameExtTraverseHandler(paths.mts),
      renameExtTraverseHandler(paths.mjs),
      renameExtTraverseHandler(paths.cts),
      renameExtTraverseHandler(paths.cjs),
      renameExtTraverseHandler(paths.dts),
    ]);

    const [mtsExists, mjsExists, ctsExists, cjsExists, dtsExists] =
      await Promise.all([
        pathExists(paths.mts),
        pathExists(paths.mjs),
        pathExists(paths.cts),
        pathExists(paths.cjs),
        pathExists(paths.dts),
      ]);
    expect(mtsExists).toBeTruthy();
    expect(mjsExists).toBeTruthy();
    expect(ctsExists).toBeTruthy();
    expect(cjsExists).toBeTruthy();
    expect(dtsExists).toBeTruthy();
  });
});
