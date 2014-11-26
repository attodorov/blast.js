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
var Parse = require("parse").Parse;
//chai.config.includeStack = true;

requirejs.config({
        nodeRequire: require,
        baseUrl: "./build/"
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
blast = requirejs("blast.gen");

window.addEventListener("load", function () {
	if (donefn) {
		donefn(); // start tests
	}
	started = true;
	blast = window.blast;
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

// generate some synthetic data
var sampleData = [];
for (var i = 0; i < 10000; i++) {
	sampleData.push({
		id: i,
		name: "Product " + i,
		description: "Lorem Ipsum " + i,
		creationdate: new Date(),
		isvalid: true
	});
}

describe("Make sure performance is good", function () {
	this.timeout(50000);
	it("should be able to observe 10000 rows in no less time than the previous run", function (done) {

		var model = blast.observe(sampleData);

		perf = window._p;
		Parse.initialize("8xnXEIVSc0KBeeDoEHNXKFPwnqQIVHfewNTNKOIO", "vbk4WiXQDzzBF28UQFeTn6tmxsaM73U9i6qDzqAz");
		var TestRun = Parse.Object.extend("TestRun");
		var query = new Parse.Query(TestRun);
		var time = perf["blast.observe"].sum;

		var newTestRun = new TestRun();
		newTestRun.set("key", "observe_100000_rows");
		newTestRun.set("time", time);

		query.find({
			success: function (testRuns) {
				if (!testRuns || testRuns.length === 0) {
					newTestRun.save(null, {
						success: function (run) {
							// pass the test
							done();
						}
					});
				} else {
					// compare to the average of the previous one
					var lastRun = testRuns[testRuns.length - 1];
					if (lastRun.get("time") + 0.2 * lastRun.get("time") < time) {
						assert.ok(time <= lastRun.get("time") + 0.2 * lastRun.get("time"), "Last test run's duration was significantly smaller than the current one. ");
					} else {
						newTestRun.save(null, {
							success: function (run) {
								done();
							},
							error: function (run, error) {
								console.log("Could not save object");
								assert.fail();
							}
						});
					}
					// you can also say, if the last 3 runs... or if the last 5 runs are CONSISTENLY FASTER.
				}
			}
		});
	});
})
