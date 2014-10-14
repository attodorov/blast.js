/*
 * Mocha tests for Blast.JS
 * using Mocha, Chai, and JSDOM
 */
var jsdom = require("jsdom");
var assert = require("chai").assert;
var expect = require("chai").expect;
var should = require("chai").should();
var chai = require("chai");
var requirejs = require("requirejs");
chai.config.includeStack = true;

requirejs.config({
        nodeRequire: require,
        baseUrl: "./src/"
});

//var fs = require("fs");
//var html = fs.readFileSync("test/template.html", "utf8");
jsdom.defaultDocumentFeatures = { 
	FetchExternalResources   : ["script"],
	ProcessExternalResources : ["script"],
	MutationEvents           : "2.0",
  	QuerySelector            : true
};
// load our sample and we'll test core functionality on it, no need to develop that stuff again
var window, doc, donefn, started = false, blast;
doc = jsdom.jsdom("<!DOCTYPE html><html><head></head><body></body></html>");
window = doc.parentWindow;
GLOBAL.window = window;
GLOBAL.document = doc;
blast = requirejs("blast");
window.addEventListener("load", function () {
	if (donefn) {
		donefn(); // start tests
	}
	started = true;
	//blast = window.blast;
});
before(function (done) {
	donefn = done;
	if (started) { // window.load has fired before Mocha's "before"
		done(); // start it immediatelly
	}
});
beforeEach(function () {
	// setup testing environment (placeholder)
	doc.body.innerHTML = "<div id='placeholder'></div>";
});

var sampleData = [
	{ID: 1, Name: "Product 1", Description: "Lorem Ipsum 1"},
	{ID: 2, Name: "Product 2", Description: "Lorem Ipsum 2"},
	{ID: 3, Name: "Product 3", Description: "Lorem Ipsum 3"},
	{ID: 4, Name: "Product 4", Description: "Lorem Ipsum 4"}
];
var sampleObservableData = [
	{ID: blast.observable(1), Name: blast.observable("Product 1"), Description: blast.observable("Lorem Ipsum 1")},
	{ID: blast.observable(2), Name: blast.observable("Product 2"), Description: blast.observable("Lorem Ipsum 2")},
	{ID: blast.observable(3), Name: blast.observable("Product 3"), Description: blast.observable("Lorem Ipsum 3")},
	{ID: blast.observable(4), Name: blast.observable("Product 4"), Description: blast.observable("Lorem Ipsum 4")}
];

describe("Make sure performance is good", function () {
	it("should be able to execute more than x ops per sec", function () {

	})
})