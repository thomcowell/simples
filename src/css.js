// exclude the following css properties to add px
var REXCLUDE = /z-?index|font-?weight|opacity|zoom|line-?height/i,
	RALPHA = /alpha([^)]*)/,
	ROPACITY = /opacity=([^)]*)/,
	RFLOAT = /float/i,
	RDASH_ALPHA = /-([a-z])/ig,
	RUPPER = /([A-Z])/g,
	RNUMPX = /^-?d+(?:px)?$/i,
	RNUM = /^-?d/,                  
	
	cssShow = { position: "absolute", visibility: "hidden", display:"block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	
	// cache check for defaultView.getComputedStyle
	getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
	// normalize float css property
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},	
	styleFloat = Simples.support.cssFloat ? "cssFloat": "styleFloat";    

function currentCSS(elem, name) {
    var ret,
    style = elem.style,
    filter;

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
}

function setStyle( elem, name, value ){                       
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
			var filter = style.filter || currentCSS( elem, "filter" ) || "";
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
 
function getWidthHeight( elem, name, extra ) {
	var which = name === "width" ? cssWidth : cssHeight, 
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight;

	if ( extra === "border" ) {
		return val;
	}
	
	for(var i=0,l=which.length;i<l;i++){
		var append = which[i];
		if ( !extra ) {
			val -= parseFloat(currentCSS( elem, "padding" + append, true)) || 0;
		}
	
		if ( extra === "margin" ) {
			val += parseFloat(currentCSS( elem, "margin" + append, true)) || 0;

		} else {
			val -= parseFloat(currentCSS( elem, "border" + append + "Width", true)) || 0;
		}
	}

	return val;
}  

// Create innerHeight, innerWidth, outerHeight and outerWidth methods
var _dimensions_ = [ "Height", "Width" ]; 

for(var i=0,l=_dimensions_.length;i<l;i++){
    var name = _dimensions_[i];
	var type = name.toLowerCase();

	// innerHeight and innerWidth
	Simples.prototype["inner" + name] = function() {
		return this[0] ? getWidthHeight( this[0], type, "padding" ) : null;
	};

	// outerHeight and outerWidth
	Simples.prototype["outer" + name] = function( margin ) {
		return this[0] ? getWidthHeight( this[0], type, margin ? "margin" : "border" ) : null;
	};

	Simples.prototype[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}

		return ("scrollTo" in elem && elem.document) ? // does it walk and quack like a window?
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			elem.document.compatMode === "CSS1Compat" && elem.document.documentElement[ "client" + name ] ||
			elem.document.body[ "client" + name ] :

			// Get document width or height
			(elem.nodeType === 9) ? // is it a document
				// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
				Math.max(
					elem.documentElement["client" + name],
					elem.body["scroll" + name], elem.documentElement["scroll" + name],
					elem.body["offset" + name], elem.documentElement["offset" + name]
				) :

				// Get or set width or height on the element
				size === undefined ?
					// Get width or height on the element
					getWidthHeight( elem, type ) : 
					// Set the width or height on the element (default to pixels if value is unitless)
					this.css( type, typeof size === "string" ? size : size + "px" );
	};

}  

Simples.extend({
	css : function( name, value ){ 
		if( value === undefined && typeof name === 'string' ){
			return currentCSS( this[0], name );  
		}

		// ignore negative width and height values #1599
		if ( (name === "width" || name === "height") && parseFloat(value) < 0 ) {
			value = undefined;
		}
		
		var nameClass = toString.call( name );
		if( nameClass === StringClass && value !== undefined ){
			
			this.each(function(){
				setStyle( this, name, value );
			});
		} else if( nameClass === ObjectClass ) {
			
			this.each(function(){  
				for( var key in name ){  
					// don't set styles on text and comment nodes
					setStyle( this, key, name[ key ] );
				}
			});
		}
		return this;
	},
	show : function(){
		this.each(function(){
			setStyle(this, "display", 'block' );
		});
	},
	hide : function(){
		this.each(function(){
			setStyle(this, "display", 'none' );
		});
	}
});