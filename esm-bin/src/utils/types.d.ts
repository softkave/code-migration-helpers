import { ValueOf } from 'type-fest';
export type TraverseAndProcessFileHandler<TArgs extends unknown[]> = (props: {
    filepath: string;
    args: TArgs;
}) => Promise<boolean | string> | boolean | string | void;
export declare const kProcessCmdType: {
    readonly addExtToImports: "add-ext";
    readonly jestToVitest: "jest-to-vitest";
    readonly renameExt: "rename-ext";
    readonly addIndexFile: "add-index";
    readonly renameFile: "rename-file";
    readonly help: "help";
    readonly version: "version";
};
export type ProcessCmdType = ValueOf<typeof kProcessCmdType>;
export interface ParsedCLIArgs {
    argsTuple: [string, string][];
    argsMap: Record<string, string | undefined>;
    unamedArgs: string[];
}
export interface PackageJson {
    name?: string;
    version?: string;
    description?: string;
}
