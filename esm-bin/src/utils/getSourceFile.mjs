import ts from 'typescript';
export function getSourceFile(filepath) {
    const program = ts.createProgram([filepath], { allowJs: true });
    return program.getSourceFile(filepath);
}
//# sourceMappingURL=getSourceFile.js.map