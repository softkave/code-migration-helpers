import {faker} from '@faker-js/faker';
import {ensureDir} from 'fs-extra';
import {flatten} from 'lodash-es';
import path from 'path';
import {
  AnyFn,
  kLoopAsyncSettlementType,
  loopAndCollateAsync,
} from 'softkave-js-utils';

export async function genFolders(
  folderList: string[],
  count: number,
  genName: AnyFn<[], string> = () => faker.number.int({min: 1}).toString()
) {
  const result = await Promise.all(
    folderList.map(folder =>
      loopAndCollateAsync(
        async () => {
          const fp = path.join(folder, genName());
          await ensureDir(fp);
          return fp;
        },
        count,
        kLoopAsyncSettlementType.all
      )
    )
  );

  return flatten(result);
}
