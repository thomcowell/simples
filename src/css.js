// exclude the following css properties to add px
var REXCLUDE = /z-?index|font-?weight|opacity|zoom|line-?height/i,
	RALPHA = /alpha([^)]*)/,
	ROPACITY = /opacity=([^)]*)/,
	RFLOAT = /float/i,
	RDASH_ALPHA = /-([a-z])/ig,
	RUPPER = /([A-Z])/g,
	RNUMPX = /^-?d+(?:px)?$/i,
	RNUM = /^-?d/,
	// cache check for defaultView.getComputedStyle
	getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
	// normalize float css property
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

        var camelCase = name.replace(RDASH_ALPHA,
        function(all, letter) {
            return letter.toUpperCase();
        });

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

Simples.extend({
	css : function( name, value ){ 
		if( value === undefined ){
			return currentCSS(this[0], name );  
		}   
		
        // don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
			return undefined;
		}

		// ignore negative width and height values #1599
		if ( (name === "width" || name === "height") && parseFloat(value) < 0 ) {
			value = undefined;
		}

		var style = elem.style || elem, set = value !== undefined;
		if( name && value ){
			
			this.each(function(){
				this.style[ name ] = value;
			});
		} else if( name.toString === '[object Object]' ) {
			
			for( var key in name ){
				this.each(function(){
					this.style[ key ] = name[ key ];
				});
			}
		}
		return this;
	}
});