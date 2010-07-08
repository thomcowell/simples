var STRIP_TAB_NEW_LINE = /[\n\t]/g,
	LAST_SPACE_OPTIONAL = /\s?$/,
	FIRST_LAST_SPACES = /^\s?|\s?$/g;
	
SimplesElement = {
	domManip : function( node, fnName, children, posElem, posName, reverse ){
		options = options || {};
		if( options.fnName !== undefined ){			
			if( typeof children === "string" ){
				var div = document.createElement('div'), position = options.position, positionName = options.positionName, insertName = options.insertName;
				div.innerHTML = children;
				children = div.childNodes;

				for(var i=children.length;i>=0;i--){
					node[ options.fnName ]( children[i], position && positionName ? position[ positionName ] : position );
				}
			} else if ( children instanceof Simples ){
				var i = children.length, position = options.position, positionName = options.positionName, insertName = options.insertName;
				while(i>-1){
					node[ options.fnName ]( children[i], position && positionName ? position[ positionName ] : position );
					i--;
				}			
			} else if ( children && children.nodeType === 1 ){
				node[ options.fnName ]( children, options.position && options.positionName ? options.position[ options.positionName ] : options.position );
			}
		}
	},
	html : function( content ){
		if( typeof content === 'string' ){
			this.each(function(){
				this.innerHTML = content;
			});
		} else {
						
			this.empty();
			this.domManip( this, 'appendChild', content );
		}
		return this;
	},
	append : function( child ){ 
		this.domManip( this, 'appendChild', child );
		return this;
	},  
	
	prepend : function( child ){
		domManip( this, 'insertBefore', child, this, 'firstChild' );
		return this;
	},  
	after : function( child ){
		domManip( this.parentNode, 'insertBefore', child, this, 'nextSibling' );
		return this   	                                                                             
	},
	before : function( child ){
		domManip( this.parentNode, 'insertBefore', child, this ); 
		// var parent = this.parentNode;
		// if( parent && typeof child === "string" ){
		// 	var div = document.createElement('div')
		// 	div.innerHTML = child;
		// 	child = div.childNodes;
		// 	
		// 	for(var i=0,l=child.length;i<l;i++){  
		// 		parent.insertBefore( sibling, elem );
		// 		parent.insertBefore( child[i], this );
		// 	}
		// } else if ( parent && child && child.nodeType === 1 ){
		// 	parent.insertBefore( child, this );
		// }		                                                                             
	},
	replaceWith : function( child ){
		var that = this;
		this.each(function(i){
			var parent = this.parentNode;
			if ( parent && element.nodeType ) {    
				cleanData( this );
				parent.replaceChild( element, this );
			}
			that[i] = element;
		});                      
	},
	hasClass : function( className ){
		this.nodeType ? ( (" " + this.className + " ").replace(STRIP_TAB_NEW_LINE, " ").indexOf( " " + className + " " ) > -1 ) : false		
	}
};

