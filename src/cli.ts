import cliui from '@isaacs/cliui';
import assert from 'assert';
import {ParsedCLIArgs} from './types.js';

export function parseCLIArgs(input: string | string[]) {
  const strList = Array.isArray(input)
    ? input
    : input
        .split(' ')
        .map(part => part.trim())
        .filter(part => !!part);
  const argsTuple: ParsedCLIArgs['argsTuple'] = [];
  const argsMap: ParsedCLIArgs['argsMap'] = {};
  const unamedArgs: ParsedCLIArgs['unamedArgs'] = [];

  for (const str of strList) {
    const [key, rawValue = ''] = str.split('=');
    const value = rawValue.replace(/^['"]{1}/, '').replace(/['"]{1}$/, '');
    const lastArg: ParsedCLIArgs['argsTuple'][number] | undefined =
      argsTuple[argsTuple.length - 1];

    if (
      !key.startsWith('-') &&
      !value &&
      lastArg?.[0].startsWith('-') &&
      !lastArg[1]
    ) {
      lastArg[1] = key;
    } else {
      argsTuple.push([key, value]);
    }
  }

  argsTuple.forEach(([key, value]) => {
    argsMap[key] = value;

    if (!value) {
      unamedArgs.push(key);
    }
  });

  return {argsTuple, argsMap, unamedArgs};
}

export function getArg<T = string>(opts: {
  /**
   * Use number to return nameless arg at index. Does not consider named args.
   */
  name: string | number;
  args: ParsedCLIArgs;
  def?: T;
  format?: (k: string | number, v: string) => T | undefined;
  /**
   * Use string for error message
   */
  isRequired?: boolean | string;
}): T | undefined {
  const {name, args, def, format, isRequired} = opts;
  let vRaw: string | undefined;
  let v: T | undefined;

  if (typeof name === 'string') {
    vRaw = args.argsMap[name];
  } else {
    vRaw = args.unamedArgs[name];
  }

  assert(
    isRequired ? vRaw : true,
    typeof isRequired === 'string'
      ? isRequired
      : typeof name === 'number'
        ? `Unamed arg at index "${name}" not found, here are the unamed args [${args.unamedArgs
            .map(([k]) => `"${k}"`)
            .join(',')}]`
        : `Arg "${name}" not found`
  );

  if (vRaw && format) {
    v = format(name, vRaw);
  } else if (!vRaw && def) {
    v = def;
  } else {
    v = vRaw as T | undefined;
  }

  return v;
}

export function getRequiredArg<T = string>(
  ...args: Parameters<typeof getArg<T>>
): NonNullable<ReturnType<typeof getArg<T>>> {
  const opts = args[0];
  const v = getArg({...opts, isRequired: true});
  assert(v);

  return v;
}

export function getMainCmd(args: ParsedCLIArgs): string | undefined {
  return args.argsTuple[0]?.[0];
}

export function printCommand(
  ui: ReturnType<typeof cliui.default>,
  name: string,
  description: string,
  options?: Array<{name: string; description: string}>
) {
  ui.div(name);

  if (description) {
    ui.div(
      {text: 'DESCRIPTION', width: 20, padding: [0, 4, 0, 4]},
      description
    );
  }

  if (options?.length) {
    options.forEach(opt => {
      ui.div(
        {text: opt.name, width: 20, padding: [0, 4, 0, 4]},
        opt.description
      );
    });
  }
}
