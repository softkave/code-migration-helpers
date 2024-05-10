"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameToCommonJsCmd = exports.renameToCommonJsTraverseHandler = void 0;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
const renameToCommonJsTraverseHandler = async (filepath) => {
    if (!(0, utils_js_1.isJSOrTSFilepath)(filepath) || (0, utils_js_1.isTSDeclarationFilepath)(filepath)) {
        return false;
    }
    const actualExt = path_1.default.extname(filepath);
    const newExt = actualExt === constants_js_1.kJSExtension
        ? constants_js_1.kCJSExtension
        : actualExt === constants_js_1.kTSExtension
            ? constants_js_1.kCTSExtension
            : undefined;
    if (newExt) {
        const basename = path_1.default.basename(filepath, actualExt);
        const newFilename = `${basename}${newExt}`;
        const dirname = path_1.default.dirname(filepath);
        const newFilepath = path_1.default.join(dirname, newFilename);
        await (0, promises_1.rename)(filepath, newFilepath);
        return true;
    }
    return false;
};
exports.renameToCommonJsTraverseHandler = renameToCommonJsTraverseHandler;
async function renameToCommonJsCmd(folderpath) {
    await (0, utils_js_1.traverseAndProcessFilesInFolderpath)(folderpath, exports.renameToCommonJsTraverseHandler);
}
exports.renameToCommonJsCmd = renameToCommonJsCmd;
