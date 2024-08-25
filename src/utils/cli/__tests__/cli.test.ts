import {describe, expect, test} from 'vitest';
import {ParsedCLIArgs} from '../../types.js';
import {parseCLIArgs} from '../cli.js';

describe('parseCLIArgs', () => {
  test('parseCLIArgs', () => {
    const input = [
      'main-cmd',
      '-c',
      '-d=',
      '-f=one',
      "-g='value'",
      '-h="value"',
      '-i',
      'value',
      'j',
      'value',
      '--c00',
      '--d00=',
      '--f00=one',
      "--g00='value'",
      '--h00="value"',
      '--i00',
      'value',
      'j00',
      'value',
    ];

    const result01 = parseCLIArgs(input);
    const result02 = parseCLIArgs(input.join('   '));

    const expectedArgsTuple: ParsedCLIArgs['argsTuple'] = [
      ['main-cmd', ''],
      ['-c', ''],
      ['-d', ''],
      ['-f', 'one'],
      ['-g', 'value'],
      ['-h', 'value'],
      ['-i', 'value'],
      ['j', ''],
      ['value', ''],
      ['--c00', ''],
      ['--d00', ''],
      ['--f00', 'one'],
      ['--g00', 'value'],
      ['--h00', 'value'],
      ['--i00', 'value'],
      ['j00', ''],
      ['value', ''],
    ];
    const expectedArgsMap: ParsedCLIArgs['argsMap'] = {
      'main-cmd': '',
      '-c': '',
      '-d': '',
      '-f': 'one',
      '-g': 'value',
      '-h': 'value',
      '-i': 'value',
      j: '',
      value: '',
      '--c00': '',
      '--d00': '',
      '--f00': 'one',
      '--g00': 'value',
      '--h00': 'value',
      '--i00': 'value',
      j00: '',
    };
    const expectedUnamedArgs: ParsedCLIArgs['unamedArgs'] = [
      'main-cmd',
      '-c',
      '-d',
      'j',
      'value',
      '--c00',
      '--d00',
      'j00',
      'value',
    ];
    expect(result01.argsTuple).toEqual(expectedArgsTuple);
    expect(result01.argsMap).toEqual(expectedArgsMap);
    expect(result01.unamedArgs).toEqual(expectedUnamedArgs);
    expect(result02.argsTuple).toEqual(expectedArgsTuple);
    expect(result02.argsMap).toEqual(expectedArgsMap);
    expect(result02.unamedArgs).toEqual(expectedUnamedArgs);
  });
});
