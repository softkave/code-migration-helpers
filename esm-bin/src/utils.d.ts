import ts from 'typescript';
import { TraverseAndProcessFileHandler } from './types.mjs';
export declare function isJSOrTSFilepath(filepath: string): boolean;
export declare function getDirAndBasename(filepath: string): string | undefined;
export declare function traverseAndProcessFilesInFolderpath<TArgs extends unknown[]>(folderpath: string, handleFile: TraverseAndProcessFileHandler<TArgs>, ...args: TArgs): Promise<void>;
export declare function isRelativeImportText(text: string): boolean;
export declare function getImportText(node: ts.Node, sourceFile: ts.SourceFile): string;
export declare function replaceNodeText(text: string, sourceFile: ts.SourceFile, node: ts.Node, replacementText: string, offset: number): {
    modifiedText: string;
    newOffset: number;
};
export declare function countCharacters(text: string, from: number, to: number, exp: string): {
    totalCount: number;
    numCharsToFirstOccurrence: number;
};