SimplesElements = {
	empty : function(){
		// Remove element nodes and prevent memory leaks
		if ( this.nodeType === 1 ) {
			cleanData( this.getElementsByTagName("*") );
		}

		// Remove any remaining nodes
		while ( this.firstChild ) {
			this.removeChild( this.firstChild );
		}		
	},
	remove : function(){
		if ( this.parentNode ) { 
			if ( this.nodeType === 1 ) {
				cleanData( this.getElementsByTagName("*") );
			}
			
			this.parentNode.removeChild( this );
		}
	}
}
Simples.extend({ 
	// html : function( content ){
	// 		
	// 	if( content.nodeType || content instanceof Simples ){
	// 		
	// 		this.empty();
	// 		this.appendChild( content );
	// 	} else if( typeof content === 'string' ){
	// 		
	// 		this.each(function(){
	// 			this.innerHTML = content;
	// 		});
	// 	}
	// 	
	// 	return this;
	// },          
	// appendChild : function( child ){                        
	//         var elem = this[0];                                            
	// 	if( typeof child === "string" ){
	// 		var div = document.createElement('div')
	// 		div.innerHTML = child;
	// 		child = div.childNodes;
	// 		
	// 		for(var i=0,l=child.length;i<l;i++){
	// 			elem.appendChild( child[i] );
	// 		}
	// 	} else if ( child instanceof Simples ){
	// 		for(var i=0,l=child.length;i<l;i++){
	// 			elem.appendChild( child[i] );
	// 		}
	// 	} else if ( child && child.nodeType === 1 ){
	// 		elem.appendChild( child );
	// 	}            	
	// 	return this;
	// },          
	// prependChild : function( child ){
	// 	var elem = this[0];
	// if( typeof child === "string" ){
	// 	var div = document.createElement('div')
	// 	div.innerHTML = child;
	// 	child = div.childNodes;
	// 	
	// 	for(var i=child.length;i>=0;i--){
	// 		elem.insertBefore( child[i], elem.firstChild );
	// 	}
	// } else if ( child instanceof Simples ){
	// 	var i = child.length;
	// 	while(i>-1){
	// 		elem.insertBefore( child[i], elem.firstChild );
	// 		i--;
	// 	}			
	// } else if ( child && child.nodeType === 1 ){
	// 	elem.insertBefore( child, elem.firstChild );
	// }
	// 	return this;
	// },    
	// before : function( sibling ){
	// 	var elem = this[0];
	// 	if ( elem ){
	// 		var parent = elem.parentNode; 
	// 		if( sibling.nodeType && parent ){
	// 			parent.insertBefore( sibling, elem );   
	// 		} else if( siblings instanceof Simples && parent ){
	// 			sibling.each(function(){
	// 				parent.insertBefore( this, elem ); 						
	// 			});
	// 		}
	// 	}
	// 	return this;
	// },
	// after : function( sibling ){
	// 	var elem = this[0]; 
	// 	if ( elem ){
	// 		var parent = elem.parentNode;
	// 		if( sibling.nodeType && parent ){
	// 			parent.insertBefore( sibling, elem.nextSibling );   
	// 		} else if( siblings instanceof Simples && parent ){
	// 			sibling.each(function(){
	// 				parent.insertBefore( this, elem.nextSibling ); 						
	// 			});
	// 		}
	// 	}
	// 	return this;
	// },      
	cloneNode : function( deep ){
		return this[0].cloneNode( deep );
	},
	replaceWith : function( child ){
		SimplesElement.insert( this.parentNode, child, 'replaceChild', this ); 
		// var that = this;
		// this.each(function(i){
		// 	var parent = this.parentNode;
		// 	if ( parent && element.nodeType ) {    
		// 		cleanData( this );
		// 		parent.replaceChild( element, this );
		// 	}
		// 	that[i] = element;
		// });   
	},
	wrap : function( selector ) {
		var tag, elem; 
		if( typeof selector === 'string' ){            
			
			tag = TAG.exec( selector || '<div/>' );
			tag = ( tag !== null && tag.length === 2 ) ? tag[1] : null;
			                               
		} else if( selector instanceof Simples ){
		   	domElem = selector[0];
		} else if( selector && selector.nodeType === 1 ){
			domElem = selector;
		}
		   
		if( tag || domElem ){
			this.each(function(){                          

	            if( this.parentNode ){ 
					elem = tag ? document.createElement( tag ) : domElem.cloneNode();
		        	this.parentNode.insertBefore(elem, this);
		        	elem.appendChild(this);
				}
			});			
		}    
		
		return this;
    },
	unwrap : function(){
		if( this.length ){
			results = [];
			this.each(function(){
				var parent = this.parentNode;
				if( parent ){
					var children = this.childNodes;
					for(var i=0,l=children.length;i<l;i++){

						parent.insertBefore( children[i], this );
					}
					this.remove();
					results.concat( children );
				}
			});
			return Simples( results );
		}
		return this;
	},
	empty : function(){             
		this.each(function(){
			// Remove element nodes and prevent memory leaks
			if ( this.nodeType === 1 ) {
				cleanData( this.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( this.firstChild ) {
				this.removeChild( this.firstChild );
			}
		});
	},
	remove : function(){
		this.each(function(){
			if ( this.parentNode ) { 
				if ( this.nodeType === 1 ) {
					cleanData( this.getElementsByTagName("*") );
				}
				
				this.parentNode.removeChild( this );
			}
		});
	},
	// attributes	
	hasClass : function( className ){
		className = " " + className + " ";
		// for ( var i = 0, l = this.length; i < l; i++ ) {
		// 	if ( (" " + this[0].className + " ").replace(STRIP_TAB_NEW_LINE, " ").indexOf( className ) > -1 ) {
		// 		return true;
		// 	}
		// }             
		return this[0] ? ( (" " + this[0].className + " ").replace(STRIP_TAB_NEW_LINE, " ").indexOf( className ) > -1 ) : false;
	},     
	addClass : function( className ){
		this.each(function(){
			if( !Simples(this).hasClass( className ) ){
				this.className = this.className.replace( LAST_SPACE_OPTIONAL, '') + ' '+className;
			} 
		});
		return this;
	},
	removeClass : function( className ){
		this.each(function(){
			if( Simples(this).hasClass( className ) ){   
				className = ' ' + this.className.replace( STRIP_TAB_NEW_LINE, '' ) +' '.replace( ' '+className+' ', ' ' );
				this.className = className.replace( FIRST_LAST_SPACES, '' );
			}  
		});
		return this;		
	},
	attr : function(name, value){
		if( name && value ){
			this.each(function(){
				if ( this.nodeType === 1 ) { 
					this.setAttribute(name, value);
				}
			});
		} else if( name && value === undefined ){
			return this[0] ? this[0].getAttribute( name ) : null;
		} else if( name && value === null){
			this.each(function(){
				if ( this.nodeType === 1 ) {
					this.removeAttribute( name );
				}				
			});
		}
		return this;
	}
});