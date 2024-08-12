import ts from 'typescript';
import { TraverseAndProcessFileHandler } from './types.js';
export declare function isJSOrTSFilepath(filepath: string): boolean;
export declare function getDirAndBasename(filepath: string): string | undefined;
export declare function traverseAndProcessFilesInFolderpath<TArgs extends unknown[]>(props: {
    folderpath: string;
    handler: TraverseAndProcessFileHandler<TArgs>;
    handlerArgs: TArgs;
}): Promise<void>;
export declare function isRelativeImportOrExportSource(text: string): boolean;
export declare function getImportOrExportSource(node: ts.Node, sourceFile: ts.SourceFile): string;
export declare function replaceNodeText(text: string, sourceFile: ts.SourceFile, node: ts.Node, replacementText: string, offset: number): {
    modifiedText: string;
    newOffset: number;
};
export declare function countCharacters(text: string, from: number, to: number, exp: string): {
    totalCount: number;
    numCharsToFirstOccurrence: number;
};
