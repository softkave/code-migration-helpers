import { TraverseAndProcessFileHandler } from './utils/types.js';
export interface IRenameFileOpts {
    asks: Array<{
        from: string;
        to: string;
        preserveCase?: boolean;
        caseInsensitive?: boolean;
    }>;
}
interface IRenameFileRuntimeOpts extends IRenameFileOpts {
    asksRegExp: Array<{
        from: RegExp;
        to: string;
        preserveCase?: boolean;
    }>;
}
export declare const renameFileTraverseHandler: TraverseAndProcessFileHandler<[
    IRenameFileRuntimeOpts
]>;
export declare function renameFileCmd(folderpath: string, opts: IRenameFileOpts): Promise<void>;
export {};
