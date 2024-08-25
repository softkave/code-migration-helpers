import { faker } from '@faker-js/faker';
import { ensureFile, writeFile } from 'fs-extra';
import path from 'path';
import { expect } from 'vitest';
import { kCJSExtension, kCTSExtension, kDTSExtension, kIndexFilename, kJSExtension, kMJSExtension, kMTSExtension, kNewline, kTSExtension, } from '../../utils/constants.mjs';
export function makeFolder(parent) {
    return path.join(parent, faker.number.int({ min: 100 }).toString());
}
export function makeEntries(parent, exts = [
    kTSExtension,
    kJSExtension,
    kMTSExtension,
    kCTSExtension,
    kMJSExtension,
    kCJSExtension,
    kDTSExtension,
]) {
    return exts.map(ext => {
        return path.join(parent, faker.number.int({ min: 100 }).toString() + ext);
    });
}
export function toRelativeImportSrcList(entries) {
    return entries.map(entry => '.' + path.sep + path.basename(entry, path.extname(entry)));
}
export async function saveFiles(filepaths) {
    await Promise.all(filepaths.map(async (filepath) => {
        await ensureFile(filepath);
    }));
}
export async function makeAndSaveIndexFile(parent, entries) {
    const indexFilepath = path.join(parent, kIndexFilename + kTSExtension);
    const text = entries.map(entry => `export * from "${entry}";`).join(kNewline);
    await ensureFile(indexFilepath);
    await writeFile(indexFilepath, text, 'utf-8');
    return { text, indexFilepath };
}
export function checkContainsValidEntries({ text, fileEntries, contains, }) {
    fileEntries === null || fileEntries === void 0 ? void 0 : fileEntries.map(entry => `export * from "${entry}";`).forEach(exportEntry => {
        expect(text.includes(exportEntry), `should ${contains ? 'contain' : 'not contain'} ${exportEntry}`).toBe(contains);
    });
}
//# sourceMappingURL=testutils.js.map