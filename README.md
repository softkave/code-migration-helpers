# Softkave Code Migration Helper

## Overview

A collection of useful code migration scripts, currently supporting the following:

- Adding `.js` to your Typescript files; useful when moving an existing `commonjs` project with multiple files to to `esmodules`.
- Importing `vitest`'s `test` and `describe` functions, and replacing `jest.fn()` with `vi.fn()`; useful when moving from `jest` to `vitest` in an existing project with a lot of test files.

**NOTE: modifications may not always be accurate, so it's best to work off a separate branch without any changes, incase you want to revert all changes and run again.**

## Install

### `npm`

```sh
npm install code-migration-helpers -D
```

### `npm` one time run

```sh
npx code-migration-helpers
```

### `yarn`

```sh
yarn add code-migration-helpers -D
```

## Usage

### Add JS extenstion to relative imports

With `code-migration-helpers`, you can add `.js` extension to relative imports in all Typescript files in a supplied folder path. To do that, run the following, replacing `../folder/path` with your intended folder's path. **Also, look at, and follow the advice in the NOTE above before running.**

```sh
code-migration-helpers add-js-ext ../folder/path
```

### `jest` to `vitest`

With `code-migration-helpers`, you can import `test` and `describe` functions, and replace `jest.fn()` mock functions with `vi.fn()` in all Typescript files in a supplied folder path. To do that, run the following, replacing `../folder/path` with your intended folder's path. **Also, look at, and follow the advice in the NOTE above before running.**

```sh
code-migration-helpers jest-to-vitest ../folder/path
```
