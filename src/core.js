// Constants
var TAG = /\<(\w+)\/?\>/g;

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

/**
 * @name merge
 * @namespace
 * @description used to merge objects into one
 * @param {Object} obj native javascript object to be merged  
 * @param {Object|Array} obj native javascript object or array to be merged onto first  	
 **/
function merge( target /* obj1, obj2..... */) { 
	
    target = target || {};
    
    for (var i=1,l=arguments.length; i<l; i++) {
        if (typeof(arguments[i]) === 'object' && arguments[i] !== null) {
	
			if( arguments[i].constructor === Array ){
				
				for( var a=0,b=arguments[i].length;a<b;a++){
					target[a] = arguments[i][a]; 
				}
			} else {
				for (var key in arguments[i]) {
	                if (arguments[i].hasOwnProperty(key)) {
	                    target[key] = arguments[i][key];
	                }
	            }
			}
        }
    }

    return target;
}
      
/**
* @name extend
* @namespace
* @description used to extend a superclass onto a subclass and add functions
* @param {Constructor} subClass the base class to add the superClass and addMethods to
* @param {Constructor} superClass the Class to extend onto subClass
* @param {Object} addMethods methods to add to the extended subClass object
**/
function extend(subClass, superClass, addMethods) { 

	if( arguments.length === 1 && typeof(arguments[0]) === 'object' ){
		// Shortcut to extend Simples without adding subClasses
		addMethods = subClass;
		subClass = Simples;                                     
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

    for (var key in addMethods) {
        if (addMethods.hasOwnProperty(key)) {
            subClass.prototype[key] = addMethods[key];
        }
    }
}
  
var div = document.createElement("div");
div.style.display = "none";
div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

var a = div.getElementsByTagName("a")[0];

merge( Simples, {
	extend : extend,
	merge : merge,
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
		
		for(var i=0,l=this.length;i<l;i++){
			
			callback.call( this[i] );
		}   
	}, 
	append : function( child ){                        
		debugger;
		if ( child.nodeType || child instanceof Simples ) {
			return this.each(function(){
				
				this.appendChild( child );
			});
		}
		return this;
	},
	wrap : function( selector ) {
		
		this.each(function(){                         
			
			var tag = TAG.exec( selector || '<div/>' ); 

			var div = document.createElement( ( tag !== null && tag.length === 2 ) ? tag[1] : 'div' );

	        this.parentNode.insertBefore(div, this);
	        div.appendChild(this);
		});
		
		return this;
    },  
	remove : function(){
		return this.each(function(){
			
		   	this.parentNode.removeChild( this ); 
		});
	}
};      
