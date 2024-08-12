import {ensureDir, ensureFile, pathExists, remove} from 'fs-extra/esm';
import path from 'path';
import {afterEach, assert, beforeEach, describe, expect, test} from 'vitest';
import {renameExtTraverseHandler} from '../renameExt.js';
import {
  kCJSExtension,
  kCTSExtension,
  kDTSExtension,
  kJSExtension,
  kTSExtension,
} from '../utils/constants.js';

const kTestLocalFsDir = '.' + path.sep + 'testdir/renameExtDir';
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
    const paths = {
      dts: path.join(testDir, filename + kDTSExtension),
    };
    await Promise.all([ensureFile(paths.dts)]);

    await Promise.all([
      renameExtTraverseHandler({
        filepath: paths.dts,
        args: [/** opts */ {from: kTSExtension, to: kCJSExtension}],
      }),
    ]);

    const [dtsExists] = await Promise.all([pathExists(paths.dts)]);
    expect(dtsExists).toBeTruthy();
  });
});
