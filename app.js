const express = require("express");
const fs = require("fs");
var path = require('path');
const BeeModParser = require('bee-mod-parser');
const { parse } = require("path");
const { json } = require("express");
const multer = require('multer');

const app = express();

// """"VERY"""" BASIC AUTH  
function authentication(req, res, next) {
    var authheader = req.headers.authorization;
    // console.log(req.headers);

    if (!authheader) {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err)
    }

    var auth = new Buffer.from(authheader.split(' ')[1],
        'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];

    // BASIC AUTHORIZATION Settings
    if (user == 'chipibarijho' && pass == '#chipi8456#') {

        // If Authorized user
        next();
    } else {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
    }

}


const serverFilesInDirectory = fs.readdirSync('../mods');
const extension = '.jar'

const serverMods = serverFilesInDirectory.filter(function (mod) {
    return mod.indexOf(extension) !== -1;
});

// console.log(serverMods.length)
const parsedClientMods = []
async function test() {
    await Promise.all(serverMods.map(async mod => {
        const path = `../mods/${mod}`
        const forgeMetaData = await BeeModParser.readForgeMod(path);
        parsedClientMods.push(forgeMetaData)

    }))
}
async function compareModsList() {
    await test()

    const modsJsonFile = JSON.parse(fs.readFileSync("./mods.json", "utf-8"))
    if (modsJsonFile !== '') {

        // Getting the mods that are installed but not in mods.js
        const parsedIds = []
        const jsonIds = []
        parsedClientMods.forEach(parsedMod => {
            if (parsedMod.mcmodInfo != '') {
                parsedIds.push(parsedMod.mcmodInfo[0].modid)
            } else {
                parsedIds.push(parsedMod.modAnnotations[0].modid)
            }

        })
        modsJsonFile.forEach(json => {
            if (json.mcmodInfo != '') {
                jsonIds.push(json.mcmodInfo[0].modid)
            } else {
                jsonIds.push(json.modAnnotations[0].modid)
            }

        })

        const differenceIds = parsedIds.filter(x => !jsonIds.includes(x))

        const newMods = []
        // console.log(differenceIds)
        differenceIds.forEach(modMissing => {
            let result = parsedClientMods.filter(m => {
                if (m.mcmodInfo != '') {
                    // console.log(m)
                    return m.mcmodInfo[0].modid === modMissing
                }

            })
            newMods.push(result)
        })

        const json = modsJsonFile
        if (newMods != '') {
            json.push(...newMods[0])
            console.log('Json Updated')
            fs.writeFileSync('./mods.json', JSON.stringify(json, null, 4))
        }


    } else {
        let json = JSON.stringify(parsedClientMods, null, 4)
        // console.log(json)
        fs.writeFileSync('./mods.json', json);
    }

    // console.log(parsedClientMods.length)

}
compareModsList()

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'skins');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var imageUpload = multer({ storage: storage }).single('skins');
// app.use(authentication)

// First step is the authentication of the client
app.get('/mods', (req, res, next) => {
    const modsJsonFile = JSON.parse(fs.readFileSync("./mods.json", "utf-8"))
    res.send(modsJsonFile)

})
app.get('/settings', (req, res, next) => {
    const settings = JSON.parse(fs.readFileSync("./settings.json", "utf-8"))
    res.send(settings)

})

//Skins
app.get('/skins', (req, res, next) => {
    // console.log(req.params)
    res.send('skins')

})

app.get('/skins/textures/:id.png', (req, res, next) => {
    // console.log(req.params)
    res.sendFile(__dirname + `/skins/${req.params.id}.png`)

})
app.get('/skins/:id.json', (req, res, next) => {
    // console.log(req.params)
    res.sendFile(__dirname + `/skins/${req.params.id}.json`)

})

app.post('/skins', imageUpload, (req, res) => {
    // console.log(req.file, req.body.username)
    if (req.file != '') {
        let userSkin = {
            username: req.body.username,
            skin: req.file.originalname
        }

        let data = JSON.stringify(userSkin)
        fs.writeFileSync(`./skins/${req.body.username}.json`, data)
    }
    // res.json('/skins api')
})

app.get('/ops', (req, res, next) => {
    let rawdata = fs.readFileSync('../ops.json');
    let ops = JSON.parse(rawdata);
    res.json(ops)
})

app.get('/whitelist', (req, res, next) => {
    let rawdata = fs.readFileSync('../whitelist.json');
    let whitelist = JSON.parse(rawdata);
    res.json(whitelist)
})
app.get('/banned-players', (req, res, next) => {
    let rawdata = fs.readFileSync('../banned-players.json');
    let bannedPlayers = JSON.parse(rawdata);
    res.json(bannedPlayers)
})
// Server setup
app.listen((25580), () => {
    console.log("Server is Running ");
})