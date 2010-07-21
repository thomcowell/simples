var STRIP_TAB_NEW_LINE = /\n|\t/g,
	LAST_SPACE_OPTIONAL = /\s?$/,
	FIRST_SPACE = /^\s+/,
	LOCATION_INSIDE = /top|bottom|inner/,
	LOCATION_SINGLE = /remove|empty|unwrap/,
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

Simples.extend({
	html : function( location, html ){
		if (arguments.length === 0) {
			return this[0] ? this[0].innerHTML : "";
		}

		if ( arguments.length === 1 && !LOCATION_SINGLE.test( arguments[0] ) ) {
		    html = location;
		    location = 'inner';
		}
		
		location = location || "", results = [];
		
		this.each(function(index) {
			var el = this, parent = el.parentNode;
			if( el.nodeType === 3 || el.nodeType === 8 ){ return; }
		    if (location == "inner") {
			  	var list, len, i = 0;     
				cleanData( this, false ); 
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
			} else if (location == "outer" && parent ) {
				cleanData( this );
		        parent.replaceChild( wrapHelper(html, el), el);
		    } else if (location == "top") {
		        el.insertBefore( wrapHelper(html, el), el.firstChild);
		    } else if (location == "bottom") {
		        el.insertBefore( wrapHelper(html, el), null);
		    } else if (location == "remove" && parent) { 
				cleanData( this );
		        parent.removeChild(el);
		    } else if (location == "before" && parent) {
		        parent.insertBefore( wrapHelper(html, parent), el);
		    } else if (location == "after" && parent) {
		        parent.insertBefore( wrapHelper(html, parent), el.nextSibling);
			} else if( location == "empty" ) {
				cleanData( this, false ); 
				while ( el.firstChild ) {
					el.removeChild( el.firstChild );
				}
			} else if (location == "wrap" && parent) {  
				var elem = wrapHelper(html, parent); 
				parent.insertBefore( elem, el );
				elem.appendChild( el );
			} else if(location == "unwrap" && parent){
				results.concat( slice.call( el.childNodes, 0 ) );
				parent.insertBefore( el.childNodes, el );
				cleanData( el );
				parent.removeChild( el );
			}
	    }); 
		
		return results.length ? Simples( results ) : this;
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
		var nameClass = toString.call( name );
			
		if( nameClass === ObjectClass ){
			for( var key in name ){
				this.attr( key, name[key] );
			}
		} else if( nameClass === StringClass ){
			if( value === undefined ){                

				var elem = this[0];
				if( !elem ){ return null; }     

				if ( elem.nodeName.toUpperCase() === "FORM" && elem.getAttributeNode(name) ) {
					// browsers index elements by id/name on forms, give priority to attributes.				
					return elem.getAttributeNode( name ).nodeValue;
				} else if ( name === "style" && !Simples.support.style ){
					// get style correctly
					return elem.style.cssText;				
				} else if( elem.nodeType === 1 && !SPECIAL_URL.test( name ) && name in elem ){
					// These attributes don't require special treatment
					return elem[ name ];
				} else {
					// it must be this
					return elem.getAttribute( name );
				}
				return null;
			} else if( value === null){
				this.each(function(){
					if ( this.nodeType === 1 ) {
						this.removeAttribute( name );
					}				
				});
			} else { 
				if( typeof value == ( 'function' || 'object' ) ){ return this; }
				this.each(function(){                                  
					if ( this.nodeType === 3 || this.nodeType === 8 || ( name === "type" && IMMUTABLE_ATTR.test( this.nodeName ) ) ) {
						return undefined;
					}

					if( name === "style" && !Simples.support.style ){
						// get style correctly
						elem.style.cssText = "" + value;
					} else if ( this.nodeType === 1 && !SPECIAL_URL.test( name ) && name in this ) { 
						// These attributes don't require special treatment 
						this[ name ] = ""+value;
					} else { 
						// it must be this
						this.setAttribute(name, ""+value);
					}
				});			
			}
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
	slice : function( i, len ){
		len = ( 0 < len ) ? len : 1 ;
		return Simples( slice.apply( this, i < 0 ? [ i ] : [+i, i+len]  ) );
	}
});