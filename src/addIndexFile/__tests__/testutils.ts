import {faker} from '@faker-js/faker';
import {writeFile} from 'fs-extra';
import {ensureFile} from 'fs-extra/esm';
import path from 'path';
import {expect} from 'vitest';
import {
  kCJSExtension,
  kCTSExtension,
  kDTSExtension,
  kIndexFilename,
  kJSExtension,
  kMJSExtension,
  kMTSExtension,
  kNewline,
  kTSExtension,
} from '../../utils/constants.js';

export function makeFolder(parent: string): string {
  return path.join(parent, faker.number.int({min: 100}).toString());
}

export function makeEntries(
  parent: string,
  exts = [
    kTSExtension,
    kJSExtension,
    kMTSExtension,
    kCTSExtension,
    kMJSExtension,
    kCJSExtension,
    kDTSExtension,
  ]
) {
  return exts.map(ext => {
    return path.join(parent, faker.number.int({min: 100}).toString() + ext);
  });
}

export function toRelativeImportSrcList(entries: string[]) {
  return entries.map(
    entry => '.' + path.sep + path.basename(entry, path.extname(entry))
  );
}

export async function saveFiles(filepaths: string[]) {
  await Promise.all(
    filepaths.map(async filepath => {
      await ensureFile(filepath);
    })
  );
}

export async function makeAndSaveIndexFile(parent: string, entries: string[]) {
  const indexFilepath = path.join(parent, kIndexFilename + kTSExtension);
  const text = entries.map(entry => `export * from "${entry}";`).join(kNewline);
  await ensureFile(indexFilepath);
  await writeFile(indexFilepath, text, 'utf-8');

  return {text, indexFilepath};
}

export function checkContainsValidEntries({
  text,
  fileEntries,
  contains,
}: {
  text: string;
  fileEntries?: string[];
  contains: boolean;
}) {
  fileEntries
    ?.map(entry => `export * from "${entry}";`)
    .forEach(exportEntry => {
      expect(
        text.includes(exportEntry),
        `should ${contains ? 'contain' : 'not contain'} ${exportEntry}`
      ).toBe(contains);
    });
}
