/** 
 * @license 
 * Simples JavaScript Library v0.2.0
 * http://simples.eightsquarestudio.com/
 * Copyright (c) 2009 - 2012, Thomas Cowell
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Wed Jan 4 13:09:14 2012 +0000
 */
(function( window, document ) {

// Save a reference to some core methods
var toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	indexOf = Array.prototype.indexOf,
	trim = String.prototype.trim,
	UNDEF,
	WIN = window,
	DOC = document,
	RCAPITALISE = /\b(\w)(\w+)\b/g,
	/** @private */
	fcapitalise = function( all, first, rest ){
		return first.toUpperCase() + rest.toLowerCase();
	},
	FIRST_SPACES = /^\s*/,
	LAST_SPACES = /\s*$/,
	DOMLOADED = "DOMContentLoaded",
	READYSTATE = "onreadystatechange",
	SCRIPT = "script",
	OPACITY = "opacity",
	TOP = "top",
	LEFT = "left",
	COMPLETE = "complete",
	// The ready event handler
	DOMContentLoaded,
	// Has the ready events already been bound?
	readyBound = false,
	// The functions to execute on DOM ready
	readyList = [];
/**
 * @description used to instantiate the Simples object
 * @param {String|Element} selector element is used by object and string is used to select Element(s), see Simples.Selector for more information
 * @param {Element} context element used to provide context
 **/
function Simples( selector, context ) {
	return new Simples.fn.init( selector, context );
}      

/**
 * @description used to test the Constructor / Class of an object
 * @param {Object} the object to test
 * @param {String} the class name to test
 * @param {Boolean} if you don't want to force the capitalisation of the className
 **/
Simples.isConstructor = function( obj, className, mustCapitalise ){
	if( obj !== null && obj !== UNDEF ){
		return toString.call( obj ) === "[object "+( mustCapitalise ? className.replace(RCAPITALISE,fcapitalise) : className )+"]";
	}
	return false;
};
/**
 * @description used to test the Constructor / Class of an object
 * @param {Object} the object to test
 **/
Simples.getConstructor = function( obj ){
	if( obj !== null && obj !== UNDEF ){
		return toString.call( obj ).replace("[object ","").replace("]","");
	}
	return false;
};

/**
 * @description used to merge objects onto the first specfied object
 * @param {Object} target native javascript object to be merged
 * @param {Object|Array} obj1, obj2.... native javascript object or array to be merged onto first
 **/
Simples.merge = function(first /* obj1, obj2..... */ ) {
    // if only 1 argument is passed in assume Simples is the target
    var target = (arguments.length === 1 && !(this === WIN || this === DOC)) ? this: Simples.isConstructor( first, "Object" ) ? first : {};
    // set i to value based on whether there are more than 1 arguments
    var i = arguments.length > 1 ? 1: 0;
    // Loop over arguments
    for (var l = arguments.length; i < l; i++) {
        // if object apply directly to target with same keys
        var klass = Simples.getConstructor( arguments[i] );
        if ( klass === "Object" ) {
            for (var key in arguments[i]) {
                if (hasOwn.call(arguments[i], key)) {
                    target[key] = arguments[i][key];
                }
            }
        } else if ( klass === "Array" ) {
            // if array apply directly to target with numerical keys
            push.apply(target, arguments[i]);
        }
    }

    return target;
};

Simples.merge( /** @lends Simples */ {
	/**
	 * @description used to add functionality to the Simples instance object
	 * @param {Object|String} addMethods list of names of functions and the function in a opbject, when 2 arguments provided the first should be the name of the function and the function to be added.
	 */
	extend : function( addMethods ){
		// Detect whether addMethods is an object to extend onto subClass
		var klass = Simples.getConstructor( addMethods );
		if( klass === "Object" ){
			for (var key in addMethods) {
		        if ( hasOwn.call( addMethods, key ) ) {
		            Simples.fn[key] = addMethods[key];
		        }
		    }
		} else if( klass === "String" && typeof arguments[1] === "function" ){
			Simples.fn[ arguments[0] ]= arguments[1];
		}
	},
	/**
	 * @description used to coerce a NodeList, HTMLElementCollection or Object into Array
	 * @param {NodeList|HTMLElementCollection|Object} object to be coerced
	 * @param {Array|Object} output object to have coerced object added to
	 */
	makeArray : function( array, results ) {
		results = results || [];
		push.apply( results, slice.call( array || [], 0 ) );
		return results;
	},
	/**
	 * @description used to check an object to see whether it is empty
	 * @param {Object} obj object to check whether is empty
	 */
	isEmptyObject : function( obj ) {
		for ( var name in obj ) { return false; }
		return true;
	},
	/**
	 * @description a value to indicate whether the browser has been triggered as ready
	 */
	isReady : false,
	/**
	 * @description used to add functions to browser ready queue and are triggered when DOMContentLoaded has been fired or latest window.onload
	 * @param {Function} callback the function to be fired when ready and or fired if already ready
	 */
	ready: function( callback ) {
		// Attach the listeners
		Simples.bindReady();
		
		// If the DOM is already ready
		if ( Simples.isReady ) {
			// Execute the function immediately
			callback.call( DOC, Simples.Event( 'ready' ) );

		// Otherwise, remember the function for later
		} else if ( readyList ) {
			// Add the function to the wait list
			readyList.push( callback );
		}
	},
	/** @private Handle when the DOM is ready */
	readyHandler : function() {
		// Make sure that the DOM is not already loaded
		if ( !Simples.isReady ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !DOC.body ) {
				return WIN.setTimeout( Simples.readyHandler, 13 );
			}

			// Remember that the DOM is ready
			Simples.isReady = true;

			// If there are functions bound, to execute
			if ( readyList ) {
				// Execute all of them
				var fn, i = 0;
				while ( (fn = readyList[ i++ ]) ) {
					fn.call( DOC, Simples );
				}

				// Reset the list of functions
				readyList = null;
			}
		}
	},
	/** @private To setup the event listeners for the ready event */
	bindReady : function(){
		if ( readyBound ) { return; }

		readyBound = true;

		// Catch cases where $(DOC).ready() is called after the
		// browser event has already occurred.
		if ( DOC.readyState === COMPLETE ) {
			return Simples.readyHandler();
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( DOC.addEventListener ) {
			// Use the handy event callback
			DOC.addEventListener( DOMLOADED, DOMContentLoaded, false );

			// A fallback to WIN.onload, that will always work
			WIN.addEventListener( "load", Simples.readyHandler, false );

		// If IE event model is used
		} else if ( DOC.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			DOC.attachEvent( READYSTATE, DOMContentLoaded);

			// A fallback to WIN.onload, that will always work
			WIN.attachEvent( "onload", Simples.readyHandler );

			// If IE and not a frame
			// continually check to see if the DOC is ready
			var toplevel = false;

			try {
				toplevel = WIN.frameElement === null || WIN.frameElement === UNDEF;
			} catch(e) {}

			if ( DOC.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},
	/**
	 * @description used to set the context on a function when the returned function is executed
	 * @param {Object} context object to use as the execution context
	 * @param {Function} func the function you want to call with the given context
	 */
	setContext : function( context, func ){
		return function(){
			return func.apply( context, arguments );
		};
	},
	/**
	 * @description Use native String.trim function wherever possible, Otherwise use our own trimming functionality
	 * @param {String} text String to trim
	 */
	trim : function( text ) {
		text = text === null || text === UNDEF ? "" : text;
		return trim ? trim.call( text ) : text.toString().replace( FIRST_SPACES, "" ).replace( LAST_SPACES, "" );
	},
	/**
	 * @description an empty function to use as noop function
	 */
	noop : function(){}
});

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	/** @ignore */
	Simples.makeArray = function( array, results ) {
		array = array || [];
		var i = 0,
			ret = results || [];

		if( Simples.isConstructor(array,"Array") ){
			push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

// Cleanup functions for the DOC ready method
/** @private */
if ( DOC.addEventListener ) {
	/** @private */
	DOMContentLoaded = function() {
		DOC.removeEventListener( DOMLOADED, DOMContentLoaded, false );
		Simples.readyHandler();
	};

} else if ( DOC.attachEvent ) {
	/** @private */
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( DOC.readyState === COMPLETE ) {
			DOC.detachEvent( READYSTATE, DOMContentLoaded );
			Simples.readyHandler();
		}
	};
} 

/** @private The DOM ready check for Internet Explorer */
function doScrollCheck() {
	if ( Simples.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		DOC.documentElement.doScroll(LEFT);
	} catch(e) {
		WIN.setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	Simples.readyHandler();
}

/**
 * @namespace Simples.fn
 * @description the instance of a Simples object functions / instance methods
 */
Simples.fn = Simples.prototype = {
	/**  @ignore */	 
	constructor : Simples,
	/**
	 * @constructs
	 * @description to initialize the Simples constructor
	 * @param {String|Element} selector Query String to find in the DOM and add to Simples instance or the Element use as the selected object
	 * @param {Object} context The document or element used to do the query on 
	 * @returns {Simples} the simples onject with the results of the selector
	 */
	init : function( selector, context ){

		// Handle $(""), $(null), or $(UNDEF)
		if ( !selector ){
			return this;
		} else if( selector.selector !== UNDEF ){
			return selector;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType || ( selector.document && selector.document.nodeType ) ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}
		
		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context ) {
			this.context = DOC;
			this[0] = DOC.body;
			this.selector = "body";
			this.length = 1;
			return this;
		}

		var klass = Simples.getConstructor( selector );
		if( klass === "String" ){
			this.context = context;
			this.selector = selector;
		
			Simples.Selector( selector, context, this );

		} else if( klass === "HTMLCollection" || klass === "NodeList" || ( klass === "Array" && context === true ) ){

			Simples.makeArray( selector, this );
		} else {
			Simples.makeArray( selector, this );
			this.filter(function(){ return !!this.nodeType || !!this.document; });
		}
		return this;		
	},
	/**
	 * @name Simples.fn.length
	 * @description The count of items on the Simples object 
	 */
	length : 0,
	/**
	 * @name Simples.fn.selector	
	 * @description The selector used to create the Simples object
	 */
	selector : "",
	/**
	 * @name Simples.fn.version	
	 * @description The version of the Simples library
	 */
	version : '0.2.0',
	/**
	 * @name Simples.fn.each
	 * @function
	 * @description To loop over each item in the Simples object
	 * @param {Function} callback The function to call with each item, this is current item, arguments[ item, index, object ]
	 */
	each : function( callback ){
		var i=0,l=this.length;
		while(i<l){
			callback.call( this[i], this[i], i++, this );
		}
		return this;
	},
	/**
	 * @name Simples.fn.filter
	 * @function
	 * @description To filter the selected elements on the Simples object 
	 * @param {Function} testFn The function to call with each item, this is current item, arguments[ item, index, object ], need to return true from callback to retain element all other return values will remove the element
	 */
	filter : function( testFn ){
		var i = 0,c = 0,l = this.length;
		while( i<l ){
			if( testFn.call( this[c], this[c], i, this ) !== true ){ 
				this.splice( c--, 1 );
			}
			c++; i++;
		}
		return this;
	},
	/**
	 * @name Simples.fn.find
	 * @function
	 * @description used to find elements off of the elements currently on the Simples object 
	 * @param {String} selector Selector string to find elements
	 */
	find: function( selector ){ 
		var results = Simples(), i=0,l=this.length;
		while(i<l){
			Simples.Selector( selector, this[i++], results );
		}
		return results;
	},
	/**
	 * @name Simples.fn.add
	 * @function
	 * @description used to add more elements to the current Simples object
	 * @param {Elements} elems An array or Simples object of elements to concatenate to the current simples Object
	 */
	add : function( elems ){
		Simples.makeArray( Simples( elems ), this );
		return this;
	},
	/**
	 * @name Simples.fn.makeArray
	 * @function
	 * @description convert the current Simples object into an Array
	 */	
	makeArray : function(){
		return Simples.makeArray( this );
	},
	// For internal use only.
	// Behaves like an Array's method, not like a Simples method. For hooking up to Sizzle.
	/** @private */
	push: push,
	/** @private */
	sort: [].sort,
	/** @private */
	splice: [].splice
};      

Simples.fn.init.prototype = Simples.fn;
// Inside closure to prevent any collisions or leaks
(function( Simples, DOC ){

var root = DOC.documentElement, div = DOC.createElement("div"), script = DOC.createElement(SCRIPT), id = SCRIPT + new Date().getTime();

div.style.display = "none";
div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

var all = div.getElementsByTagName("*"), a = div.getElementsByTagName("a")[0];

// Can't get basic test support
if ( !all || !all.length || !a ) {
	return;
}
var fragment = DOC.createDocumentFragment(), testDiv = DOC.createElement("div");
testDiv.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";
fragment.appendChild( testDiv.firstChild );

// Technique from Juriy Zaytsev
// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
var eventSupported = function( eventName ) { 
	var el = DOC.createElement("div"); 
	eventName = "on" + eventName; 

	var isSupported = (eventName in el); 
	if ( !isSupported ) { 
		el.setAttribute(eventName, "return;"); 
		isSupported = typeof el[eventName] === "function"; 
	} 
	el = null; 

	return isSupported; 
};

Simples.merge( /** @lends Simples */ {
	support : { 
		// to determine whether querySelector is avaliable
		useQuerySelector : typeof DOC.querySelectorAll === "function",
		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See jQuery #5145
		opacity : /^0.55$/.test( a.style.opacity ),
		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)		
		cssFloat: !!a.style.cssFloat,
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,
		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: div.getElementsByTagName("input")[0].value === "on",
		// WebKit doesn't clone checked state correctly in fragments   
		checkClone : fragment.cloneNode(true).cloneNode(true).lastChild.checked, 
		// Event support
		submitBubbles : eventSupported("submit"),
		changeBubbles : eventSupported("change"),
		// standard setup
		scriptEval: false, 
		// standard setup
		noCloneEvent: true,
		// Box model support
		isBoxModel: null
	},
	// Use of Simples.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	/**
	 * @description takes a navigator.userAgent and returns a usable rendition of it 
	 * @params {String} navigator.userAgent
	 * @returns {Object} i.e. { browser: msie|opera|webkit|mozilla, version: 1 }
	 */
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
			/(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
			/(msie) ([\w.]+)/.exec( ua ) ||
			!/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},
	browser : {}
}); 

script.type = "text/javascript";
try {
	script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
} catch(e) {}

root.insertBefore( script, root.firstChild );

// Make sure that the execution of code works by injecting a script
// tag with appendChild/createTextNode
// (IE doesn't support this, fails, and uses .text instead)
if ( WIN[ id ] ) {
	Simples.support.scriptEval = true;
	delete WIN[ id ];
}

root.removeChild( script );

if ( div.attachEvent && div.fireEvent ) {
	div.attachEvent("onclick", function click() {
		// Cloning a node shouldn't copy over any
		// bound event handlers (IE does this)
		Simples.support.noCloneEvent = false;
		div.detachEvent("onclick", click);
	});
	div.cloneNode(true).fireEvent("onclick");
}

var browserMatch = Simples.uaMatch( navigator.userAgent );
if ( browserMatch.browser ) {
	Simples.browser[ browserMatch.browser ] = true;
	Simples.browser.version = browserMatch.version;
}

Simples.ready(function(){
	var div = DOC.createElement("div");
	div.style.width = div.style.paddingLeft = "1px";

	DOC.body.appendChild( div );
	Simples.support.isBoxModel = div.offsetWidth === 2;
	DOC.body.removeChild( div ).style.display = 'none';
	div = null;	
});
// nulling out support varaibles as finished
root = div = script = id = testDiv = null;

})( Simples, document );
/*
    http://www.JSON.org/json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {

        var IS_JSON = /^[\],:{}\s]*$/,
            AT_CHAR = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
            RIGHT_SQUARE = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            EMPTY_CHAR = /(?:^|:|,)(?:\s*\[)+/g;

        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if ( IS_JSON.test( text.replace(AT_CHAR, '@').replace(RIGHT_SQUARE, ']').replace(EMPTY_CHAR, '') ) ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = ( new Function('return (' + text + ');') )();

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ? walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
var accessID = 'simples'+ new Date().getTime(),
	// The following elements throw uncatchable exceptions if you
	// attempt to add data properties to them.
	noData = {
		"embed": true,
		"object": true,
		"applet": true
	},
	/** @private */
	canDoData = function( elem ){
		return elem && elem.nodeName && !( elem == WIN || noData[ elem.nodeName.toLowerCase() ] );
	},
	/** @private */
	removeHTML5Data = function( elem, key ){
		
		var data = elem.dataset;
		
		if( data && data[ key ] ){
			delete elem.dataset[ key ];
		} else if( !data ){
			Simples.attr( elem, "data-" + key, null );
		}
	},
	/** @private */
	readHTML5Data = function( elem, key, original ){
		
		var data = elem.dataset;
		
		if( key ){
			var val = data ? data[ key ] : Simples.attr( elem, "data-" + key );
			return ( val == null || val == "" ) ? UNDEF : val;
		} else {
			if (!data) {
				data = {};
				var attrs = elem.attributes, i = attrs ? attrs.length : 0;
				while (i) {
					var attr = attrs[ --i ];
					if (attr.name.indexOf('data-') === 0) {
						data[attr.name.substr(5)] = attr.value;
					}
				}
			} else {
				var newData = {};
				for( var name in data ){
					newData[ name ] = data[ name ];
				}
				data = newData;
			}
			return Simples.merge( data, original || {} );
		}
	};

Simples.merge( /** @lends Simples */ {
	/**
	 * @description for the provided element you can save data to the elements dataset where a simple string or read data off of the element
	 * @param {Element} elem the element to read and manipulate dataset
	 * @param {String} key the name of the dataset to work with
	 * @param {All} value the value to write to the dataset, where value is undefined will read, where value is null will remove the key and data
	 * @returns {Object|Null|All} returns dataset object for read where no key, returns value where read and null for eveything else
	 */
	data : function( elem, key, value ){
		if ( canDoData( elem ) && ( key === UNDEF || typeof key === "string" ) ) {
			var data = !elem[ accessID ] ? elem[ accessID ] = {} : elem[ accessID ];

			if( key && value !== UNDEF ){
				// To remove the existing data-* attribute as well as the data value
				removeHTML5Data( elem, key );
				if( value !== null ){
					data[ key ] = value;
				} else {
					delete data[ key ];
				}      
			} else if( value === UNDEF ){
				if( !key ){
					return Simples.merge( data, readHTML5Data( elem, null, data ) );
				} else {
					var val = data[ key ];
					return typeof val === "undefined" ? readHTML5Data( elem, key ) : val;
				}
			}
		}
		return null;
	},
	/**
	 * @description for the provided element you can save data to the elements dataset where a simple string or read data off of the element
	 * @param {Element} elem the element to clean all data off of the children
	 * @param {Boolean} andSelf whether to include the provided element in with its children in the cleaning process
	 */
	cleanData : function( elem, andSelf ){
		// Remove element nodes and prevent memory leaks
		var canClean = canDoData( elem ),
			elems = canClean ? Simples.makeArray( elem.getElementsByTagName("*") ) : [];

		if( canClean && andSelf !== false ){
			elems.push( elem );
		}
		var i=elems.length;
		while( i ){
			// decrement to ensure correct array position
			i--;
			if ( elems[ i ].nodeType === 1 ) {
				// Clean up the element expando
				try {
					delete elems[ i ][ accessID ];
				} catch( e ) {
					// IE has trouble directly removing the expando
					// but it's ok with using removeAttribute
					if ( elems[ i ].removeAttribute ) {
						elems[ i ].removeAttribute( accessID );
					}
				}
			}
		}
	}
});

Simples.extend( /** @lends Simples.fn */ {
	/**
	 * Simples( '*' ).data: for the elements on the Simples object you can save data to the elements dataset where a simple string or read data off of the element, Simples.data for more information
	 * @param {String} key the name of the dataset to work with
	 * @param {All} value the value to write to the dataset
	 * @returns {Simples|All} returns Simples object for write and delete and the value for read
	 */	
	data : function( key, value ){   
		if( typeof key === "string" ){
			if( value !== UNDEF ){
				var l=this.length;
				while( l ){
					Simples.data( this[--l], key, value );
				}
			} else {
				return this[0] ? Simples.data( this[0], key ) : null;
			}
		}
		return this;
	}
});

// ======= AJAX ========== //
// borrowed from jQuery
/** @private */
var ACCEPTS = {
    xml: "application/xml, text/xml",
    html: "text/html",
	script: "text/javascript, application/javascript",
    json: "application/json, text/javascript",
    text: "text/plain",
    _default: "*/*"
},
TYPE_JSON = "json",
FILE = "file:",
GET = "GET",
XML = "xml",
// REGEXP USED IN THIS FILE
LAST_AMP = /&$/,
PARSEERROR = "parsererror",
// count of active ajax requests
ActiveAjaxRequests = 0,
/** @private method used by Simples.params to build data for request */
formatData = function(name, value) {

    var str = "";

    if (typeof name === "string") {
		var klass = Simples.getConstructor( value );
		if ( klass === "Function" ) {

            str = formatData(name, value());
        } else if ( klass === "Object" ) {
            var arr = [];

            for (var key in value) {

                var result = formatData(name + "[" + key + "]", value[key]);
                if (result) {
                    arr.push(result);
                }
            }

            str = arr.join('&');
        } else if ( klass === "Array" ) {
            str = formatData(name, value.join(','));
        } else if( value != null ){
            str = ( encodeURIComponent(name) + '=' + encodeURIComponent(value) );
		}
    }
    return str;
},
/** @private method to determine the success of the HTTP response */
httpSuccess = function(xhr) {
    try {
        // If no server status is provided, and we're actually
        // requesting a local file, then it was successful
        return !xhr.status && location.protocol == FILE ||

        // Any status in the 200 range is good
        (xhr.status >= 200 && xhr.status < 300) ||

        // Successful if the document has not been modified
        xhr.status == 304 ||

        // Safari returns an empty status if the file has not been modified
        navigator.userAgent.indexOf("Safari") >= 0 && typeof xhr.status == "undefined";
    } catch(e) {}

    // If checking the status failed, then assume that the request failed too
    return false;
},
/** @private method for httpData parsing is from jQuery 1.4 */
httpData = function(xhr, type, dataFilter) {

    var ct = xhr.getResponseHeader("content-type") || "",
    xml = type === XML || !type && ct.indexOf(XML) >= 0,
    data = xml ? xhr.responseXML: xhr.responseText;

    if (xml && data.documentElement.nodeName === PARSEERROR) {
        throw PARSEERROR;
    }

    if (typeof dataFilter === "function") {
        data = dataFilter(data, type);
    }

    // The filter can actually parse the response
    if (typeof data === "string") {
        // Get the JavaScript object, if JSON is used.
        if (type === TYPE_JSON || !type && ct.indexOf(TYPE_JSON) >= 0) {
            // Make sure the incoming data is actual JSON
            // Now using http://json.org/json2.js so don't need to add any logic
            data = JSON.parse(data);
            // If the type is SCRIPT, eval it in global context
        } else if (type === SCRIPT || !type && ct.indexOf("javascript") >= 0) {

            eval.call(WIN, data);
        }
    }

    return data;
};
// public methods
Simples.merge( /** @lends Simples */ {
	/**
	 * @namespace Simples.ajaxDefaults
	 * @description default behaviour for all ajax requests
	 */
	ajaxDefaults : /** @lends Simples.ajaxDefaults */ {
	    // Functions to call when the request fails, succeeds,
	    // or completes (either fail or succeed)
		/** 
		 * @description function to execute request is made to server ( xhrObject )
		 */	
		beforeSend : Simples.noop,
		/**
		 * @description function to execute when complete arguments are ( xhrObject, 'complete' )
		 */
	    complete: Simples.noop,
		/**
		 * @description function to execute when complete arguments are ( xhrObject, 'error' || 'pareseerror' )
		 */	
	    error: Simples.noop,
		/**
		 * @description function to execute when complete arguments are ( data, 'success', xhrObject )
		 */	
	    success: Simples.noop,
		/**
		 * @description The data type that'll be returned from the server the default is simply to determine what data was returned from the and act accordingly. -- xml: "application/xml, text/xml", html: "text/html", json: "application/json, text/javascript", text: "text/plain", _default: "*%2F*"
		 */
	    dataType: TYPE_JSON,
		/**
		 * @description boolean value of whether you want the request to be asynchronous or blocking
		 */
	    async: true,
		/**
		 * @description the HTTP verb type of request GET, POST, PUT, DELETE
		 */		
	    type: GET,
		/**
		 * @description the time to allow the request to be open before a timeout is triggered
		 */
	    timeout: 5000,
		/**
		 * @description helper to return the correct XHR object for your platform
		 */
		xhr: WIN.XMLHttpRequest && (WIN.location.protocol !== FILE || !WIN.ActiveXObject) ?
			function() {
				return new WIN.XMLHttpRequest();
			} :
			function() {
				try {
					return new WIN.ActiveXObject("Microsoft.XMLHTTP");
				} catch(e) {}
			},
		/**
		 * data: data to pass to the server
		 */
	    data: null,
		/**
		 * Simples.ajaxDefaults.context: context in which the callback is to be executed
		 */
		context : WIN
	},
	/**
	 * @description used to send an ajax requests
	 * @param url {String}
	 * @param options {Object} the options to use specified for each individual request see Simples.ajaxDefaults for description of options
	 */	
    ajax: function(url, options) {

	    // Load the options object with defaults, if no
	    // values were provided by the user
	    if ( typeof url !== "string" ) {
	        throw new Error('A URL must be provided.');
	    }

	    options = Simples.merge({}, Simples.ajaxDefaults, options);
		var type = options.type.toUpperCase(); 

	    // How long to wait before considering the request to be a timeout
	    // Create the request object
	    var xhr = options.xhr();
	
	    if ( options.data ) {
            options.data = Simples.params( options.data );
        }

	    if (type === 'POST') {
	        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    } else if( type === GET){
			url = ( url + ( url.indexOf('?') > 0 ? '&' : '?' ) + options.data );
		}

	    // Open the asynchronous POST request
	    xhr.open( type, url, options.async );

	    // Keep track of when the request has been succesfully completed
	    var requestDone = false;

	    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

	    xhr.setRequestHeader("Accept", ACCEPTS[ options.dataType ] || ACCEPTS._default );
		// up ajax Counter
	    ActiveAjaxRequests++;
	    // Watch for when the state of the document gets updated
	    function onreadystatechange() {
	        // Wait until the data is fully loaded,
	        // and make sure that the request hasn't already timed out
	        if (xhr.readyState == 4 && !requestDone) {
	            // clear poll interval
	            if (ival) {
	                clearInterval(ival);
	                ival = null;
	            }
	            // clearTimeout( TIMEOUT_ID );
	            // Check to see if the request was successful
	            if (httpSuccess(xhr)) {

	                // Execute the success callback with the data returned from the server
	                var data;
	                try {
	                    data = httpData(xhr, options.dataType);
	                } catch(e) {
	                    options.error.call( options.context, xhr, PARSEERROR);
	                }

	                options.success.call( options.context, data, 'success', xhr);

	                // Otherwise, an error occurred, so execute the error callback
	            } else {
	                options.error.call( options.context, xhr, 'error');
	            }
	            // Call the completion callback
	            options.complete.call( options.context, xhr, 'complete' );

	            ActiveAjaxRequests--;
	            // Clean up after ourselves, to avoid memory leaks
	            xhr = null;
	        }
	    }
        // to enable headers etc to be added to request
        options.beforeSend( xhr );

	    // Setup async ajax call
	    if (options.async) {
	        // don't attach the handler to the request, just poll it instead
	        var ival = setInterval(onreadystatechange, 13);
	        // Initalize a callback which will fire 5 seconds from now, cancelling
	        // the request (if it has not already occurred).
	        setTimeout(function() {
	            requestDone = true;
	        },
	        options.timeout);
	    }

	    // Establish the connection to the server
		// Send the data
		try {
			xhr.send( (type !== GET && s.data) || null );
		} catch( sendError ) {
			onreadystatechange();
		}
	    // non-async requests
	    if (!options.async) {
	        onreadystatechange();
	    }

	},
	/**
	 * @description used to get scripts from a server
	 * @param src {String} the source to point to for the request
	 * @param callback {Function} called when the script is finished loading
	 */
	scriptLoader : function( src, callback ){

		var script = DOC.createElement(SCRIPT),
			head = DOC.getElementsByTagName("head")[0] || DOC.documentElement;
		
	    if (script.readyState) {
			/** @private */
	        script.onreadystatechange = function() {
	            if (script.readyState === "loaded" || script.readyState === "complete") {
	                script.onreadystatechange = null;
	                ( ( typeof callback === "function" ) ? callback : Simples.noop ).call( this, src, this );
					this.parentNode.removeChild( this );
	            }
	        };
	    } else {
			/** @private */
	        script.onload = function() {
	            ( ( typeof callback === "function" ) ? callback : Simples.noop ).call( this, src, this );
				this.parentNode.removeChild( this );
	        };
		}

	    script.type = "text/javascript";
	    script.async = true;
	    script.src = src;

	    head.appendChild(script);
	
	    // cleanup memory
	    script = null;
	},
	/**
	 * @description used to update the global default settings, see Simples.ajaxDefaults description
	 */
    ajaxSettings: function(opts) {
	    Simples.ajaxDefaults = Simples.merge(Simples.ajaxDefaults, opts);
	},
	/**
	 * @description used to format data into a transmittable format takes either one argument of an object of array of objects or 2 arguments of strings
	 * @param {Object|Array|String} name : value OR [{name:'',value:''}] OR "name" 
	 * @param {String} value 
	 */
    params: function(obj,value) {

	    if( arguments.length === 1 ){ 
			var arr = [],
				klass = Simples.getConstructor( obj );
		    if ( klass === "Object" ) {
		        for (var key in obj) {

		            arr[ arr.length ] = formatData( key, obj[key] );
				}
		    } else if ( klass === "Array" ) {
		        for (var i = 0, l = obj.length; i < l; i++) {

		            if ( Simples.isConstructor( obj[i], "Object" ) ) {

		                arr[ arr.length ] = formatData( obj[i].name, obj[i].value );
		            }
		        }                        
			}
			return arr.join('&');
	    } else if( arguments.length === 2 ) {
			return formatData( arguments[0], arguments[1] );
		}
	}
});
// Constants
var SINGLE_TAG = /<(\w+)\s?\/?>/,
	// TAG_STRIP = /\b[\.|\#\|\[].+/g, 
	// TAG_STRIP = /\b(\.|\#|\[)|(\=?<!(name))(.)*/, /(?:\w+)\b((\.|\#|\[)|(\=?>!(name)))(.)*/, /(?:\w+)\b[\.|\#|\[]{1}.*/g,
	FIRST_ID = /\s#/,
	// ATTR_NAME_IS = /\[name\=([^\]]+)\]/,
	// Is it a simple selector
	COMPLEX_TAG = /^<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>(.*)<\/\1>/i,
	SPACE_WITH_BOUNDARY = /\b\s+/g,
	COMMA_WITH_BOUNDARY = /\s?\,\s?/g,
	QUERY_SELECTOR = Simples.support.useQuerySelector,
	/** @private */
	getElements = function(selector, context) {

	    context = context || DOC;
	    var tag = selector.substring(1),
	    elems,
	    nodes;

	    if (selector.indexOf('#') === 0) {
	        // Native function
	        var id = (context && context.nodeType === 9 ? context: DOC).getElementById(tag);
	        // test to make sure id is the own specified, because of name being read as id in some browsers
	        return id && id.id === tag ? [id] : [];

	    } else if (selector.indexOf('.') === 0) {
	        if (typeof context.getElementsByClassName === "function" ) {
	            // Native function
				return Simples.makeArray( context.getElementsByClassName(tag) );
	        } else {
	            // For IE which doesn't support getElementsByClassName
				elems = Simples.makeArray( context.getElementsByTagName('*') );
				nodes = [];
	            // Loop over elements to test for correct class
	            for (var i = 0, l = elems.length; i < l; i++) {
	                // Detect whether this element has the class specified
	                if ( Simples.className( elems[i], tag ) ) {
	                    nodes.push(elems[i]);
	                }
	            }
	            return nodes;
	        }
	    } else if (selector.indexOf('[name=') === 0) {
	        var name = selector.substring(6).replace(/\].*/, "");
	        context = context && context.nodeType === 9 ? context: DOC;
	        if (context.getElementsByName) {
	            return Simples.makeArray( context.getElementsByName(name) );
	        } else {
	            // For IE which doesn't support getElementsByClassName
	            elems = context.getElementsByName('*');
	            nodes = [];
	            // Loop over elements to test for correct class
	            for (var m = 0, n = elems.length; m < n; m++) {
	                // Detect whether this element has the class specified
	                if ((" " + (elems[m].name || elems[m].getAttribute("name")) + " ").indexOf(name) > -1) {
	                    nodes.push(elems[m]);
	                }
	            }
	            return nodes;
	        }
	    } else {
	        // assume that if not id or class must be tag
	        return Simples.makeArray( context.getElementsByTagName(selector) );
	    }
	},
	/** @private */
	createDOM = function( selector, results ){

		results.context = DOC;

		if( COMPLEX_TAG.test( selector ) ){
            results.selector = "<"+COMPLEX_TAG.exec( selector )[1]+">";

			var div = DOC.createElement('div');
            div.innerHTML = selector;
            Simples.makeArray( div.childNodes, results );

        } else if( SINGLE_TAG.test( selector ) ) {
            var tag = SINGLE_TAG.exec( selector );

			results.selector = tag[0];
            results.push( DOC.createElement(tag[1]) );
		}

		return results;
	};

/**
 * @description used to create or select Elements selector based on .class #id and [name=name]
 * @param {String|Element} selector element is used by object and string is used to select Element(s), based on className, id and name and where the querySelector is available using querySelectorAll
 * @param {Element} context element used to provide context
 * @param {Object|Array} results optional object to return selected Elements
 */
Simples.Selector = function(selector, context, results) {
    results = results || [];
	results.selector = selector;
	results.context = context || DOC;

    if (typeof(selector) === "string") {
        // check selector if structured to create element
		if( selector.indexOf('<') > -1 && selector.indexOf('>') > 0 ){
			return createDOM( selector, results );
        } else if ( QUERY_SELECTOR ) {
            return Simples.makeArray( (context || DOC).querySelectorAll(selector), results );
        } else {
	        // if it is a multi select split and short cut the process
	        if (COMMA_WITH_BOUNDARY.test(selector)) {
	            var get = selector.split(COMMA_WITH_BOUNDARY);

	            for (var x = 0, y = get.length; x < y; x++) {
					Simples.makeArray( Simples.Selector(get[x], context), results );
	            }
	            return results;
	        }
            // clean up selector
            // selector = selector.replace(TAG_STRIP, "");
            // get last id in selector
            var index = selector.lastIndexOf(FIRST_ID);
            selector = selector.substring(index > 0 ? index: 0);
            // allow another document to be used for context where getting by id
            results.context = context = (selector.indexOf('#') === 0 || selector.indexOf('[name=') === 0) ? (context && context.nodeType === 9 ? context: DOC) : (context || DOC);
            var split = selector.split(SPACE_WITH_BOUNDARY);

            for (var i = 0, l = split.length; i < l; i++) {
                if (context.length > 0) {

                    var result = [];
                    for (var m = 0, n = context.length; m < n; m++) {

                        result = result.concat(getElements(split[i], context[m]));
                    }
                    context = result;
                } else {
                    context = getElements(split[i], context);
                }
            }
            results.push.apply(results, context);
        }
    }
    return results;
};
var STRIP_TAB_NEW_LINE = /\n|\t|\r/g,
	SINGLE_ARG_READ = /^outer$|^inner$|^text$/,
	IMMUTABLE_ATTR = /(button|input)/i,
	SPECIAL_URL = /href|src|style/,
	VALID_ELEMENTS = /^<([A-Z][A-Z0-9]*)([^>]*)>(.*)<\/\1>/i, 
	SPLIT_ATTRIBUTE = /([A-Z]*\s*=\s*['|"]?[A-Z0-9:;#\s]*['|"]?)/i,
	TAG_LIST = {'UL':'LI','DL':'DT','TR':'TD'},
	QUOTE_MATCHER = /(["']?)/g,
	/**
	 * @private - Borrowed from XUI project
	 * Wraps the HTML in a TAG, Tag is optional. If the html starts with a Tag, it will wrap the context in that tag.
	 */
	wrapHelper = function(xhtml, el) {
		// insert into documentFragment to ensure insert occurs without messing up order
		if( xhtml.toString === UNDEF || xhtml.toString().indexOf("[object ") > -1 || ( xhtml && !!xhtml.nodeType ) ){
			if( xhtml && xhtml.length !== UNDEF ){
				var docFrag = DOC.createDocumentFragment();
				xhtml = Simples.makeArray( xhtml, 0 );
				for(var p=0,r=xhtml.length;p<r;p++){
					docFrag.appendChild( xhtml[p] );
				}
				xhtml = docFrag;
			}
		
			return xhtml;
		}
	    var attributes = {}, element, x, i = 0, attr, node, attrList, result, tag;
	    xhtml = "" + xhtml;
	    if ( VALID_ELEMENTS.test(xhtml) ) {
	        result = VALID_ELEMENTS.exec(xhtml);
			tag = result[1];

	        // if the node has any attributes, convert to object
	        if (result[2] !== "") {
	            attrList = result[2].split( SPLIT_ATTRIBUTE );

	            for (var l=attrList.length; i < l; i++) {
	                attr = Simples.trim( attrList[i] );
	                if (attr !== "" && attr !== " ") {
	                    node = attr.split('=');
	                    attributes[ node[0] ] = node[1].replace( QUOTE_MATCHER, "");
	                }
	            }
	        }
	        xhtml = result[3];
	    } else {
			tag = (el.firstChild === null) ? TAG_LIST[el.tagName] || el.tagName : el.firstChild.tagName;
		}

	    element = DOC.createElement(tag);

	    for( x in attributes ){
			Simples.attr( element, x, attributes[x] );
		}

	    element.innerHTML = xhtml;
	    return element;
	};

Simples.merge( /** @lends Simples */ {
	/**
	 * @description to read the html from a elem
	 * @param {Element} elem the element to read the dom html from
	 * @param {String} location to specify how to return the dom options are [ outer, text, inner/undefined ] use outer for outerHTML, text to read all the textNodes and inner or no argument for innerHTML
	 */
	domRead : function( elem, location ){
		if( elem && elem.nodeType ){
			switch( location ){
				case "outer" :
					html = elem.outerHTML;

					if ( !html ) {
						var div = elem.ownerDocument.createElement("div");
						div.appendChild( elem.cloneNode(true) );
						html = div.innerHTML;
					}

					return html;
				case "text" :
					var str = "", elems = elem.childNodes;
					for ( var i = 0; elems[i]; i++ ) {
						elem = elems[i];

						// Get the text from text nodes and CDATA nodes
						if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
							str += elem.nodeValue;
						// Traverse everything else, except comment nodes
						} else if ( elem.nodeType !== 8 ) {
							str += Simples.domRead( elem, "text" );
						}
					}
					return str;
				default :
					return elem.innerHTML;
			}
		}
	},
	/**
	 * @description to write the dom new html string or dom elements
	 * @param {Element} elem the element to read the dom html from
	 * @param {String} location to specify how to return the dom options are desctructive: [remove, empty, outer, text, inner/undefined ], non-destructive: [top, bottom, unwrap, before, after, wrap ]
	 * @param {String|Elements} html the string or Elements to put into the dom
	 */	
	domManip : function( elem, location, html ){
		var el, parent = elem.parentNode;
		if( !elem || !elem.nodeType ){ return; }
		
		switch( location ){
			case 'text' :
				Simples.cleanData( elem );
				while ( elem.firstChild ) {
					elem.removeChild( elem.firstChild );
				}
				elem.appendChild( (elem && elem.ownerDocument || DOC).createTextNode( html.toString() ) );
				break;
			case 'remove' :
				if( parent ){
					Simples.cleanData( elem );     
					parent.removeChild(elem);
				}
				break;
			default :  
				if( elem.nodeType === 3 || elem.nodeType === 8 ){
					return;
				}
				switch( location ){
					case 'outer' :
						if( parent ){ 
							el = wrapHelper(html, elem);
							Simples.cleanData( elem );
					        parent.replaceChild( el, elem );						
						}
						break;
					case 'top' :
						elem.insertBefore( wrapHelper(html, elem), elem.firstChild);
						break;
					case 'bottom' : 
						elem.insertBefore( wrapHelper(html, elem), null);
						break;
					case 'unwrap' :
						if( parent ){
							var docFrag = wrapHelper( elem.childNodes, elem );
							Simples.cleanData( elem );
							el = docFrag.childNodes;
							parent.insertBefore( docFrag, elem );
							parent.removeChild( elem );
						}
						break;
					case 'empty' :
						Simples.cleanData( elem, false ); 
						while ( elem.firstChild ) {
							elem.removeChild( elem.firstChild );
						}
						break;
					case 'before' :
						if( parent ){
							parent.insertBefore( wrapHelper(html, parent), elem);
						}
						break;
					case 'after' :
						if( parent ){ 
							parent.insertBefore( wrapHelper(html, parent), elem.nextSibling);
						}
						break;
					case 'wrap' :
						if( parent ){ 
							var elems = wrapHelper( html, parent );           
							var wrap = ( elems.nodeType === 11 ? elems.firstChild : elems );
							parent.insertBefore( elems, elem );
							wrap.appendChild( elem );						
						}
						break;
					default :  
						Simples.cleanData( this, false );
						html = html != null ? html : location;
						var list, len, i = 0, testStringIndex = html.toString().indexOf("[object");
						if ( testStringIndex === -1 ) {
							elem.innerHTML = ""+html;
							list = elem.getElementsByTagName('SCRIPT');
							len = list.length;
							for (; i < len; i++) {
								eval(list[i].text);
							}
						} else if( testStringIndex > -1 ) {
							elem.innerHTML = "";
							elem.appendChild( wrapHelper( html, elem ) );
						}					
				}
		}
		return el;
	},
	/**
	 * @description to either check for a className, add or remove a className
	 * @param {Element} elem the element to manipulate the className on
	 * @param {String} className the class to work with
	 * @param {String} action to perform the step [ add, remove, has/undefined ]
	 */
	className : function( elem, className, action ){
		if( elem && elem.nodeType && elem.nodeType != ( 3 || 8 ) ){
			className = " "+className+" ";
			var hasClassName = (" " + elem.className + " ").replace( STRIP_TAB_NEW_LINE, " ").indexOf( className ) > -1;
			if( action === "add" ){
				if( !hasClassName ){
					elem.className = Simples.trim( Simples.trim( elem.className.replace( STRIP_TAB_NEW_LINE, " ") ) + className );
				}
			} else if( action === "remove" ){
				if( hasClassName ){
					elem.className = Simples.trim( (' ' + elem.className.replace( STRIP_TAB_NEW_LINE, " ") +' ').replace( className, ' ' ) );
				}
			} else {
				return hasClassName;
			}
		}
	},
	/**
	 * @description read / write the attribute on an element
	 * @param {Element} elem the element to manipulate the attribute
	 * @param {String} name the name of the attribute
	 * @param {String} value the value to specify, if undefined will read the attribute, if null will remove the attribute, else will add the value as a string
	 */
	attr : function( elem, name, value ){
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
			return UNDEF;
		}

		if( value === UNDEF ){
			if ( elem.nodeName.toUpperCase() === "FORM" && elem.getAttributeNode(name) ) {
				// browsers index elements by id/name on forms, give priority to attributes.				
				return elem.getAttributeNode( name ).nodeValue;
			} else if ( name === "style" && !Simples.support.style ){
				// get style correctly
				return elem.style.cssText;				
			} else if( elem.nodeType === 1 && !SPECIAL_URL.test( name ) && name in elem ){
				// These attributes don't require special treatment
				return elem[ name ];
			} else {
				// it must be this
				return elem.getAttribute( name );
			}
			return null;  
		} else if( value === null ){
			if ( elem.nodeType === 1 ) {
				elem.removeAttribute( name );
			}
		} else { 
			if ( ( typeof value == ( "function" || 'object' ) ) || ( name === "type" && IMMUTABLE_ATTR.test( elem.nodeName ) ) ) {
				return UNDEF;
			}

			if( name === "style" && !Simples.support.style ){
				// get style correctly
				elem.style.cssText = "" + value;
			} else if ( elem.nodeType === 1 && !SPECIAL_URL.test( name ) && name in elem ) { 
				// These attributes don't require special treatment 
				elem[ name ] = ""+value;
			} else { 
				// it must be this
				elem.setAttribute(name, ""+value);
			}
		}
	}
});

Simples.extend( /** @lends Simples.fn */ {
	/**
	 * @description to read or write to the dom basd on the elements on the Simples object
	 * @param {String} location to specify how to return the dom options are desctructive: [remove, empty, outer, text, inner/undefined ], non-destructive: [top, bottom, unwrap, before, after, wrap ]
	 * @param {String|Elements} html the string or Elements to put into the dom, if not specfied where location is [ outer, text, inner/undefined ] will read
	 * @returns {Simples|String} if writing to the dom will return this, else will return string of dom
	 */
	html : function( location, html ){

		if ( arguments.length === 0 || ( arguments.length === 1 && SINGLE_ARG_READ.test( location ) ) ) {
			return Simples.domRead( this[0], location );
		}
		location = location != null ? location : "";

		var c=0,i=0,l=this.length, results;
		while(i<l){
			Simples.domManip( this[i++], location, html );
		}

		return this;
	},
	/**
	 * @description to determine whether any of the elements on the Simples object has the specified className
	 * @params {String} className the exact className to test for
	 * @returns {Boolean} indicating whether className is on elements of Simples object
	 */
	hasClass : function( className ){
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( Simples.className( this[i], className ) ) {
				return true;
			}
		}
		return false;
	},
	/**
	 * @description to add the specified className to the elements on the Simples object with the specified className
	 * @params {String} className the className to add to the elements
	 */
	addClass : function( className ){
		var l = this.length;
		while ( l ) {
			Simples.className( this[ --l ], className, "add" );
		}
		return this;
	},
	/**
	 * @description to remove the specified className to the elements on the Simples object with the specified className
	 * @params {String} className the className to remove to the elements
	 */
	removeClass : function( className ){
		var l = this.length;
		while ( l ) {
			Simples.className( this[ --l ], className, "remove" );
		}
		return this;		
	},
	/**
	 * @description to read / write the given attribute to the elements on the Simples object
	 * @param {String} name the name of the attribute
	 * @param {String} value the value to specify, if undefined will read the attribute, if null will remove the attribute, else will add the value as a string
	 */
	attr : function(name, value){
		var klass = Simples.getConstructor( name );
			
		if( klass === "Object" ){
			for( var key in name ){
				var i=0,l=this.length,val = name[key];
				while(i<l){
					Simples.attr( this[i++], key, val );
				}
			}
		} else if( klass === "String" ){
			if( value === UNDEF ){
				return Simples.attr( this[0], name );
			} else { 
				for(var m=0,n=this.length;m<n;m++){
					Simples.attr( this[m], name, value );
				}
			}
		}
		return this;
	},
	/* TODO: Rename me as I don't indicate functionality */
	/**
	 * @description to select a new set of elements off of the elements in the Simples object
	 * @params {String|Function} name the string to specify the traversing, i.e. childNodes, parentNode, etc or a function to walk 
	 */
	traverse : function( name ){
		var isWhat = Simples.getConstructor( name ), results = new Simples(), i=0,l = this.length;
		while( i<l ){
			var current = this[i++], elem = ( isWhat === "String" ) ? current[ name ] : ( isWhat === "Function" ) ? name.call( current, current ) : null;
			if( elem ){
				results.push.apply( results, ( elem.item || elem.length ) ? Simples.makeArray( elem ) : [ elem ] );
			}
		}
		
		return results;
	},
	/**
	 * @description to return a subset of the selected elements
	 * @params {Number} i the first element to start slicing
	 * @params {Number} len the last element to finish slicing this is optional if not specified then the slice is to the last element
	 */	
	slice : function( i, len ){
		len = ( 0 < len ) ? len : 1 ;
		return Simples( slice.apply( this, i < 0 ? [ i ] : [+i, i+len]  ), true );
	}
});
// exclude the following css properties to add px
var REXCLUDE = /z-?index|font-?weight|opacity|zoom|line-?height/i,
	RALPHA = /alpha\([^)]*\)/,
	ROPACITY = /opacity=([^)]*)/,
	RFLOAT = /float/i,
	RDASH_ALPHA = /-([a-z])/ig,
	RUPPER = /([A-Z])/g,
	RNUMPX = /^-?\d+(?:px)?$/i,
	RNUM = /^-?\d/,
	WIDTH = "width",
	HEIGHT = "height",
	// cache check for defaultView.getComputedStyle
	isGetComputedStyle = !!DOC.defaultView && !!DOC.defaultView.getComputedStyle,
	isCurrentStyle = !!document.documentElement.currentStyle,
	/** @private normalize float css property */
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},
	styleFloat = Simples.support.cssFloat ? "cssFloat": "styleFloat";

Simples.merge( /** @lends Simples */ {
	/**
	 * @description Used to read the current computed style of the element including width, height, innerWidth, innerHeight, offset.top, offset.left, border, etc.
	 * @function
	 * @param {Element} elem the element to read the somputed style off
	 * @param {String} type of the attribute to read
	 * @param {Boolean} extra used to determine on outerHeight, outerWidth whether to include the margin or just the border
	 */
	getStyle : (function( Simples ){

        var RWIDTH_HEIGHT = /width|height/i,
			cssShow = { position: "absolute", visibility: "hidden", display:"block" },
			cssWidth = [ "Left", "Right" ],
			cssHeight = [ "Top", "Bottom" ];

		function getWidthHeight( elem, name, extra ){
			var val;
			if ( elem.offsetWidth !== 0 ) {
				val = returnWidthHeight( elem, name, extra );

			} else {
				resetCSS( elem, cssShow, function() {
					val = returnWidthHeight( elem, name, extra );
				});
			}

			return Math.max(0, Math.round(val) );
		}

		function returnWidthHeight( elem, name, extra ) {
			var which = name === WIDTH ? cssWidth : cssHeight, 
				val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

			if ( extra === "border" ) {
				return val;
			}

			for(var i=0,l=which.length;i<l;i++){
				var append = which[i];
				if ( !extra ) {
					val -= parseFloat(Simples.currentCSS( elem, "padding" + append, true)) || 0;
				}

				if ( extra === "margin" ) {
					val += parseFloat(Simples.currentCSS( elem, "margin" + append, true)) || 0;

				} else {
					val -= parseFloat(Simples.currentCSS( elem, "border" + append + "Width", true)) || 0;
				}
			}

			return val;
		}  

		function resetCSS( elem, options, callback ){
			var old = {};

			// Remember the old values, and insert the new ones
			for ( var name in options ) {
				old[ name ] = elem.style[ name ];
				elem.style[ name ] = options[ name ];
			}

			callback.call( elem );

			// Revert the old values
			for ( name in options ) {
				elem.style[ name ] = old[ name ];
			}	
		}
        
		return function( elem, type, extra ){
            if( elem && RWIDTH_HEIGHT.test( type ) ){
				if( type === WIDTH || type === HEIGHT ){ 
					// Get window width or height
					// does it walk and quack like a window?
					if( "scrollTo" in elem && elem.document ){
						var client = "client" + ( ( type === WIDTH ) ? "Width" : "Height" );
						// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
						return elem.document.compatMode === "CSS1Compat" && elem.document.documentElement[ client ] || elem.document.body[ client ];
				
					// Get document width or height
					// is it a document
					} else if( elem.nodeType === 9 ){
						var name = ( type === WIDTH ) ? "Width" : "Height",
							scroll = "scroll" + name, 
							offset = "offset" + name;
				
						// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
						return Math.max(
							elem.documentElement[ "client" + name ],
							elem.body[ scroll ], elem.documentElement[ scroll ],
							elem.body[ offset ], elem.documentElement[ offset ]
						);
					} else {
						return getWidthHeight( elem, type );
					}
				} else if( type === "innerHeight" || type === "innerWidth" ){
					type = type === "innerHeight" ? HEIGHT : WIDTH;
					return getWidthHeight( elem, type, "padding" );
				} else if( type === "outerHeight" || type === "outerWidth" ){
					type = type === "outerHeight" ? HEIGHT : WIDTH;
					return getWidthHeight( elem, type, extra ? "margin" : "border" );
				}
				return null;
			} else if( elem && ( type === TOP || type === LEFT ) ){
				// shortcut to prevent the instantiation of another Simples object
				return Simples.offset( elem )[ type ];
			}

			return Simples.currentCSS( elem, type );
		};

	})( Simples ),
	/**
	 * @description to read the current style attribute 
	 * @param {Element} elem the element to read the current style attributes off 
	 * @param {String} name of the style atttribute to read
	 */	
	currentCSS : function(elem, name) {

	    var ret, style = elem.style, filter;

	    // IE uses filters for opacity
	    if (!Simples.support.opacity && name === OPACITY && elem.currentStyle) {
	        ret = ROPACITY.test( (elem.currentStyle ? elem.currentStyle.filter : elem.style.filter ) || "") ? (parseFloat(RegExp.$1) / 100) + "": "";
	        return ret === "" ? "1": ret;
	    }

	    // Make sure we're using the right name for getting the float value
	    if (RFLOAT.test(name)) {
	        name = styleFloat;
	    }

	    if (style && style[name]) {
	        ret = style[name];

	    } else if (isGetComputedStyle) {

	        // Only "float" is needed here
	        if (RFLOAT.test(name)) {
	            name = "float";
	        }

	        name = name.replace(RUPPER, "-$1").toLowerCase();

	        var defaultView = elem.ownerDocument.defaultView;

	        if (!defaultView) {
	            return null;
	        }

	        var computedStyle = defaultView.getComputedStyle(elem, null);

	        if (computedStyle) {
	            ret = computedStyle.getPropertyValue(name);
	        }

	        // We should always get a number back from opacity
	        if (name === OPACITY && ret === "") {
	            ret = "1";
	        }

	    } else if (isCurrentStyle) {

	        name = name.replace(RDASH_ALPHA, fcamelCase );
	        ret = elem.currentStyle && elem.currentStyle[name];

			if ( ret === null && style && style[ name ] ) {
				ret = style[ name ];
			}
	        // From the awesome hack by Dean Edwards
	        // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
	        // If we're not dealing with a regular pixel number
	        // but a number that has a weird ending, we need to convert it to pixels
	        if (!RNUMPX.test(ret) && RNUM.test(ret)) {
	            // Remember the original values
	            var left = style.left,
				rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

	            // Put in the new values to get a computed value out
	            if( rsLeft ){
					elem.runtimeStyle.left = elem.currentStyle.left;
	            }
	            style.left = name === "fontSize" ? "1em": (ret || 0);
	            ret = style.pixelLeft + "px";

	            // Revert the changed values
	            style.left = left;
	            if ( rsLeft ) {
					elem.runtimeStyle.left = rsLeft;
	            }
	        }
	    }

	    return ret === "" ? "auto" : ret;
	},
	/**
	 * @description use to set the supplied elements style attribute 
	 * @param {Element} elem the element to set the style attribute on
	 * @param {String} name the name of the attribute to set
	 * @param {Number|String} value to be set either a pure number 12 or string with the 12px
	 */	
	setStyle : function( elem, name, value ){                       
		// don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
			return UNDEF;
		}

		// ignore negative width and height values #1599
		if ( (name === WIDTH || name === HEIGHT) && parseFloat(value) < 0 ) {
			value = UNDEF;
		}

		if ( typeof value === "number" && !REXCLUDE.test(name) ) {
			value += "px";
		}

		var style = elem.style || elem, set = value !== UNDEF;

		// IE uses filters for opacity
		if ( !Simples.support.opacity && name === OPACITY ) {
			if ( set ) {
				// IE has trouble with opacity if it does not have layout
				// Force it by setting the zoom level
				style.zoom = 1;

				// Set the alpha filter to set the opacity
				var opacity = parseInt( value, 10 ) + "" === "NaN" ? "" : "alpha(opacity=" + (value * 100) + ")";
				var filter = style.filter || Simples.currentCSS( elem, "filter" ) || "";
				style.filter = RALPHA.test(filter) ? filter.replace(RALPHA, opacity) : opacity;
			}

			return style.filter && style.filter.indexOf("opacity=") >= 0 ? (parseFloat( ROPACITY.exec(style.filter)[1] ) / 100) + "":"";
		}

		// Make sure we're using the right name for getting the float value
		if ( RFLOAT.test( name ) ) {
			name = styleFloat;
		}

		name = name.replace( RDASH_ALPHA, fcamelCase); 

		if ( set ) {
			// set value to empty string when null to prevent IE issue
			style[ name ] = value === null ? "" : value;
		}

		return style[ name ];
	}
});

