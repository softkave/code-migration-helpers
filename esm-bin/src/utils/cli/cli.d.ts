import cliui from '@isaacs/cliui';
import { ParsedCLIArgs } from '../types.js';
export declare function parseCLIArgs(input: string | string[]): {
    argsTuple: [string, string][];
    argsMap: Record<string, string | undefined>;
    unamedArgs: string[];
};
export declare function getArg<T = string>(opts: {
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
}): T | undefined;
export declare function getRequiredArg<T = string>(...args: Parameters<typeof getArg<T>>): NonNullable<ReturnType<typeof getArg<T>>>;
export declare function getMainCmd(args: ParsedCLIArgs): string | undefined;
export declare function printCommand(ui: ReturnType<typeof cliui.default>, name: string, description: string, options?: Array<{
    name: string;
    description: string;
}>): void;
