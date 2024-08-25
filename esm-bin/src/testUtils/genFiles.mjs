import { faker } from '@faker-js/faker';
import { writeFile } from 'fs/promises';
import { flatten } from 'lodash-es';
import path from 'path';
import { kLoopAsyncSettlementType, loopAndCollateAsync, } from 'softkave-js-utils';
export async function genFiles(folderList, count, genFn = () => ({
    name: faker.number.int({ min: 1 }).toString(),
    content: 'Hello, world!',
})) {
    const result = await Promise.all(folderList.map(folder => loopAndCollateAsync(async () => {
        const { name, content } = genFn();
        const fp = path.join(folder, name);
        await writeFile(fp, content, 'utf-8');
        return fp;
    }, count, kLoopAsyncSettlementType.all)));
    return flatten(result);
}
//# sourceMappingURL=genFiles.js.map