Simples.extend( /** @lends Simples.fn */ {
	/**
	 * @description Used to read the current computed style of the first element or write through this.css the style atttribute, see Simples.getStyle
	 * @param {String} type the computed style attribute to read
	 * @param {Boolean} extra whether to include extra
	 */	
	style : function( type, extra ){
		if( !extra || typeof extra === "boolean" ){
			return this[0] ? Simples.getStyle( this[0], type, extra ) : null;
		} else {
			return this.css( type, extra );
		}
	},
	/**
	 * @description Used to read the current style attribute or set the current style attribute
	 * @param {String} name of the attribute to set
	 * @param {Number|String} value to be set either a pure number 12 or string with the 12px
	 */	
	css : function( name, value ){ 
		if( value === UNDEF && typeof name === "string" ){
			return Simples.currentCSS( this[0], name );  
		}

		// ignore negative width and height values #1599
		if ( (name === WIDTH || name === HEIGHT) && parseFloat(value) < 0 ) {
			value = UNDEF;
		}
		
		var klass = Simples.getConstructor( name );
		if( klass === "String" && value !== UNDEF ){
			var i=0,l=this.length;
			while( i<l ){
				Simples.setStyle( this[i++], name, value );
			}
		} else if( klass === "Object" ) {
			for( var key in name ){
				this.css( key, name[ key ] );
			}
		}
		return this;
	}
});
/** @private */
function returnFalse() {
	return false;
}
/** @private */
function returnTrue() {
	return true;
}
/** @private used to clear all events on a provided element */
function clearEvents( elem, type, events, handlers ){
	// check whether it is a W3C browser or not
	if ( elem.removeEventListener ) {
		// remove event listener and unregister element event
		elem.removeEventListener( type, handlers[ type ], false );
	} else if ( elem.detachEvent ) {

		elem.detachEvent( "on" + type, handlers[ type ] );
	}
	
	if( events && events[type] ){ delete events[ type ]; }
	if( handlers && handlers[type] ){ delete handlers[ type ]; }
}
/**
 * @constructor
 * @description the event constructor to provide unified event object support
 * @param {String|Event} the name or event to coerce into a Simples.Event to bridge the differences between implementations
 */
