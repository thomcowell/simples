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
	HTMLCollectionClass = "[object HTMLCollection]";

function Simples( selector, context ) {

	if ( !(this instanceof Simples) ){	// or this.each !== Simples.prototype.each
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
		var result = select( selector, context );
		this.context = result.context;
		this.selector = result.selector;

		merge.call( this, result.elems );

	} else if( objClass === HTMLCollectionClass || objClass === NodeListClass ){

		merge.call( this, slice.call(selector, 0) );		
    } else if( objClass === ArrayClass ){

		for(var d=0,e=selector.length;d<e;d++){
			if( selector[d] && selector[d].nodeType ){
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
	setContext : function( context, func ){
		return function(){
			return func.apply( context, arguments );
		};
	},
	noop : function(){}
});

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
	}
};      
