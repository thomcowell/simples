// Constants
var SINGLE_TAG = /<(\w+)\s?\/?>/,
	// TAG_STRIP = /\b[\.|\#\|\[].+/g, 
	// TAG_STRIP = /\b(\.|\#|\[)|(\=?<!(name))(.)*/, /(?:\w+)\b((\.|\#|\[)|(\=?>!(name)))(.)*/, /(?:\w+)\b[\.|\#|\[]{1}.*/g,
	FIRST_ID = /\s#/,
	// ATTR_NAME_IS = /\[name\=([^\]]+)\]/,
	// Is it a simple selector
	COMPLEX_TAG = /^<([a-zA-Z][a-zA-Z0-9]*)([^>]*)>(.*)<\/\1>/i,
	SPACE_WITH_BOUNDARY = /\b\s+/g,
	COMMA_WITH_BOUNDARY = /\s?\,\s?/g,
	QUERY_SELECTOR = Simples.support.useQuerySelector,
	/** @private */
	getElements = function(selector, context) {

	    context = context || DOC;
	    var tag = selector.substring(1),
	    elems,
	    nodes;

	    if (selector.indexOf('#') === 0) {
	        // Native function
	        var id = (context && context.nodeType === 9 ? context: DOC).getElementById(tag);
	        // test to make sure id is the own specified, because of name being read as id in some browsers
	        return id && id.id === tag ? [id] : [];

	    } else if (selector.indexOf('.') === 0) {
	        if (context.getElementsByClassName) {
	            // Native function
	            return Simples.makeArray( context.getElementsByClassName(tag) );
	        } else {
	            // For IE which doesn't support getElementsByClassName
	            elems = context.getElementsByTagName('*');
	            nodes = [];
	            // Loop over elements to test for correct class
	            for (var i = 0, l = elems.length; i < l; i++) {
	                // Detect whether this element has the class specified
	                if ( Simples.className( elems[i], tag ) ) {
	                    nodes.push(elems[i]);
	                }
	            }
	            return nodes;
	        }
	    } else if (selector.indexOf('[name=') === 0) {
	        var name = selector.substring(6).replace(/\].*/, "");
	        context = context && context.nodeType === 9 ? context: DOC;
	        if (context.getElementsByName) {
	            return Simples.makeArray( context.getElementsByName(name) );
	        } else {
	            // For IE which doesn't support getElementsByClassName
	            elems = context.getElementsByName('*');
	            nodes = [];
	            // Loop over elements to test for correct class
	            for (var m = 0, n = elems.length; m < n; m++) {
	                // Detect whether this element has the class specified
	                if ((" " + (elems[m].name || elems[m].getAttribute("name")) + " ").indexOf(name) > -1) {
	                    nodes.push(elems[m]);
	                }
	            }
	            return nodes;
	        }
	    } else {
	        // assume that if not id or class must be tag
	        return Simples.makeArray( context.getElementsByTagName(selector) );
	    }
	},
	/** @private */
	createDOM = function( selector, results ){

		results.context = DOC;

		if( COMPLEX_TAG.test( selector ) ){
            results.selector = "<"+COMPLEX_TAG.exec( selector )[1]+">";

			var div = DOC.createElement('div');
            div.innerHTML = selector;
            Simples.makeArray( div.childNodes, results );

        } else if( SINGLE_TAG.test( selector ) ) {
            var tag = SINGLE_TAG.exec( selector );

			results.selector = tag[0];
            results.push( DOC.createElement(tag[1]) );
		}

		return results;
	};

/**
 * @description used to create or select Elements selector based on .class #id and [name=name]
 * @param {String|Element} selector element is used by object and string is used to select Element(s), based on className, id and name and where the querySelector is available using querySelectorAll
 * @param {Element} context element used to provide context
 * @param {Object|Array} results optional object to return selected Elements
 */
Simples.Selector = function(selector, context, results) {
    results = results || [];
	results.selector = selector;
	results.context = context || DOC;

    if (typeof(selector) === "string") {
        // check selector if structured to create element
		if( selector.indexOf('<') > -1 && selector.indexOf('>') > 0 ){
			return createDOM( selector, results );
        } else if ( QUERY_SELECTOR ) {
            return Simples.makeArray( (context || DOC).querySelectorAll(selector), results );
        } else {
	        // if it is a multi select split and short cut the process
	        if (COMMA_WITH_BOUNDARY.test(selector)) {
	            var get = selector.split(COMMA_WITH_BOUNDARY);

	            for (var x = 0, y = get.length; x < y; x++) {
	            	Simples.makeArray( Simples.Selector(get[x], context), results );
	            }
	            return results;
	        }
            // clean up selector
            // selector = selector.replace(TAG_STRIP, "");
            // get last id in selector
            var index = selector.lastIndexOf(FIRST_ID);
            selector = selector.substring(index > 0 ? index: 0);
            // allow another document to be used for context where getting by id
            results.context = context = (selector.indexOf('#') === 0 || selector.indexOf('[name=') === 0) ? (context && context.nodeType === 9 ? context: DOC) : (context || DOC);
            var split = selector.split(SPACE_WITH_BOUNDARY);

            for (var i = 0, l = split.length; i < l; i++) {
                if (context.length > 0) {

                    var result = [];
                    for (var m = 0, n = context.length; m < n; m++) {

                        result = result.concat(getElements(split[i], context[m]));
                    }
                    context = result;
                } else {
                    context = getElements(split[i], context);
                }
            }
            results.push.apply(results, context);
        }
    }
    return results;
};