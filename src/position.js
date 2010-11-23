// OMG its another non-W3C standard browser 
var REGEX_HTML_BODY = /^body|html$/i,
getWindow = function( elem ) {
	return ("scrollTo" in elem && elem.document) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
};

if( "getBoundingClientRect" in document.documentElement ){
	/**
	 * Simples.offset: to get the top, left offset of an element
	 * @param {Element} elem the element to get the offset of
	 * @returns {Object} top, left
	 */
	Simples.offset = function( elem ){

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return Simples.bodyOffset( elem );
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
	Simples.offset = function( elem ) {

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return Simples.bodyOffset( elem );
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

				if ( Simples.offset.doesNotAddBorder && !(Simples.offset.doesAddBorderForTableAndCells && (/^t(able|d|h)$/i).test(elem.nodeName)) ) {
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
/**
 * @private 
 */
Simples.offset.init = function(){
	var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( Simples.currentCSS(body, "marginTop", true) ) || 0,
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
	checkDiv.style.position = checkDiv.style.top = EMPTY_STRING;

	innerDiv.style.overflow = "hidden";
	innerDiv.style.position = "relative";

	this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

	this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

	body.removeChild( container );
	body = container = innerDiv = checkDiv = table = td = null;
	this.init = Simples.noop;
};

Simples.merge({
	/**
	 * Simples.bodyOffset: to get the offset of the body 
	 * @param {Body} body body element to measure
	 * @returns {Object} top, left
	 */
	bodyOffset : function( body ) {
		var top = body.offsetTop, left = body.offsetLeft;

		Simples.offset.init();

		if ( Simples.offset.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( Simples.currentCSS(body, "marginTop",  true) ) || 0;
			left += parseFloat( Simples.currentCSS(body, "marginLeft", true) ) || 0;
		}

		return { top: top, left: left };
	},
	/**
	 * Simples.setOffset: to set the offset of the top and left of an element passed on its current offset
	 * @param {Element} elem
	 * @param {Object} options
	 * @param {Number} options.top the top offset desired
	 * @param {Number} options.left	the left offset desired
	 */
	setOffset : function( elem, options ) {
		var position = Simples.currentCSS( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem    = Simples( elem ),
			curOffset  = curElem.offset(),
			curCSSTop  = Simples.currentCSS( elem, TOP, true ),
			curCSSLeft = Simples.currentCSS( elem, LEFT, true ),
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
	},
	/**
	 * Simples.offsetParent: to get the offsetParent of an element
	 * @param {Element} elem
	 * @returns {Element}
	 */
	offsetParent : function( elem ) {
		var offsetParent = elem.offsetParent || document.body;
		while ( offsetParent && (!REGEX_HTML_BODY.test(offsetParent.nodeName) && Simples.currentCSS(offsetParent, "position") === "static") ) {
			offsetParent = offsetParent.offsetParent;
		}

		return offsetParent;
	},
	/**
	 * Simples.position: to get the position of the element
	 * @param {Element} elem to get the position of
	 * @returns {Object} top, left
	 */
	position: function( elem ) {

		// Get *real* offsetParent
		var offsetParent = Simples.offsetParent( elem ),

		// Get correct offsets
		offset       = Simples.offset( elem ),
		parentOffset = REGEX_HTML_BODY.test(offsetParent.nodeName) ? { top: 0, left: 0 } : Simples.offset( offsetParent );

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( Simples.currentCSS(elem, "marginTop",  true) ) || 0;
		offset.left -= parseFloat( Simples.currentCSS(elem, "marginLeft", true) ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( Simples.currentCSS(offsetParent, "borderTopWidth",  true) ) || 0;
		parentOffset.left += parseFloat( Simples.currentCSS(offsetParent, "borderLeftWidth", true) ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},
	/**
	 * Simples.setScroll: 
	 * @param {Element} elem
	 * @param {String} name 'top' or 'left' 
	 * @param {Number} value  	
	 */
	setScroll : function( elem, name, val ){
		win = getWindow( elem );

		if ( win ) {
			win.scrollTo(
				name === LEFT ? val : Simples.getScroll( win, LEFT ),
				name === TOP ? val : Simples.getScroll( win, TOP )
			);

		} else {
			name = name === TOP ? "scrollTop" : "scrollLeft";
			elem[ name ] = val;
		}
	},
	/**
	 * Simples.getScroll: To retrieve the scrollTop / scrollLeft for a given element
	 * @param {Element} elem
	 * @param {String} name 'top' or 'left'
	 * @returns {Number} the value of the scrollTop / scrollLeft 	
	 */	
	getScroll : function( elem, name ){
		var isTop = name === TOP;
		name = isTop ? "scrollTop" : "scrollLeft";
		win = getWindow( elem );

		// Return the scroll offset
		return win ? ( ("pageXOffset" in win) ? win[ isTop ? "pageYOffset" : "pageXOffset" ] : Simples.support.boxModel && win.document.documentElement[ name ] || win.document.body[ name ] ) : elem[ name ];		
	}
});

Simples.extend({
	/**
	 * Simples( '*' ).offset: To set or retrieve the offset of the selected elements on the Simples object
	 * @param {Object} options object with top and / or left specified to set the offset
	 * @returns {Number|Simples} the value of the offset or Simples object
	 */	
	offset : function( options ){

		if ( options ) {
			var len = this.length;
			while( len ){
				Simples.setOffset( this[ --len ], options );
			}
			return this;
		}

		return this[0] ? Simples.offset( this[0] ) : null;
	},
	/**
	 * Simples( '*' ).offsetParent: To return the same object with the offsetParents added in place of the selected elements
	 */	
	offsetParent : function(){
		var len = this.length;
		while( len ){
			this[ --len ] = Simples.offsetParent( this[ len ] );
		}
		return this;
	},
	/**
	 * Simples( '*' ).scroll: To retrieve or set the scrollTop / scrollLeft elements on the simples object, if no value is provided the first element has the value return
	 * @param {String} name 'top' or 'left'
	 * @param {Number} val the value to set the offset to
	 * @returns {Number|Simples} the value of the scrollTop / scrollLeft or Simples object
	 */	
	scroll : function( name, val ){
		if( val !== undefined ){
			var len = this.length;
			while( len ){
				Simples.setScroll( this[ --len ], name, val );
			}
			return this;
		}
		return this[0] ? Simples.getScroll( this[0], name ) : null;
	},
	/**
	 * Simples( '*' ).position: To retrieve or set the scrollTop / scrollLeft elements on the simples object
	 * @param {String} name 'top' or 'left'
	 * @param {Number} val the value to set the offset to
	 * @returns {Number} the value of the scrollTop / scrollLeft 	
	 */	
	position : function(){
		return this[0] ? Simples.position( this[0] ) : null;
	}
});