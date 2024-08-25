import path from 'path';
export function getPathBasename(p, index) {
    if (URL.canParse(p)) {
        p = new URL(p).pathname;
    }
    const sp = p.split(path.sep);
    return sp.at(index !== null && index !== void 0 ? index : sp.length - 1);
}
//# sourceMappingURL=getPathBasename.js.map