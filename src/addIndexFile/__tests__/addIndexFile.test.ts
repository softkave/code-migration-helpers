import {faker} from '@faker-js/faker';
import {ensureFile, readFile, remove, writeFile} from 'fs-extra';
import {ensureDir} from 'fs-extra/esm';
import path from 'path';
import {afterAll, assert, beforeEach, describe, expect, test} from 'vitest';
import {kIndexFilename, kTSExtension} from '../../utils/constants.js';
import {addIndexFileCmd} from '../addIndexFileCmd.js';
import {
  checkContainsValidEntries,
  makeAndSaveIndexFile,
  makeEntries,
  makeFolder,
  saveFiles,
  toRelativeImportSrcList,
} from './testutils.js';

/**
 * TODO:
 * - exports
 * - default export
 */

const kTestLocalFsDir = '.' + path.sep + 'testdir/addIndexFile';
const testDir = path.join(kTestLocalFsDir + '/' + faker.number.int({min: 100}));

beforeEach(async () => {
  await ensureDir(testDir);
});

afterAll(async () => {
  assert(testDir);
  await remove(testDir);
});

describe('addIndexFile', () => {
  test.skip('addIndexFile with default', async () => {
    const folderpath = makeFolder(testDir);
    const indexFilepath = path.join(folderpath, kIndexFilename + kTSExtension);

    const validEntries = makeEntries(folderpath);
    const invalidEntries = makeEntries(folderpath, [
      '.abc',
      '.test.ts',
      '.test.js',
      '.spec.ts',
      '.spec.js',
    ]);
    await Promise.all([saveFiles(validEntries), saveFiles(invalidEntries)]);

    await addIndexFileCmd({absFolderpath: folderpath});

    const indexText = await readFile(indexFilepath, 'utf-8');
    checkContainsValidEntries({
      text: indexText,
      fileEntries: toRelativeImportSrcList(validEntries),
      contains: true,
    });
    checkContainsValidEntries({
      text: indexText,
      fileEntries: toRelativeImportSrcList(invalidEntries),
      contains: false,
    });
  });

  test.skip('addIndexFile with existing index file', async () => {
    const folderpath = makeFolder(testDir);
    const indexFilepath = path.join(folderpath, kIndexFilename + kTSExtension);

    const validEntries = makeEntries(folderpath);
    const existingEntries = ['fs', '.' + path.sep + 'some-file.ts'];
    await Promise.all([
      makeAndSaveIndexFile(folderpath, existingEntries),
      saveFiles(validEntries),
    ]);

    await addIndexFileCmd({absFolderpath: folderpath});

    const indexText = await readFile(indexFilepath, 'utf-8');
    checkContainsValidEntries({
      text: indexText,
      fileEntries: existingEntries,
      contains: true,
    });
    checkContainsValidEntries({
      text: indexText,
      fileEntries: toRelativeImportSrcList(validEntries),
      contains: true,
    });
  });

  test.skip('addIndexFile propagates to parent', async () => {
    const rootFolderpath = makeFolder(testDir);
    const folderpath = makeFolder(rootFolderpath);
    const rootFolderIndexFilepath = path.join(
      rootFolderpath,
      kIndexFilename + kTSExtension
    );

    // Add a file so that folderpath will be considered, not ignored because
    // it's empty
    await saveFiles(
      makeEntries(folderpath, [kTSExtension]).concat(rootFolderIndexFilepath)
    );

    await addIndexFileCmd({absFolderpath: rootFolderpath});

    const indexText = await readFile(rootFolderIndexFilepath, 'utf-8');
    checkContainsValidEntries({
      text: indexText,
      fileEntries: toRelativeImportSrcList([folderpath]).map(
        src => src + '/' + kIndexFilename + kTSExtension
      ),
      contains: true,
    });
  });

  test.skip('addIndexFile default exclude', async () => {
    const folderpath = makeFolder(testDir);
    const indexFilepath = path.join(folderpath, kIndexFilename + kTSExtension);

    const excludedEntries = [
      'node_modules/index.ts',
      '__tests__/index.ts',
      '__test__/index.ts',
      'file.test.ts',
      'file.spec.ts',
      'file.test.js',
      'file.spec.js',
    ];
    const validEntries = ['included-file.js'];
    await saveFiles(
      excludedEntries
        .concat(validEntries)
        .map(entry => path.join(folderpath, entry))
    );

    await addIndexFileCmd({absFolderpath: folderpath});

    const indexText = await readFile(indexFilepath, 'utf-8');
    checkContainsValidEntries({
      text: indexText,
      fileEntries: toRelativeImportSrcList(['included-file.js']),
      contains: true,
    });
    excludedEntries.forEach(entry => {
      expect(indexText.includes(entry), `includes ${entry}`).toBeFalsy();
    });
  });

  test.skip.each([
    {tagName: 'public', optTag: true},
    {tagName: 'custom-public', optTag: 'custom-public'},
  ])('with tagName=$tagName', async ({tagName, optTag}) => {
    const folderpath = makeFolder(testDir);
    const indexFilepath = path.join(folderpath, kIndexFilename + kTSExtension);
    const entryFilepath = path.join(folderpath, 'entry' + kTSExtension);

    await ensureFile(entryFilepath);
    await writeFile(
      entryFilepath,
      `/** @${tagName} */` +
        "export const publicExport = 'string';" +
        "export const nonPublicExport = 'string';"
    );

    await addIndexFileCmd({absFolderpath: folderpath, tag: optTag});

    const indexText = await readFile(indexFilepath, 'utf-8');
    expect(
      indexText.includes('publicExport'),
      'does not contain publicExport'
    ).toBeTruthy();
    expect(
      indexText.includes('nonPublicExport'),
      'contains nonPublicExport'
    ).toBeFalsy();
  });

  test.skip.each([{includeEmptyFiles: true}, {includeEmptyFiles: false}])(
    'with includeEmptyFiles=$includeEmptyFiles',
    async ({includeEmptyFiles}) => {
      const folderpath = makeFolder(testDir);
      const indexFilepath = path.join(
        folderpath,
        kIndexFilename + kTSExtension
      );
      const emptyFilepath = path.join(folderpath, 'emptyFile' + kTSExtension);
      await ensureFile(emptyFilepath);

      await addIndexFileCmd({includeEmptyFiles, absFolderpath: folderpath});

      const indexText = await readFile(indexFilepath, 'utf-8');
      if (includeEmptyFiles) {
        expect(
          indexText.includes('emptyFile'),
          'does not contain emptyFile'
        ).toBeTruthy();
      } else {
        expect(
          indexText.includes('emptyFile'),
          'contains emptyFile'
        ).toBeTruthy();
      }
    }
  );

  test.skip('exports and default exports', async () => {
    const folderpath = makeFolder(testDir);
    const indexFilepath = path.join(folderpath, kIndexFilename + kTSExtension);
    const entryWithSelectiveExportsFilepath = path.join(
      folderpath,
      'emptyFile' + kTSExtension
    );
  });
});
