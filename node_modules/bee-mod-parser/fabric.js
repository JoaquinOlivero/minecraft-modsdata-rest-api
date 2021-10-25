"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFabricMod = undefined;
const system_1 = require("@xmcl/system");
/**
 * Read fabric mod metadata json from a jar file or a directory
 * @param file The jar file or directory path. I can also be the binary content of the jar if you have already read the jar.
 */
async function readFabricMod(file) {
    const fs = await system_1.resolveFileSystem(file);
    const content = await fs.readFile("fabric.mod.json", "utf-8");
    return JSON.parse(content.replace(/^\uFEFF/, ""));
}
exports.readFabricMod = readFabricMod;
