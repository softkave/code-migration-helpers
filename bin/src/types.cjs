"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kProcessCmdType = exports.kProcessedFileOutcome = void 0;
exports.kProcessedFileOutcome = {
    skip: 'skip',
    error: 'error',
    processed: 'processed',
};
exports.kProcessCmdType = {
    addJsExt: 'add-js-ext',
    jestToVitest: 'jest-to-vitest',
    renameToCjs: 'rename-to-cjs',
    help: 'help',
};
