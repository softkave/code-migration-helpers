import assert from 'assert';
import ts from 'typescript';

export function getExports(sourceFile: ts.SourceFile) {
  assert(sourceFile);

  const exportNodes: ts.Node[] = [];
  let defaultExport: ts.Node | undefined;

  const checkIsExportNode = (node: ts.Node) => {
    if (ts.isExportDeclaration(node)) {
      exportNodes.push(node);
    } else if (ts.isExportAssignment(node)) {
      defaultExport = node;
      exportNodes.push(node);
    } else if (node.kind === ts.SyntaxKind.ExportKeyword) {
      exportNodes.push(node.parent);
    }
  };

  ts.forEachChild(sourceFile, checkIsExportNode);
  return {exportNodes, defaultExport};
}
