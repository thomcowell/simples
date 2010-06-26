// OMG its another non-W3C standard browser 
var REGEX_HTML_BODY = /^body|html$/i;

Simples.offset = {
	init : function(){
		var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( currentCSS(body, "marginTop", true) ) || 0,
			html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

		Simples.merge( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

		container.innerHTML = html;
		body.insertBefore( container, body.firstChild );
		innerDiv = container.firstChild;
		checkDiv = innerDiv.firstChild;
		td = innerDiv.nextSibling.firstChild.firstChild;

		this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
		this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

		checkDiv.style.position = "fixed";
		checkDiv.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
		checkDiv.style.position = checkDiv.style.top = "";

		innerDiv.style.overflow = "hidden";
		innerDiv.style.position = "relative";

		this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

		this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

		body.removeChild( container );
		body = container = innerDiv = checkDiv = table = td = null;
		Simples.offset.initialize = Simples.noop;
	},
	bodyOffset: function( body ) {
		var top = body.offsetTop, left = body.offsetLeft;

		Simples.offset.init();

		if ( Simples.offset.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( currentCSS(body, "marginTop",  true) ) || 0;
			left += parseFloat( currentCSS(body, "marginLeft", true) ) || 0;
		}

		return { top: top, left: left };
	},
	
	setOffset: function( elem, options, i ) {
		var position = currentCSS( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem    = Simples( elem ),
			curOffset  = curElem.offset(),
			curCSSTop  = currentCSS( elem, "top", true ),
			curCSSLeft = currentCSS( elem, "left", true ),
			calculatePosition = (position === "absolute" && (curCSSTop === 'auto' || curCSSLeft === 'auto' ) ),
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is absolute
		if ( calculatePosition ) {
			curPosition = curElem.position();
		}

		curTop  = calculatePosition ? curPosition.top  : parseInt( curCSSTop,  10 ) || 0;
		curLeft = calculatePosition ? curPosition.left : parseInt( curCSSLeft, 10 ) || 0;

		if (options.top != null) {
			props.top = (options.top - curOffset.top) + curTop;
		}
		if (options.left != null) {
			props.left = (options.left - curOffset.left) + curLeft;
		}
		
		curElem.css( props );
	}	
}

if( "getBoundingClientRect" in document.documentElement ){
	Simples.prototype.offset = function( options ){
		var elem = this[0];

		if ( options ) { 
			return this.each(function( i ) {
				Simples.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return Simples.offset.bodyOffset( elem );
		}

		var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body,
			docElem = doc.documentElement, win = getWindow(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = (win.pageYOffset || Simples.support.boxModel && docElem.scrollTop  || body.scrollTop ),
			scrollLeft = (win.pageXOffset || Simples.support.boxModel && docElem.scrollLeft || body.scrollLeft),
			top  = box.top  + scrollTop  - clientTop, left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};	                 
} else {
	Simples.prototype.offset = function( options ) {
		var elem = this[0];

		if ( options ) { 
			return this.each(function( i ) {
				Simples.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return Simples.offset.bodyOffset( elem );
		}

		Simples.offset.init();

		var offsetParent = elem.offsetParent, prevOffsetParent = elem,
			doc = elem.ownerDocument, computedStyle, docElem = doc.documentElement,
			body = doc.body, defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop, left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( Simples.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( Simples.offset.doesNotAddBorder && !(Simples.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( Simples.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( Simples.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};	
}

Simples.extend({
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
		var newObj = Simples();
		this.each(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!REGEX_HTML_BODY.test(offsetParent.nodeName) && currentCSS(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}  
			if( offsetParent !== null || offsetParent !== undefined ){
				newObj[newObj.length] = offsetParent;
				newObj.length++;
			}
		});
		return newObj;
	}       
});

function getWindow( elem ) {
	return ("scrollTo" in elem && elem.document) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
 
// Create scrollLeft and scrollTop methods
(function( Simples ){
	var _scrolls_ = ["Left", "Top"];
	for(var i=0,l=_scrolls_.length;i<l;i++){
		(function( name, i ){ 		
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
								!i ? val : Simples(win).scrollLeft(),
								 i ? val : Simples(win).scrollTop()
							);

						} else {
							this[ method ] = val;
						}
					});
				} else {
					win = getWindow( elem );

					// Return the scroll offset
					return win ? ( ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] : Simples.support.boxModel && win.document.documentElement[ method ] || win.document.body[ method ] ) : elem[ method ];
				}
			};
		})( _scrolls_[i], i );
	}            
})( Simples );