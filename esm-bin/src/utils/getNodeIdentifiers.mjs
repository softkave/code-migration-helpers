import ts from 'typescript';
export function getNodeIdentifiers(inputNode) {
    const identifiers = [];
    ts.forEachChild(inputNode, node => {
        if (ts.isIdentifier(node)) {
            identifiers.push(node);
        }
    });
    return identifiers;
}
//# sourceMappingURL=getNodeIdentifiers.js.map