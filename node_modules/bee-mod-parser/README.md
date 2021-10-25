# Bee Mod Parser

A Node.js Package To Get Metadata Of Fabric/Forge/Liteloader Mods. Used By Bee Launcher.

Want To Contact Me?
<br>Discord: **Nishant1500#9195**
<br>You Can Also Mention Me In **Disussion Tab** Of The Repository :)

**PRs** Are Always Welcome :) And Why Dont You Send Me Your Project, ***Maybe i can also help***?!?

[![NPM Badge](https://nodei.co/npm/bee-mod-parser.png)](https://npmjs.com/package/bee-mod-parser)
<br>OH BOI THATS A LOT OF DOWNLOADS IN ONE DAY!!!! ***85 ARE U KIDDING ME?***

### Most Reported Errors :)
Got Lost In `await is only valid in async functions and the top level bodies of modules` Error?

Dont Worry :) I Can Help You With That

```js
async function funcName() {
    const BeeModParser = require('bee-mod-parser')
    // {Other Codes...}
}
funcName();
```

## Install

```sh
npm install bee-mod-parser
```

## Usage

```js
const BeeModParser = require('bee-mod-parser')

//{...}//
```

## API

### Fabric Mod Metadata

#### mod
Path Where The Fabric Mod Is Located

Type: `string`

#### Example

```js
const BeeModParser = require('bee-mod-parser')

const path = "mod" // Where The Mod Is Located.. | Example: "C:/Users/Nishant/AppData/Roaming/.minecraft/mods/A-Mod.jar"
const fabricMetaData = await BeeModParser.readFabricMod(path);

console.log(fabricMetaData);
// Console Output
// {id:"xxxxxx",name:"xxxx",.....}
```

### Forge Mod Metadata

#### mod
Path Where The Forge Mod Is Located

Type: `string`

#### Example

```js
const BeeModParser = require('bee-mod-parser')

const path = "mod" // Where The Mod Is Located.. | Example: "C:/Users/Nishant/AppData/Roaming/.minecraft/mods/A-Mod.jar"
const forgeMetaData = await BeeModParser.readForgeMod(path);

console.log(forgeMetaData);
```

### Liteloader Mod Metadata

#### mod
Path Where The Forge Mod Is Located

Type: `string`

#### Example

```js
const BeeModParser = require('bee-mod-parser')

const path = "mod" // Where The Mod Is Located.. | Example: "C:/Users/Nishant/AppData/Roaming/.minecraft/mods/A-Mod.jar"
const liteloaderMetaData = await BeeModParser.readLiteloaderMod(path);

console.log(liteloaderMetaData);
```
