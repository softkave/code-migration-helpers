import { TraverseAndProcessFileHandler } from './utils/types.js';
export interface RenameExtOpts {
    from: string;
    to: string;
    silent?: boolean;
}
export declare const renameExtTraverseHandler: TraverseAndProcessFileHandler<[
    RenameExtOpts
]>;
export declare function renameExtCmd(folderpath: string, opts: RenameExtOpts): Promise<void>;
