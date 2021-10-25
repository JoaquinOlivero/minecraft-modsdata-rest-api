"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeModParseFailedError = exports.readForgeMod = exports.readForgeModJson = exports.readForgeModAsm = exports.readForgeModToml = exports.readForgeModManifest = void 0;
const system_1 = require("@xmcl/system");
const toml_1 = require("@iarna/toml");
const asm_1 = require("@xmcl/asm");
class ModAnnotationVisitor extends asm_1.AnnotationVisitor {
    constructor(map) {
        super(asm_1.Opcodes.ASM5);
        this.map = map;
    }
    visit(s, o) {
        if (s === "value") {
            this.map.modid = o;
        }
        else {
            this.map[s] = o;
        }
    }
}
class DummyModConstructorVisitor extends asm_1.MethodVisitor {
    constructor(parent, api) {
        super(api);
        this.parent = parent;
        this.stack = [];
    }
    visitLdcInsn(value) {
        this.stack.push(value);
    }
    visitFieldInsn(opcode, owner, name, desc) {
        if (opcode === asm_1.Opcodes.PUTFIELD) {
            const last = this.stack.pop();
            if (last) {
                if (name === "modId") {
                    this.parent.guess.modid = last;
                }
                else if (name === "version") {
                    this.parent.guess.version = last;
                }
                else if (name === "name") {
                    this.parent.guess.name = last;
                }
                else if (name === "url") {
                    this.parent.guess.url = last;
                }
                else if (name === "parent") {
                    this.parent.guess.parent = last;
                }
                else if (name === "mcversion") {
                    this.parent.guess.mcversion = last;
                }
            }
        }
    }
}
class ModClassVisitor extends asm_1.ClassVisitor {
    constructor(result, guess, corePlugin) {
        super(asm_1.Opcodes.ASM5);
        this.result = result;
        this.guess = guess;
        this.corePlugin = corePlugin;
        this.fields = {};
        this.className = "";
        this.isDummyModContainer = false;
        this.isPluginClass = false;
    }
    validateType(desc) {
        if (desc.indexOf("net/minecraftforge") !== -1) {
            this.result.usedForgePackage = true;
        }
        if (desc.indexOf("net/minecraft") !== -1) {
            this.result.usedMinecraftPackage = true;
        }
        if (desc.indexOf("cpw/mods/fml") !== -1) {
            this.result.usedLegacyFMLPackage = true;
        }
        if (desc.indexOf("net/minecraft/client") !== -1) {
            this.result.usedMinecraftClientPackage = true;
        }
    }
    visit(version, access, name, signature, superName, interfaces) {
        this.className = name;
        this.isPluginClass = name === this.corePlugin;
        if (superName === "net/minecraftforge/fml/common/DummyModContainer") {
            this.isDummyModContainer = true;
        }
        this.validateType(superName);
        for (const intef of interfaces) {
            this.validateType(intef);
        }
    }
    visitMethod(access, name, desc, signature, exceptions) {
        if (this.isDummyModContainer && name === "<init>") {
            return new DummyModConstructorVisitor(this, asm_1.Opcodes.ASM5);
        }
        this.validateType(desc);
        return null;
    }
    visitField(access, name, desc, signature, value) {
        this.fields[name] = value;
        return null;
    }
    visitAnnotation(desc, visible) {
        if (desc === "Lnet/minecraftforge/fml/common/Mod;" || desc === "Lcpw/mods/fml/common/Mod;") {
            const annotationData = {
                modid: "",
                name: "",
                version: "",
                dependencies: "",
                useMetadata: true,
                clientSideOnly: false,
                serverSideOnly: false,
                acceptedMinecraftVersions: "",
                acceptableRemoteVersions: "",
                acceptableSaveVersions: "",
                modLanguage: "java",
                modLanguageAdapter: "",
                value: "",
            };
            this.result.modAnnotations.push(annotationData);
            return new ModAnnotationVisitor(annotationData);
        }
        return null;
    }
    visitEnd() {
        if (this.className === "Config" && this.fields && this.fields.OF_NAME) {
            this.result.modAnnotations.push({
                modid: this.fields.OF_NAME,
                name: this.fields.OF_NAME,
                mcversion: this.fields.MC_VERSION,
                version: `${this.fields.OF_EDITION}_${this.fields.OF_RELEASE}`,
                description: "OptiFine is a Minecraft optimization mod. It allows Minecraft to run faster and look better with full support for HD textures and many configuration options.",
                authorList: ["sp614x"],
                url: "https://optifine.net",
                clientSideOnly: true,
                serverSideOnly: false,
                value: "",
                dependencies: "",
                useMetadata: false,
                acceptableRemoteVersions: "",
                acceptableSaveVersions: "",
                acceptedMinecraftVersions: `[${this.fields.MC_VERSION}]`,
                modLanguage: "java",
                modLanguageAdapter: "",
            });
        }
        for (const [k, v] of Object.entries(this.fields)) {
            switch (k.toUpperCase()) {
                case "MODID":
                case "MOD_ID":
                    this.guess.modid = this.guess.modid || v;
                    break;
                case "MODNAME":
                case "MOD_NAME":
                    this.guess.name = this.guess.name || v;
                    break;
                case "VERSION":
                case "MOD_VERSION":
                    this.guess.version = this.guess.version || v;
                    break;
                case "MCVERSION":
                    this.guess.mcversion = this.guess.mcversion || v;
                    break;
            }
        }
    }
}
/**
 * Read the mod info from `META-INF/MANIFEST.MF`
 * @returns The manifest directionary
 */
