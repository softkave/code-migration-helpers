#!/usr/bin/env node

import cliui from '@isaacs/cliui';
import fsExtra from 'fs-extra';
import path from 'path';
import {addExtCmd} from './addExt.js';
import {addIndexFileCmd} from './addIndexFile/addIndexFileCmd.js';
import {addVitestToTestCmd} from './addVitestToTests.js';
import {renameExtCmd} from './renameExt.js';
import {renameFileCmd} from './renameFile.js';
import {
  getArg,
  getMainCmd,
  getRequiredArg,
  parseCLIArgs,
  printCommand,
} from './utils/cli/cli.js';
import {kAppliesToMessage, kCmdVars} from './utils/constants.js';
import {PackageJson, kProcessCmdType} from './utils/types.js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ui = new cliui({width: 80, padding: [0, 4, 0, 4]});

async function main() {
  const pkgJson = await fsExtra.readJSON('./package.json');

  const name = (pkgJson as PackageJson).name || 'code-migration-helpers';
  const description =
    (pkgJson as PackageJson).description ||
    'Provides useful (but currently not thorough) code migration helpers';
  const version = (pkgJson as PackageJson).version || '0.1.0';

  const args = parseCLIArgs(process.argv.slice(2));
  const mainCmd = getMainCmd(args);

  switch (mainCmd) {
    case kProcessCmdType.addExtToImports: {
      const folderpath = getRequiredArg({args, name: kCmdVars.folder});
      const from = getArg({args, name: kCmdVars.from});
      const to = getArg({args, name: kCmdVars.to});
      await addExtCmd(folderpath, {from, to});
      break;
    }

    case kProcessCmdType.jestToVitest: {
      const folderpath = getRequiredArg({args, name: kCmdVars.folder});
      await addVitestToTestCmd(folderpath);
      break;
    }

    case kProcessCmdType.renameExt: {
      const folderpath = getRequiredArg({args, name: kCmdVars.folder});
      const from = getRequiredArg({args, name: kCmdVars.from});
      const to = getRequiredArg({args, name: kCmdVars.to});
      await renameExtCmd(folderpath, {from, to});
      break;
    }

    case kProcessCmdType.addIndexFile: {
      const folderpath = getRequiredArg({args, name: kCmdVars.folder});
      const includeArg = getRequiredArg({args, name: kCmdVars.include});
      const excludeArg = getRequiredArg({args, name: kCmdVars.exclude});
      const absFolderpath = path.isAbsolute(folderpath)
        ? folderpath
        : path.join(process.cwd(), folderpath);
      await addIndexFileCmd({
        absFolderpath,
        includeStrOrRegex: [includeArg],
        excludeStrOrRegex: [excludeArg],
      });
      break;
    }

    case kProcessCmdType.renameFile: {
      const folderpath = getRequiredArg({args, name: kCmdVars.folder});
      const fromArg = getRequiredArg({args, name: kCmdVars.include});
      const toArg = getRequiredArg({args, name: kCmdVars.exclude});
      const preserveCaseArg = getRequiredArg({args, name: kCmdVars.exclude});

      const preserveCase = !!preserveCaseArg;
      await renameFileCmd(folderpath, {
        asks: [{preserveCase, from: fromArg, to: toArg}],
      });
      break;
    }

    case kProcessCmdType.version:
      ui.div(`${name} - v${version}`);
      console.log(ui.toString());
      break;

    case kProcessCmdType.help:
    default:
      ui.div(`${name} - v${version}`);
      ui.div({text: 'DESCRIPTION', width: 20}, description);

      printCommand(
        ui,
        kProcessCmdType.addExtToImports,
        'Add extension to relative imports',
        [
          {name: kCmdVars.folder, description: 'folderpath to operate in'},
          {
            name: kCmdVars.from,
            description: 'existing relative import extension to replace',
          },
          {name: kCmdVars.to, description: 'extension to replace with'},
        ]
      );

      printCommand(
        ui,
        kProcessCmdType.jestToVitest,
        'Import "vitest" test constructs and replace "jest.fn" with "vi.fn". ' +
          'Does nothing if there\'s an existing "vitest" import. ' +
          kAppliesToMessage,
        [{name: kCmdVars.folder, description: 'folderpath to operate in'}]
      );

      printCommand(
        ui,
        kProcessCmdType.renameExt,
        'Rename filename extensions',
        [
          {name: kCmdVars.folder, description: 'folderpath to operate in'},
          {name: kCmdVars.from, description: 'extension to replace'},
          {name: kCmdVars.to, description: 'extension to replace with'},
        ]
      );

      printCommand(
        ui,
        kProcessCmdType.addIndexFile,
        'Recursively adds index files to  folders',
        [
          {name: kCmdVars.folder, description: 'folderpath to operate in'},
          {
            name: kCmdVars.include,
            description:
              'string or js-flavor regex of file and folder names to include',
          },
          {
            name: kCmdVars.exclude,
            description:
              'string or js-flavor regex of file and folder names to exclude',
          },
        ]
      );

      printCommand(
        ui,
        kProcessCmdType.renameFile,
        'Recursively adds index files to  folders',
        [
          {name: kCmdVars.folder, description: 'folderpath to operate in'},
          {
            name: kCmdVars.from,
            description:
              'string or js-flavor regex of file and folder name to replace',
          },
          {name: kCmdVars.to, description: 'string to replace with'},
          {
            name: kCmdVars.preserveCase,
            description:
              'whether to preserve case when replacing. ' +
              'will preserve case if passed in any form, omit to not preserve case.',
          },
        ]
      );

      printCommand(ui, kProcessCmdType.help, 'Print commands');
      printCommand(ui, kProcessCmdType.version, 'Print version');
      console.log(ui.toString());
      break;
  }
}

main().catch(console.error.bind(console));
