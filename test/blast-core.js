/*
 * Mocha tests for Blast.JS
 * using Mocha, Chai, and JSDOM
 */
var jsdom = require("jsdom");
var assert = require("chai").assert;
var expect = require("chai").expect;
var should = require("chai").should();
var chai = require("chai");
chai.Assertion.includeStack = true;
var fs = require("fs");
var html = fs.readFileSync("test/template.html", "utf8");
jsdom.defaultDocumentFeatures = { 
	FetchExternalResources   : ["script"],
	ProcessExternalResources : ["script"],
	MutationEvents           : "2.0",
  	QuerySelector            : true
};
// load our sample and we'll test core functionality on it, no need to develop that stuff again
var window, doc, donefn, started = false, blast;
doc = jsdom.jsdom(html);
window = doc.createWindow();

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

var sampleData = [
	{ID: 1, Name: "Product 1", Description: "Lorem Ipsum"},
	{ID: 2, Name: "Product 2", Description: "Lorem Ipsum"},
	{ID: 3, Name: "Product 3", Description: "Lorem Ipsum"},
	{ID: 4, Name: "Product 4", Description: "Lorem Ipsum"}
];
// simulate events
function fireEvent (element, event) {
	if (doc.createEventObject) {
		var evt = doc.createEventObject();
		return element.fireEvent('on' + event, evt)
	}
	else {
		var evt = doc.createEvent("HTMLEvents");
		evt.initEvent(event, true, true );
		return !element.dispatchEvent(evt);
	}
}

describe("Observing a JSON array", function () {
	it("should be wrapped with observable functions", function () {
		var model = blast.observe(sampleData);
		expect(model[0].ID).to.be.a("function");
		expect(model[0].Name).to.be.a("function");
		expect(model[0].Description).to.be.a("function");

		expect(model[0].ID).to.have.a.property("__bo");
		expect(model[0].Name).to.have.a.property("__bo");
		expect(model[0].Description).to.have.a.property("__bo");
	})
})

describe("Evaluating observed value", function () {
	it("should evaluate to the correct underlying data value", function () {
		var model = blast.observe(sampleData);
		expect(model[0].ID()).to.be.equal(1);
		expect(model[0].Name()).to.be.equal("Product 1");
		expect(model[0].Description()).to.be.equal("Lorem Ipsum");
	})
})
describe("observable state after changing the value of a bound input field", function () {
	it("should be updated with the new input value", function () {
		var placeholder = doc.getElementById("placeholder");
		var nameModel = {
			firstName: blast.observable("Chuck")
		};
		placeholder.innerHTML = "<input data-bind='firstName' />";
		var input = placeholder.querySelector("input");
		blast.bind(nameModel);
		assert(input.value === "Chuck", "After binding, the value should be Chuck");
		input.value = "new name";
		fireEvent(input, "change")
		assert(input.value === "new name", "The input's new value is not equal to the expected one");
		// now check the bound obervable
		expect(nameModel.firstName()).to.be.equal("new name");
	})
})
