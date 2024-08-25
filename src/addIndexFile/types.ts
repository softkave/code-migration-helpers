import {kNamesAndKeywords} from '../utils/constants.js';

export interface IAddIndexFileFolderpathEntries {
  folderpath: string;
  entries: Array<{filepath: string; importSrc?: string}>;
}

export interface IAddIndexFileOpts {
  absFolderpath: string;
  includeStrOrRegex?: string[];
  excludeStrOrRegex?: string[];
  /** Empty files or files without exports */
  includeEmptyFiles?: boolean;
  /** Only include exports with provided tag in index file. Defaults to `public`
   * if `true` */
  tag?: string | boolean;
}

export interface IAddIndexFileRuntimeOpts extends IAddIndexFileOpts {
  includeRegex: RegExp[];
  excludeRegex: RegExp[];
  maxCacheEntries: number;
  fEntries: IAddIndexFileFolderpathEntries | undefined;
  tagName: string | undefined;
}

export interface IAddIndexFileExportIdObj {
  id: string;
  as?: string;
}

export type IAddIndexFileExportId =
  | typeof kNamesAndKeywords.asterisk
  | Array<IAddIndexFileExportIdObj>;