async function readForgeModManifest(mod, manifestStore = {}) {
    const fs = await system_1.resolveFileSystem(mod);
    if (!await fs.existsFile("META-INF/MANIFEST.MF")) {
        return undefined;
    }
    const data = await fs.readFile("META-INF/MANIFEST.MF");
    const manifest = data.toString().split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((l) => l.split(":").map((s) => s.trim()))
        .reduce((a, b) => ({ ...a, [b[0]]: b[1] }), {});
    Object.assign(manifestStore, manifest);
    const metadata = {
        modid: "",
        name: "",
        authors: new Array(),
        version: "",
        description: "",
        url: "",
    };
    if (typeof manifest.TweakName === "string") {
        metadata.modid = manifest.TweakName;
        metadata.name = manifest.TweakName;
    }
    if (typeof manifest.TweakAuthor === "string") {
        metadata.authors = [manifest.TweakAuthor];
    }
    if (typeof manifest.TweakVersion === "string") {
        metadata.version = manifest.TweakVersion;
    }
    if (manifest.TweakMetaFile) {
        const file = manifest.TweakMetaFile;
        if (await fs.existsFile(`META-INF/${file}`)) {
            const metadataContent = await fs.readFile(`META-INF/${file}`, "utf-8").then((s) => s.replace(/^\uFEFF/, "")).then(JSON.parse);
            if (metadataContent.id) {
                metadata.modid = metadataContent.id;
            }
            if (metadataContent.name) {
                metadata.name = metadataContent.name;
            }
            if (metadataContent.version) {
                metadata.version = metadataContent.version;
            }
            if (metadataContent.authors) {
                metadata.authors = metadataContent.authors;
            }
            if (metadataContent.description) {
                metadata.description = metadataContent.description;
            }
            if (metadataContent.url) {
                metadata.url = metadataContent.url;
            }
        }
    }
    return metadata;
}
exports.readForgeModManifest = readForgeModManifest;
/**
 * Read mod metadata from new toml metadata file.
 */
async function readForgeModToml(mod, manifest) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const fs = await system_1.resolveFileSystem(mod);
    const existed = await fs.existsFile("META-INF/mods.toml");
    const all = [];
    if (existed) {
        const str = await fs.readFile("META-INF/mods.toml", "utf-8");
        const root = toml_1.parse(str);
        if (root.mods instanceof Array) {
            for (const mod of root.mods) {
                const tomlMod = mod;
                const modObject = {
                    modid: (_a = tomlMod.modId) !== null && _a !== void 0 ? _a : "",
                    authors: (_c = (_b = tomlMod.authors) !== null && _b !== void 0 ? _b : root.authors) !== null && _c !== void 0 ? _c : "",
                    version: tomlMod.version === "${file.jarVersion}" && typeof (manifest === null || manifest === void 0 ? void 0 : manifest["Implementation-Version"]) === "string"
                        ? manifest === null || manifest === void 0 ? void 0 : manifest["Implementation-Version"] : tomlMod.version,
                    displayName: (_d = tomlMod.displayName) !== null && _d !== void 0 ? _d : "",
                    description: (_e = tomlMod.description) !== null && _e !== void 0 ? _e : "",
                    displayURL: (_g = (_f = tomlMod.displayURL) !== null && _f !== void 0 ? _f : root.displayURL) !== null && _g !== void 0 ? _g : "",
                    updateJSONURL: (_j = (_h = tomlMod.updateJSONURL) !== null && _h !== void 0 ? _h : root.updateJSONURL) !== null && _j !== void 0 ? _j : "",
                    dependencies: [],
                    logoFile: (_k = tomlMod.logoFile) !== null && _k !== void 0 ? _k : "",
                    credits: (_l = tomlMod.credits) !== null && _l !== void 0 ? _l : "",
                    loaderVersion: (_m = root.loaderVersion) !== null && _m !== void 0 ? _m : "",
                    modLoader: (_o = root.modLoader) !== null && _o !== void 0 ? _o : "",
                    issueTrackerURL: (_p = root.issueTrackerURL) !== null && _p !== void 0 ? _p : "",
                };
                all.push(modObject);
            }
        }
        if (typeof root.dependencies === "object") {
            for (const mod of all) {
                const dep = root.dependencies[mod.modid];
                if (dep) {
                    mod.dependencies = dep;
                }
            }
        }
    }
    return all;
}
exports.readForgeModToml = readForgeModToml;
/**
 * Use asm to scan all the class files of the mod. This might take long time to read.
 */
