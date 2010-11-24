var STRIP_TAB_NEW_LINE = /\n|\t/g,
	SINGLE_ARG_READ = /^outer$|^inner$|^text$/,
	IMMUTABLE_ATTR = /(button|input)/i,
	SPECIAL_URL = /href|src|style/,
	VALID_ELEMENTS = /^<([A-Z][A-Z0-9]*)([^>]*)>(.*)<\/\1>/i, 
	SPLIT_ATTRIBUTE = /([A-Z]*\s*=\s*['|"][A-Z0-9:;#\s]*['|"])/i,
	TAG_LIST = {'UL':'LI','DL':'DT','TR':'TD'},
	QUOTE_MATCHER = /(["']?)/g,
	/**
	 * @private - Borrowed from XUI project
	 * Wraps the HTML in a TAG, Tag is optional. If the html starts with a Tag, it will wrap the context in that tag.
	 */
	wrapHelper = function(xhtml, el) {
		// insert into documentFragment to ensure insert occurs without messing up order
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
	    xhtml = EMPTY_STRING + xhtml;
	    if ( VALID_ELEMENTS.test(xhtml) ) {
	        result = VALID_ELEMENTS.exec(xhtml);
			tag = result[1];

	        // if the node has any attributes, convert to object
	        if (result[2] !== EMPTY_STRING) {
	            attrList = result[2].split( SPLIT_ATTRIBUTE );

	            for (var l=attrList.length; i < l; i++) {
	                attr = Simples.trim( attrList[i] );
	                if (attr !== EMPTY_STRING && attr !== " ") {
	                    node = attr.split('=');
	                    attributes[ node[0] ] = node[1].replace( QUOTE_MATCHER, EMPTY_STRING);
	                }
	            }
	        }
	        xhtml = result[3];
	    } else {
			tag = (el.firstChild === null) ? TAG_LIST[el.tagName] || el.tagName : el.firstChild.tagName;
		}

	    element = document.createElement(tag);

	    for( x in attributes ){
			Simples.attr( element, x, attributes[x] );
		}

	    element.innerHTML = xhtml;
	    return element;
	};

Simples.merge({
	/**
	 * Simples.domRead: to read the html from a elem
	 * @param {Element} elem the element to read the dom html from
	 * @param {String} location to specify how to return the dom options are [ outer, text, inner/undefined ] use outer for outerHTML, text to read all the textNodes and inner or no argument for innerHTML
	 */
	domRead : function( elem, location ){
		if( elem && elem.nodeType ){
			switch( location ){
				case "outer" :
					html = elem.outerHTML;

					if ( !html ) {
						var div = elem.ownerDocument.createElement("div");
						div.appendChild( elem.cloneNode(true) );
						html = div.innerHTML;
					}

					return html;
				case "text" :
					var str = EMPTY_STRING, elems = elem.childNodes;
					for ( var i = 0; elems[i]; i++ ) {
						elem = elems[i];

						// Get the text from text nodes and CDATA nodes
						if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
							str += elem.nodeValue;
						// Traverse everything else, except comment nodes
						} else if ( elem.nodeType !== 8 ) {
							str += Simples.domRead( elem, "text" );
						}
					}
					return str;
				default :
					return elem.innerHTML;
			}
		}
	},
	/**
	 * Simples.domManip: to write the dom new html string or dom elements
	 * @param {Element} elem the element to read the dom html from
	 * @param {String} location to specify how to return the dom options are desctructive: [remove, empty, outer, text, inner/undefined ], non-destructive: [top, bottom, unwrap, before, after, wrap ]
	 * @param {String|Elements} html the string or Elements to put into the dom
	 */	
	domManip : function( elem, location, html ){
		var el, parent = elem.parentNode;
		if( !elem || !elem.nodeType ){ return; }
		
		switch( location ){
			case 'text' :
				Simples.cleanData( elem );
				while ( elem.firstChild ) {
					elem.removeChild( elem.firstChild );
				}
				elem.appendChild( (elem && elem.ownerDocument || document).createTextNode( html.toString() ) );
				break;
			case 'remove' :
				if( parent ){
					Simples.cleanData( elem );     
					parent.removeChild(elem);
				}
				break;
			default :  
				if( elem.nodeType === 3 || elem.nodeType === 8 ){
					return;
				}
				switch( location ){
					case 'outer' :
						if( parent ){ 
							el = wrapHelper(html, elem);
							Simples.cleanData( elem );
					        parent.replaceChild( el, elem );						
						}
						break;
					case TOP :
						elem.insertBefore( wrapHelper(html, elem), elem.firstChild);
						break;
					case 'bottom' : 
						elem.insertBefore( wrapHelper(html, elem), null);
						break;
					case 'unwrap' :
						if( parent ){
							var docFrag = wrapHelper( elem.childNodes, elem );
							Simples.cleanData( elem );
							el = docFrag.childNodes;
							parent.insertBefore( docFrag, elem );
							parent.removeChild( elem );
						}
						break;
					case 'empty' :
						Simples.cleanData( elem, false ); 
						while ( elem.firstChild ) {
							elem.removeChild( elem.firstChild );
						}
						break;
					case 'before' :
						if( parent ){
							parent.insertBefore( wrapHelper(html, parent), elem);
						}
						break;
					case 'after' :
						if( parent ){ 
							parent.insertBefore( wrapHelper(html, parent), elem.nextSibling);
						}
						break;
					case 'wrap' :
						if( parent ){ 
							var elems = wrapHelper( html, parent );           
							var wrap = ( elems.nodeType === 11 ? elems.firstChild : elems );
							parent.insertBefore( elems, elem );
							wrap.appendChild( elem );						
						}
						break;
					default :  
						Simples.cleanData( this, false );
						html = html != null ? html : location;
						var list, len, i = 0, testString = html.toString();
						if ( testString.indexOf("[object ") === -1 ) {
							elem.innerHTML = EMPTY_STRING+html;
							list = elem.getElementsByTagName('SCRIPT');
							len = list.length;
							for (; i < len; i++) {
								eval(list[i].text);
							}
						} else if( testString.indexOf("[object ") > -1 ) {
							elem.innerHTML = EMPTY_STRING;
							elem.appendChild( wrapHelper( html, elem ) );
						}					
				}
		}
		return el;
	},
	/**
	 * Simples.className: to either check for a className, add or remove a className
	 * @param {Element} elem the element to manipulate the className on
	 * @param {String} className the class to work with
	 * @param {String} action to perform the step [ add, remove, has/undefined ]
	 */
	className : function( elem, className, action ){
		if( elem && elem.nodeType && elem.nodeType != ( 3 || 8 ) ){
			className = " "+className+" "; 
			var hasClassName = (" " + elem.className + " ").replace( STRIP_TAB_NEW_LINE, " ").indexOf( className ) > -1;
			if( action === "add" ){
				if( !hasClassName ){
					elem.className = Simples.trim( Simples.trim( elem.className.replace( STRIP_TAB_NEW_LINE, " ") ) + className );
				}
		 	} else if( action === "remove" ){
				if( hasClassName ){
					elem.className = Simples.trim( (' ' + elem.className.replace( STRIP_TAB_NEW_LINE, " ") +' ').replace( className, ' ' ) );
				}
			} else {
				return hasClassName;
			}
		}
	},
	/**
	 * Simples.attr: read / write the attribute on an element
	 * @param {Element} elem the element to manipulate the attribute
	 * @param {String} name the name of the attribute
	 * @param {String} value the value to specify, if undefined will read the attribute, if null will remove the attribute, else will add the value as a string
	 */
	attr : function( elem, name, value ){
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
			if ( ( typeof value == ( FUNC || 'object' ) ) || ( name === "type" && IMMUTABLE_ATTR.test( elem.nodeName ) ) ) {
				return undefined;
			}

			if( name === "style" && !Simples.support.style ){
				// get style correctly
				elem.style.cssText = EMPTY_STRING + value;
			} else if ( elem.nodeType === 1 && !SPECIAL_URL.test( name ) && name in elem ) { 
				// These attributes don't require special treatment 
				elem[ name ] = EMPTY_STRING+value;
			} else { 
				// it must be this
				elem.setAttribute(name, EMPTY_STRING+value);
			}
		}
	}
});

Simples.extend({
	/**
	 * Simples( '*' ).html: to read or write to the dom basd on the elements on the Simples object
	 * @param {String} location to specify how to return the dom options are desctructive: [remove, empty, outer, text, inner/undefined ], non-destructive: [top, bottom, unwrap, before, after, wrap ]
	 * @param {String|Elements} html the string or Elements to put into the dom, if not specfied where location is [ outer, text, inner/undefined ] will read
	 * @returns {Simples|String} if writing to the dom will return this, else will return string of dom
	 */
	html : function( location, html ){

		if ( arguments.length === 0 || ( arguments.length === 1 && SINGLE_ARG_READ.test( location ) ) ) {
			return Simples.domRead( this[0], location );
		}
		location = location != null ? location : EMPTY_STRING;

		var c=0,i=0,l=this.length, results;
		while(i<l){
			Simples.domManip( this[i++], location, html );
		}

		return this;
	},
	/**
	 * Simples( '*' ).hasClass: to determine whether any of the elements on the Simples object has the specified className
	 * @params {String} className the exact className to test for
	 * @returns {Boolean} indicating whether className is on elements of Simples object
	 */
	hasClass : function( className ){
		for ( var i = 0, l = this.length; i < l; i++ ) {
			if ( Simples.className( this[i], className ) ) {
				return true;
			}
		}
		return false;
	},
	/**
	 * Simples( '*' ).addClass: to add the specified className to the elements on the Simples object with the specified className
	 * @params {String} className the className to add to the elements
	 */
	addClass : function( className ){
		var l = this.length;
		while ( l ) {
			Simples.className( this[ --l ], className, "add" );
		}
		return this;
	},
	/**
	 * Simples( '*' ).removeClass: to remove the specified className to the elements on the Simples object with the specified className
	 * @params {String} className the className to remove to the elements
	 */
	removeClass : function( className ){
		var l = this.length;
		while ( l ) {
			Simples.className( this[ --l ], className, "remove" );
		}
		return this;		
	},
	/**
	 * Simples( '*' ).attr: to read / write the given attribute to the elements on the Simples object
	 * @param {String} name the name of the attribute
	 * @param {String} value the value to specify, if undefined will read the attribute, if null will remove the attribute, else will add the value as a string
	 */
	attr : function(name, value){
		var nameClass = toString.call( name );
			
		if( nameClass === ObjectClass ){   
			this.each(function(){
				for( var key in name ){
					Simples.attr( this, key, name[key] );
				}
			});
		} else if( nameClass === StringClass ){
			if( value === undefined ){
				return Simples.attr( this[0], name, value );
			} else { 
				this.each(function(){
					Simples.attr( this, name, value );
				});			
			}
		}
		return this;
	},
	/* TODO: Rename me as I don't indicate functionality */
	/**
	 * Simples( '*' ).traverse: to select a new set of elements off of the elements in the Simples object
	 * @params {String|Function} name the string to specify the traversing, i.e. childNodes, parentNode, etc or a function to walk 
	 */
	traverse : function( name ){
		var isWhat = toString.call( name ), results = new Simples(), i=0,l = this.length;
		while( i<l ){
			var current = this[i++], elem = ( isWhat === StringClass ) ? current[ name ] : ( isWhat === FunctionClass ) ? name.call( current, current ) : null;
			if( elem ){
				results.push.apply( results, elem && ( elem.item || elem.length ) ? slice.call( elem, 0 ) : [ elem ] );
			}
		}
		
		return results;
	},
	/**
	 * Simples( '*' ).slice: to return a subset of the selected elements
	 * @params {Number} i the first element to start slicing
	 * @params {Number} len the last element to finish slicing this is optional if not specified then the slice is to the last element
	 */	
	slice : function( i, len ){
		len = ( 0 < len ) ? len : 1 ;
		return Simples( slice.apply( this, i < 0 ? [ i ] : [+i, i+len]  ), true );
	}
});