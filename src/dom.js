var STRIP_TAB_NEW_LINE = /\n|\t/g,
	OTHER_SINGLE_ARGUMENTS = /^remove$|^empty$|^unwrap$/,
	IMMUTABLE_ATTR = /(button|input)/i,
	SPECIAL_URL = /href|src|style/,
	VALID_ELEMENTS = /^<([A-Z][A-Z0-9]*)([^>]*)>(.*)<\/\1>/i, 
	SPLIT_ATTRIBUTE = /([A-Z]*\s*=\s*['|"][A-Z0-9:;#\s]*['|"])/i,
	QUOTE_MATCHER = /(["']?)/g;

// private method - Borrowed from XUI project
// Wraps the HTML in a TAG, Tag is optional. If the html starts with a Tag, it will wrap the context in that tag.
function wrapHelper(xhtml, el) {
	// insert into document fragment to ensure insert occurs without messing up order
 	if( xhtml.toString().indexOf("[object ") > -1 ){
		if( xhtml && xhtml.length !== undefined ){
			var docFrag = document.createDocumentFragment();
			xhtml = slice.call( xhtml, 0 );
			for(var p=0,r=xhtml.length;p<r;p++){
				docFrag.appendChild( xhtml[p] );
			}
			xhtml = docFrag;
		}
		
		return xhtml;
	}
    var attributes = {}, element, x, i = 0, attr, node, attrList, result, tag;
    xhtml = "" + xhtml
    if ( VALID_ELEMENTS.test(xhtml) ) {
        result = VALID_ELEMENTS.exec(xhtml);
		tag = result[1];

        // if the node has any attributes, convert to object
        if (result[2] !== "") {
            attrList = result[2].split( SPLIT_ATTRIBUTE );

            for (var l=attrList.length; i < l; i++) {
                attr = Simples.trim( attrList[i] );
                if (attr !== "" && attr !== " ") {
                    node = attr.split('=');
                    attributes[ node[0] ] = node[1].replace( QUOTE_MATCHER, '');
                }
            }
        }
        xhtml = result[3];
    } else {
		tag = (el.firstChild === null) ? {'UL':'LI','DL':'DT','TR':'TD'}[el.tagName] || el.tagName : el.firstChild.tagName;
	}

    element = document.createElement(tag);

    for( x in attributes ){
		attrs( element, x, attributes[x] );
	}

    element.innerHTML = xhtml;
    return element;
}

// private method - className must be provided as " "+className+" "
function hasClass( elem, className ){                 
	return (" " + elem.className + " ").replace( STRIP_TAB_NEW_LINE, " ").indexOf( className ) > -1;
} 

function attrs( elem, name, value ){
	if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
		return undefined;
	}
	
	if( value === undefined ){
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
	} else if( value === null ){   	
		if ( elem.nodeType === 1 ) {
			elem.removeAttribute( name );
		}
	} else { 
		if ( typeof value == ( 'function' || 'object' ) || ( name === "type" && IMMUTABLE_ATTR.test( elem.nodeName ) ) ) {
			return undefined;
		}

		if( name === "style" && !Simples.support.style ){
			// get style correctly
			elem.style.cssText = "" + value;
		} else if ( elem.nodeType === 1 && !SPECIAL_URL.test( name ) && name in elem ) { 
			// These attributes don't require special treatment 
			elem[ name ] = ""+value;
		} else { 
			// it must be this
			elem.setAttribute(name, ""+value);
		}
	}	
}

Simples.extend({
	html : function( location, html ){
		if (arguments.length === 0) {
			return this[0] ? this[0].innerHTML : "";
		} else if ( arguments.length === 1 ){	
			if( location === "outer" && this[0] ){
				html = this[0].outerHTML;

				if ( !html ) {
					var div = this[0].ownerDocument.createElement("div");
					div.appendChild( this[0].cloneNode(true) );
					html = div.innerHTML;
				}
				
				return html;
			} else if( !OTHER_SINGLE_ARGUMENTS.test( arguments[0] ) ) {
			    html = location;
			    location = 'inner';
			} 
		}
		
		location = location || "";
		var results = new Simples();
		
		this.each(function(index) {   

			var el = this, parent = el.parentNode, elem;
			if( el.nodeType === 3 || el.nodeType === 8 ){ return; }
		    if (location == "inner") {
			  	var list, len, i = 0;     
				cleanData( this, false );
				var testString = html.toString(); 
		        if ( testString.indexOf("[object ") === -1 ) {
		            el.innerHTML = ""+html;
		            list = el.getElementsByTagName('SCRIPT');
		            len = list.length;
		            for (; i < len; i++) {
		                eval(list[i].text);
		            }
		        } else if( testString.indexOf("[object ") > -1 ) {
		            el.innerHTML = '';
		            el.appendChild( wrapHelper( html, el ) );
		        }
			} else if (location == "outer" && parent ) {     
				elem = wrapHelper(html, el);
				cleanData( el );
		        parent.replaceChild( elem, el);
		    } else if (location == "top") {
		        el.insertBefore( wrapHelper(html, el), el.firstChild);
		    } else if (location == "bottom") {
		        el.insertBefore( wrapHelper(html, el), null);
		    } else if (location == "remove" && parent) { 
				elem = parent;
				cleanData( el );     
		        parent.removeChild(el);
		    } else if (location == "before" && parent) {
		        parent.insertBefore( wrapHelper(html, parent), el);
		    } else if (location == "after" && parent) {
		        parent.insertBefore( wrapHelper(html, parent), el.nextSibling);
			} else if( location == "empty" ) {
				cleanData( el, false ); 
				while ( el.firstChild ) {
					el.removeChild( el.firstChild );
				}
			} else if (location == "wrap" && parent) {  
				var elems = wrapHelper( html, parent );           
				var wrap = ( elems.nodeType === 11 ? elems.firstChild : elems );
				parent.insertBefore( elems, el );
				wrap.appendChild( el );
			} else if( location == "unwrap" && parent ){
				var docFrag = wrapHelper( el.childNodes, el );
				cleanData( el );
				elem = docFrag.childNodes;
				parent.insertBefore( docFrag, el );
				parent.removeChild( el );
			}
			if( elem ){
				results.push.apply( results, slice.call( elem, 0 ) );
			}
	    });
		       
		return results.length ? results : this;
	},
	text : function( text ){
		if( text ){
			this.each(function(){
				this.innerText = text;
			});
		} else {
			return this[0] && this[0].innerText;
		}
	},
	// attributes	
	hasClass : function( className ){
		className = " " + className + " ";
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( hasClass( this[i], className ) ) {
				return true;
			}
		}
		return false;
	},     
	addClass : function( className ){ 
		className = " " + className + " ";
		this.each(function(){
			if( !hasClass( this, className ) ){
				this.className = Simples.trim( Simples.trim( this.className.replace( STRIP_TAB_NEW_LINE, " ") ) + className );
			} 
		});
		return this;
	},
	removeClass : function( className ){  
		className = ' '+className+' ';
		this.each(function(){
			this.className = Simples.trim( (' ' + this.className.replace( STRIP_TAB_NEW_LINE, " ") +' ').replace( className, ' ' ) );
		});
		return this;		
	},
	attr : function(name, value){
		var nameClass = toString.call( name );
			
		if( nameClass === ObjectClass ){   
			this.each(function(){   
				for( var key in name ){
					attrs( this, key, name[key] );
				}
			});
		} else if( nameClass === StringClass ){
			if( value === undefined ){                
               	return attrs( this[0], name, value );
			} else { 
				this.each(function(){
					attrs( this, name, value );
				});			
			}
		}
		return this;
	},
	/* TODO: Rename me as I don't indicate functionality */
	traverse : function( name ){
		var isWhat = toString.call( name ), results = new Simples();
		this.each(function(){
			var elem = ( isWhat === StringClass ) ? this[ name ] : ( isWhat === FunctionClass ) ? name.call( this, this ) : null;
			if( elem ){
				results.push.apply( results, elem && ( elem.item || elem.length ) ? slice.call( elem, 0 ) : [ elem ] );
			}
		});
		
		return results;
	},
	slice : function( i, len ){
		len = ( 0 < len ) ? len : 1 ;
		return Simples( slice.apply( this, i < 0 ? [ i ] : [+i, i+len]  ), true );
	}
});