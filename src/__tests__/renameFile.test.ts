import {readdir} from 'fs-extra';
import {ensureDir, ensureFile, remove} from 'fs-extra/esm';
import path from 'path';
import {afterEach, assert, beforeEach, describe, expect, test} from 'vitest';
import {renameFileCmd} from '../renameFile.js';

const kTestLocalFsDir = '.' + path.sep + 'testdir/renameFileDir';
const testDir = path.join(kTestLocalFsDir + '/' + Date.now());

beforeEach(async () => {
  await ensureDir(testDir);
});

afterEach(async () => {
  assert(testDir);
  await remove(testDir);
});

describe('renameFile', () => {
  test('renameFileCmd', async () => {
    const folderpath = path.join(testDir, Date.now().toString());
    await ensureDir(folderpath);

    await Promise.all([
      ensureFile(path.join(folderpath, 'dash-file')),
      ensureFile(path.join(folderpath, 'snake_case_file')),
      ensureFile(path.join(folderpath, 'camelCaseFile')),
      ensureFile(path.join(folderpath, 'PascalCaseFile')),
      ensureFile(path.join(folderpath, 'notChanged')),
    ]);

    await renameFileCmd(folderpath, {
      asks: [{from: 'file', to: 'bin'}],
    });

    const folderContent = await readdir(folderpath);
    expect(folderContent).toEqual(
      expect.arrayContaining([
        'dash-bin',
        'snake_case_bin',
        'camelCaseFile',
        'PascalCaseFile',
        'notChanged',
      ])
    );
  });

  test('renameFileCmd case insensitive', async () => {
    const folderpath = path.join(testDir, Date.now().toString());
    await ensureDir(folderpath);

    await Promise.all([
      ensureFile(path.join(folderpath, 'dash-file')),
      ensureFile(path.join(folderpath, 'snake_case_file')),
      ensureFile(path.join(folderpath, 'camelCaseFile')),
      ensureFile(path.join(folderpath, 'PascalCaseFile')),
      ensureFile(path.join(folderpath, 'NotChanged')),
    ]);

    await renameFileCmd(folderpath, {
      asks: [{from: 'file', to: 'bin', caseInsensitive: true}],
    });

    const folderContent = await readdir(folderpath);
    expect(folderContent).toEqual(
      expect.arrayContaining([
        'dash-bin',
        'snake_case_bin',
        'camelCasebin',
        'PascalCasebin',
        'NotChanged',
      ])
    );
  });

  test('renameFileCmd preserve case', async () => {
    const folderpath = path.join(testDir, Date.now().toString());
    await ensureDir(folderpath);

    await Promise.all([
      ensureFile(path.join(folderpath, 'dash-file')),
      ensureFile(path.join(folderpath, 'snake_case_file')),
      ensureFile(path.join(folderpath, 'camelCaseFile')),
      ensureFile(path.join(folderpath, 'PascalCaseFile')),
      ensureFile(path.join(folderpath, 'not_changed')),
    ]);

    await renameFileCmd(folderpath, {
      asks: [
        {from: 'dash', to: 'bin', preserveCase: true, caseInsensitive: true},
        {
          from: 'snake_case',
          to: 'bin',
          preserveCase: true,
          caseInsensitive: true,
        },
        {
          from: 'camelCase',
          to: 'bin',
          preserveCase: true,
          caseInsensitive: true,
        },
        {
          from: 'PascalCase',
          to: 'bin',
          preserveCase: true,
          caseInsensitive: true,
        },
      ],
    });

    const folderContent = await readdir(folderpath);
    expect(folderContent).toEqual(
      expect.arrayContaining([
        'bin-file',
        'bin_file',
        'binFile',
        'BinFile',
        'not_changed',
      ])
    );
  });

  test('renameFileCmd regex', async () => {
    const folderpath = path.join(testDir, Date.now().toString());
    await ensureDir(folderpath);

    await Promise.all([
      ensureFile(path.join(folderpath, 'dash-file')),
      ensureFile(path.join(folderpath, 'snake_case_file')),
      ensureFile(path.join(folderpath, 'camelCaseFile')),
      ensureFile(path.join(folderpath, 'PascalCaseFile')),
    ]);

    await renameFileCmd(folderpath, {
      asks: [{from: '^dash-file$', to: 'bin'}],
    });

    const folderContent = await readdir(folderpath);
    expect(folderContent).toEqual(
      expect.arrayContaining([
        'bin',
        'snake_case_file',
        'camelCaseFile',
        'PascalCaseFile',
      ])
    );
  });
});