Simples.Event = function( event ){
	// Allow instantiation without the 'new' keyword
	if ( !this.isDefaultPrevented ) {
		return new Simples.Event( event );
	}

	// Event object
	if ( event && event.type ) {
		this.originalEvent = event;
		this.type = event.type;
	// Event type
	} else {
		this.type = event;
	}
    
	// timeStamp is buggy for some events on Firefox(#3843)
	// So we won't rely on the native value
	this.timeStamp = new Date().getTime();

	// set the event to be fixed
	this[ accessID ] = true;
	// return self
	return this;   
};
/**
 * Simples.Event: the event constructor to provide unified event object support
 */
Simples.Event.prototype = {
	/** 
	 * @description used to prevent the browser from performing its default action
	 */
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		
		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();
		}
		// otherwise set the returnValue property of the original event to false (IE)
		e.returnValue = false;
	},
	/** 
	 * @description used to stop the event from continuing its bubbling
	 */	
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	/** 
	 * @description used to stop the event bubbling up and any other event callbacks from being triggered on the current element
	 */	
	stopImmediatePropagation: function() {
	    this.isImmediatePropagationStopped = returnTrue;
	    this.stopPropagation();
	},
	/**
	 * @function
	 * @description used to determine wherther the event has had preventDefault called
	 */	
	isDefaultPrevented: returnFalse,
	/** 
	 * @function
	 * @description used to determine wherther the event has had stopPropagation called
	 */	
	isPropagationStopped: returnFalse,
	/** 
	 * @function
	 * @description used to determine wherther the event has had stopImmediatePropagation called
	 */	
	isImmediatePropagationStopped: returnFalse
};
	
