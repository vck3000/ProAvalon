const { join } = require("path");
// import { readdirSync } from "fs";

const path = join(__dirname, "cards");

readdirSync(path).forEach((fileName) => {
    if (fileName.endsWith(".js")) module.exports[fileName] = require(`./cards/${fileName}`);
});
