import {IAddIndexFileRuntimeOpts} from './types.js';

export function shouldIncludeEntry(
  entry: string,
  opts: IAddIndexFileRuntimeOpts
) {
  const matchedExclude = opts.excludeRegex.some(regexp => regexp.test(entry));

  if (matchedExclude) {
    return false;
  }

  const matchedInclude = opts.includeRegex.some(regexp => regexp.test(entry));
  return matchedInclude;
}
