import assert from 'assert';
export function parseCLIArgs(input) {
    const strList = Array.isArray(input)
        ? input
        : input
            .split(' ')
            .map(part => part.trim())
            .filter(part => !!part);
    const argsTuple = [];
    const argsMap = {};
    const unamedArgs = [];
    for (const str of strList) {
        const [key, rawValue = ''] = str.split('=');
        const value = rawValue.replace(/^['"]{1}/, '').replace(/['"]{1}$/, '');
        const lastArg = argsTuple[argsTuple.length - 1];
        if (!key.startsWith('-') &&
            !value &&
            (lastArg === null || lastArg === void 0 ? void 0 : lastArg[0].startsWith('-')) &&
            !lastArg[1]) {
            lastArg[1] = key;
        }
        else {
            argsTuple.push([key, value]);
        }
    }
    argsTuple.forEach(([key, value]) => {
        argsMap[key] = value;
        if (!value) {
            unamedArgs.push(key);
        }
    });
    return { argsTuple, argsMap, unamedArgs };
}
export function getArg(opts) {
    const { name, args, def, format, isRequired } = opts;
    let vRaw;
    let v;
    if (typeof name === 'string') {
        vRaw = args.argsMap[name];
    }
    else {
        vRaw = args.unamedArgs[name];
    }
    assert(isRequired ? vRaw : true, typeof isRequired === 'string'
        ? isRequired
        : typeof name === 'number'
            ? `Unamed arg at index "${name}" not found, here are the unamed args [${args.unamedArgs
                .map(([k]) => `"${k}"`)
                .join(',')}]`
            : `Arg "${name}" not found`);
    if (vRaw && format) {
        v = format(name, vRaw);
    }
    else if (!vRaw && def) {
        v = def;
    }
    else {
        v = vRaw;
    }
    return v;
}
export function getRequiredArg(...args) {
    const opts = args[0];
    const v = getArg({ ...opts, isRequired: true });
    assert(v);
    return v;
}
export function getMainCmd(args) {
    var _a;
    return (_a = args.argsTuple[0]) === null || _a === void 0 ? void 0 : _a[0];
}
export function printCommand(ui, name, description, options) {
    ui.div(name);
    if (description) {
        ui.div({ text: 'DESCRIPTION', width: 20, padding: [0, 4, 0, 4] }, description);
    }
    if (options === null || options === void 0 ? void 0 : options.length) {
        options.forEach(opt => {
            ui.div({ text: opt.name, width: 20, padding: [0, 4, 0, 4] }, opt.description);
        });
    }
}
//# sourceMappingURL=cli.js.map