import {ValueOf} from 'type-fest';

export type TraverseAndProcessFileHandler<TArgs extends unknown[]> = (props: {
  filepath: string;
  args: TArgs;
}) => Promise<boolean | string>;

export const kProcessCmdType = {
  addExtToImports: 'add-ext',
  jestToVitest: 'jest-to-vitest',
  renameExt: 'rename-ext',
  addIndexFile: 'add-index',
  renameFile: 'rename-file',
  help: 'help',
  version: 'version',
} as const;

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
