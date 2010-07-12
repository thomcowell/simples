// Save a reference to some core methods
var toString = Object.prototype.toString,
	hasOwnProperty = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	indexOf = Array.prototype.indexOf,
// references to class outputs	
	ArrayClass = '[object Array]',
	ObjectClass = '[object Object]',
	NodeListClass = '[object NodeList]', 
	StringClass = "[object String]", 
	NumberClass = "[object Number]",
	FunctionClass = "[object Function]",
	BooleanClass = "[object Boolean]",
	HTMLCollectionClass = "[object HTMLCollection]",
	WindowClass = "[object Window]",
	// The ready event handler
	DOMContentLoaded,
	// Has the ready events already been bound?
	readyBound = false,
	// The functions to execute on DOM ready
	readyList = [];

function Simples( selector, context ) {

	if ( !(this instanceof Simples) ){	// or this.each !== Simples.prototype.each
		return new Simples( selector, context );  		
	} else if( selector instanceof Simples ){
		return selector;
	}
	  	
	// Handle $(""), $(null), or $(undefined) 		
	if ( !selector ){
		return this;
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
		var result = SimplesSelector( selector, context );
		this.context = result.context;
		this.selector = result.selector;

		merge.call( this, result.elems );

	} else if( objClass === HTMLCollectionClass || objClass === NodeListClass ){

		merge.call( this, slice.call(selector, 0) );		
    } else if( objClass === ArrayClass ){

		for(var d=0,e=selector.length;d<e;d++){
			if( selector[d] && ( selector[d].nodeType || selector[d].document ) ){
				this[ this.length ] = selector[d];
				this.length++;
			}
		}
		
	}
	
    return this;
}

function isArray( obj ){ 
	if( !obj ){ return false; }
	return ( toString.call( obj ) === ArrayClass );
}

function isObject( obj ){
	if( !obj ){ return false; }
	return ( toString.call( obj ) === ObjectClass );
}

function isFunction( obj ) {
	return ( toString.call( obj ) === FunctionClass );
}
function isEmptyObject( obj ) {
	for ( var name in obj ) { return false; }
	return true;
}       

/**
 * @name merge
 * @namespace
 * @description used to merge objects into one
 * @param {Object} obj native javascript object to be merged  
 * @param {Object|Array} obj native javascript object or array to be merged onto first  	
 **/
function merge( first /* obj1, obj2..... */) { 
	// if only 1 argument is passed in assume Simples is the target
    var target = ( arguments.length === 1 && !( this === window || this === document ) ) ? this : isObject( first ) ? first : {};
	// set i to value based on whether there are more than 1 arguments
    var i = arguments.length > 1 ? 1 : 0;
	// Loop over arguments
    for (var l=arguments.length; i<l; i++) {
		// if object apply directly to target with same keys
		if( isObject( arguments[i] ) ){
			for (var key in arguments[i]) {
                if ( hasOwnProperty.call( arguments[i], key ) ) {
                    target[key] = arguments[i][key];
                }
            }
		} else if( isArray( arguments[i] ) ){
         	// if array apply directly to target with numerical keys
			if ( !hasOwnProperty.call( target, 'length' ) ){ target.length = 0; }
			for( var a=0,b=arguments[i].length;a<b;a++){
				target[ target.length ] = arguments[i][a]; 
				target.length++;
			}
		}                                            
    }

    return target;
}
      
/**
* @name extend
* @namespace
* @description used to extend functions onto an Class: 1 argument onto this, 2 arguments onto Class & 3 arguments subClass, superClass and methods to add to build a heirarchy
* @param {Constructor} subClass the base class to add the superClass and addMethods to
* @param {Constructor} superClass the Class to extend onto subClass
* @param {Object} addMethods methods to add to the extended subClass object
**/
function extend(subClass, superClass, addMethods) { 
    // if subClass & superClass are not specified extend onto Simples the object provided
	if( arguments.length === 1 && !( this === window || this === document ) ){
		// Shortcut to extend Simples without adding subClasses
		addMethods = arguments[0];
		subClass = this;  
	// if SuperClass is not specified extend onto subClass the object provided
	} else if( arguments.length === 2 ){
		addMethods = arguments[1];      
	// if no addMethods are specified no superClass structure is created, to ensure superClass structure pass in an empty object
	} else if( arguments.length === 3 ) {                      
		// Standard extend behaviour expected
		var F = function() {};

	    F.prototype = superClass.prototype;
	    subClass.prototype = new F();
	    subClass.prototype.constructor = subClass;

	    subClass.prototype.superclass = superClass.prototype;

	    if (superClass.prototype.constructor == Object.prototype.constructor) {
	        superClass.prototype.constructor = superClass;
	    }
	}

	// Detect whether addMethods is an object to extend onto subClass
	if( isObject( addMethods ) ){
		for (var key in addMethods) {
	        if ( hasOwnProperty.call( addMethods, key ) ) {
	            subClass.prototype[key] = addMethods[key];
	        }
	    }
	}
}

// call with Simples to make sure context is correct
merge.call( Simples, {
	extend : extend,
	merge : merge,
	isArray : isArray,
	isObject : isObject,
	isFunction: isFunction,
	// Has the ready events already been bound?      	
	isReady : false,       
	// Handle when the DOM is ready
	ready : function() {
		// Make sure that the DOM is not already loaded
		if ( !Simples.isReady ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( Simples.ready, 13 );
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

			// Trigger any bound ready events
			if ( Simples.prototype.triggerHandler ) {
				Simples( document ).triggerHandler( "ready" );
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
			return Simples.ready();
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", Simples.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent("onreadystatechange", DOMContentLoaded);

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", Simples.ready );

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
	noop : function(){}
});

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		Simples.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			Simples.ready();
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
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	Simples.ready();
}


Simples.prototype = {
	length : 0,
	selector : '',
	version : '@VERSION',  
	each : function( callback ){
		                                                     
		if( this.length === 1){

			callback.call( this[0] );
		} else if( this.length > 1 ) {
			
			for(var i=0,l=this.length;i<l;i++){
				
				callback.call( this[i], i, l );
			}
		}
		return this;
	},
	filter : function( testFn ){
		
		var newSimples = new Simples();
		newSimples.context = this.context;
		
		this.each(function(i,l){
			if( testFn.call( this, i, l ) === true ){
				newSimples[ newSimples.length ] = this;
				newSimples.length++;
			}
		});           
		
		return newSimples;
	},
	ready: function( fn ) {
		// Attach the listeners
		Simples.bindReady();
		
		// If the DOM is already ready
		if ( Simples.isReady ) {
			// Execute the function immediately
			fn.call( document, Simples );

		// Otherwise, remember the function for later
		} else if ( readyList ) {
			// Add the function to the wait list
			readyList.push( fn );
		}

		return this;
	}
};      
