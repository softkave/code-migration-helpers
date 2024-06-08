#!/usr/bin/env node
import cliui from '@isaacs/cliui';
import fsExtra from 'fs-extra';
import { addExtCmd } from './addExt.mjs';
import { addVitestToTestCmd } from './addVitestToTests.mjs';
import { getArg, getMainCmd, getRequiredArg, parseCLIArgs, printCommand, } from './cli.mjs';
import { kAppliesToMessage, kCmdVars } from './constants.mjs';
import { renameExtCmd } from './renameExt.mjs';
import { kProcessCmdType } from './types.mjs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ui = new cliui({ width: 80, padding: [0, 4, 0, 4] });
async function main() {
    const pkgJson = await fsExtra.readJSON('./package.json');
    const name = pkgJson.name || 'code-migration-helpers';
    const description = pkgJson.description ||
        'Provides useful (but currently not thorough) code migration helpers';
    const version = pkgJson.version || '0.1.0';
    const args = parseCLIArgs(process.argv.slice(2));
    const mainCmd = getMainCmd(args);
    switch (mainCmd) {
        case kProcessCmdType.addExtToImports: {
            const folderpath = getRequiredArg({ args, name: kCmdVars.folder });
            const from = getArg({ args, name: kCmdVars.from });
            const to = getArg({ args, name: kCmdVars.to });
            await addExtCmd(folderpath, { from, to });
            break;
        }
        case kProcessCmdType.jestToVitest: {
            const folderpath = getRequiredArg({ args, name: kCmdVars.folder });
            await addVitestToTestCmd(folderpath);
            break;
        }
        case kProcessCmdType.renameExt: {
            const folderpath = getRequiredArg({ args, name: kCmdVars.folder });
            const from = getRequiredArg({ args, name: kCmdVars.from });
            const to = getRequiredArg({ args, name: kCmdVars.to });
            await renameExtCmd(folderpath, { from, to });
            break;
        }
        case kProcessCmdType.version:
            ui.div(`${name} - v${version}`);
            console.log(ui.toString());
            break;
        case kProcessCmdType.help:
        default:
            ui.div(`${name} - v${version}`);
            ui.div({ text: 'DESCRIPTION', width: 20 }, description);
            printCommand(ui, kProcessCmdType.addExtToImports, 'Add extension to relative imports', [
                { name: kCmdVars.folder, description: 'folderpath to operate in' },
                {
                    name: kCmdVars.from,
                    description: 'existing relative import extension to replace',
                },
                { name: kCmdVars.to, description: 'extension to replace with' },
            ]);
            printCommand(ui, kProcessCmdType.jestToVitest, 'Import "vitest" test constructs and replace "jest.fn" with "vi.fn". ' +
                'Does nothing if there\'s an existing "vitest" import. ' +
                kAppliesToMessage, [{ name: kCmdVars.folder, description: 'folderpath to operate in' }]);
            printCommand(ui, kProcessCmdType.renameExt, 'Rename filename extensions', [
                { name: kCmdVars.folder, description: 'folderpath to operate in' },
                { name: kCmdVars.from, description: 'extension to replace' },
                { name: kCmdVars.to, description: 'extension to replace with' },
            ]);
            printCommand(ui, kProcessCmdType.help, 'Print commands');
            printCommand(ui, kProcessCmdType.version, 'Print version');
            console.log(ui.toString());
            break;
    }
}
main().catch(console.error.bind(console));
//# sourceMappingURL=index.js.map