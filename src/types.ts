import {Dirent} from 'fs-extra';
import {ValueOf} from 'type-fest';

export interface ExplicitModification {
  prev: string;
  after: string;
  partIndex: number;
  originalPart: string;
  modifiedPart: string;
}

export const kProcessedFileOutcome = {
  skip: 'skip',
  error: 'error',
  processed: 'processed',
} as const;

export type ProcessedFileOutcome = ValueOf<typeof kProcessedFileOutcome>;

export type ProcessedFile =
  | {
      outcome: typeof kProcessedFileOutcome.skip;
      filepath: string;
      skipReason: string;
    }
  | {
      outcome: typeof kProcessedFileOutcome.processed;
      filepath: string;
      explicitModifications?: ExplicitModification[];
      isModified: boolean;
      originalParts: string[];
      workingParts: string[];
    }
  | {
      outcome: typeof kProcessedFileOutcome.error;
      filepath: string;
      error: unknown;
    };

export type FileTreeTraverseHandler = (
  dirent: Dirent,
  entryPath: string
) => Promise<ProcessedFile | undefined>;

export const kProcessCmdType = {
  addJsExt: 'add-js-ext',
  jestToVitest: 'jest-to-vitest',
} as const;

export type ProcessCmdType = ValueOf<typeof kProcessCmdType>;
