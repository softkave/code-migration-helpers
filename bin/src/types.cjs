"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kProcessCmdType = exports.kProcessedFileOutcome = void 0;
exports.kProcessedFileOutcome = {
    skip: 'skip',
    error: 'error',
    processed: 'processed',
};
exports.kProcessCmdType = {
    addExtToImports: 'add-ext',
    jestToVitest: 'jest-to-vitest',
    renameExt: 'rename-ext',
    help: 'help',
    version: 'version',
};
