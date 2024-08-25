import {faker} from '@faker-js/faker';
import {ensureDir} from 'fs-extra';
import {rm} from 'fs/promises';
import {concat} from 'lodash-es';
import path from 'path';
import {afterEach, assert, beforeEach, describe, expect, test} from 'vitest';
import {genFiles} from '../testUtils/genFiles.js';
import {genFolders} from '../testUtils/genFolders.js';
import {traverseAndProcessFilesInFolderpath} from '../utils.js';

const testDir = '.' + path.sep + 'testdir/utils';

beforeEach(async () => {
  await ensureDir(testDir);
});

afterEach(async () => {
  assert(testDir);
  await rm(testDir, {recursive: true, force: true});
});

describe('traverseAndProcessFilesInFolderpath', () => {
  test('deep folder', async () => {
    const count = 10;
    const folder01 = path.join(testDir, faker.number.int({min: 1}).toString());
    const folderList02 = await genFolders([folder01], count);
    const fileList02 = await genFiles([folder01], count);
    const folderList03 = await genFolders(folderList02, count);
    const fileList03 = await genFiles(folderList02, count);
    // const folderList04 = await genFolders(folderList03, count);
    const fileList04 = await genFiles(folderList03, count);

    const traversedFiles: string[] = [];
    await traverseAndProcessFilesInFolderpath({
      folderpath: folder01,
      handlerArgs: [],
      handler: ({filepath}) => {
        traversedFiles.push(filepath);
        return false;
      },
    });

    const fullFileList = concat(fileList02, fileList03, fileList04);
    expect(fullFileList).toEqual(expect.arrayContaining(traversedFiles));
  });
});
