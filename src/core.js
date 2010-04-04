// Constants
var TAG = /\<(\w+)\/?\>/g,
	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwnProperty = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	indexOf = Array.prototype.indexOf;

function Simples( selector, context ) {
	if( !this.each ){
	     return new Simples( selector, context );   
	}  
	
	return select.apply( this, arguments );
}

function select( selector, context ){
	
   	// Handle $(""), $(null), or $(undefined)
	if ( !selector ) {
		return this;
	}

	// Handle $(DOMElement)
	if ( selector.nodeType ) {
		this.context = this[0] = selector;
		this.length = 1;
		return this;
	}

	
    if ( typeof( selector ) === 'string' ) {  
	
		var tag = TAG.exec( selector );

		if( tag !== null && tag.length === 2 ){       
			
			this.context = document;
			this[0] = this.context.createElement( tag[1] );
			this.length = 1;        
			
			return this;
		} else {
			
			this.selector = selector;
			this.context = context || document;		 

			tag = selector.substring(1);

	    	if (selector.indexOf('#') === 0) {
	            // Native function   
				tag = this.context.getElementById( tag );
				this.length = 1;
	            this[0] = tag;

	        } else if (selector.indexOf('.') === 0) {
	         	if( this.context.getElementsByClassName ){
		            // Native function
	             	tag = this.context.getElementsByClassName( tag );

					this.length = tag.length;
					Simples.merge( this, tag );
				} else {
					// For IE which doesn't support getElementsByClassName
					var length = 0;
					var elems = this.context.getElementsByTagName('*'); 
					// Loop over elements to test for correct class
					for(var i=0,l=elems.length;i<l;i++){  
						// Detect whether this element has the class specified
						if( (" " + ( elems[i].className || elems[i].getAttribute("class") ) + " ").indexOf( tag ) > -1 ) {
							this[length] = elems[i];
							length++;
						}
					}
					this.length = length;
				}
			}
		}
    }                      
	
 	return this;
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
    var target = arguments.length === 1 ? this : isObject( first ) ? first : {};
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
		} else if( Simples.isArray( arguments[i] ) ){

			for( var a=0,b=arguments[i].length;a<b;a++){
				target[a] = arguments[i][a]; 
			}
		}                                            
    }

    return target;
}
      
/**
* @name extend
* @namespace
* @description used to extend functions onto an Class 
	if subClass & superClass are not specified extend onto Simples the object provided
	if SuperClass is not specified extend onto subClass the object provided
	if no addMethods are specified no superClass structure is created, to ensure superClass structure pass in an empty object
* @param {Constructor} subClass the base class to add the superClass and addMethods to
* @param {Constructor} superClass the Class to extend onto subClass
* @param {Object} addMethods methods to add to the extended subClass object
**/
function extend(subClass, superClass, addMethods) { 
	
	if( arguments.length === 1 ){
		// Shortcut to extend Simples without adding subClasses
		addMethods = arguments[0];
		subClass = Simples;                                     
	} else if( arguments.length === 2 ){
		addMethods = arguments[1];
	} else {                      
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
	support:{
		boxModel : (function(){
			var div = document.createElement("div");
			div.style.width = div.style.paddingLeft = "1px";

			document.body.appendChild( div );
			var isBoxModel = div.offsetWidth === 2;
			document.body.removeChild( div ).style.display = 'none';
			div = null;       
			return isBoxModel;	
		})(),
		opacity : /^0.55$/.test( a.style.opacity ),
		cssFloat: !!a.style.cssFloat
	}
});

Simples.prototype = {  
	each : function( callback ){
		                                                     
		if( this.length === 1){
			
			return callback.call( this[0] );
		} else {
			var response = [];
			for(var i=0,l=this.length;i<l;i++){
			
				response.push( callback.call( this[i] ) );
			}
		
			return response.length === 1 ? response[0] : response;
		}
	}, 
	append : function( child ){                        

		if ( child.nodeType || child instanceof Simples ) {
			return this.each(function(){
				if( child instanceof Simples ){
					var that = this;
					child.each(function(){
						that.appendChild( this );
					});
				} else {
					this.appendChild( child );
				}
			});
		}
		return this;
	}, 
	prepend : function( child ){
		if ( child.nodeType || child instanceof Simples ) {
			return this.each(function(){       
				var parent = this.parentNode;
				if( child instanceof Simples ){
					var that = this;
					child.each(function(){
						parent.insertBefore( this, that );
					});
				} else {
					parent.insertBefore( child, this );
				}
			});
		}
		return this;
	},
	wrap : function( selector ) { 
		
		if( typeof selector === 'string' ){            
			
			var tag = TAG.exec( selector || '<div/>' );
			tag = ( tag !== null && tag.length === 2 ) ? tag[1] : 'div';
			
			this.each(function(){                          

				var elem = document.createElement( tag );

		        this.parentNode.insertBefore(elem, this);
		        elem.appendChild(this);
			});                                
		}
		
		return this;
    },   
	remove : function(){
		this.each(function(){
		   	this.parentNode.removeChild( this ); 
		});
	}
};      
