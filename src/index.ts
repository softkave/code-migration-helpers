import assert from 'assert';
import {Command, Option} from 'commander';
import {version} from 'typescript';
import {addJsExtCmd} from './addJsExt.js';
import {addVitestToTestCmd} from './addVitestToTests.js';
import {kExtensions, kJSExtension} from './constants.js';
import pkgJson from './package.json';
import {renameToCommonJsCmd} from './renameToCommonJs.js';
import {ProcessCmdType, kProcessCmdType} from './types.js';

interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
}

const program = new Command();
const name = (pkgJson as PackageJson).name || 'code-migration-helpers';
const description =
  (pkgJson as PackageJson).description ||
  'Provides useful (but currently not thorough) code migration helpers';
const version = (pkgJson as PackageJson).version || '0.1.0';

program.name(name).description(description).version(version);

program
  .command(kProcessCmdType.addExtToImports)
  .description('Add extension to relative imports')
  .argument('<string>', 'folderpath to operate in')
  .addOption(
    new Option(
      '--from',
      'existing relative import extension to replace'
    ).choices(kExtensions)
  )
  .addOption(
    new Option('--to', 'extension to replace with')
      .choices(kExtensions)
      .default(kJSExtension)
  )
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });

program
  .command(kProcessCmdType.jestToVitest)
  .description(
    'Import "vitest" test constructs and replace "jest.fn" with "vi.fn"'
  )
  .argument('<string>', 'folderpath to operate in')
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });

program
  .command(kProcessCmdType.renameExt)
  .description('Rename ".js" and ".ts" to ".cjs" and ".cts"')
  .argument('<string>', 'folderpath to operate in')
  .addOption(
    new Option('--from', 'extension to replace')
      .choices(kExtensions)
      .makeOptionMandatory(true)
  )
  .addOption(
    new Option('--to', 'extension to replace with')
      .choices(kExtensions)
      .makeOptionMandatory(true)
  )
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });

program.parse();

function getCmdArg() {
  const cmd = process.argv[2];
  assert(
    cmd,
    `No cmd provided, expected one of ${Object.values(kProcessCmdType)
      .map(name => `"${name}"`)
      .join(' | ')}`
  );

  return cmd;
}

function getFolderpathArg() {
  const folderpath = process.argv[3];
  assert(folderpath, 'No "folderpath" provided');

  return folderpath;
}

async function main() {
  const cmd = getCmdArg();

  switch (cmd as ProcessCmdType) {
    case kProcessCmdType.addJsExt: {
      const folderpath = getFolderpathArg();
      await addJsExtCmd(folderpath);
      break;
    }

    case kProcessCmdType.jestToVitest: {
      const folderpath = getFolderpathArg();
      await addVitestToTestCmd(folderpath);
      break;
    }

    case kProcessCmdType.renameToCjs: {
      const folderpath = getFolderpathArg();
      await renameToCommonJsCmd(folderpath);
      break;
    }

    case kProcessCmdType.help:
      console.log(kProcessCmdType.addJsExt);
      console.log('\tAdd ".js" extension to relative imports');
      console.log('\tRequires "folderpath" arg');
      console.log('\tE.g code-migration-helpers add-js-ext "./folderpath"');

      console.log(kProcessCmdType.jestToVitest);
      console.log(
        '\tImport "vitest" test constructs and replace "jest.fn" with "vi.fn"'
      );
      console.log('\tRequires "folderpath" arg');
      console.log('\tE.g code-migration-helpers jest-to-vitest "./folderpath"');

      console.log(kProcessCmdType.renameToCjs);
      console.log('\tRename ".js" and ".ts" to ".cjs" and ".cts"');
      console.log('\tRequires "folderpath" arg');
      console.log('\tE.g code-migration-helpers rename-to-cjs "./folderpath"');

      console.log(kProcessCmdType.help);
      console.log('\tShow help');

      break;
  }
}

main().catch(console.error.bind(console));
