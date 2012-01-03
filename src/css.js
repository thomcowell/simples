// exclude the following css properties to add px
var REXCLUDE = /z-?index|font-?weight|opacity|zoom|line-?height/i,
	RALPHA = /alpha\([^)]*\)/,
	ROPACITY = /opacity=([^)]*)/,
	RFLOAT = /float/i,
	RDASH_ALPHA = /-([a-z])/ig,
	RUPPER = /([A-Z])/g,
	RNUMPX = /^-?d+(?:px)?$/i,
	RNUM = /^-?d/,
	WIDTH = "width",
	HEIGHT = "height",
	// cache check for defaultView.getComputedStyle
	isGetComputedStyle = !!DOC.defaultView && !!DOC.defaultView.getComputedStyle,
	isCurrentStyle = !!document.documentElement.currentStyle,
	/** @private normalize float css property */
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},
	styleFloat = Simples.support.cssFloat ? "cssFloat": "styleFloat";

Simples.merge( /** @lends Simples */ {
	/**
	 * @description Used to read the current computed style of the element including width, height, innerWidth, innerHeight, offset.top, offset.left, border, etc.
	 * @function
	 * @param {Element} elem the element to read the somputed style off
	 * @param {String} type of the attribute to read
	 * @param {Boolean} extra used to determine on outerHeight, outerWidth whether to include the margin or just the border
	 */
	getStyle : (function( Simples ){

        var RWIDTH_HEIGHT = /width|height/i,
			cssShow = { position: "absolute", visibility: "hidden", display:"block" },
			cssWidth = [ "Left", "Right" ],
			cssHeight = [ "Top", "Bottom" ];

		function getWidthHeight( elem, name, extra ){
			var val;
			if ( elem.offsetWidth !== 0 ) {
				val = returnWidthHeight( elem, name, extra );

			} else {
				resetCSS( elem, cssShow, function() {
					val = returnWidthHeight( elem, name, extra );
				});
			}

			return Math.max(0, Math.round(val) );
		}

		function returnWidthHeight( elem, name, extra ) {
			var which = name === WIDTH ? cssWidth : cssHeight, 
				val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

			if ( extra === "border" ) {
				return val;
			}

			for(var i=0,l=which.length;i<l;i++){
				var append = which[i];
				if ( !extra ) {
					val -= parseFloat(Simples.currentCSS( elem, "padding" + append, true)) || 0;
				}

				if ( extra === "margin" ) {
					val += parseFloat(Simples.currentCSS( elem, "margin" + append, true)) || 0;

				} else {
					val -= parseFloat(Simples.currentCSS( elem, "border" + append + "Width", true)) || 0;
				}
			}

			return val;
		}  

		function resetCSS( elem, options, callback ){
			var old = {};

			// Remember the old values, and insert the new ones
			for ( var name in options ) {
				old[ name ] = elem.style[ name ];
				elem.style[ name ] = options[ name ];
			}

			callback.call( elem );

			// Revert the old values
			for ( name in options ) {
				elem.style[ name ] = old[ name ];
			}	
		}
        
		return function( elem, type, extra ){
            if( elem && RWIDTH_HEIGHT.test( type ) ){
				if( type === WIDTH || type === HEIGHT ){ 
					// Get window width or height
					// does it walk and quack like a window?
					if( "scrollTo" in elem && elem.document ){
						var client = "client" + ( ( type === WIDTH ) ? "Width" : "Height" );
						// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
						return elem.document.compatMode === "CSS1Compat" && elem.document.documentElement[ client ] || elem.document.body[ client ];
				
					// Get document width or height
					// is it a document
					} else if( elem.nodeType === 9 ){
						var name = ( type === WIDTH ) ? "Width" : "Height",
							scroll = "scroll" + name, 
							offset = "offset" + name;
				
						// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
						return Math.max(
							elem.documentElement[ "client" + name ],
							elem.body[ scroll ], elem.documentElement[ scroll ],
							elem.body[ offset ], elem.documentElement[ offset ]
						);
					} else {
						return getWidthHeight( elem, type );
					}
				} else if( type === "innerHeight" || type === "innerWidth" ){
					type = type === "innerHeight" ? HEIGHT : WIDTH;
					return getWidthHeight( elem, type, "padding" );
				} else if( type === "outerHeight" || type === "outerWidth" ){
					type = type === "outerHeight" ? HEIGHT : WIDTH;
					return getWidthHeight( elem, type, extra ? "margin" : "border" );
				}
				return null;
			} else if( elem && ( type === TOP || type === LEFT ) ){
				// shortcut to prevent the instantiation of another Simples object
				return Simples.offset( elem )[ type ];
			}

			return Simples.currentCSS( elem, type );
		};

	})( Simples ),
	/**
	 * @description to read the current style attribute 
	 * @param {Element} elem the element to read the current style attributes off 
	 * @param {String} name of the style atttribute to read
	 */	
	currentCSS : function(elem, name) {

	    var ret, style = elem.style, filter;

	    // IE uses filters for opacity
	    if (!Simples.support.opacity && name === OPACITY && elem.currentStyle) {
	        ret = ROPACITY.test( (elem.currentStyle ? elem.currentStyle.filter : elem.style.filter ) || "") ? (parseFloat(RegExp.$1) / 100) + "": "";
	        return ret === "" ? "1": ret;
	    }

	    // Make sure we're using the right name for getting the float value
	    if (RFLOAT.test(name)) {
	        name = styleFloat;
	    }

	    if (style && style[name]) {
	        ret = style[name];

	    } else if (isGetComputedStyle) {

	        // Only "float" is needed here
	        if (RFLOAT.test(name)) {
	            name = "float";
	        }

	        name = name.replace(RUPPER, "-$1").toLowerCase();

	        var defaultView = elem.ownerDocument.defaultView;

	        if (!defaultView) {
	            return null;
	        }

	        var computedStyle = defaultView.getComputedStyle(elem, null);

	        if (computedStyle) {
	            ret = computedStyle.getPropertyValue(name);
	        }

	        // We should always get a number back from opacity
	        if (name === OPACITY && ret === "") {
	            ret = "1";
	        }

	    } else if (isCurrentStyle) {

	        var uncomputed;
	        name = name.replace(RDASH_ALPHA, fcamelCase );
	        ret = elem.currentStyle && elem.currentStyle[name];

			if ( ret === null && style && (uncomputed = style[ name ]) ) {
				ret = uncomputed;
			}
	        // From the awesome hack by Dean Edwards
	        // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
	        // If we're not dealing with a regular pixel number
	        // but a number that has a weird ending, we need to convert it to pixels
	        if (!RNUMPX.test(ret) && RNUM.test(ret)) {
	            // Remember the original values
	            var left = style.left,
	            rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

	            // Put in the new values to get a computed value out
	            if( rsLeft ){
	            	elem.runtimeStyle.left = elem.currentStyle.left;
	            }
	            style.left = name === "fontSize" ? "1em": (ret || 0);
	            ret = style.pixelLeft + "px";

	            // Revert the changed values
	            style.left = left;
	            if ( rsLeft ) {
	            	elem.runtimeStyle.left = rsLeft;
	            }
	        }
	    }

	    return ret === "" ? "auto" : ret;
	},
	/**
	 * @description use to set the supplied elements style attribute 
	 * @param {Element} elem the element to set the style attribute on
	 * @param {String} name the name of the attribute to set
	 * @param {Number|String} value to be set either a pure number 12 or string with the 12px
	 */	
	setStyle : function( elem, name, value ){                       
		// don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
			return UNDEF;
		}

		// ignore negative width and height values #1599
		if ( (name === WIDTH || name === HEIGHT) && parseFloat(value) < 0 ) {
			value = UNDEF;
		}

		if ( typeof value === "number" && !REXCLUDE.test(name) ) {
			value += "px";
		}

		var style = elem.style || elem, set = value !== UNDEF;

		// IE uses filters for opacity
		if ( !Simples.support.opacity && name === OPACITY ) {
			if ( set ) {
				// IE has trouble with opacity if it does not have layout
				// Force it by setting the zoom level
				style.zoom = 1;

				// Set the alpha filter to set the opacity
				var opacity = parseInt( value, 10 ) + "" === "NaN" ? "" : "alpha(opacity=" + (value * 100) + ")";
				var filter = style.filter || Simples.currentCSS( elem, "filter" ) || "";
				style.filter = RALPHA.test(filter) ? filter.replace(RALPHA, opacity) : opacity;
			}

			return style.filter && style.filter.indexOf("opacity=") >= 0 ? (parseFloat( ROPACITY.exec(style.filter)[1] ) / 100) + "":"";
		}

		// Make sure we're using the right name for getting the float value
		if ( RFLOAT.test( name ) ) {
			name = styleFloat;
		}

		name = name.replace( RDASH_ALPHA, fcamelCase); 

		if ( set ) {
			// set value to empty string when null to prevent IE issue
			style[ name ] = value === null ? "" : value;
		}

		return style[ name ];
	}
});

