// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else      
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        "use strict";
        var O = Object(this);
        var len = parseInt(O.length, 10) || 0;
        if (len === 0) { return false; }
        var n = parseInt(arguments[1], 10) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement) { // FIXME NaN !== NaN
                return true;
            }
            k++;
        }
        return false;
    };
}
if (!("classList" in document.documentElement) && window.Element) {
	(function () {
		var prototype = Array.prototype,
		indexOf = prototype.indexOf,
		slice = prototype.slice,
		push = prototype.push,
		splice = prototype.splice,
		join = prototype.join;

		function DOMTokenList(elm) {
			this._element = elm;
			if (elm.className == this._classCache) { return; }
			this._classCache = elm.className;
			if (!this._classCache) { return; }

			var classes = this._classCache.replace(/^\s+|\s+$/g,'').split(/\s+/);
			for (var i = 0; i < classes.length; i++) {
				push.call(this, classes[i]);
			}
		}
		window.DOMTokenList = DOMTokenList;

		function setToClassName(el, classes) {
			el.className = classes.join(" ");
		}

		DOMTokenList.prototype = {
			add: function(token) {
				if (this.contains(token)) { return; }
				push.call(this, token);
				setToClassName(this._element, slice.call(this, 0));
			},
			contains: function(token) {
				return (indexOf.call(this, token) != -1);
			},
			item: function(index) {
				return this[index] || null;
			},
			remove: function(token) {
				var i = indexOf.call(this, token);
				if (i == -1) { return; }
				splice.call(this, i, 1);
				setToClassName(this._element, slice.call(this, 0));
			},
			toString: function() {
				return join.call(this, " ");
			},
			toggle: function(token) {
				if (indexOf.call(this, token) == -1) {
					this.add(token);
					return true;
				} else {
					this.remove(token);
					return false;
				}
			}
		};

		function defineElementGetter (obj, prop, getter) {
			if (Object.defineProperty) {
				Object.defineProperty(obj, prop, {
					get: getter
				});
			} else {
				obj.__defineGetter__(prop, getter);
			}
		}

		defineElementGetter(Element.prototype, "classList", function() {
			return new DOMTokenList(this);
		});
	})();
}

;(function() {
	if (!window.SVGElement) { return; }
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	if (!("classList" in svg)) {
		var d = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "classList");
		Object.defineProperty(SVGElement.prototype, "classList", d);
	}
})();