async function readForgeModAsm(mod, manifest = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const fs = await system_1.resolveFileSystem(mod);
    let corePluginClass;
    if (manifest) {
        if (typeof manifest.FMLCorePlugin === "string") {
            const clazz = manifest.FMLCorePlugin.replace(/\./g, "/");
            if (await fs.existsFile(clazz) || await fs.existsFile(`/${clazz}`)) {
                corePluginClass = clazz;
            }
        }
    }
    const result = {
        usedForgePackage: false,
        usedLegacyFMLPackage: false,
        usedMinecraftClientPackage: false,
        usedMinecraftPackage: false,
        modAnnotations: []
    };
    const guessing = {};
    await fs.walkFiles("/", async (f) => {
        if (!f.endsWith(".class")) {
            return;
        }
        const data = await fs.readFile(f);
        const visitor = new ModClassVisitor(result, guessing, corePluginClass);
        new asm_1.ClassReader(data).accept(visitor);
    });
    if (result.modAnnotations.length === 0 && guessing.modid && (result.usedForgePackage || result.usedLegacyFMLPackage)) {
        result.modAnnotations.push({
            modid: (_a = guessing.modid) !== null && _a !== void 0 ? _a : "",
            name: (_b = guessing.name) !== null && _b !== void 0 ? _b : "",
            version: (_c = guessing.version) !== null && _c !== void 0 ? _c : "",
            dependencies: (_d = guessing.dependencies) !== null && _d !== void 0 ? _d : "",
            useMetadata: (_e = guessing.useMetadata) !== null && _e !== void 0 ? _e : false,
            clientSideOnly: (_f = guessing.clientSideOnly) !== null && _f !== void 0 ? _f : false,
            serverSideOnly: (_g = guessing.serverSideOnly) !== null && _g !== void 0 ? _g : false,
            acceptedMinecraftVersions: (_h = guessing.acceptedMinecraftVersions) !== null && _h !== void 0 ? _h : "",
            acceptableRemoteVersions: (_j = guessing.acceptableRemoteVersions) !== null && _j !== void 0 ? _j : "",
            acceptableSaveVersions: (_k = guessing.acceptableSaveVersions) !== null && _k !== void 0 ? _k : "",
            modLanguage: (_l = guessing.modLanguage) !== null && _l !== void 0 ? _l : "java",
            modLanguageAdapter: (_m = guessing.modLanguageAdapter) !== null && _m !== void 0 ? _m : "",
            value: (_o = guessing.value) !== null && _o !== void 0 ? _o : "",
        });
    }
    return result;
}
exports.readForgeModAsm = readForgeModAsm;
/**
 * Read `mcmod.info`, `cccmod.info`, and `neimod.info` json file
 * @param mod The mod path or buffer or opened file system.
 */
