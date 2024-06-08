# Softkave Code Migration Helper

## Overview

A collection of useful code migration scripts. Currently provides the following:

- Replacing/adding relative import extensions in code. E.g. `import some from "./thing"` can become `import some from "./thing.js"`.
- Importing `vitest` test constructs in a test file. Useful when moving from `jest` to `vitest`.
- Replacing filename extenstions for matching extensions. E.g. `some-file.js` can become `some-file.cjs`.

**NOTE: modifications may not always be accurate, so it's best to work off a separate branch without any changes, incase you want to revert all changes and run again.**

## Install

### `npm`

```sh
npm install code-migration-helpers -D
```

### `npm` one time run

```sh
npx code-migration-helpers --help
```

## Usage

### `help`

Prints help.

```sh
npx code-migration-helpers help
```

### `version`

Prints version.

```sh
npx code-migration-helpers version
```

### `add-ext`

Add extensions to relative `import` or `require` calls. Relative meaning `./some-file` or `../some-folder/some-file`.

#### Arguments

- `-f` - `Required` file or folder path.
- `--from` - `Optional` extension to replace. If empty, all relative imports are considered in scope.
- `--to` - `Optional` extension to replace with. If empty, it'll try to figure out the right extension. i.e. Imported files ending in [`.js`, `.ts`] become `.js`, [`.cjs`, `.cts`] become `.cjs`, [`.mjs`, `.mts`] become `.mjs`.

```sh
npx code-migration-helpers add-ext -f="./fpath"
```

### `jest-to-vitest`

Imports `vitest` test constructs if found in files-in-scope. E.g. `expect`, `test`, `beforeAll`, etc. and also replaces calls to `jest.fn()` with `vi.fn()`.

#### Arguments

- `-f` - `Required` file or folder path.

```sh
npx code-migration-helpers jest-to-vitest -f="./fpath"
```

### `rename-ext`

Renames file extensions for files-in-scope. E.g. `some-file.js` can become `some-file.cjs`.

#### Arguments

- `-f` - `Required` file or folder path.
- `--from` - `Required` extension to replace.
- `--to` - `Required` extension to replace with.

```sh
npx code-migration-helpers jest-to-vitest -f="./fpath"
```
