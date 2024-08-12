import { TraverseAndProcessFileHandler } from './types.js';
export interface IAddIndexFileOpts {
    absFolderpath: string;
    includeStrOrRegex?: string[];
    excludeStrOrRegex?: string[];
}
interface IAddIndexFileRuntimeOpts extends IAddIndexFileOpts {
    includeRegex: RegExp[];
    excludeRegex: RegExp[];
}
export declare const addIndexFileTraverseHandler: TraverseAndProcessFileHandler<[
    IAddIndexFileRuntimeOpts
]>;
export declare function addIndexFileCmd(opts: IAddIndexFileOpts): Promise<void>;
export {};
