const express = require("express");
const fs = require("fs");
var path = require('path');
const BeeModParser = require('bee-mod-parser');
const { parse } = require("path");


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

const serverMods = serverFilesInDirectory.filter(function(mod){
    return mod.indexOf(extension) !== -1;
});
const parsedClientMods = []
async function test(){
    await Promise.all(serverMods.map(async mod =>{
        const path = `../mods/${mod}`
        const forgeMetaData = await BeeModParser.readForgeMod(path);
        parsedClientMods.push(forgeMetaData)
    }))
}


app.use(authentication)
 
// First step is the authentication of the client
app.get('/mods', (req, res, next) =>{
    async function compareModsList(){
        await test()
        res.json(parsedClientMods)
    }
    compareModsList()
})

app.get('/ops', (req, res, next) =>{
    let rawdata = fs.readFileSync('../ops.json');
    let ops = JSON.parse(rawdata);
    res.json(ops)
})

app.get('/whitelist', (req, res, next) =>{
    let rawdata = fs.readFileSync('../whitelist.json');
    let whitelist = JSON.parse(rawdata);
    res.json(whitelist)
})
app.get('/banned-players', (req, res, next) =>{
    let rawdata = fs.readFileSync('../banned-players.json');
    let bannedPlayers = JSON.parse(rawdata);
    res.json(bannedPlayers)
})
// Server setup
app.listen((25580), () => {
    console.log("Server is Running ");
})