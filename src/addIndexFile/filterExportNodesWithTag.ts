import ts from 'typescript';

export function filterExportNodesWithTag(
  exportNodes: ts.Node[],
  tagName: string
) {
  tagName = tagName.toLowerCase();
  const exportNodesWithTag = exportNodes.filter(node => {
    const tags = ts.getJSDocTags(node);
    return tags.some(tag => tagName === tag.tagName.text.toLowerCase());
  });

  return {exportNodesWithTag};
}
