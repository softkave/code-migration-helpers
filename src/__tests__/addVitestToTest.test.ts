import {ensureDir, remove} from 'fs-extra/esm';
import {readFile, writeFile} from 'fs/promises';
import path from 'path';
import {afterEach, assert, beforeEach, describe, expect, test} from 'vitest';
import {addVitestToTestTraverseHandler} from '../addVitestToTests.js';

const kTestLocalFsDir = '.' + path.sep + 'testdir';
const testDir = path.join(kTestLocalFsDir + '/' + Date.now());

beforeEach(async () => {
  await ensureDir(testDir);
});

afterEach(async () => {
  assert(testDir);
  await remove(testDir);
});

describe('addVitestToTest', () => {
  test('addVitestToTestTraverseHandler', async () => {
    const testCode = `
import fse from "fs-extra";

beforeEach(async () => {
  // do nothing
});

afterEach(async () => {
  // do nothing
});
beforeAll(async () => {
  // do nothing
});

afterAll(async () => {
  // do nothing
});

describe('describe', () => {
  test("test", () => {
    const mockFn = jest.fn().mockImplementation(() => {});
    expect(1).toBe(1);
  });
});
`;
    const filepath = path.join(testDir, Date.now() + '.test.ts');
    await writeFile(filepath, testCode, 'utf-8');

    await addVitestToTestTraverseHandler({filepath, args: []});

    const actualCode = await readFile(filepath, 'utf-8');
    const expectedCode = `
import fse from "fs-extra";
import {beforeEach, afterEach, beforeAll, afterAll, describe, test, vi, expect} from "vitest";

beforeEach(async () => {
  // do nothing
});

afterEach(async () => {
  // do nothing
});
beforeAll(async () => {
  // do nothing
});

afterAll(async () => {
  // do nothing
});

describe('describe', () => {
  test("test", () => {
    const mockFn = vi.fn().mockImplementation(() => {});
    expect(1).toBe(1);
  });
});
`;

    expect(actualCode).toEqual(expectedCode);
  });
});
