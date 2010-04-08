// Constants
var TAG = /\<(\w+)\/?\>/,
	// TAG_STRIP = /\b[\.|\#\|\[].+/g,
	FIRST_ID = '#',
	TAG_STRIP = /\b[\.\#\|\[\=].+/g,
	SPACE_WITH_BOUNDARY = /\b\s+/g,
	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwnProperty = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	indexOf = Array.prototype.indexOf;
	// Internal Preferences
	useSimplesObject = true;

function Simples( selector, context ) {

	if( useSimplesObject ){

		if ( !this.each && !this.filter ){	
			return new Simples( selector, context );  		
		}
		
   		// Handle $(""), $(null), or $(undefined) 		
		if ( !selector ){
			return this;
		}
		
		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}
		
		var result = select( selector, context );
		this.context = result.context;
		this.selector = result.selector;
		return merge.call( this, result.elems );
	}
 
	var elements = ( selector.nodeType ) ? [ selector ] : select( selector, context ).elems;

	if( elements.length === 1){  
		if( !elements[0].prependChild ){
			elements = merge.call( elements[0], SimplesElement );
		}
	} else if( elements.length > 1 ){
		for(var i=0,l=elements.length;i<l;i++){
			if( !elements[i].prependChild ){
				elements[i] = merge.call( elements[i], SimplesElement );
			}
		} 
		
		elements = merge.call( new Simples(), elements );
	} else {
		elements = undefined;
	} 

	return elements;
}

function select( selector, context ){
	
	var results = {
		context : context,
		selector : selector,
		elems : []
	};
	
    if ( typeof( selector ) === 'string' ) {
		// clean up selector           
        selector = selector.replace( TAG_STRIP, '');
		// get last id in selector
		var index = selector.lastIndexOf( FIRST_ID );
		selector = selector.substring( index > 0 ? index : 0 );
		// check selector if structured to create element
		var tag = TAG.exec( selector );
		if( tag !== null && tag.length > 1 ){
			
			results.context = document;
			results.selector = tag[0];
            results.elems = [ document.createElement( tag[1] ) ];
		} else {
			results.selector = selector;
			results.context = context = selector.indexOf('#') === 0 ? document : ( context || document );
			
			var split = selector.split( SPACE_WITH_BOUNDARY );     

			for(var i=0,l=split.length;i<l;i++){           
			   	if( context.length > 0){

					var result = [];
					for(var m=0,n=context.length;m<n;m++){

						result = result.concat( getElements( split[i], context[m] ) );
					}
					context = result;
				} else {
					context = getElements( split[i], context );
				}
			}
			
			results.elems = context;
		}
    }                      
	
 	return results;
}

function getElements( selector, context ){

	context = context || document;
	tag = selector.substring(1);
	
	if ( selector.indexOf('#') === 0) {
        // Native function
		var id = document.getElementById( tag ); 
		// test to make sure id is the own specified, because of name being read as id in some browsers
		return id && id.id === tag ? [ id ] : [];

    } else if ( selector.indexOf('.') === 0) {
     	if( context.getElementsByClassName ){
            // Native function
         	return slice.call( context.getElementsByClassName( tag ), 0 );
		} else {
			// For IE which doesn't support getElementsByClassName
			var elems = context.getElementsByTagName('*'),
				nodes = [];
			// Loop over elements to test for correct class
			for(var i=0,l=elems.length;i<l;i++){
				// Detect whether this element has the class specified
				if( (" " + ( elems[i].className || elems[i].getAttribute("class") ) + " ").indexOf( tag ) > -1 ) {
					nodes.push( elems[i] );
				}
			}
			return nodes;
		} 
	} else {     
		// assume that if not id or class must be tag
		return slice.call( context.getElementsByTagName( selector ), 0 );
	}
}

function isArray( obj ){ 
	if( !obj ){ return false; }
	return ( toString.call( obj ) === '[object Array]' );
}

function isObject( obj ){
	if( !obj ){ return false; }
	return ( toString.call( obj ) === '[object Object]' );
}

function isFunction( obj ) {
	return ( toString.call(obj) === "[object Function]" );
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
  
var div = document.createElement("div");
div.style.display = "none";
div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

var a = div.getElementsByTagName("a")[0];

// call with Simples to make sure context is correct
merge.call( Simples, {
	extend : extend,
	merge : merge,
	isArray : isArray,
	isObject : isObject,
	isFunction: isFunction,
	extendElement : function(){
		useSimplesObject = false;
	},
	setContext : function( context, func ){
		return function(){
			return func.apply( context, arguments );
		};
	},
	noop : function(){}
});

Simples.prototype = {  
	each : function( callback ){
		                                                     
		if( this.length === 1){

			return callback.call( this[0] );
		} else {
			var response = [];
			for(var i=0,l=this.length;i<l;i++){

				response.push( callback.call( this[i], i, l ) );
			}

			return response.length === 1 ? response[0] : response;
		}
	},
	filter : function( testFn ){
		
		var results = new Simples();
		results.length = 0;
		
		this.each(function(){
			if( testFn.call( this ) ){
				results[ results.length ] = this;
				results.length++;
			}
		});           
		
		return results;
	}
};      
