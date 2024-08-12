import caseJs from 'case';
import {rename} from 'fs/promises';
import path from 'path';
import {traverseAndProcessFilesInFolderpath} from './utils.js';
import {TraverseAndProcessFileHandler} from './utils/types.js';

export interface IRenameFileOpts {
  asks: Array<{
    from: string;
    to: string;
    preserveCase?: boolean;
    caseInsensitive?: boolean;
  }>;
}

interface IRenameFileRuntimeOpts extends IRenameFileOpts {
  asksRegExp: Array<{from: RegExp; to: string; preserveCase?: boolean}>;
}

function replaceText(
  basename: string,
  from: string,
  fromIndex: number,
  to: string,
  preserveCase: boolean
): string {
  if (preserveCase) {
    const fromCase = caseJs.of(from);

    if (
      fromCase &&
      fromCase in caseJs &&
      typeof (caseJs as Record<string, unknown>)[fromCase] === 'function'
    ) {
      const caseFn = (caseJs as unknown as Record<string, unknown>)[
        fromCase
      ] as (str: string) => string;
      to = caseFn(to);
    }
  }

  return (
    basename.slice(0, fromIndex) + to + basename.slice(fromIndex + from.length)
  );
}

export const renameFileTraverseHandler: TraverseAndProcessFileHandler<
  [IRenameFileRuntimeOpts]
> = async ({filepath, args: [opts]}) => {
  const basename = path.basename(filepath);
  let newFilename = basename;
  opts.asksRegExp.some(ask => {
    const match = ask.from.exec(basename);

    if (match === null) {
      return false;
    }

    const matchedStr = match[0];
    const {index} = match;
    newFilename = replaceText(
      basename,
      matchedStr,
      index,
      ask.to,
      ask.preserveCase || false
    );

    return true;
  });

  if (basename === newFilename) {
    return false;
  }

  const dirname = path.dirname(filepath);
  const newFilepath = path.join(dirname, newFilename);
  await rename(filepath, newFilepath);

  return true;
};

function prepareRuntimeOpts(opts: IRenameFileOpts): IRenameFileRuntimeOpts {
  return {
    ...opts,
    asksRegExp: opts.asks.map(ask => ({
      ...ask,
      from: new RegExp(ask.from, ask.caseInsensitive ? 'i' : undefined),
    })),
  };
}

export async function renameFileCmd(folderpath: string, opts: IRenameFileOpts) {
  const rOpts = prepareRuntimeOpts(opts);
  await traverseAndProcessFilesInFolderpath({
    folderpath,
    handler: renameFileTraverseHandler,
    handlerArgs: [rOpts],
  });
}
