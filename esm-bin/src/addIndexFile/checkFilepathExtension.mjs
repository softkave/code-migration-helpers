import path from 'path';
import { kDTSExtension, kJSOrTSFilepathRegex } from '../utils/constants.mjs';
export function checkFilepathExtension(filepath) {
    const ext = path.extname(filepath);
    return kJSOrTSFilepathRegex.test(ext) || ext === kDTSExtension;
}
//# sourceMappingURL=checkFilepathExtension.js.map