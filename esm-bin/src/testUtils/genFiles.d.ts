import { AnyFn } from 'softkave-js-utils';
export type GenFileGenFn = AnyFn<[], {
    name: string;
    content: string;
}>;
export declare function genFiles(folderList: string[], count: number, genFn?: GenFileGenFn): Promise<string[]>;
