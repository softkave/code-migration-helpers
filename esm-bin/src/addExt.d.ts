import { TraverseAndProcessFileHandler } from './types.js';
export interface AddExtOpts {
    from?: string;
    to?: string;
}
export declare function getImportTextWithExt(dir: string, originalImportText: string, fromExt: string | undefined, toExt: string | undefined, checkExts: string[]): Promise<string | undefined>;
export declare const addExtTraverseHandler: TraverseAndProcessFileHandler<[
    AddExtOpts
]>;
export declare function addExtCmd(folderpath: string, opts: AddExtOpts): Promise<void>;