Simples.merge( /** @lends Simples */ {
	/**
	 * @description to add the event to the provided element
	 * @param {Element} elem the element to attach the event to	
	 * @param {String} type the type of event to bind i.e. click, custom, etc
	 * @param {Function} callback the callback to bind, false can be specified to have a return false callback
	 */
	attach : function( elem, type, callback ){
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		} else if( typeof type === "string" && type.indexOf(" ") > -1 ){
			type = type.split(" ");
			for(var m=0,n=type.length;m<n;m++){
				Simples.attach( elem, type[m], callback );
			}
			return;
		}
		
		if ( callback === false ) {
			callback = returnFalse;
		}
		// For whatever reason, IE has trouble passing the window object
		// around, causing it to be cloned in the process
		if ( elem.setInterval && ( elem !== WIN && !elem.frameElement ) ) {
			elem = WIN;
		}
        
		if( Simples.isConstructor( callback, "Function" ) && canDoData( elem ) ){ 
			
			var data = Simples.data( elem ),
				events = data.events ? data.events : data.events = {},
				handlers = data.handlers ? data.handlers : data.handlers = {};
			
			var guid = !callback.guid ? callback.guid = Simples.guid++ : callback.guid, 
				handler = handlers[ type ];
				
			if( !handler ){
				handler = handlers[ type ] = function( evt ){
					return Simples !== UNDEF ? Simples._eventHandler.apply( handler.elem, arguments ) : UNDEF;
				};
				handler.elem = elem;
				// Attach to the element
				if ( elem.addEventListener ) {

			        elem.addEventListener(type, handler, false);
			    } else if ( elem.attachEvent ) {

			        elem.attachEvent("on" + type, handler);
			    }
			}
			
			events[ type ] = events[ type ] || [];
			events[ type ].push( { callback : callback, guid : guid } );
			
		}
	},
	/**
	 * @description to remove the event from the provided element
	 * @param {Element} elem the element to detach the event from
	 * @param {String} type the type of event to unbind i.e. click, custom, etc, if no type is specifed then all events are unbound
	 * @param {Function} callback the callback to unbind, if not specified will unbind all the callbacks to this event	
	 */
	detach : function( elem, type, callback ){
		
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		} else if( typeof type === "string" && type.indexOf(" ") > -1 ){
			type = type.split(" ");
			for(var m=0,n=type.length;m<n;m++){
				Simples.detach( elem, type[m], callback );
			}
			return;
		}

		if( type && type.type ){
			callback = type.handler;
			type = type.type;
		} else if ( callback === false ) {
			callback = returnFalse;
		}
		   
		var elemData = Simples.data( elem ),
			events = elemData.events,
			handlers = elemData.handlers;
		
		if( type === UNDEF ){
			for( var eventType in events ){
				clearEvents( elem, eventType, events, handlers );
			}
		} else {
			var event = events[ type ];

			for(var i=0;i<event.length;i++){
				if( callback === UNDEF || callback.guid === event[i].guid ){
					event.splice( i--, 1 );
				}
			}

			if( event.length === 0 ){
				clearEvents( elem, type, events, handlers );
			}
		}
	},
	/**
	 * @description to trigger an event on a supplied element
	 * @param {Element} elem the element to trigger the event on
	 * @param {String} type the type of event to trigger i.e. click, custom, etc
	 * @param {Any} data the data to attach to the event	
	 */
	trigger : function( elem, type, data ){
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}
		if ( canDoData( elem ) ) {
			// Use browser event generators
			var e;
			if( elem.dispatchEvent ){
				// Build Event
				e = DOC.createEvent("HTMLEvents");
				e.initEvent(type, true, true); 
				if( data ){ e.data = JSON.stringify(data); }
				// Dispatch the event to the ELEMENT
				elem.dispatchEvent(e);
			} else if( elem.fireEvent ) {
				e = DOC.createEventObject();
				if( data ){ e.data = JSON.stringify(data); }
				e.target = elem;
				e.eventType = "on"+type;
				elem.fireEvent( "on"+type, e );
			} 
		}		                                         
	},
	/** @private properties as part of the fix process */
	_eventProperties : "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
	/** @private to fix the native Event */
	_eventFix : function( event ){
		 if( event[ accessID ] ){
			return event;
		}
	    // store a copy of the original event object
	    // and "clone" to set read-only properties 
		var originalEvent = event;
		
		event = Simples.Event( originalEvent );

	    for (var i=Simples._eventProperties.length, prop; i;) {
	        prop = Simples._eventProperties[--i];
	        event[ prop ] = originalEvent[ prop ];
	    }

		// Fix target property, if necessary
		if ( !event.target ) {
			event.target = event.srcElement || DOC; // Fixes #1925 where srcElement might not be defined either
		}

		// check if target is a textnode (safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement ) {
			event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
		}

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var doc = DOC.documentElement, body = DOC.body;
			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add which for key events
		if ( !event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode) ) {
			event.which = event.charCode || event.keyCode;
		}

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey ) {
			event.metaKey = event.ctrlKey;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button !== UNDEF ) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}

		if( event.data ){
            event.data = JSON.parse(event.data);
		}

	    return event;
	},
	/** @private to create a unique identifier */
	guid : 1e6,
	/** @private event handler this is bound to the elem event */
	_eventHandler : function( event ){ 
		var events, callbacks;
		var args = slice.call( arguments, 0 );
		event = args[0] = Simples._eventFix( event || WIN.event );
        event.currentTarget = this;

		events = Simples.data( this, "events" );
		callbacks = (events || {})[ event.type ];
         
		if( events && callbacks ){
			callbacks = slice.call(callbacks, 0);
			
			for( var i=0,l=callbacks.length;i<l;i++){ 
				var callback = callbacks[i];
				event.handler = callback.callback;
				
				var ret = event.handler.apply( this, args );
				if( ret !== UNDEF ){
					event.result = ret;
					if ( ret === false ) { 
						event.preventDefault();
						event.stopPropagation();
					}
				}
				
				if ( event.isImmediatePropagationStopped() ) {
					break;
				}
			}
		}
		return event.result;
	}
});

