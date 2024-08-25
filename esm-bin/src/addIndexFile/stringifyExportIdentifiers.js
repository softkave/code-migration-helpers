import { kNamesAndKeywords } from '../utils/constants.js';
export function stringifyExportIdentifiers(ids, importSrc) {
    if (Array.isArray(ids) && ids.length) {
        const strIds = ids
            .map(id => (id.as ? `${id.id} as ${id.id}` : id.id))
            .join(kNamesAndKeywords.comma);
        return `export {${strIds}} from ${importSrc}`;
    }
    else if (ids === kNamesAndKeywords.asterisk) {
        return `export * from ${importSrc}`;
    }
    return undefined;
}
//# sourceMappingURL=stringifyExportIdentifiers.js.map