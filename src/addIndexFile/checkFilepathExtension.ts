import path from 'path';
import {kDTSExtension, kJSOrTSFilepathRegex} from '../utils/constants.js';

export function checkFilepathExtension(filepath: string) {
  const ext = path.extname(filepath);
  return kJSOrTSFilepathRegex.test(ext) || ext === kDTSExtension;
}
