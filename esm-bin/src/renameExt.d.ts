import { TraverseAndProcessFileHandler } from './types.js';
export interface RenameExtOpts {
    from: string;
    to: string;
}
export declare const renameExtTraverseHandler: TraverseAndProcessFileHandler<[
    RenameExtOpts
]>;
export declare function renameExtCmd(folderpath: string, opts: RenameExtOpts): Promise<void>;
