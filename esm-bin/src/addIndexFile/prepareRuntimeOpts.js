import { kNamesAndKeywords } from '../utils/constants.js';
import { kAddIndexFileConstants } from './constants.js';
export function prepareRuntimeOpts(opts, maxCacheEntries) {
    opts.includeStrOrRegex =
        opts.includeStrOrRegex || kAddIndexFileConstants.defaultIncludeStrOrRegex;
    opts.excludeStrOrRegex =
        opts.excludeStrOrRegex || kAddIndexFileConstants.defaultExcludeStrOrRegex;
    return {
        ...opts,
        maxCacheEntries,
        fEntries: undefined,
        tagName: typeof opts.tag === 'string' && opts.tag
            ? opts.tag
            : opts.tag
                ? kNamesAndKeywords.public
                : undefined,
        includeRegex: opts.includeStrOrRegex.map(str => new RegExp(str)),
        excludeRegex: opts.excludeStrOrRegex.map(str => new RegExp(str)),
    };
}
//# sourceMappingURL=prepareRuntimeOpts.js.map