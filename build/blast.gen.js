__init__();
'use strict';
(function (window, document) {
    __pushstack('anonymous');
    var __start = _getstart();
    var blast = window.blast = window.blast || {}, doc = document;
    var _arrextend = [
        'pop',
        'push',
        'reverse',
        'shift',
        'sort',
        'splice',
        'unshift'
    ];
    blast.observable = function (val) {
        __pushstack('blast.observable');
        var __start = _getstart();
        var current = val;
        var ret = function (retVal) {
            __pushstack('ret');
            var __start = _getstart();
            if (!undef(retVal) && retVal !== ret._val) {
                ret.notify(false);
                current = retVal;
                ret.notify(true);
                _putstat('ret', __start);
                __popstack();
                return ret;
            }
            _putstat('ret', __start);
            __popstack();
            return current;
        };
        ret.notify = function (end, action) {
            __pushstack('ret.notify');
            var __start = _getstart();
            for (var i = 0; i < ret.subs.length; i++) {
                ret.subs[i](current, !end ? true : false, action);
            }
            _putstat('ret.notify', __start);
            __popstack();
        };
        ret.subs = [];
        ret._val = val;
        ret.__bo = true;
        ret(val);
        _putstat('blast.observable', __start);
        __popstack();
        return ret;
    };
    blast.observableArray = function (arr) {
        __pushstack('blast.observableArray');
        var __start = _getstart();
        arr = arr || [];
        var i;
        var observableArr = blast.observable(arr);
        var _compilefn = function (fn) {
            __pushstack('_compilefn');
            var __start = _getstart();
            _putstat('_compilefn', __start);
            __popstack();
            return function () {
                __pushstack('anonymous');
                var __start = _getstart();
                observableArr.notify(false, fn);
                var ret = observableArr._val[fn].apply(observableArr._val, arguments);
                observableArr.notify(true, fn);
                _putstat('anonymous', __start);
                __popstack();
                return ret;
            };
        };
        for (i = 0; i < _arrextend.length; i++) {
            observableArr[_arrextend[i]] = _compilefn(_arrextend[i]);
        }
        _putstat('blast.observableArray', __start);
        __popstack();
        return observableArr;
    };
    blast.link = function (elem, meta, data) {
        __pushstack('blast.link');
        var __start = _getstart();
        var key = meta.key;
        if (data[key].__bo) {
            data[key].subs.push(function (val, beforeEvent) {
                __pushstack('anonymous');
                var __start = _getstart();
                if (!beforeEvent) {
                    setval(elem, val);
                }
                _putstat('anonymous', __start);
                __popstack();
            });
        }
        elem.addEventListener(meta.event ? meta.event : 'change', function () {
            __pushstack('anonymous');
            var __start = _getstart();
            var newVal = getval(elem);
            if (data[key].__bo) {
                data[key](newVal);
            } else {
                data[key] = newVal;
            }
            _putstat('anonymous', __start);
            __popstack();
        }, false);
        if (undef(meta) || meta && meta.init !== false) {
            setval(elem, data[key].__bo ? data[key]() : data[key]);
        }
        _putstat('blast.link', __start);
        __popstack();
    };
    blast.linkAll = function (prop, meta, model) {
        __pushstack('blast.linkAll');
        var __start = _getstart();
        var elems = elem(prop, meta.parent);
        for (var i = 0; i < elems.length; i++) {
            meta.key = prop;
            blast.link(elems[i], meta, model);
        }
        _putstat('blast.linkAll', __start);
        __popstack();
    };
    blast.observe = function (data) {
        __pushstack('blast.observe');
        var __start = _getstart();
        if (undef(data)) {
            _putstat('blast.observe', __start);
            __popstack();
            return null;
        }
        if (Array.isArray(data)) {
            var observed = [];
            for (var i = 0; i < data.length; i++) {
                observed.push(observeObj(data[i]));
            }
            _putstat('blast.observe', __start);
            __popstack();
            return observed;
        }
        _putstat('blast.observe', __start);
        __popstack();
        return observeObj(data);
    };
    blast.bind = function (model, meta) {
        __pushstack('blast.bind');
        var __start = _getstart();
        var m = undef(meta) ? {} : meta;
        var addItem = function (parent, tmpl, meta, prepend) {
            __pushstack('addItem');
            var __start = _getstart();
            var item = tmpl.cloneNode(true);
            if (prepend) {
                parent.insertBefore(item, parent.firstChild);
            } else {
                parent.appendChild(item);
            }
            meta.parent = item;
            _putstat('addItem', __start);
            __popstack();
        };
        for (var p in model) {
            if (model.hasOwnProperty(p)) {
                var prop = model[p];
                if (Array.isArray(prop) || prop.__bo && Array.isArray(prop())) {
                    var dom = elem(p)[0];
                    var tmpl = (dom.firstElementChild || dom.children[0]).cloneNode(true);
                    clear(dom);
                    if (prop.__bo) {
                        prop.subs.push(function (arr, before, action) {
                            __pushstack('anonymous');
                            var __start = _getstart();
                            if (!before) {
                                switch (action) {
                                case 'push':
                                    addItem(dom, tmpl, m);
                                    blast.bind(arr[arr.length - 1], m);
                                    break;
                                case 'pop':
                                    dom.removeChild(dom.lastChild);
                                    break;
                                case 'shift':
                                    dom.removeChild(dom.firstChild);
                                    break;
                                case 'unshift':
                                    addItem(dom, tmpl, m, true);
                                    blast.bind(arr[0], m);
                                    break;
                                case 'splice':
                                    break;
                                case 'sort':
                                    break;
                                default:
                                    break;
                                }
                            }
                            _putstat('anonymous', __start);
                            __popstack();
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
        _putstat('blast.bind', __start);
        __popstack();
    };
    blast.json = function (model) {
        __pushstack('blast.json');
        var __start = _getstart();
        if (undef(model)) {
            _putstat('blast.json', __start);
            __popstack();
            return null;
        }
        if (Array.isArray(model)) {
            var d = [];
            for (var i = 0; i < model.length; i++) {
                d.push(toObj(model[i]));
            }
            _putstat('blast.json', __start);
            __popstack();
            return d;
        }
        _putstat('blast.json', __start);
        __popstack();
        return toObj(model);
    };
    function observeObj(o) {
        __pushstack('observeObj');
        var __start = _getstart();
        var observed = {}, prop = null;
        for (prop in o) {
            if (o.hasOwnProperty(prop)) {
                observed[prop] = blast.observable(o[prop]);
            }
        }
        _putstat('observeObj', __start);
        __popstack();
        return observed;
    }
    function toObj(observable) {
        __pushstack('toObj');
        var __start = _getstart();
        var obj = {};
        for (var p in observable) {
            if (observable.hasOwnProperty(p)) {
                obj[p] = observable[p]();
            }
        }
        _putstat('toObj', __start);
        __popstack();
        return obj;
    }
    function setval(elem, val) {
        __pushstack('setval');
        var __start = _getstart();
        if (elem instanceof window.HTMLInputElement) {
            elem.value = val;
        } else {
            elem.innerHTML = val;
        }
        _putstat('setval', __start);
        __popstack();
    }
    function getval(elem) {
        __pushstack('getval');
        var __start = _getstart();
        if (elem instanceof window.HTMLInputElement) {
            _putstat('getval', __start);
            __popstack();
            return elem.value;
        }
        _putstat('getval', __start);
        __popstack();
        return elem.innerHTML;
    }
    function elem(prop, parent) {
        __pushstack('elem');
        var __start = _getstart();
        var root = parent ? parent : doc;
        _putstat('elem', __start);
        __popstack();
        return root.querySelectorAll('[data-bind=' + prop + ']');
    }
    function clear(elem) {
        __pushstack('clear');
        var __start = _getstart();
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
        _putstat('clear', __start);
        __popstack();
    }
    function undef(val) {
        __pushstack('undef');
        var __start = _getstart();
        _putstat('undef', __start);
        __popstack();
        return val === null || typeof val === 'undefined';
    }
    _putstat('anonymous', __start);
    __popstack();
}(window, document));
if (typeof define === 'function' && define.amd) {
    define('blast', [], function () {
        __pushstack('anonymous');
        var __start = _getstart();
        _putstat('anonymous', __start);
        __popstack();
        return window.blast;
    });
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.blast;
}