async function readForgeModJson(mod) {
    const fs = await system_1.resolveFileSystem(mod);
    const all = [];
    function normalize(json) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const metadata = {
            modid: "",
            name: "",
            description: "",
            version: "",
            mcversion: "",
            url: "",
            updateUrl: "",
            updateJSON: "",
            authorList: [],
            credits: "",
            logoFile: "",
            screenshots: [],
            parent: "",
            useDependencyInformation: false,
            requiredMods: [],
            dependencies: [],
            dependants: [],
        };
        metadata.modid = (_a = json.modid) !== null && _a !== void 0 ? _a : metadata.modid;
        metadata.name = (_b = json.name) !== null && _b !== void 0 ? _b : metadata.name;
        metadata.description = (_c = json.description) !== null && _c !== void 0 ? _c : metadata.description;
        metadata.version = (_d = json.version) !== null && _d !== void 0 ? _d : metadata.version;
        metadata.mcversion = (_e = json.mcversion) !== null && _e !== void 0 ? _e : metadata.mcversion;
        metadata.url = (_f = json.url) !== null && _f !== void 0 ? _f : metadata.url;
        metadata.updateUrl = (_g = json.updateUrl) !== null && _g !== void 0 ? _g : metadata.updateUrl;
        metadata.updateJSON = (_h = json.updateJSON) !== null && _h !== void 0 ? _h : metadata.updateJSON;
        metadata.authorList = (_j = json.authorList) !== null && _j !== void 0 ? _j : metadata.authorList;
        metadata.credits = (_k = json.credits) !== null && _k !== void 0 ? _k : metadata.credits;
        metadata.logoFile = (_l = json.logoFile) !== null && _l !== void 0 ? _l : metadata.logoFile;
        metadata.screenshots = (_m = json.screenshots) !== null && _m !== void 0 ? _m : metadata.screenshots;
        metadata.parent = (_o = json.parent) !== null && _o !== void 0 ? _o : metadata.parent;
        metadata.useDependencyInformation = (_p = json.useDependencyInformation) !== null && _p !== void 0 ? _p : metadata.useDependencyInformation;
        metadata.requiredMods = (_q = json.requiredMods) !== null && _q !== void 0 ? _q : metadata.requiredMods;
        metadata.dependencies = (_r = json.dependencies) !== null && _r !== void 0 ? _r : metadata.dependencies;
        metadata.dependants = (_s = json.dependants) !== null && _s !== void 0 ? _s : metadata.dependants;
        return metadata;
    }
    function readJsonMetadata(json) {
        const modList = [];
        if (json instanceof Array) {
            modList.push(...json);
        }
        else if (json.modList instanceof Array) {
            modList.push(...json.modList);
        }
        else if (json.modid) {
            modList.push(json);
        }
        all.push(...modList.map(normalize));
    }
    if (await fs.existsFile("mcmod.info")) {
        try {
            const json = JSON.parse((await fs.readFile("mcmod.info", "utf-8")).replace(/^\uFEFF/, ""));
            readJsonMetadata(json);
        }
        catch (e) { }
    }
    else if (await fs.existsFile("cccmod.info")) {
        try {
            const text = (await fs.readFile("cccmod.info", "utf-8")).replace(/^\uFEFF/, "").replace(/\n\n/g, "\\n").replace(/\n/g, "");
            const json = JSON.parse(text);
            readJsonMetadata(json);
        }
        catch (e) { }
    }
    else if (await fs.existsFile("neimod.info")) {
        try {
            const text = (await fs.readFile("neimod.info", "utf-8")).replace(/^\uFEFF/, "").replace(/\n\n/g, "\\n").replace(/\n/g, "");
            const json = JSON.parse(text);
            readJsonMetadata(json);
        }
        catch (e) { }
    }
    return all;
}
exports.readForgeModJson = readForgeModJson;
/**
 * Read metadata of the input mod.
 *
 * This will scan the mcmod.info file, all class file for `@Mod` & coremod `DummyModContainer` class.
 * This will also scan the manifest file on `META-INF/MANIFEST.MF` for tweak mod.
 *
 * If the input is totally not a mod. It will throw {@link NonForgeModFileError}.
 *
 * @throws {@link NonForgeModFileError}
 * @param mod The mod path or data
 * @returns The mod metadata
 */
async function readForgeMod(mod) {
    const fs = await system_1.resolveFileSystem(mod);
    const jsons = await readForgeModJson(fs);
    const manifest = {};
    const manifestMetadata = await readForgeModManifest(fs, manifest);
    const tomls = await readForgeModToml(fs, manifest);
    const base = await readForgeModAsm(fs, manifest);
    if (jsons.length === 0 && (!manifestMetadata || !manifestMetadata.modid) && tomls.length === 0 && base.modAnnotations.length === 0) {
        throw new ForgeModParseFailedError(mod, base, manifest);
    }
    const result = {
        mcmodInfo: jsons,
        manifest: manifest,
        manifestMetadata: (manifestMetadata === null || manifestMetadata === void 0 ? void 0 : manifestMetadata.modid) ? manifestMetadata : undefined,
        modsToml: tomls,
        ...base,
    };
    return result;
}
exports.readForgeMod = readForgeMod;
class ForgeModParseFailedError extends Error {
    constructor(mod, asm, manifest) {
        super("Cannot find the mod metadata in the mod!");
        this.mod = mod;
        this.asm = asm;
        this.manifest = manifest;
    }
}
exports.ForgeModParseFailedError = ForgeModParseFailedError;