;(function() {
	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod("add");
		createMethod("remove");
	}

	testElement.classList.toggle("c3", false);

	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};
	}

	testElement = null;
})();
if (!Object.assign) {
	Object.defineProperty(Object, "assign", {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function(target) {
			if (target === undefined || target === null) {
				throw new TypeError("Cannot convert first argument to object");
			}

			var to = Object(target);
			for (var i = 1; i < arguments.length; i++) {
				var nextSource = arguments[i];
				if (nextSource === undefined || nextSource === null) {
					continue;
				}
				nextSource = Object(nextSource);

				var keysArray = Object.keys(Object(nextSource));
				for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
					var nextKey = keysArray[nextIndex];
					var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
					if (desc !== undefined && desc.enumerable) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
			return to;
		}
	});
}
/*
	Any copyright is dedicated to the Public Domain.
	http://creativecommons.org/publicdomain/zero/1.0/
*/

(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define([ "exports" ], factory);
	} else if (typeof exports === "object") {
		factory(exports);
	} else {
		factory(root);
	}
}(this, function (exports) {
	if (exports.Promise) { return; }

	/**
	 * @class A promise - value to be resolved in the future.
	 * Implements the "Promises/A+ 1.1" specification.
	 * @param {function} [resolver]
	 */
	var Promise = function(resolver) {
		this._state = 0; /* 0 = pending, 1 = fulfilled, 2 = rejected */
		this._value = null; /* fulfillment / rejection value */
		this._timeout = null;

		this._cb = {
			fulfilled: [],
			rejected: []
		}

		this._thenPromises = []; /* promises returned by then() */

		if (resolver) { this._invokeResolver(resolver); }
	}

	Promise.resolve = function(value) {
		return new this(function(resolve, reject) {
			resolve(value);
		});
	}

	Promise.reject = function(reason) {
		return new this(function(resolve, reject) {
			reject(reason);
		});
	}

	/**
	 * Wait for all these promises to complete. One failed => this fails too.
	 */
	Promise.all = Promise.when = function(all) {
		return new this(function(resolve, reject) {
			var counter = 0;
			var results = [];

			all.forEach(function(promise, index) {
				counter++;
				promise.then(function(result) {
					results[index] = result;
					counter--;
					if (!counter) { resolve(results); }
				}, function(reason) {
					counter = 1/0;
					reject(reason);
				});
			});
		});
	}

	Promise.race = function(all) {
		return new this(function(resolve, reject) {
			all.forEach(function(promise) {
				promise.then(resolve, reject);
			});
		});
	}

	/**
	 * @param {function} onFulfilled To be called once this promise gets fulfilled
	 * @param {function} onRejected To be called once this promise gets rejected
	 * @returns {Promise}
	 */
	Promise.prototype.then = function(onFulfilled, onRejected) {
		this._cb.fulfilled.push(onFulfilled);
		this._cb.rejected.push(onRejected);

		var thenPromise = new Promise();

		this._thenPromises.push(thenPromise);

		if (this._state > 0) { this._schedule(); }

		/* 2.2.7. then must return a promise. */
		return thenPromise;
	}

	/**
	 * Fulfill this promise with a given value
	 * @param {any} value
	 */
	Promise.prototype.fulfill = function(value) {
		if (this._state != 0) { return this; }

		this._state = 1;
		this._value = value;

		if (this._thenPromises.length) { this._schedule(); }

		return this;
	}

	/**
	 * Reject this promise with a given value
	 * @param {any} value
	 */
	Promise.prototype.reject = function(value) {
		if (this._state != 0) { return this; }

		this._state = 2;
		this._value = value;

		if (this._thenPromises.length) { this._schedule(); }

		return this;
	}

	Promise.prototype.resolve = function(x) {
		/* 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason. */
		if (x == this) {
			this.reject(new TypeError("Promise resolved by its own instance"));
			return;
		}

		/* 2.3.2. If x is a promise, adopt its state */
		if (x instanceof this.constructor) {
			x.chain(this);
			return;
		}

		/* 2.3.3. Otherwise, if x is an object or function,  */
		if (x !== null && (typeof(x) == "object" || typeof(x) == "function")) {
			try {
				var then = x.then;
			} catch (e) {
				/* 2.3.3.2. If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason. */
				this.reject(e);
				return;
			}

			if (typeof(then) == "function") {
				/* 2.3.3.3. If then is a function, call it */
				var called = false;
				var resolvePromise = function(y) {
					/* 2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y). */
					if (called) { return; }
					called = true;
					this.resolve(y);
				}
				var rejectPromise = function(r) {
					/* 2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r. */
					if (called) { return; }
					called = true;
					this.reject(r);
				}

				try {
					then.call(x, resolvePromise.bind(this), rejectPromise.bind(this));
				} catch (e) { /* 2.3.3.3.4. If calling then throws an exception e, */
					/* 2.3.3.3.4.1. If resolvePromise or rejectPromise have been called, ignore it. */
					if (called) { return; }
					/* 2.3.3.3.4.2. Otherwise, reject promise with e as the reason. */
					this.reject(e);
				}
			} else {
				/* 2.3.3.4 If then is not a function, fulfill promise with x. */
				this.fulfill(x);
			}
			return;
		}

		/* 2.3.4. If x is not an object or function, fulfill promise with x. */
		this.fulfill(x);
	}

	/**
	 * Pass this promise's resolved value to another promise
	 * @param {Promise} promise
	 */
	Promise.prototype.chain = function(promise) {
		var resolve = function(value) {
			promise.resolve(value);
		}
		var reject = function(value) {
			promise.reject(value);
		}
		return this.then(resolve, reject);
	}

	/**
	 * @param {function} onRejected To be called once this promise gets rejected
	 * @returns {Promise}
	 */
	Promise.prototype["catch"] = function(onRejected) {
		return this.then(null, onRejected);
	}

	Promise.prototype._schedule = function() {
		if (this._timeout) { return; } /* resolution already scheduled */
		this._timeout = setTimeout(this._processQueue.bind(this), 0);
	}

	Promise.prototype._processQueue = function() {
		this._timeout = null;

		while (this._thenPromises.length) {
			var onFulfilled = this._cb.fulfilled.shift();
			var onRejected = this._cb.rejected.shift();
			this._executeCallback(this._state == 1 ? onFulfilled : onRejected);
		}
	}

	Promise.prototype._executeCallback = function(cb) {
		var thenPromise = this._thenPromises.shift();

		if (typeof(cb) != "function") {
			if (this._state == 1) {
				/* 2.2.7.3. If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value. */
				thenPromise.fulfill(this._value);
			} else {
				/* 2.2.7.4. If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason. */
				thenPromise.reject(this._value);
			}
			return;
		}

		try {
			var x = cb(this._value);
			/* 2.2.7.1. If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x). */
			thenPromise.resolve(x);
		} catch (e) {
			/* 2.2.7.2. If either onFulfilled or onRejected throws an exception, promise2 must be rejected with the thrown exception as the reason. */
			thenPromise.reject(e);
		}
	}

	Promise.prototype._invokeResolver = function(resolver) {
		try {
			resolver(this.resolve.bind(this), this.reject.bind(this));
		} catch (e) {
			this.reject(e);
		}
	}

	exports.Promise = Promise;
}));