Simples.extend( /** @lends Simples.fn */ {
	/**
	 * @description Used to read the current computed style of the first element or write through this.css the style atttribute, see Simples.getStyle
	 * @param {String} type the computed style attribute to read
	 * @param {Boolean} extra whether to include extra
	 */	
	style : function( type, extra ){
		if( !extra || typeof extra === "boolean" ){
			return this[0] ? Simples.getStyle( this[0], type, extra ) : null;
		} else {
			return this.css( type, extra );
		}
	},
	/**
	 * @description Used to read the current style attribute or set the current style attribute
	 * @param {String} name of the attribute to set
	 * @param {Number|String} value to be set either a pure number 12 or string with the 12px
	 */	
	css : function( name, value ){ 
		if( value === UNDEF && typeof name === "string" ){
			return Simples.currentCSS( this[0], name );  
		}

		// ignore negative width and height values #1599
		if ( (name === WIDTH || name === HEIGHT) && parseFloat(value) < 0 ) {
			value = UNDEF;
		}
		
		var klass = Simples.getConstructor( name );
		if( klass === "String" && value !== UNDEF ){
			var i=0,l=this.length;
			while( i<l ){
				Simples.setStyle( this[i++], name, value );
			}
		} else if( klass === "Object" ) {
			for( var key in name ){
				this.css( key, name[ key ] );
			}
		}
		return this;
	}
});