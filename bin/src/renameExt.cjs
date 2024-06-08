"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameExtCmd = exports.renameExtTraverseHandler = void 0;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const constants_js_1 = require("./constants.cjs");
const utils_js_1 = require("./utils.cjs");
const renameExtTraverseHandler = async (filepath, opts) => {
    if (!filepath.endsWith(opts.from) || filepath.endsWith(constants_js_1.kDTSExtension)) {
        return false;
    }
    const actualExt = path_1.default.extname(filepath);
    const basename = path_1.default.basename(filepath, actualExt);
    const newFilename = `${basename}${opts.to}`;
    const dirname = path_1.default.dirname(filepath);
    const newFilepath = path_1.default.join(dirname, newFilename);
    await (0, promises_1.rename)(filepath, newFilepath);
    return true;
};
exports.renameExtTraverseHandler = renameExtTraverseHandler;
async function renameExtCmd(folderpath, opts) {
    await (0, utils_js_1.traverseAndProcessFilesInFolderpath)(folderpath, exports.renameExtTraverseHandler, opts);
}
exports.renameExtCmd = renameExtCmd;
