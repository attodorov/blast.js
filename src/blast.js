/* Blast - JavaScript Two-Way databinding library
 * Copyright Angel Todorov (attodorov@gmail.com)
 * Licensed under BSD 
 */
"use strict";
(function (window, document) {
	var blast = window.blast = window.blast || {}, doc = document;
	var _arrextend = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"];
	blast.observable = function (val) {
		var current = val;
		var ret = function (retVal) {
			if (!undef(retVal) && retVal !== ret._val) {
				//notify subscribers
				ret.notify(false);
				current = retVal;
				ret.notify(true);
				return ret;
			}
			return current;
		};
		ret.notify = function (end, action) {
			for (var i = 0; i < ret.subs.length; i++) {
				ret.subs[i](current, !end ? true : false, action);
			}
		};
		ret.subs = [];
		ret._val = val;
		ret.__bo = true; //mark it as a Blast observable
		ret(val);
		return ret;
	};
	blast.observableArray = function (arr) {
		arr = arr || [];
		var i;
		var observableArr = blast.observable(arr);
		var _compilefn = function (fn) {
			return function () {
				observableArr.notify(false, fn);
				var ret = observableArr._val[fn].apply(observableArr._val, arguments);
				observableArr.notify(true, fn);
				return ret;
			};
		};
		for (i = 0; i < _arrextend.length; i++) {
			observableArr[_arrextend[i]] = _compilefn(_arrextend[i]);
		}
		return observableArr;
	};
	blast.link = function (elem, meta, data) { // DOM => observables
		var key = meta.key;
		if (data[key].__bo) {
			data[key].subs.push(function (val, beforeEvent) {
				if (!beforeEvent) {
					setval(elem, val);
				}
			});
		}
		elem.addEventListener(meta.event ? meta.event : "change", function () {
			var newVal = getval(elem);
			if (data[key].__bo) { // assume observable
				data[key](newVal);
			} else {
				data[key] = newVal;
			}
		}, false); //don't bubble
		if (undef(meta) || (meta && meta.init !== false)) {
			setval(elem, data[key].__bo ? data[key]() : data[key]); // init
		}
	};
	blast.linkAll = function (prop, meta, model) {
		var elems = elem(prop, meta.parent);
		for (var i = 0; i < elems.length; i++) {
			meta.key = prop;
			blast.link(elems[i], meta, model);
		}
	};
	blast.observe = function (data) { // data is a plain js object/array
		if (undef(data)) {
			return null;
		}
		if (Array.isArray(data)) {
			var observed = [];
			for (var i = 0; i < data.length; i++) {
				observed.push(observeObj(data[i]));
			}
			return observed;
		}
		return observeObj(data);
	};
	blast.bind = function (model, meta) { //two-way: HTML <=> Model
		var m = undef(meta) ? {} : meta;
		var addItem = function (parent, tmpl, meta, prepend) {
			var item = tmpl.cloneNode(true);
			if (prepend) {
				parent.insertBefore(item, parent.firstChild);
			} else {
				parent.appendChild(item);
			}
			meta.parent = item;
		};
		for (var p in model) {
			if (model.hasOwnProperty(p)) { //TODO: handle scope
				var prop = model[p];
				if (Array.isArray(prop) || (prop.__bo && Array.isArray(prop()))) { //also recurse
					var dom = elem(p)[0];//TODO elem() returning > 1
					var tmpl = (dom.firstElementChild || dom.children[0]).cloneNode(true);
					clear(dom);
					if (prop.__bo) { // listen for array notifications
						prop.subs.push(function (arr, before, action) {
							if (!before) { // transaction log, order, batch, etc. ? 
								switch (action) {
									case "push":
										addItem(dom, tmpl, m);
										blast.bind(arr[arr.length - 1], m);
										break;
									case "pop":
										dom.removeChild(dom.lastChild);
										break;
									case "shift":
										dom.removeChild(dom.firstChild);
										break;
									case "unshift":
										addItem(dom, tmpl, m, true);
										blast.bind(arr[0], m);
										break;
									case "splice":
										//TODO: check how many items have been added (by comparing prev.length to new.length) & do add
										break;
									case "sort":
										// rebind the whole array
										break;
									default:
										break;
								}
							}
						});
						prop = prop();
					}
					for (var i = 0; i < prop.length; i++) {
						addItem(dom, tmpl, m);
						blast.bind(prop[i], m);
					}
				} else {
					blast.linkAll(p, m, model);
				}
			}
		}
	};
	// convert model to plain js objects
	blast.json = function (model) {
		if (undef(model)) {
			return null;
		}
		if (Array.isArray(model)) {
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
		if (elem instanceof window.HTMLInputElement) {
			elem.value = val;
		} else {
			elem.innerHTML = val;
		}
	}
	function getval(elem) {
		if (elem instanceof window.HTMLInputElement) {
			return elem.value;
		}
		return elem.innerHTML; //TODO: parse inner content
	}
	function elem(prop, parent) {
		var root = parent ? parent : doc;
		return root.querySelectorAll("[data-bind=" + prop + "]");
	}
	function clear(elem) {
		while (elem.firstChild) {
			elem.removeChild(elem.firstChild);
		}
	}
	function undef(val) {
		return val === null || typeof (val) === "undefined";
	}
}) (window, document);
//Support for AMD (RequireJS)
if (typeof define === "function" && define.amd) {
    define( "blast", [], function () {
        return window.blast;
    });
}
// support for CommonJS (Node)
if (typeof module !== "undefined" && module.exports) {
	module.exports = window.blast; // works only if window is defined (JSDOM, etc.)
}