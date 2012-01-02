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
	/** @private */
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
};

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
			this.filter(function(){ return !!this.nodeType || !!this.document });
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
	version : '@VERSION',
	/**
	 * @memberof Simples.fn
	 * @name each
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
	 * @memberof Simples.fn
	 * @name filter
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
	 * @memberof Simples.fn
	 * @name find
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
	 * @memberof Simples.fn
	 * @name add
	 * @function
	 * @description used to add more elements to the current Simples object
	 * @param {Elements} elems An array or Simples object of elements to concatenate to the current simples Object
	 */
	add : function( elems ){
		Simples.makeArray( Simples( elems ), this );
		return this;
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