var STRIP_TAB_NEW_LINE = /[\n\t]/g,
	LAST_SPACE_OPTIONAL = /\s?$/,
	FIRST_LAST_SPACES = /^\s?|\s?$/g;

Simples.extend({ 
	html : function( content ){
		
		if( content.nodeType ){
			
			this.empty();
			this.appendChild( content );
		} else if( typeof content === 'string' ){
			
			this.each(function(){
				this.innerHTML = content;
			});
		} else if( content instanceof Simples ){
			this.empty();        
			this.appendChild( content );
		}
		
		return this;
	},
	appendChild : function( child ){                        

		if ( this[0] && ( child.nodeType || child instanceof Simples ) ) { 
			if( child instanceof Simples ){
				var that = this;
				child.each(function(){
					that[0].appendChild( this );
				});
			} else {
				this[0].appendChild( child );
			}
		}                 	
		return this;
	}, 
	prependChild : function( child ){
		if ( this[0] && ( child.nodeType || child instanceof Simples ) ) {
			var parent = this[0].parentNode;
			if( child instanceof Simples ){
				var that = this;
				child.each(function(){
					parent.insertBefore( this, that[0] );
				});
			} else {
				parent.insertBefore( child, this[0] );
			}
		}
		return this;
	},
	before : function( sibling ){
		if ( this[0] ){
			if( sibling.nodeType && this[0].parentNode ){
				this[0].parentNode.insertBefore( sibling, this[0] );   
			} else if( siblings instanceof Simples && this[0].parentNode ){
				var that = this;
				child.each(function(){
					if( this.nodeType ){
						that[0].parentNode.insertBefore( sibling, that[0] ); 						
					}
				});
			}
		}
		return this;
	},
	after : function( sibling ){
		if ( this[0] ){
			if( sibling.nodeType && this[0].parentNode ){
				this[0].parentNode.insertBefore( sibling, this[0].nextSibling );   
			} else if( siblings instanceof Simples && this[0].parentNode ){
				var that = this;
				child.each(function(){
					if( this.nodeType ){
						that[0].parentNode.insertBefore( this, that[0].nextSibling ); 						
					}
				});
			}
		}
		return this;
	},
	cloneNode : function( deep ){
		return this[0].cloneNode( deep );
	},
	replaceWith : function( element ){
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
	wrap : function( selector ) {
		var tag, elem; 
		if( typeof selector === 'string' ){            
			
			tag = TAG.exec( selector || '<div/>' );
			tag = ( tag !== null && tag.length === 2 ) ? tag[1] : null;
			                               
		} else if( selector instanceof Simples ){
		   	domElem = selector[0];
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
		return this[0] ? " "+this[0].className.indexOf( className )+" " > 0 : false;
	},     
	addClass : function( klass ){
		this.each(function(){
			if( !hasClass.call( [ this ], klass ) ){
				this.className = this.className.replace( LAST_SPACE_OPTIONAL, '') + ' '+klass;
			} 
		});
		return this;
	},
	removeClass : function( klass ){
		this.each(function(){
			if( hasClass.call( [ this ], klass ) ){   
				klass = ' ' + this.className.replace( STRIP_TAB_NEW_LINE, '' ) +' '.replace( ' '+klass+' ', ' ' );
				this.className = klass.replace( FIRST_LAST_SPACES, '' );
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