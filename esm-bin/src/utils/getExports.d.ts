import ts from 'typescript';
export declare function getExports(sourceFile: ts.SourceFile): {
    exportNodes: ts.Node[];
    defaultExport: ts.Node | undefined;
};
