"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeConfig = void 0;
var ForgeConfig;
(function (ForgeConfig) {
    /**
     * Convert a forge config to string
     */
    function stringify(config) {
        let content = "# Configuration file\n\n\n";
        const propIndent = "    ", arrIndent = "        ";
        Object.keys(config).forEach((cat) => {
            content += `${cat} {\n\n`;
            config[cat].properties.forEach((prop) => {
                if (prop.comment) {
                    const lines = prop.comment.split("\n");
                    for (const l of lines) {
                        content += `${propIndent}# ${l}\n`;
                    }
                }
                if (prop.value instanceof Array) {
                    content += `${propIndent}${prop.type}:${prop.name} <\n`;
                    prop.value.forEach((v) => content += `${arrIndent}${v}\n`);
                    content += `${propIndent}>\n`;
                }
                else {
                    content += `${propIndent}${prop.type}:${prop.name}=${prop.value}\n`;
                }
                content += "\n";
            });
            content += "}\n\n";
        });
        return content;
    }
    ForgeConfig.stringify = stringify;
    /**
     * Parse a forge config string into `Config` object
     * @param body The forge config string
     */
    function parse(body) {
        const lines = body.split("\n").map((s) => s.trim())
            .filter((s) => s.length !== 0);
        let category;
        let pendingCategory;
        const parseVal = (type, value) => {
            const map = {
                I: Number.parseInt,
                D: Number.parseFloat,
                S: (s) => s,
                B: (s) => s === "true",
            };
            const handler = map[type];
            return handler(value);
        };
        const config = {};
        let inlist = false;
        let comment;
        let last;
        const readProp = (type, line) => {
            line = line.substring(line.indexOf(":") + 1, line.length);
            const pair = line.split("=");
            if (pair.length === 0 || pair.length === 1) {
                let value;
                let name;
                if (line.endsWith(" <")) {
                    value = [];
                    name = line.substring(0, line.length - 2);
                    inlist = true;
                }
                else { }
                if (!category) {
                    throw {
                        type: "CorruptedForgeConfig",
                        reason: "MissingCategory",
                        line,
                    };
                }
                config[category].properties.push(last = { name, type, value, comment });
            }
            else {
                inlist = false;
                if (!category) {
                    throw {
                        type: "CorruptedForgeConfig",
                        reason: "MissingCategory",
                        line,
                    };
                }
                config[category].properties.push({ name: pair[0], value: parseVal(type, pair[1]), type, comment });
            }
            comment = undefined;
        };
        for (const line of lines) {
            if (inlist) {
                if (!last) {
                    throw {
                        type: "CorruptedForgeConfig",
                        reason: "CorruptedList",
                        line,
                    };
                }
                if (line === ">") {
                    inlist = false;
                }
                else if (line.endsWith(" >")) {
                    last.value.push(parseVal(last.type, line.substring(0, line.length - 2)));
                    inlist = false;
                }
                else {
                    last.value.push(parseVal(last.type, line));
                }
                continue;
            }
            switch (line.charAt(0)) {
                case "#":
                    if (!comment) {
                        comment = line.substring(1, line.length).trim();
                    }
                    else {
                        comment = comment.concat("\n", line.substring(1, line.length).trim());
                    }
                    break;
                case "I":
                case "D":
                case "S":
                case "B":
                    readProp(line.charAt(0), line);
                    break;
                case "<":
                    break;
                case "{":
                    if (pendingCategory) {
                        category = pendingCategory;
                        config[category] = { comment, properties: [] };
                        comment = undefined;
                    }
                    else {
                        throw {
                            type: "CorruptedForgeConfig",
                            reason: "MissingCategory",
                            line,
                        };
                    }
                    break;
                case "}":
                    category = undefined;
                    break;
                default:
                    if (!category) {
                        if (line.endsWith("{")) {
                            category = line.substring(0, line.length - 1).trim();
                            config[category] = { comment, properties: [] };
                            comment = undefined;
                        }
                        else {
                            pendingCategory = line;
                        }
                    }
                    else {
                        throw {
                            type: "CorruptedForgeConfig",
                            reason: "Duplicated",
                            line,
                        };
                    }
            }
        }
        return config;
    }
    ForgeConfig.parse = parse;
})(ForgeConfig = exports.ForgeConfig || (exports.ForgeConfig = {}));
