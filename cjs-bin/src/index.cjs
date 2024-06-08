#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cliui_1 = __importDefault(require("@isaacs/cliui"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const addExt_js_1 = require("./addExt.cjs");
const addVitestToTests_js_1 = require("./addVitestToTests.cjs");
const cli_js_1 = require("./cli.cjs");
const constants_js_1 = require("./constants.cjs");
const renameExt_js_1 = require("./renameExt.cjs");
const types_js_1 = require("./types.cjs");
const ui = new cliui_1.default({ width: 80, padding: [0, 4, 0, 4] });
async function main() {
    const pkgJson = await fs_extra_1.default.readJSON('./package.json');
    const name = pkgJson.name || 'code-migration-helpers';
    const description = pkgJson.description ||
        'Provides useful (but currently not thorough) code migration helpers';
    const version = pkgJson.version || '0.1.0';
    const args = (0, cli_js_1.parseCLIArgs)(process.argv.slice(2));
    const mainCmd = (0, cli_js_1.getMainCmd)(args);
    switch (mainCmd) {
        case types_js_1.kProcessCmdType.addExtToImports: {
            const folderpath = (0, cli_js_1.getRequiredArg)({ args, name: constants_js_1.kCmdVars.folder });
            const from = (0, cli_js_1.getArg)({ args, name: constants_js_1.kCmdVars.from });
            const to = (0, cli_js_1.getArg)({ args, name: constants_js_1.kCmdVars.to });
            await (0, addExt_js_1.addExtCmd)(folderpath, { from, to });
            break;
        }
        case types_js_1.kProcessCmdType.jestToVitest: {
            const folderpath = (0, cli_js_1.getRequiredArg)({ args, name: constants_js_1.kCmdVars.folder });
            await (0, addVitestToTests_js_1.addVitestToTestCmd)(folderpath);
            break;
        }
        case types_js_1.kProcessCmdType.renameExt: {
            const folderpath = (0, cli_js_1.getRequiredArg)({ args, name: constants_js_1.kCmdVars.folder });
            const from = (0, cli_js_1.getRequiredArg)({ args, name: constants_js_1.kCmdVars.from });
            const to = (0, cli_js_1.getRequiredArg)({ args, name: constants_js_1.kCmdVars.to });
            await (0, renameExt_js_1.renameExtCmd)(folderpath, { from, to });
            break;
        }
        case types_js_1.kProcessCmdType.version:
            ui.div(`${name} - v${version}`);
            console.log(ui.toString());
            break;
        case types_js_1.kProcessCmdType.help:
        default:
            ui.div(`${name} - v${version}`);
            ui.div({ text: 'DESCRIPTION', width: 20 }, description);
            (0, cli_js_1.printCommand)(ui, types_js_1.kProcessCmdType.addExtToImports, 'Add extension to relative imports', [
                { name: constants_js_1.kCmdVars.folder, description: 'folderpath to operate in' },
                {
                    name: constants_js_1.kCmdVars.from,
                    description: 'existing relative import extension to replace',
                },
                { name: constants_js_1.kCmdVars.to, description: 'extension to replace with' },
            ]);
            (0, cli_js_1.printCommand)(ui, types_js_1.kProcessCmdType.jestToVitest, 'Import "vitest" test constructs and replace "jest.fn" with "vi.fn". ' +
                'Does nothing if there\'s an existing "vitest" import. ' +
                constants_js_1.kAppliesToMessage, [{ name: constants_js_1.kCmdVars.folder, description: 'folderpath to operate in' }]);
            (0, cli_js_1.printCommand)(ui, types_js_1.kProcessCmdType.renameExt, 'Rename filename extensions', [
                { name: constants_js_1.kCmdVars.folder, description: 'folderpath to operate in' },
                { name: constants_js_1.kCmdVars.from, description: 'extension to replace' },
                { name: constants_js_1.kCmdVars.to, description: 'extension to replace with' },
            ]);
            (0, cli_js_1.printCommand)(ui, types_js_1.kProcessCmdType.help, 'Print commands');
            (0, cli_js_1.printCommand)(ui, types_js_1.kProcessCmdType.version, 'Print version');
            console.log(ui.toString());
            break;
    }
}
main().catch(console.error.bind(console));
