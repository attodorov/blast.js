/* Blast - JavaScript Two-Way databinding library
 * Copyright Angel Todorov (attodorov@gmail.com)
 * Licensed under BSD 
 */
(function (window, document) {
	var blast = window.blast = window.blast || {};
	blast.observable = function (val) {
		var current = val;
		var ret = function (retVal) {
			if (retVal && retVal !== this._val) {
				//notify subscribers
				for (var i = 0; i < ret.subs.length; i++) {
					ret.subs[i](retVal, ret._val);
				}
				current = retVal;
				return this;
			} else {
				return current;
			}
		};
		ret.subs = [];
		ret._val = val;
		ret.__bo = true; //mark it as a Blast observable
		ret(val);
		return ret;
	};
	blast.observableArray = function (arr) { // not implemented
	};
	blast.link = function (elem, meta, data) {
		var key = meta.key;
		if (data[key].__bo) {
			data[key].subs.push(function (val, oldVal) {
				setval(elem, val);
			});
		}
		elem["on" + (meta.event ? meta.event : "change")] = function () {
			var newVal = null;
				newVal = getval(elem);
			if (data[key].__bo) { // assume observable
				data[key](newVal);
			} else {
				data[key] = newVal;
			}
		}
	};
	blast.observe = function (data) {
		if (undef(data)) {
			return null;
		}
		if (data instanceof Array) { //array
			observed = [];
			for (var i = 0; i < data.length; i++) {
				observed.push(observeObj(data[i]));
			}
			return observed;
		} else {
			return observeObj(data);
		}
	};
	// convert model to plain js objects
	blast.json = function (model) {
		if (undef(model)) {
			return null;
		}
		if (model instanceof Array) {
			var d = [];
			for (var i = 0; i < model.length; i++) {
				d.push(toObj(model[i]));
			}
			return d;
		}
		return toObj(model);
	};
	function observeObj(o) {
		var observed = {}, prop = null;
		for (prop in o) {
			if (o.hasOwnProperty(prop)) {
				observed[prop] = blast.observable(o[prop]);
			}
		}
		return observed;
	}
	function toObj(observable) {
		var obj = {};
		for (var p in observable) {
			if (observable.hasOwnProperty(p)) {
				obj[p] = observable[p]();
			}
		}
		return obj;
	}
	function setval(elem, val) {
		if (elem.hasOwnProperty("value")) {
			elem.value = val;
		} else {
			elem.innerHTML = val;
		}
	}
	function getval(elem) {
		if (elem.hasOwnProperty("value")) {
			return elem.value;
		} else {
			return elem.innerHTML; //TODO: parse inner content 
		}
	}
	function undef(val) {
		return val === null || typeof (val) === "undefined";
	}
}) (window, document);