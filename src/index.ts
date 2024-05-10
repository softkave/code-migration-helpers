import assert from 'assert';
import {Command, Option} from 'commander';
import {addExtCmd} from './addExt.js';
import {addVitestToTestCmd} from './addVitestToTests.js';
import {kExtensions, kJSExtension} from './constants.js';
import pkgJson from './package.json';
import {renameExtCmd} from './renameExt.js';
import {kProcessCmdType} from './types.js';

interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
}

function checkExtension(argName: string, ext?: string) {
  if (ext) {
    assert(
      kExtensions.includes(ext),
      `Invalid ${argName} arg, expected one of ${Object.values(kProcessCmdType)
        .map(name => `"${name}"`)
        .join(' | ')}`
    );
  }
}

const program = new Command();
const name = (pkgJson as PackageJson).name || 'code-migration-helpers';
const description =
  (pkgJson as PackageJson).description ||
  'Provides useful (but currently not thorough) code migration helpers';
const version = (pkgJson as PackageJson).version || '0.1.0';
const kAppliesToMessage = `Only considers files ending in ${kExtensions
  .map(name => `"${name}"`)
  .join(', ')}.`;

program.name(name).description(description).version(version);

program
  .command(kProcessCmdType.addExtToImports)
  .description('Add extension to relative imports. ' + kAppliesToMessage)
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
  .action(async (folderpath, options) => {
    const from = options.from;
    const to = options.to;
    checkExtension('--from', from);
    checkExtension('--to', to);

    await addExtCmd(folderpath, {from, to});
  });

program
  .command(kProcessCmdType.jestToVitest)
  .description(
    'Import "vitest" test constructs and replace "jest.fn" with "vi.fn". ' +
      'Does nothing if there\'s an existing "vitest" import. ' +
      kAppliesToMessage
  )
  .argument('<string>', 'folderpath to operate in')
  .action(async folderpath => {
    await addVitestToTestCmd(folderpath);
  });

program
  .command(kProcessCmdType.renameExt)
  .description('Rename filename extensions. ' + kAppliesToMessage)
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
  .action(async (folderpath, options) => {
    const from = options.from;
    const to = options.to;
    checkExtension('--from', from);
    checkExtension('--to', to);

    await renameExtCmd(folderpath, {from, to});
  });

program.parse();
