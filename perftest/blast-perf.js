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
/*
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
*/
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
					// compare to the previous one
					var lastRun = testRuns[testRuns.length - 1];
					if (lastRun.get("time") < time) {
						assert.fail(time, lastRun.get("time"), "Last test run's duration was significantly smaller than the current one. ");
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
		// now check the avg bind time for a record. Note that it's not possible to do that without manually putting statements in the blast code
		//expect(perf["blast.observe"].sum).to.be.lessThan(5000);
		// check how much binding 100000 rows took

		// fail if the maximum bind for a single record is larger than some value (this way we can detect if there is specific data that makes binding slow)
		// such as nested bindings, etc. ? (depending on your app logic)

	});
	// now lets look at something more interesting. Check how much this takes.
	/*
		<table>
			<tbody data-bind="bigdata">
				<tr>
					<td data-bind="prop1"></td>
					<td data-bind="prop2"></td>
					<td data-bind="prop3"></td>
				</tr>
			</tbody>
		</table>

		perfModel = {
			bigdata: bigData
		};
		blast.bind(perfModel);
	*/
	it("Should two-way bind to a model and render a HTML table for all rows in no more than 2 sec", function () {

		// YOU CAN'T MEASURE THIS with new Date().getTime() and so on. 

		// rendering shouldn't take more than XXX sec.

		// rendering for a single record shouldn't take more than ... 

		// why not use Benchmark.Js - well... you can't. Using that you can only measure how much the bind() tool for ALL records

	});

})
