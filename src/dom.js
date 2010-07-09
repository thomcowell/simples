var STRIP_TAB_NEW_LINE = /[\n\t]/g,
	LAST_SPACE_OPTIONAL = /\s?$/,
	FIRST_LAST_SPACES = /^\s?|\s?$/g;

function setUpOptions( elem, type, content ){
	switch( type ){
		case 'append':
			return {
				node : elem,
				fnName : 'appendChild'
			};
		case 'prepend':
			return {
				node : elem,
				fnName : 'insertBefore',
				position : elem.firstChild
			};
		case 'after':
			return {
				node : elem.parentNode,
				fnName : 'insertBefore',
				position : elem.nextSibling
			};
		case 'before':
			return {
				node : elem.parentNode,
				fnName : 'insertBefore',
				reverse : true,
				position : elem
			};   
		case 'wrap':
			return {
				node : elem.parentNode,
				fnName : 'insertBefore',
				position : elem
			};			
		case 'replaceWith':
			cleanData( elem );
			return {
				node : elem.parentNode,
				fnName : 'replaceChild',
				position : elem
			}
	};
	return {};
};

Simples.extend({
	insert : function( type, children ){
		var o = setUpOptions( this[0], type ), fnName = o.fnName;
		
		if( o.fnName && typeof children === "string" ){
			this.each(function(){
				
				var o = setUpOptions( this, type ),
					div = document.createElement('div');
                
				if( o.node ){
					div.innerHTML = children;
					children = div.childNodes;

	               	for(var i=children.length;i>=0;i--){
						o.node[ o.fnName ]( children[i], o.position );
					}
				}
			});
		} else if ( o.fnName && children instanceof Simples ){
			var i=0,l=children.length;
			while(l>-1){
				o.node[ o.fnName ]( children[i], o.position );
				l--;
			}			
		} else if ( o.fnName && children && children.nodeType === 1 ){
			o.node[ o.fnName ]( children, o.position );
		}
	},
	html : function( content ){
		if( typeof content === 'string' ){
			this.each(function(){
				this.innerHTML = content;
			});
		} else {
			this.empty().insert( 'append', content );
		}
		return this;
	},
	append : function( child ){
		return this.insert( 'append', child );
	},
	prepend : function( child ){
		return this.insert( 'prepend', child );
	},  
	after : function( child ){
		return this.insert( 'after', child );
	},
	before : function( child ){
		return this.insert( 'before', child ); 	                                                                             
	},
	replaceWith : function( child ){
		return this.insert( 'replaceWith', child );
	},  
	clone : function( deep ){
		var results = new Simples();
		this.each(function(i){
			results[i] = this.cloneNode( deep );
			results.length = i+1;
		});
		return results;
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
			results = new Simples();
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
			
			
				cleanElemData( this );

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
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( (" " + this[i].className + " ").replace(STRIP_TAB_NEW_LINE, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}
		return false;
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