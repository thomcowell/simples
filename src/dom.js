var STRIP_TAB_NEW_LINE = /\n|\t/g,
	LAST_SPACE_OPTIONAL = /\s?$/,
	FIRST_SPACE = /^\s+/,
	IMMUTABLE_ATTR = /(button|input)/i,
	SPECIAL_URL = /href|src|style/,
	FIRST_LAST_SPACES = /^\s?|\s?$/g;

// Borrowed from XUI project
// private method for finding a dom element
function getTag(el) {
    return (el.firstChild === null) ? {'UL':'LI','DL':'DT','TR':'TD'}[el.tagName] || el.tagName : el.firstChild.tagName;
}

function wrapHelper(html, el) {
  return (typeof html == "string") ? wrap(html, getTag(el)) : html && html.each ? slice.call( html, 0 ) : html;
}

// private method
// Wraps the HTML in a TAG, Tag is optional
// If the html starts with a Tag, it will wrap the context in that tag.
function wrap(xhtml, tag) {

    var attributes = {},
        re = /^<([A-Z][A-Z0-9]*)([^>]*)>(.*)<\/\1>/i,
        element,
        x,
        a,
        i = 0,
        attr,
        node,
        attrList;

    if (re.test(xhtml)) {
        result = re.exec(xhtml);
        tag = result[1];

        // if the node has any attributes, convert to object
        if (result[2] !== "") {
            attrList = result[2].split(/([A-Z]*\s*=\s*['|"][A-Z0-9:;#\s]*['|"])/i);

            for (; i < attrList.length; i++) {
                attr = attrList[i].replace(/^\s*|\s*$/g, "");
                if (attr !== "" && attr !== " ") {
                    node = attr.split('=');
                    attributes[node[0]] = node[1].replace(/(["']?)/g, '');
                }
            }
        }
        xhtml = result[3];
    }

    element = document.createElement(tag);
    
	Simples( element ).attr( attributes );

    element.innerHTML = xhtml;
    return element;
}

function clean( el ){
	cleanData( el ); 
	Simples( el ).empty();
}

Simples.extend({
	html : function( location, html ){
		if (arguments.length === 0) {
           return this[0].innerHTML;
       }

       if ( arguments.length === 1 && arguments[0] !== 'remove') {
           html = location;
           location = 'inner';
       }

       return this.each(function() {
           var el = this, parent =this.parentNode, list, len, i = 0;
           if (location == "inner") {  
               if (typeof html === "string") {
                   el.innerHTML = html;
                   list = el.getElementsByTagName('SCRIPT');
                   len = list.length;
                   for (; i < len; i++) {
                       eval(list[i].text);
                   }
               } else {
                   el.innerHTML = '';
                   el.appendChild( html && html.each ? slice.call( html, 0 ) : html);
               }
           } else if (location == "outer") {
               parent.replaceChild( wrapHelper(html, el), el);
           } else if (location == "top") {
               el.insertBefore( wrapHelper(html, el), el.firstChild);
           } else if (location == "bottom") {
               el.insertBefore( wrapHelper(html, el), null);
           } else if (location == "remove") {
               parent.removeChild(el);
           } else if (location == "before") {
               parent.insertBefore( wrapHelper(html, parent), el);
           } else if (location == "after") {
               parent.insertBefore( wrapHelper(html, parent), el.nextSibling);
		   }
        });
		return this;
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
		if( !this.length ){ return this; }
		results = [];
		this.each(function(){
			var parent = this.parentNode;
			if( parent ){
				var children = slice.call( this.childNodes, 0);
				for(var i=0,l=children.length;i<l;i++){

					parent.insertBefore( children[i], this );
				}
				Simples(this).remove();
				results.concat( children );
			}
		});
		return Simples( results );
	},
	empty : function(){            
		this.each(function(){
			cleanData( this, false );
			// Remove any remaining nodes
			while ( this.firstChild ) {
				this.removeChild( this.firstChild );
			}
		});
	},
	remove : function(){
		this.each(function(){
			if ( this.parentNode ) { 
				cleanData( this );				
				this.parentNode.removeChild( this );
			}
		});
	},
	// attributes	
	hasClass : function( className ){
		className = " " + className + " ";
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( (" " + this[i].className + " ").replace( STRIP_TAB_NEW_LINE, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}
		return false;
	},     
	addClass : function( className ){
		this.each(function(){
			if( !Simples(this).hasClass( className ) ){
				classname = ( this.className.replace( STRIP_TAB_NEW_LINE, " ").replace( LAST_SPACE_OPTIONAL, '') + ' '+className );
				this.className = classname.replace( FIRST_SPACE,'');
			} 
		});
		return this;
	},
	removeClass : function( className ){
		this.each(function(){
			className = (' ' + this.className.replace( STRIP_TAB_NEW_LINE, " ") +' ').replace( ' '+className+' ', ' ' );
			this.className = className.replace( FIRST_LAST_SPACES, '' );
		});
		return this;		
	},
	attr : function(name, value){
		var special = SPECIAL_URL.test( name ),
			nameClass = toString.call( name );
			
		if( nameClass === ObjectClass ){
			for( var key in name ){
				this.attr( key, name[key] );
			}
		} else if( nameClass === StringClass && value ){
			this.each(function(){                                  
				if ( this.nodeType === 3 || this.nodeType === 8 || ( name === "type" && IMMUTABLE_ATTR.test( this.nodeName ) ) ) {
					return undefined;
				}
				if ( this.nodeType === 1 && !special && name in this ) { 
					this[ name ] = value;
				} else if( name === "style" && !Simples.support.style ){
					elem.style.cssText = "" + value;
				} else {
					this.setAttribute(name, ""+value);
				}
			});
		} else if( nameClass === StringClass && value === undefined ){                
			var elem;
			for(var i=0,l=this.length;i<l;i++){
				if ( this.nodeType !== 3 && this.nodeType !== 8 ) {
					elem = this[i];
					break;
				}
			}     
			if( !elem ){ return null; }     
			// browsers index elements by id/name on forms, give priority to attributes.
			if ( elem.nodeName.toUpperCase() === "FORM" && elem.getAttributeNode(name) ) {
				return elem.getAttributeNode( name ).nodeValue;
			} else if( elem.nodeType === 1 && !special && name in elem ){
				// These attributes require special treatment				
				return elem[ name ]; 
			} else if ( name === "style" && !Simples.support.style ){
				return elem.style.cssText;
			} else {
				return elem.getAttribute( name );
			}
			return null;
		} else if( nameClass === StringClass && value === null){
			this.each(function(){
				if ( this.nodeType === 1 ) {
					this.removeAttribute( name );
				}				
			});
		}
		return this;
	},
	/* TODO: Rename me as I don't indicate functionality */
	traverse : function( name ){
		var isWhat = toString.call( name ), results = [];
		this.each(function(){
			var elem = ( isWhat === StringClass ) ? this[ name ] : ( isWhat === FunctionClass ) ? name.call( this )  : null;
			if( elem ){
				elem = elem && ( elem.item || elem.length ) ? slice.call( elem, 0 ) : [ elem ];
				results = results.concat( elem );
			}
		}); 
		return Simples( results );
	},
	eq : function( i ){
		return Simples( slice.apply( this, i < 0 ? [ i ] : [+i, i+1]  ) );
	}
});