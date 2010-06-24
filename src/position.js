// OMG its another non-W3C standard browser 
var REGEX_HTML_BODY = /^body|html$/i;
var domStuff = (function(){

	var result = {};
 	var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( currentCSS(body, "marginTop") ) || 0,
		html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

	merge( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

	container.innerHTML = html;
	body.insertBefore( container, body.firstChild );
	innerDiv = container.firstChild;
	checkDiv = innerDiv.firstChild;
	td = innerDiv.nextSibling.firstChild.firstChild;

	result.doesNotAddBorder = (checkDiv.offsetTop !== 5);
	result.doesAddBorderForTableAndCells = (td.offsetTop === 5);

	checkDiv.style.position = "fixed"; checkDiv.style.top = "20px";
	// safari subtracts parent border width here which is 5px
	result.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
	checkDiv.style.position = checkDiv.style.top = "";

	innerDiv.style.overflow = "hidden"; innerDiv.style.position = "relative";
	result.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

	result.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

	body.removeChild( container );
	body = container = innerDiv = checkDiv = table = td = null;
	return result;
})();


Simples.extend({
	offset : ( "getBoundingClientRect" in document.documentElement ) ?
		function(){

			var box = this[0].getBoundingClientRect(), doc = this[0].ownerDocument, body = doc.body, docElem = doc.documentElement, 
				clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
				top  = box.top  + (self.pageYOffset || Simples.support.boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
				left = box.left + (self.pageXOffset || Simples.support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;

			return { top: top, left: left };
		} : function() {
               var elem = this[0];
			var offsetParent = elem.offsetParent, prevOffsetParent = elem,
				doc = elem.ownerDocument, computedStyle, docElem = doc.documentElement,
				body = doc.body, defaultView = doc.defaultView,
				prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
				top = elem.offsetTop, left = elem.offsetLeft;

			while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
				if ( domStuff.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
					break;
				}

				computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
				top  -= elem.scrollTop;
				left -= elem.scrollLeft;

				if ( elem === offsetParent ) {
					top  += elem.offsetTop;
					left += elem.offsetLeft;

					prevOffsetParent = offsetParent; offsetParent = elem.offsetParent;
				}

				if ( domStuff.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevComputedStyle = computedStyle;
			}

			if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
				top  += body.offsetTop;
				left += body.offsetLeft;
			}

			if ( domStuff.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				top  += Math.max( docElem.scrollTop, body.scrollTop );
				left += Math.max( docElem.scrollLeft, body.scrollLeft );
			}

			return { top: top, left: left };
		},
		position: function() {
			if ( !this[0] ) {
				return null;
			}

			var elem = this[0],

			// Get *real* offsetParent
			offsetParent = this.offsetParent(),

			// Get correct offsets
			offset       = this.offset(),
			parentOffset = REGEX_HTML_BODY.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

			// Subtract element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft
			// are the same in Safari causing offset.left to incorrectly be 0
			offset.top  -= parseFloat( currentCSS(elem, "marginTop",  true) ) || 0;
			offset.left -= parseFloat( currentCSS(elem, "marginLeft", true) ) || 0;

			// Add offsetParent borders
			parentOffset.top  += parseFloat( currentCSS(offsetParent[0], "borderTopWidth",  true) ) || 0;
			parentOffset.left += parseFloat( currentCSS(offsetParent[0], "borderLeftWidth", true) ) || 0;

			// Subtract the two offsets
			return {
				top:  offset.top  - parentOffset.top,
				left: offset.left - parentOffset.left
			};
		},

		offsetParent: function() {
			return this.map(function() {
				var offsetParent = this.offsetParent || document.body;
				while ( offsetParent && (!REGEX_HTML_BODY.test(offsetParent.nodeName) && currentCSS(offsetParent, "position") === "static") ) {
					offsetParent = offsetParent.offsetParent;
				}
				return offsetParent;
			});
		}
}); 

// Create scrollLeft and scrollTop methods
var _scrolls_ = ["Left", "Top"];
for(var i=0,l=_scrolls_.length;i<l;i++){
	var name = _scrolls_[i];
	var method = "scroll" + name;

	Simples.prototype[ method ] = function(val) {
		var elem = this[0], win;
		
		if ( !elem ) {
			return null;
		}

		if ( val !== undefined ) {
			// Set the scroll offset
			return this.each(function() {
				win = getWindow( this );

				if ( win ) {
					win.scrollTo(
						!i ? val : jQuery(win).scrollLeft(),
						 i ? val : jQuery(win).scrollTop()
					);

				} else {
					this[ method ] = val;
				}
			});
		} else {
			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				Simples.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}
	};
}

function getWindow( elem ) {
	return ("scrollTo" in elem && elem.document) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}