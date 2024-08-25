import ts from 'typescript';
export declare function filterExportNodesWithTag(exportNodes: ts.Node[], tagName: string): {
    exportNodesWithTag: ts.Node[];
};
