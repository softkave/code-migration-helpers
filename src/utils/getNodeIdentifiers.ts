import ts from 'typescript';

export function getNodeIdentifiers(inputNode: ts.Node) {
  const identifiers: ts.Identifier[] = [];
  ts.forEachChild(inputNode, node => {
    if (ts.isIdentifier(node)) {
      identifiers.push(node);
    }
  });

  return identifiers;
}
