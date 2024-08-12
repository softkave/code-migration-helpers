import ts from 'typescript';

export function getSourceFile(filepath: string) {
  const program = ts.createProgram([filepath], {allowJs: true});
  return program.getSourceFile(filepath);
}
