import {RequiredDeep} from 'type-fest';
import ts from 'typescript';
import {getExports} from '../utils/getExports.js';
import {IAddIndexFileFolderpathEntries} from './types.js';

/**
 * is it included in import or export specifiers
 * if in export specifier
 *   if default, check if there's a default imported and re-exported
 *   if export, check for asterisk, name, or name re-exported
 * if in import specifier
 *   if default or export, was it imported, and what was it imported as
 *     if imported, was it re-exported
 */

export async function filterExistingExportSources(
  sourceFile: ts.SourceFile,
  entries: RequiredDeep<IAddIndexFileFolderpathEntries>
): Promise<{newExportEntries: typeof entries.entries; exportNodes: ts.Node[]}> {
  const {exportNodes} = getExports(sourceFile);
  const newExportEntries: typeof entries.entries = [];

  return {newExportEntries, exportNodes};
}