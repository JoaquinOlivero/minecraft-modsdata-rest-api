"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLiteloaderMod = void 0;
const system_1 = require("@xmcl/system");
async function readLiteloaderMod(mod) {
    const fs = await system_1.resolveFileSystem(mod);
    const text = await fs.readFile("litemod.json", "utf-8").then((s) => s.replace(/^\uFEFF/, "")).catch(() => undefined);
    if (!text) {
        throw {
            error: "IllegalInputType",
            errorMessage: "Illegal input type! Expect a jar file contains litemod.json",
            mod,
        };
    }
    const metadata = JSON.parse(text.trim(), (key, value) => key === "revision" ? Number.parseInt(value, 10) : value);
    if (!metadata.version) {
        metadata.version = `${metadata.mcversion}:${metadata.revision || 0}`;
    }
    return metadata;
}
exports.readLiteloaderMod = readLiteloaderMod;
