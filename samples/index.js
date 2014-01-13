//Node.JS example (Blast.JS & JSDOM)
var jsdom = require("jsdom");
var doc = jsdom.jsdom("<!DOCTYPE html><html><head></head><body></body></html>");
GLOBAL.window = doc.createWindow();
GLOBAL.document = doc;
var blast = require("../src/blast");
console.log(blast);