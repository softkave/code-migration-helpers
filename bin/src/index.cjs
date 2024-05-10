"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const addJsExt_js_1 = require("./addJsExt.js");
const addVitestToTests_js_1 = require("./addVitestToTests.js");
const renameToCommonJs_js_1 = require("./renameToCommonJs.js");
const types_js_1 = require("./types.js");
function getCmdArg() {
    const cmd = process.argv[2];
    (0, assert_1.default)(cmd, `No cmd provided, expected one of ${Object.values(types_js_1.kProcessCmdType)
        .map(name => `"${name}"`)
        .join(' | ')}`);
    return cmd;
}
function getFolderpathArg() {
    const folderpath = process.argv[3];
    (0, assert_1.default)(folderpath, 'No "folderpath" provided');
    return folderpath;
}
async function main() {
    const cmd = getCmdArg();
    switch (cmd) {
        case types_js_1.kProcessCmdType.addJsExt: {
            const folderpath = getFolderpathArg();
            await (0, addJsExt_js_1.addJsExtCmd)(folderpath);
            break;
        }
        case types_js_1.kProcessCmdType.jestToVitest: {
            const folderpath = getFolderpathArg();
            await (0, addVitestToTests_js_1.addVitestToTestCmd)(folderpath);
            break;
        }
        case types_js_1.kProcessCmdType.renameToCjs: {
            const folderpath = getFolderpathArg();
            await (0, renameToCommonJs_js_1.renameToCommonJsCmd)(folderpath);
            break;
        }
        case types_js_1.kProcessCmdType.help:
            console.log(types_js_1.kProcessCmdType.addJsExt);
            console.log('\tAdd ".js" extension to relative imports');
            console.log('\tRequires "folderpath" arg');
            console.log('\tE.g code-migration-helpers add-js-ext "./folderpath"');
            console.log(types_js_1.kProcessCmdType.jestToVitest);
            console.log('\tImport "vitest" test constructs and replace "jest.fn" with "vi.fn"');
            console.log('\tRequires "folderpath" arg');
            console.log('\tE.g code-migration-helpers jest-to-vitest "./folderpath"');
            console.log(types_js_1.kProcessCmdType.renameToCjs);
            console.log('\tRename ".js" and ".ts" to ".cjs" and ".cts"');
            console.log('\tRequires "folderpath" arg');
            console.log('\tE.g code-migration-helpers rename-to-cjs "./folderpath"');
            console.log(types_js_1.kProcessCmdType.help);
            console.log('\tShow help');
            break;
    }
}
main().catch(console.error.bind(console));
