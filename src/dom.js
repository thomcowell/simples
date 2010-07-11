var STRIP_TAB_NEW_LINE = /[\n\t]/g,
	LAST_SPACE_OPTIONAL = /\s?$/,
	FIRST_LAST_SPACES = /^\s?|\s?$/g;

Simples.extend({
	domManip : function( children, reverse, insertFn ){
        if( !isFunction( insertFn ) ){ return this; }
		if( typeof children === "string" ){
			this.each(function(){
				
				var div = document.createElement('div');

				div.innerHTML = children;
				children = div.childNodes;

               	for(var i=children.length;i>=0;i--){
					insertFn.call( this, children[i] );
				}
			});
		} else if ( children instanceof Simples ){
			var i=0,l=children.length;
			while(l){
				l--;
				insertFn.call( this, children[l] );
			}			
		} else if ( children && children.nodeType === 1 ){
			insertFn.call( this[0], children[i] );
		}
		return this;
	},
	html : function( content ){
		if( typeof content === 'string' ){
			this.each(function(){
				this.innerHTML = content;
			});
		} else {
			this.empty().append( content );
		}
		return this;
	},
	append : function( value ){
		return this.domManip( value, false, function( node ){
			if ( this.nodeType === 1 ) {
				this.appendChild( node );
			}
		});
	},
	prepend : function( value ){
		return this.domManip( value, true, function( node ){
			if ( this.nodeType === 1 ) {
				this.insertBefore( node, this.firstChild );
			}
		});
	},  
	after : function( value ){
		return this.domManip( value, true, function( node ){
			if ( this && this.parentNode ) {
				this.parentNode.insertBefore( node, this.nextSibling );
			}
		});
	},
	before : function( value ){
		return this.domManip( value, false, function( node ){
			if ( this && this.parentNode ) {
				this.parentNode.insertBefore( node, this );
			}
		});
	},
	replaceWith : function( value ){
		this.each(function(){
			var next = this.nextSibling, parent = this.parentNode;
			cleanData( this );
			parent.removeChild( this );
			if( next ){
				Simples( next ).before( value );
			} else {
				Simples( parent ).append( value );
			}
		});
	},  
	clone : function(){
		var results = [];
		var noCloneEvent = Simples.support.noCloneEvent;
		this.each(function(i){
			if( noCloneEvent ){
				var html = this.outerHTML, ownerDocument = this.ownerDocument;

				if ( !html ) {
					var div = ownerDocument.createElement("div");
					div.appendChild( this.cloneNode(true) );
					html = div.innerHTML;
				}

				var elem = ownerDocument.createElement("div");
				elem.innerHTML = html;
				cleanData( elem );

				results.concat( slice.call( elem.childNodes ) );
			} else {
				results.push( this.cloneNode( true ) );
			}
		});
		return Simples( results );
	},
	wrap : function( selector ) {		
		var tag, domElem;
		if( typeof selector === 'string' ){            
			
			tag = TAG.exec( selector || '<div/>' );
			domElem = document.createElement( ( tag !== null && tag.length === 2 ) ? tag[1] : null );
		} else if( selector instanceof Simples ){
		   	domElem = selector[0];
		} else if( selector && selector.nodeType === 1 ){
			domElem = selector;
		}
		
		if( !domElem ){ return this; }
		
		this.each(function(){
			if( this.parentNode && this.nodeType && this.nodeType !== 9 ){
				var elem = Simples( domElem ).clone()[0];
				this.parentNode.insertBefore( elem, this );
				elem.appendChild( this );
			}
		});
		
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
			if ( this.nodeType === 1 ) {
				cleanData( this, false );
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
					cleanData( this );
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