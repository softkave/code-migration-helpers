export function shouldIncludeEntry(entry, opts) {
    const matchedExclude = opts.excludeRegex.some(regexp => regexp.test(entry));
    if (matchedExclude) {
        return false;
    }
    const matchedInclude = opts.includeRegex.some(regexp => regexp.test(entry));
    return matchedInclude;
}
//# sourceMappingURL=shouldIncludeEntry.js.map