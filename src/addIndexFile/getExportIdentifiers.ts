import path from 'path';
import ts from 'typescript';
import {kNamesAndKeywords} from '../utils/constants.js';
import {getExports} from '../utils/getExports.js';
import {getNodeIdentifiers} from '../utils/getNodeIdentifiers.js';
import {getSourceFile} from '../utils/getSourceFile.js';
import {filterExportNodesWithTag} from './filterExportNodesWithTag.js';
import {
  IAddIndexFileExportId,
  IAddIndexFileExportIdObj,
  IAddIndexFileRuntimeOpts,
} from './types.js';

export async function getExportIdentifiers(
  filepath: string,
  opts: IAddIndexFileRuntimeOpts
): Promise<IAddIndexFileExportId | undefined> {
  const sourceFile = getSourceFile(filepath);
  if (!sourceFile) {
    return;
  }

  const {exportNodes, defaultExport} = getExports(sourceFile);
  let selectedExportNodes = exportNodes;

  if (opts.tagName) {
    ({exportNodesWithTag: selectedExportNodes} = filterExportNodesWithTag(
      exportNodes,
      opts.tagName
    ));
  }

  if (!defaultExport && exportNodes.length === selectedExportNodes.length) {
    return kNamesAndKeywords.asterisk;
  }

  const exportIds: IAddIndexFileExportIdObj[] = [];
  selectedExportNodes
    .map(node => [node, undefined] as [ts.Node, string | undefined])
    .concat(
      defaultExport
        ? [defaultExport, path.basename(filepath, path.extname(filepath))]
        : []
    )
    .forEach(([node, as]) => {
      let ids = getNodeIdentifiers(node);
      if (as) {
        ids = ids.slice(0, 1);
      }

      ids.forEach(id => exportIds.push({id: id.escapedText.toString()}));
    });

  return exportIds;
}
