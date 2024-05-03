import {describe, expect, test} from 'vitest';
import {importVitestAndReplaceJestMocks} from '../jestToVitest.js';
import {ProcessedFile, kProcessedFileOutcome} from '../types.js';

describe('jestToVitest', () => {
  test.each([
    'test',
    'describe',
    'expect',
    'beforeAll',
    'beforeEach',
    'afterEach',
    'afterAll',
  ] as const)('importVitestAndReplaceJestMocks %s', importStr => {
    const originalParts: string[] = [
      "import something from 'another-thing';",
      '',
      'const mockFn = jest.fn();',
      'const mockFn02 = jest.fn().mockImplementation();',
    ];
    let extraPart: string | undefined;

    switch (importStr) {
      case 'afterAll':
        extraPart = 'afterAll(() => {});';
        break;
      case 'afterEach':
        extraPart = 'afterEach(() => {});';
        break;
      case 'beforeAll':
        extraPart = 'beforeAll(() => {});';
        break;
      case 'beforeEach':
        extraPart = 'beforeEach(() => {});';
        break;
      case 'describe':
        extraPart = 'describe(() => {});';
        break;
      case 'test':
        extraPart = 'test(() => {});';
        break;
      case 'expect':
        extraPart = 'someTest(() => { expect(1).toBe(1); });';
        break;
    }

    if (extraPart) {
      originalParts.push(extraPart);
    }

    const f: ProcessedFile = {
      originalParts,
      isModified: false,
      filepath: 'filepath.ts',
      workingParts: originalParts,
      outcome: kProcessedFileOutcome.processed,
    };

    importVitestAndReplaceJestMocks(f);

    const expectedParts: string[] = [
      "import something from 'another-thing';",
      `import {${importStr}, vi} from 'vitest';`,
      '',
      'const mockFn = vi.fn();',
      'const mockFn02 = vi.fn().mockImplementation();',
    ];

    if (extraPart) {
      expectedParts.push(extraPart);
    }

    f.workingParts.forEach((p, i) => expect(p).toEqual(expectedParts[i]));
    expect(f.isModified).toBeTruthy();
  });
});
