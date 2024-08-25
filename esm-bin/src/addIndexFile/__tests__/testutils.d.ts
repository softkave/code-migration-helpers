export declare function makeFolder(parent: string): string;
export declare function makeEntries(parent: string, exts?: string[]): string[];
export declare function toRelativeImportSrcList(entries: string[]): string[];
export declare function saveFiles(filepaths: string[]): Promise<void>;
export declare function makeAndSaveIndexFile(parent: string, entries: string[]): Promise<{
    text: string;
    indexFilepath: string;
}>;
export declare function checkContainsValidEntries({ text, fileEntries, contains, }: {
    text: string;
    fileEntries?: string[];
    contains: boolean;
}): void;
