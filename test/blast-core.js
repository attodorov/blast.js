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
//chai.config.includeStack = true;

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
	it("should evaluate to the correct underlying data value - arrays", function () {
		var model = blast.observe(sampleData);
		expect(model[0].ID()).to.be.equal(1);
		expect(model[0].Name()).to.be.equal("Product 1");
		expect(model[0].Description()).to.be.equal("Lorem Ipsum 1");
	})
	it("should evaluate to the correct underlying data value - primitives", function () {
		var model = blast.observe({Name: "Angel"});
		expect(model.Name()).to.be.equal("Angel");
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
describe("two-way databinding: plain array <-> HTML Table", function () {
	var productsModel = {
		products: sampleData
	};
	doc.body.innerHTML = "<table><tbody data-bind='products'><tr><td data-bind='Name'></td><td data-bind='Description'></td></tr></tbody></table>";
	blast.bind(productsModel);
	var table = doc.body.querySelector("table");
	var rows = table.querySelectorAll("tr");
	it("should have 4 table row TRs rendered", function () {
		var trcount = table.querySelectorAll("tr").length;
		assert(trcount === 4, "The table rows must be 4");
	})
	it("the first row's TDs should read Product 1 and Lorem Ipsum 1", function () {
		var tds = rows[0].querySelectorAll("td");
		assert(tds[0].innerHTML === "Product 1", "First td text should be equal to Product 1");
		assert(tds[1].innerHTML === "Lorem Ipsum 1", "Second td text should be equal to Lorem Ipsum 1");
	})
	it("the last row's TDs should read Product 4 and Lorem Ipsum 4", function () {
		var tds = rows[rows.length - 1].querySelectorAll("td");
		assert(tds[0].innerHTML === "Product 4", "First td text should be equal to Product 4");
		assert(tds[1].innerHTML === "Lorem Ipsum 4", "Second td text should be equal to Lorem Ipsum 4");
	});
})
describe("two-way databinding: initial observable array <=> HTML Table", function () {
	var productsModel = {
		products: sampleObservableData
	};
	doc.body.innerHTML = "<table><tbody data-bind='products'><tr><td data-bind='Name'></td><td data-bind='Description'></td></tr></tbody></table>";
	blast.bind(productsModel);
	var table = doc.body.querySelector("table");
	var rows = table.querySelectorAll("tr");
	it("should have 4 table row TRs rendered", function () {
		var trcount = table.querySelectorAll("tr").length;
		assert(trcount === 4, "The table rows must be 4");
	})
})
describe("Observable model to plain JSON", function () {
	var json = blast.json(sampleObservableData);
	it("Should have 4 array rows in the result", function () {
		expect(json.length).to.be.equal(4);
	})
	it("Should have plain values in the resulting output, not observables", function () {
		expect(json[0].Name).to.not.be.a("function");
		expect(json[0].ID).to.not.be.a("function");
		expect(json[0].Description).to.not.be.a("function");
	})
	it("Should have '1', 'Product 1', and 'Lorem Ipsum 1' in the first row", function () {
		expect(json[0].ID).to.be.equal(1);
		expect(json[0].Name).to.be.equal("Product 1");
		expect(json[0].Description).to.be.equal("Lorem Ipsum 1");
	})
	it("Should evaluate to the same object, once a plain object is converted back to a javascript object (Plain primitives)", function () {
		var myObservablePlain = {name: blast.observable("Angel")};
		var jsonObjectPlain = blast.json(myObservablePlain);
		expect(jsonObjectPlain).to.include.keys("name");
		expect(jsonObjectPlain.name).to.be.equal("Angel");
	})
	it("Should evaluate to the same object, once a plain object is converted back to a javascript object", function () {
		var myObservable = blast.observe({name: "Angel"});
		var jsonObject = blast.json(myObservable);
		expect(jsonObject).to.include.keys("name");
		expect(jsonObject.name).to.be.equal("Angel");
	})
})
