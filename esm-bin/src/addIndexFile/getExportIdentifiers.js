import path from 'path';
import { kNamesAndKeywords } from '../utils/constants.js';
import { getExports } from '../utils/getExports.js';
import { getNodeIdentifiers } from '../utils/getNodeIdentifiers.js';
import { getSourceFile } from '../utils/getSourceFile.js';
import { filterExportNodesWithTag } from './filterExportNodesWithTag.js';
export async function getExportIdentifiers(filepath, opts) {
    const sourceFile = getSourceFile(filepath);
    if (!sourceFile) {
        return;
    }
    const { exportNodes, defaultExport } = getExports(sourceFile);
    let selectedExportNodes = exportNodes;
    if (opts.tagName) {
        ({ exportNodesWithTag: selectedExportNodes } = filterExportNodesWithTag(exportNodes, opts.tagName));
    }
    if (!defaultExport && exportNodes.length === selectedExportNodes.length) {
        return kNamesAndKeywords.asterisk;
    }
    const exportIds = [];
    selectedExportNodes
        .map(node => [node, undefined])
        .concat(defaultExport
        ? [defaultExport, path.basename(filepath, path.extname(filepath))]
        : [])
        .forEach(([node, as]) => {
        let ids = getNodeIdentifiers(node);
        if (as) {
            ids = ids.slice(0, 1);
        }
        ids.forEach(id => exportIds.push({ id: id.escapedText.toString() }));
    });
    return exportIds;
}
//# sourceMappingURL=getExportIdentifiers.js.map