Simples.extend( /** @lends Simples.fn */ {
	/**
	 * @description to add the event from the elements on the Simples object
	 * @param {String} type the type of event to bind i.e. click, custom, etc
	 * @param {Function} callback the callback to bind, false can be specified to have a return false callback
	 */
	bind : function( type, callback ){
		if( typeof type === "string" && ( callback === false || Simples.isConstructor( callback, "Function" ) ) ){
			// Loop over elements    
			var i=0,l=this.length;
			while(i<l){
				// Register each original event and the handled event to allow better detachment
				Simples.attach( this[i++], type, callback );
			}
		}
		return this;	
	},
	/**
	 * @description to remove the event from the elements on the Simples object
	 * @param {String} type the type of event to unbind i.e. click, custom, etc, if no type is specifed then all events are unbound
	 * @param {Function} callback the callback to unbind, if not specified will unbind all the callbacks to this event
	 */
	unbind : function( type, callback ){
		// Loop over elements    
		var i=0,l=this.length;
		while(i<l){
			// Register each original event and the handled event to allow better detachment    
			Simples.detach( this[i++], type, callback );
		}
		return this;
	},
	/**
	 * @description to trigger an event on the elements on the Simples object
	 * @param {String} type the type of event to trigger i.e. click, custom, etc
	 * @param {Any} data the data to attach to the event
	 */
	trigger : function( type, data ){
		if( typeof type === "string"){ 
			// Loop over elements
			var i=0,l=this.length;
			while(i<l){
				// Register each original event and the handled event to allow better detachment    
				Simples.trigger( this[i++], type, data );
			}
		}
		return this;
	}
});
// OMG its another non-W3C standard browser 
var REGEX_HTML_BODY = /^body|html$/i,
/** @private */
getWIN = function( elem ) {
	return ("scrollTo" in elem && elem.document) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
};

