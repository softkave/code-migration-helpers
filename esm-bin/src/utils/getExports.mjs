import assert from 'assert';
import ts from 'typescript';
export function getExports(sourceFile) {
    assert(sourceFile);
    const exportNodes = [];
    let defaultExport;
    const checkIsExportNode = (node) => {
        if (ts.isExportDeclaration(node)) {
            exportNodes.push(node);
        }
        else if (ts.isExportAssignment(node)) {
            defaultExport = node;
            exportNodes.push(node);
        }
        else if (node.kind === ts.SyntaxKind.ExportKeyword) {
            exportNodes.push(node.parent);
        }
    };
    ts.forEachChild(sourceFile, checkIsExportNode);
    return { exportNodes, defaultExport };
}
//# sourceMappingURL=getExports.js.map