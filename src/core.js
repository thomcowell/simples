// Save a reference to some core methods
var toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	indexOf = Array.prototype.indexOf,
	trim = String.prototype.trim,
/* references to class outputs	 */
	ArrayClass = '[object Array]',
	ObjectClass = '[object Object]',
	NodeListClass = '[object NodeList]', 
	StringClass = "[object String]", 
	NumberClass = "[object Number]",
	FunctionClass = "[object Function]",
	BooleanClass = "[object Boolean]",
	HTMLCollectionClass = "[object HTMLCollection]",
	WindowClass = "[object Window]",
	FIRST_LAST_SPACES = /^\s*|\s*$/g,
	// The ready event handler
	DOMContentLoaded,
	// Has the ready events already been bound?
	readyBound = false,
	// The functions to execute on DOM ready
	readyList = [];

function Simples( selector, context ) {
	return new Simples.fn.init( selector, context );
}      

/**
 * @name merge
 * @description used to merge objects into one
 * @param {Object} target native javascript object to be merged
 * @param {Object|Array} obj native javascript object or array to be merged onto first
 **/
Simples.merge = function(first /* obj1, obj2..... */ ) {
    // if only 1 argument is passed in assume Simples is the target
    var target = (arguments.length === 1 && !(this === window || this === document)) ? this: toString.call(first) === ObjectClass ? first : {};
    // set i to value based on whether there are more than 1 arguments
    var i = arguments.length > 1 ? 1: 0;
    // Loop over arguments
    for (var l = arguments.length; i < l; i++) {
        // if object apply directly to target with same keys
        var isWhat = toString.call(arguments[i]);
        if (isWhat === ObjectClass) {
            for (var key in arguments[i]) {
                if (hasOwn.call(arguments[i], key)) {
                    target[key] = arguments[i][key];
                }
            }
        } else if (isWhat === ArrayClass) {
            // if array apply directly to target with numerical keys
            push.apply(target, arguments[i]);
        }
    }

    return target;
};

Simples.merge({
	extend : function( addMethods ){
		// Detect whether addMethods is an object to extend onto subClass
		if( toString.call( addMethods ) === ObjectClass ){
			for (var key in addMethods) {
		        if ( hasOwn.call( addMethods, key ) ) {
		            Simples.fn[key] = addMethods[key];
		        }
		    }
		}
	},  
	isEmptyObject : function( obj ) {
		for ( var name in obj ) { return false; }
		return true;
	},
	// Has the ready events already been bound?
	isReady : false,       
	ready: function( fn ) {
		// Attach the listeners
		Simples.bindReady();
		
		// If the DOM is already ready
		if ( Simples.isReady ) {
			// Execute the function immediately
			fn.call( document, Simples.Event( 'ready' ) );

		// Otherwise, remember the function for later
		} else if ( readyList ) {
			// Add the function to the wait list
			readyList.push( fn );
		}
	},
	// Handle when the DOM is ready
	readyHandler : function() {
		// Make sure that the DOM is not already loaded
		if ( !Simples.isReady ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( Simples.readyHandler, 13 );
			}

			// Remember that the DOM is ready
			Simples.isReady = true;

			// If there are functions bound, to execute
			if ( readyList ) {
				// Execute all of them
				var fn, i = 0;
				while ( (fn = readyList[ i++ ]) ) {
					fn.call( document, Simples );
				}

				// Reset the list of functions
				readyList = null;
			}
		}
	},
	bindReady : function(){
		if ( readyBound ) {
			return;
		}

		readyBound = true;

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			return Simples.readyHandler();
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", Simples.readyHandler, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent("onreadystatechange", DOMContentLoaded);

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", Simples.readyHandler );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},	
	setContext : function( context, func ){
		return function(){
			return func.apply( context, arguments );
		};
	},
	// Use native String.trim function wherever possible, Otherwise use our own trimming functionality
	trim : function( text ) {
		text = text == null ? "" : text;
		return trim ? trim.call( text ) : text.toString().replace( FIRST_LAST_SPACES, "" );
	},
	noop : function(){}
});

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		Simples.readyHandler();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			Simples.readyHandler();
		}
	};
} 

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( Simples.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		window.setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	Simples.readyHandler();
}


Simples.fn = Simples.prototype = { 
	init : function( selector, context ){

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ){
			return this;
		} else if( selector.selector !== undefined ){
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
			this.context = document;
			this[0] = document.body;
			this.selector = "body";
			this.length = 1;
			return this;
		}
	  
		var objClass = toString.call( selector );
		if( objClass === StringClass ){
			this.context = context;
			this.selector = selector;
		
			return Simples.Selector( selector, context, this );

		} else if( objClass === HTMLCollectionClass || objClass === NodeListClass ){

			this.push.apply( this, slice.call( selector, 0 ) );
	    } else if( objClass === ArrayClass ){
	        if( context === true ){
				// shortcut to use native push
		        this.push.apply( this, selector );
			} else {
				for(var d=0,e=selector.length;d<e;d++){
					if( selector[d] && ( selector[d].nodeType || selector[d].document ) ){
						this.push.call( this, selector[d] );
					}
				}
			}
		}
		return this;		
	},
	length : 0,
	selector : '',
	version : '@VERSION',  
	each : function( callback ){
		var i=0,l=this.length;
		while(i<l){
			callback.call( this[i], i, l );
			i++;
		}
		return this;
	},
	filter : function( testFn ){
		var i = 0,c = 0,l = this.length;
		while( i<l ){
			if( testFn.call( this[c], i, l ) !== true ){ this.splice( c--, 1 ); }
			c++; i++;
		}
		return this;
	},
	find: function( selector ){ 
		var results = Simples(), i=0,l=this.length;
		while(i<l){
			Simples.Selector( selector, this[i++], results );
		}
		return results;
	},
	add : function( elems ){
		this.push.apply( this, slice.call( Simples( elems ), 0 ) );
		return this;
	},
	// For internal use only.
	// Behaves like an Array's method, not like a Simples method. For hooking up to Sizzle.
	push: push,
	sort: [].sort,
	splice: [].splice
};      

Simples.fn.init.prototype = Simples.fn