if( "getBoundingClientRect" in DOC.documentElement ){
	/**
	 * @description to get the top, left offset of an element
	 * @param {Element} elem the element to get the offset of
	 * @returns {Object} top, left
	 */
	Simples.offset = function( elem ){

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return Simples.bodyOffset( elem );
		}

		var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body,
			docElem = doc.documentElement, win = getWIN(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = (win.pageYOffset || Simples.support.boxModel && docElem.scrollTop  || body.scrollTop ),
			scrollLeft = (win.pageXOffset || Simples.support.boxModel && docElem.scrollLeft || body.scrollLeft),
			top  = box.top  + scrollTop  - clientTop, left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};	                 
} else {
	Simples.offset = function( elem ) {

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return Simples.bodyOffset( elem );
		}

		Simples.offset.init();

		var offsetParent = elem.offsetParent, prevOffsetParent = elem,
			doc = elem.ownerDocument, computedStyle, docElem = doc.documentElement,
			body = doc.body, defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop, left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( Simples.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( Simples.offset.doesNotAddBorder && !(Simples.offset.doesAddBorderForTableAndCells && (/^t(able|d|h)$/i).test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( Simples.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( Simples.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}
/** @private */
Simples.offset.init = function(){
	var body = DOC.body, container = DOC.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( Simples.currentCSS(body, "marginTop", true) ) || 0,
		html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

	Simples.merge( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

	container.innerHTML = html;
	body.insertBefore( container, body.firstChild );
	innerDiv = container.firstChild;
	checkDiv = innerDiv.firstChild;
	td = innerDiv.nextSibling.firstChild.firstChild;

	Simples.offset.doesNotAddBorder = (checkDiv.offsetTop !== 5);
	Simples.offset.doesAddBorderForTableAndCells = (td.offsetTop === 5);

	checkDiv.style.position = "fixed";
	checkDiv.style.top = "20px";

	// safari subtracts parent border width here which is 5px
	Simples.offset.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
	checkDiv.style.position = checkDiv.style.top = "";

	innerDiv.style.overflow = "hidden";
	innerDiv.style.position = "relative";

	Simples.offset.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

	Simples.offset.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

	body.removeChild( container );
	body = container = innerDiv = checkDiv = table = td = null;
	Simples.offset.init = Simples.noop;
};

Simples.merge( /** @lends Simples */ {
	/**
	 * @description to get the offset of the body 
	 * @param {Body} body body element to measure
	 * @returns {Object} top, left
	 */
	bodyOffset : function( body ) {
		var top = body.offsetTop, left = body.offsetLeft;

		Simples.offset.init();

		if ( Simples.offset.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( Simples.currentCSS(body, "marginTop",  true) ) || 0;
			left += parseFloat( Simples.currentCSS(body, "marginLeft", true) ) || 0;
		}

		return { top: top, left: left };
	},
	/**
	 * @description to set the offset of the top and left of an element passed on its current offset
	 * @param {Element} elem element to set the offset on
	 * @param {Object} options
	 * @param {Number} options.top the top offset desired
	 * @param {Number} options.left	the left offset desired
	 */
	setOffset : function( elem, options ) {
		var position = Simples.currentCSS( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem    = Simples( elem ),
			curOffset  = curElem.offset(),
			curCSSTop  = Simples.currentCSS( elem, TOP, true ),
			curCSSLeft = Simples.currentCSS( elem, LEFT, true ),
			calculatePosition = (position === "absolute" && (curCSSTop === 'auto' || curCSSLeft === 'auto' ) ),
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is absolute
		if ( calculatePosition ) {
			curPosition = curElem.position();
		}

		curTop  = calculatePosition ? curPosition.top  : parseInt( curCSSTop,  10 ) || 0;
		curLeft = calculatePosition ? curPosition.left : parseInt( curCSSLeft, 10 ) || 0;

		if (options.top != null) {
			props.top = (options.top - curOffset.top) + curTop;
		}
		if (options.left != null) {
			props.left = (options.left - curOffset.left) + curLeft;
		}

		curElem.css( props );
	},
	/**
	 * @description to get the offsetParent of an element
	 * @param {Element} elem the element to get the offsetParent of
	 * @returns {Element}
	 */
	offsetParent : function( elem ) {
		var offsetParent = elem.offsetParent || DOC.body;
		while ( offsetParent && (!REGEX_HTML_BODY.test(offsetParent.nodeName) && Simples.currentCSS(offsetParent, "position") === "static") ) {
			offsetParent = offsetParent.offsetParent;
		}

		return offsetParent;
	},
	/**
	 * @description to get the position of the element
	 * @param {Element} elem to get the position of
	 * @returns {Object} top, left
	 */
	position: function( elem ) {

		// Get *real* offsetParent
		var offsetParent = Simples.offsetParent( elem ),

		// Get correct offsets
		offset       = Simples.offset( elem ),
		parentOffset = REGEX_HTML_BODY.test(offsetParent.nodeName) ? { top: 0, left: 0 } : Simples.offset( offsetParent );

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( Simples.currentCSS(elem, "marginTop",  true) ) || 0;
		offset.left -= parseFloat( Simples.currentCSS(elem, "marginLeft", true) ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( Simples.currentCSS(offsetParent, "borderTopWidth",  true) ) || 0;
		parentOffset.left += parseFloat( Simples.currentCSS(offsetParent, "borderLeftWidth", true) ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},
	/**
	 * @description To set the scrollTop / scrollLeft for a given element
	 * @param {Element} elem element to set the scroll on
	 * @param {String} name 'top' or 'left'
	 * @param {Number} value
	 */
	setScroll : function( elem, name, val ){
		win = getWIN( elem );

		if ( win ) {
			win.scrollTo(
				name === LEFT ? val : Simples.getScroll( win, LEFT ),
				name === TOP ? val : Simples.getScroll( win, TOP )
			);

		} else {
			name = name === TOP ? "scrollTop" : "scrollLeft";
			elem[ name ] = val;
		}
	},
	/**
	 * @description To retrieve the scrollTop / scrollLeft for a given element
	 * @param {Element} elem element to get the scroll of
	 * @param {String} name 'top' or 'left'
	 * @returns {Number} the value of the scrollTop / scrollLeft
	 */	
	getScroll : function( elem, name ){
		var isTop = name === TOP;
		name = isTop ? "scrollTop" : "scrollLeft";
		win = getWIN( elem );

		// Return the scroll offset
		return win ? ( ("pageXOffset" in win) ? win[ isTop ? "pageYOffset" : "pageXOffset" ] : Simples.support.boxModel && win.document.documentElement[ name ] || win.document.body[ name ] ) : elem[ name ];		
	}
});

Simples.extend( /** @lends Simples.fn */ {
	/**
	 * @description To set or retrieve the offset of the selected elements on the Simples object
	 * @param {Object} options object with top and / or left specified to set the offset
	 * @returns {Number|Simples} the value of the offset or Simples object
	 */	
	offset : function( options ){

		if ( options ) {
			var len = this.length;
			while( len ){
				Simples.setOffset( this[ --len ], options );
			}
			return this;
		}

		return this[0] ? Simples.offset( this[0] ) : null;
	},
	/**
	 * @description To return the same object with the offsetParents added in place of the selected elements
	 */	
	offsetParent : function(){
		var len = this.length;
		while( len ){
			this[ --len ] = Simples.offsetParent( this[ len ] );
		}
		return this;
	},
	/**
	 * @description To retrieve or set the scrollTop / scrollLeft elements on the simples object, if no value is provided the first element has the value return
	 * @param {String} name 'top' or 'left'
	 * @param {Number} val the value to set the offset to
	 * @returns {Number|Simples} the value of the scrollTop / scrollLeft or Simples object
	 */	
	scroll : function( name, val ){
		if( val !== UNDEF ){
			var len = this.length;
			while( len ){
				Simples.setScroll( this[ --len ], name, val );
			}
			return this;
		}
		return this[0] ? Simples.getScroll( this[0], name ) : null;
	},
	/**
	 * @description To retrieve or set the scrollTop / scrollLeft elements on the simples object
	 * @param {String} name 'top' or 'left'
	 * @param {Number} val the value to set the offset to
	 * @returns {Number} the value of the scrollTop / scrollLeft
	 */	
	position : function(){
		return this[0] ? Simples.position( this[0] ) : null;
	}
});
// ======= ANIMATION ========== //
// Regexp used in this file
var REGEX_PIXEL = /px\s?$/,
	ALLOW_TYPES = /padding|margin|height|width|top|left|right|bottom|fontSize/,
	TIMER_ID;
/**
 * @namespace Simples.Animation
 * @description Animation controller if provide a standard animation object to this functionality it will execute the animation 
 */
Simples.Animation = {
	/* animations: currently active animations being run */
	animations : {},
	/* frameRate: global frame rate for animations */
	frameRate : 24,
	/* length: count of current active animations */
	length : 0,
	/**
	 * @namespace Simples.Animation.tweens 
	 * @description default tweens for animation 
	 */
	tweens : {
		/**
		 * @param frame: current frame
		 * @param frameCount: total frames for animations
		 * @param start: start value for tween
		 * @param delta: difference to end value
		*/
		easing : function( frame, frameCount, start, delta ) {
			return ((frame /= frameCount / 2) < 1) ? delta / 2 * frame * frame + start : -delta / 2 * ((--frame) * (frame - 2) - 1) + start;
		},
		/** @see Simples.Animation.tweens.easing */
		linear : function( frame, frameCount, start, delta ){
			return start + ( delta * ( frame/frameCount ));
		},
		/** @see Simples.Animation.tweens.easing */
		quadratic : function( frame, frameCount, start, delta ){
			return start + (((Math.cos((frame/frameCount)*Math.PI) )/2) * delta );
		}
	},
	interval : Math.round( 1000 / this.frameRate ),
	/**
	 * Simples.Animation.create: used to to create an animation object which can be used by the animation queue runner
	 * @param elem {Element} DOM Element to animate
	 * @param setStyle {Object} CSS to use in animation, final position 
	 * @param opts {Object}
	 * @param opts.callback {Function} when animation complete
	 * @param opts.tween {Function} tween to use when animating
	 * @param opts.duration {Object} the time to elapse during animation
	 */
	create : function( elem, setStyle, opts ){
		opts = opts || {};
		if ( !( elem && elem.nodeType ) || Simples.isEmptyObject( setStyle ) ) {
			if (typeof opts.callback === "function") {
				opts.callback.call(elem);
			}
			return null;
		}

		var anim = {
			0 : elem,
			id : Simples.guid++,
			callback : ( typeof opts.callback === "function" ) ? opts.callback : Simples.noop,
			duration : ( typeof opts.duration === "number" && opts.duration > -1 ) ? opts.duration : 600,
			tween : ( typeof opts.tween === "function" ) ? opts.tween : ( Simples.Animation.tweens[ opts.tween ] || Simples.Animation.tweens.easing ),
			start : {},
			finish : {}
		};

		// check for supported css animated features and prep for animation
		for( var key in setStyle ){
			var cKey = key.replace( RDASH_ALPHA, fcamelCase ),
				opacity = ( cKey === OPACITY && setStyle[ key ] >= 0 && setStyle[ key ] <= 1 );

			if( opacity || ALLOW_TYPES.test( cKey ) ){
				anim.start[ cKey ] = ( Simples.getStyle( elem, cKey ) + "" ).replace(REGEX_PIXEL,"") * 1;
				anim.finish[ cKey ] = ( setStyle[ key ] + "" ).replace(REGEX_PIXEL,"") * 1;
			}                                        
		}

		var data = Simples.data(elem);
		data.animations = data.animations || {};
		data.animations[ anim.id ] = anim;

		if( opts.manualStart !== true ){
			Simples.Animation.start( anim );
		}
		return anim;
	},
	/**
	 * Simples.Animation.start: used to add the animation to the animation runner queue
	 * @param animation {Object} animation to perform action on
	 */
	start : function( animation ){

		if( animation && animation.id ){
			if( !hasOwn.call( this.animations, animation.id ) ){
				this.length++;
				this.animations[ animation.id ] = animation;
				if( animation.duration === 0 ){
					this.stop( animation );
				} else if( !animation.startTime ){
					animation.startTime = new Date().getTime();
				}
			}
			
			if( !TIMER_ID ){
				this.interval = Math.round( 1000/ this.frameRate );
				TIMER_ID = WIN.setInterval(function(){ Simples.Animation._step(); }, this.interval );
			}
		}
	},
	/**
	 * Simples.Animation.reverse: used to take an animation in its current position and reverse and run
	 * @param animation {Object} animation to perform action on
	 */
	reverse : function( animation ){
		var start = animation.start, finish = animation.finish;

		animation.start = finish;
		animation.finish = start;
		
		if( this.animations[ animation.id ] && animation.startTime ){
			var now = new Date().getTime(),
				diff = now - animation.startTime;

			animation.startTime = now - ( animation.duration - diff );
		} else {
			if( this.animations[ animation.id ] ){
				delete this.animations[ animation.id ];
				this.length--;
			}
			this.start( animation );
		}
	}, 
	/**
	 * Simples.Animation.reset: used to reset an animation to either the start or finish position
	 * @param animation {Object} animation to perform action on
	 * @param resetToEnd {Boolean} whether to reset to finish (true) or start (false||undefined) state
	 */
	reset : function( animation, resetToEnd ){

		var cssObj = resetToEnd ? animation.finish : animation.start,
			elem = animation[0];
			
		for( var name in cssObj ){
			Simples.setStyle( elem, name, cssObj[ name ] );
		}
		
		if( animation.startTime ){
			this.stop( animation );
		}
	},
	/**
	 * @private used by the queue runner to iterate over queued animations and update each postion
	 */
	_step : function(){
		if( this.length ){ 
			var now = new Date().getTime();    
			for( var id in this.animations ){
				var anim = this.animations[ id ],
					diff = now - anim.startTime,
					elem = anim[0],
					duration = anim.duration;
					
				if ( diff > duration ) {
					this.stop( anim, true );
				} else {
					for( var name in anim.start ){
						var start = anim.start[ name ];
						Simples.setStyle( elem, name, anim.tween( diff, duration, start, anim.finish[ name ] - start ) );
					
					}
				}
			}
		} else if( TIMER_ID ){
			WIN.clearInterval( TIMER_ID );
			TIMER_ID = null;
		}
	},
	/**
	 * Simples.Animation.stop: used to stop a supplied animation and cleanup after itsef
	 * @param animation {Object} the animation object to use and work on.
	 * @param jumpToEnd {Boolean} whether to leave in current position or set css to finish position
	 */
	stop : function( animation, jumpToEnd ){
		if( animation && hasOwn.call( this.animations, animation.id ) ){

			animation.startTime = null;

			if ( jumpToEnd ){
				this.reset( animation, true );
			}

			var data = Simples.data( animation[0] );
			data.animations = data.animations || {};
			delete data.animations[ animation.id ];

			animation.callback.call(animation[0], animation);
			delete this.animations[ animation.id ];
			this.length--;
		}
	}
};

Simples.extend( /** @lends Simples.fn */ {
	/**
	 * @description From the instance of the Simples object used to bridge to the Simples.Animation functionality
	 * @param action {String} the name of the action to be performed - stop, start, reset, reverse; this is excluding create && _step
	 */
	animations: function(action) {
		if( action != ("create" || "_step") && Simples.Animation[ action ] ){
			var i = this.length,
				action = Simples.Animation[ action ];
			if( typeof action === "function" ){
				while (i) {
					var anims = Simples.data( this[--i], "animation" );
					Simples.Animation[ action ]( anim, arguments[2] );
				}
			}
		}
		return this;
	},
	/**
	 * @description Used to create animations off the elements in the instance of the Simples object
	 * @param action {String} the name of the action to be performed, excluding create && _step
	 * @param css {Object} CSS to use in animation, final position 
	 * @param opts {Object}
	 * @param opts.callback {Function} when animation complete
	 * @param opts.tween {Function} tween to use when animating
	 * @param opts.duration {Object} the time to elapse during animation
	 */
	animate: function(css, opts) {
		var i = this.length;
		while (i) {
			Simples.Animation.create( this[--i], css, opts );
		}
		return this;
	}
});
// Expose Simples to the global object
window.Simples = window.$ = Simples;

})(window,document);
