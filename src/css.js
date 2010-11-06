// exclude the following css properties to add px
var REXCLUDE = /z-?index|font-?weight|opacity|zoom|line-?height/i,
	RALPHA = /alpha([^)]*)/,
	ROPACITY = /opacity=([^)]*)/,
	RFLOAT = /float/i,
	RDASH_ALPHA = /-([a-z])/ig,
	RUPPER = /([A-Z])/g,
	RCAPITALISE = /\b(\w)(\w)\b/g,
	RNUMPX = /^-?d+(?:px)?$/i,
	RNUM = /^-?d/,
	
	// cache check for defaultView.getComputedStyle
	getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
	// normalize float css property
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},
	fcapitalise = function( all, first, rest ){
		return first.toUpperCase() + rest.toLowerCase();
	},
	styleFloat = Simples.support.cssFloat ? "cssFloat": "styleFloat";

// Create innerHeight, innerWidth, outerHeight and outerWidth methods

Simples.merge({
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
			var which = name === "width" ? cssWidth : cssHeight, 
				val = name === "width" ? elem.offsetWidth : elem.offsetHeight;

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
				if( type === "width" || type === "height" ){
					// Get window width or height
					// does it walk and quack like a window?
					if( "scrollTo" in elem && elem.document ){
						var client = "client" + type.replace( RCAPITALISE, fcapitalise );
						// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
						return elem.document.compatMode === "CSS1Compat" && elem.document.documentElement[ client ] || elem.document.body[ client ];
				
					// Get document width or height
					// is it a document
					} else if( elem.nodeType === 9 ){
						var name = type.replace( RCAPITALISE, fcapitalise ),
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
					type = type === "innerHeight" ? "height" : "width";
					return getWidthHeight( elem, type, "padding" );
				} else if( type === "outerHeight" || type === "outerWidth" ){
					type = type === "outerHeight" ? "height" : "width";
					return getWidthHeight( elem, type, extra ? "margin" : "border" );
				}
				return null;
			} else if( elem && ( type === "top" || type === "left" ) ){
				// shortcut to prevent the instantiation of another Simples object
				return Simples.prototype.offset.call( [ elem ] )[ type ];
			}

			return Simples.currentCSS( elem, type, extra );
		};

	})( Simples ),
	currentCSS : function(elem, name, extra) {

	    var ret, style = elem.style, filter;

	    // IE uses filters for opacity
	    if (!Simples.support.opacity && name === "opacity" && elem.currentStyle) {

	        ret = ROPACITY.test(elem.currentStyle.filter || "") ? (parseFloat(RegExp.$1) / 100) + "": "";
	        return ret === "" ? "1": ret;
	    }

	    // Make sure we're using the right name for getting the float value
	    if (RFLOAT.test(name)) {
	        name = styleFloat;
	    }

	    if (style && style[name]) {
	        ret = style[name];

	    } else if (getComputedStyle) {

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
	        if (name === "opacity" && ret === "") {
	            ret = "1";
	        }

	    } else if (elem.currentStyle) {

	        var camelCase = name.replace(RDASH_ALPHA, fcamelCase );

	        ret = elem.currentStyle[name] || elem.currentStyle[camelCase];

	        // From the awesome hack by Dean Edwards
	        // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
	        // If we're not dealing with a regular pixel number
	        // but a number that has a weird ending, we need to convert it to pixels
	        if (!RNUMPX.test(ret) && RNUM.test(ret)) {
	            // Remember the original values
	            var left = style.left,
	            rsLeft = elem.runtimeStyle.left;

	            // Put in the new values to get a computed value out
	            elem.runtimeStyle.left = elem.currentStyle.left;
	            style.left = camelCase === "fontSize" ? "1em": (ret || 0);
	            ret = style.pixelLeft + "px";

	            // Revert the changed values
	            style.left = left;
	            elem.runtimeStyle.left = rsLeft;
	        }
	    }

	    return ret;
	},
	setStyle : function( elem, name, value ){                       
		// don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
			return undefined;
		}

		// ignore negative width and height values #1599
		if ( (name === "width" || name === "height") && parseFloat(value) < 0 ) {
			value = undefined;
		}

		if ( typeof value === "number" && !REXCLUDE.test(name) ) {
			value += "px";
		}

		var style = elem.style || elem, set = value !== undefined;

		// IE uses filters for opacity
		if ( !Simples.support.opacity && name === "opacity" ) {
			if ( set ) {
				// IE has trouble with opacity if it does not have layout
				// Force it by setting the zoom level
				style.zoom = 1;

				// Set the alpha filter to set the opacity
				var opacity = parseInt( value, 10 ) + "" === "NaN" ? "" : "alpha(opacity=" + value * 100 + ")";
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
			style[ name ] = value;
		}

		return style[ name ];
	}
});

Simples.extend({
	style : function( type, extra ){
		if( !extra || typeof extra === "boolean" ){
			return this[0] ? Simples.getStyle( this[0], type, extra ) : null;
		} else {
			return this.css( type, extra );
		}
	},
	css : function( name, value ){ 
		if( value === undefined && typeof name === 'string' ){
			return Simples.currentCSS( this[0], name );  
		}

		// ignore negative width and height values #1599
		if ( (name === "width" || name === "height") && parseFloat(value) < 0 ) {
			value = undefined;
		}
		
		var nameClass = toString.call( name );
		if( nameClass === StringClass && value !== undefined ){
			var i=0,l=this.length;
			while( i<l ){
				Simples.setStyle( this[i++], name, value );
			}
		} else if( nameClass === ObjectClass ) {
			for( var key in name ){
				this.css( key, name[ key ] );
			}
		}
		return this;
	}
});