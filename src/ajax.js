
// ======= AJAX ========== //
// borrowed from jQuery
/** @private */
var ACCEPTS = {
    xml: "application/xml, text/xml",
    html: "text/html",
	script: "text/javascript, application/javascript",
    json: "application/json, text/javascript",
    text: "text/plain",
    _default: "*/*"
},
JSON = "json",
FILE = "file:",
GET = "GET",
XML = "xml",
// REGEXP USED IN THIS FILE
AJAX_IS_JSON = /^[\],:{}\s]*$/,
AJAX_AT = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
AJAX_RIGHT_SQUARE = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
AJAX_EMPTY = /(?:^|:|,)(?:\s*\[)+/g,
LAST_AMP = /&$/,
PARSEERROR = "parsererror",
// count of active ajax requests
ActiveAjaxRequests = 0,
/** @private method used by Simples.params to build data for request */
formatData = function(name, value) {

    var str = "";

    if (typeof name === "string") {
    	var klass = Simples.getConstructor( value );
		if ( klass === "Function" ) {

            str = formatData(name, value());
        } else if ( klass === "Object" ) {
            var arr = [];

            for (var key in value) {

                var result = formatData(name + "[" + key + "]", value[key]);
                if (result) {
                    arr.push(result);
                }
            }

            str = arr.join('&');
        } else if ( klass === "Array" ) {
            str = formatData(name, value.join(','));
        } else if( value != null ){
            str = ( encodeURIComponent(name) + '=' + encodeURIComponent(value) );
		}
    }
    return str;
},
/** @private method to determine the success of the HTTP response */
httpSuccess = function(xhr) {
    try {
        // If no server status is provided, and we're actually
        // requesting a local file, then it was successful
        return !xhr.status && location.protocol == FILE ||

        // Any status in the 200 range is good
        (xhr.status >= 200 && xhr.status < 300) ||

        // Successful if the document has not been modified
        xhr.status == 304 ||

        // Safari returns an empty status if the file has not been modified
        navigator.userAgent.indexOf("Safari") >= 0 && typeof xhr.status == "undefined";
    } catch(e) {}

    // If checking the status failed, then assume that the request failed too
    return false;
},
/** @private method for httpData parsing is from jQuery 1.4 */
httpData = function(xhr, type, dataFilter) {

    var ct = xhr.getResponseHeader("content-type") || "",
    xml = type === XML || !type && ct.indexOf(XML) >= 0,
    data = xml ? xhr.responseXML: xhr.responseText;

    if (xml && data.documentElement.nodeName === PARSEERROR) {
        throw PARSEERROR;
    }

    if (typeof dataFilter === "function") {
        data = dataFilter(data, type);
    }

    // The filter can actually parse the response
    if (typeof data === "string") {
        // Get the JavaScript object, if JSON is used.
        if (type === JSON || !type && ct.indexOf(JSON) >= 0) {
            // Make sure the incoming data is actual JSON
            // Logic borrowed from http://json.org/json2.js
            if (AJAX_IS_JSON.test(data.replace(AJAX_AT, "@").replace(AJAX_RIGHT_SQUARE, "]").replace(AJAX_EMPTY, ""))) {

                // Try to use the native JSON parser first
                if (WIN.JSON && WIN.JSON.parse) {
                    data = WIN.JSON.parse(data);

                } else {
                    data = ( new Function("return " + data) )();
                }

            } else {
                throw "Invalid JSON: " + data;
            }

            // If the type is SCRIPT, eval it in global context
        } else if (type === SCRIPT || !type && ct.indexOf("javascript") >= 0) {

            eval.call(WIN, data);
        }
    }

    return data;
};
// public methods
Simples.merge( /** @lends Simples */ {
	/**
	 * @namespace Simples.ajaxDefaults
	 * @description default behaviour for all ajax requests
	 */
	ajaxDefaults : /** @lends Simples.ajaxDefaults */ {
	    // Functions to call when the request fails, succeeds,
	    // or completes (either fail or succeed)
		/** 
		 * @description function to execute request is made to server ( xhrObject )
		 */	
		beforeSend : Simples.noop,
		/**
		 * @description function to execute when complete arguments are ( xhrObject, 'complete' )
		 */
	    complete: Simples.noop,
		/**
		 * @description function to execute when complete arguments are ( xhrObject, 'error' || 'pareseerror' )
		 */	
	    error: Simples.noop,
		/**
		 * @description function to execute when complete arguments are ( data, 'success', xhrObject )
		 */	
	    success: Simples.noop,
		/**
		 * @description The data type that'll be returned from the server the default is simply to determine what data was returned from the and act accordingly. -- xml: "application/xml, text/xml", html: "text/html", json: "application/json, text/javascript", text: "text/plain", _default: "*%2F*"
		 */
	    dataType: JSON,
		/**
		 * @description boolean value of whether you want the request to be asynchronous or blocking
		 */
	    async: true,
		/**
		 * @description the HTTP verb type of request GET, POST, PUT, DELETE
		 */		
	    type: GET,
		/**
		 * @description the time to allow the request to be open before a timeout is triggered
		 */
	    timeout: 5000,
		/**
		 * @description helper to return the correct XHR object for your platform
		 */
		xhr: WIN.XMLHttpRequest && (WIN.location.protocol !== FILE || !WIN.ActiveXObject) ?
			function() {
				return new WIN.XMLHttpRequest();
			} :
			function() {
				try {
					return new WIN.ActiveXObject("Microsoft.XMLHTTP");
				} catch(e) {}
			},
		/**
		 * data: data to pass to the server
		 */
	    data: null,
		/**
		 * Simples.ajaxDefaults.context: context in which the callback is to be executed
		 */
		context : WIN
	},
	/**
	 * @description used to send an ajax requests
	 * @param url {String}
	 * @param options {Object} the options to use specified for each individual request see Simples.ajaxDefaults for description of options
	 */	
    ajax: function(url, options) {

	    // Load the options object with defaults, if no
	    // values were provided by the user
	    if ( typeof url !== "string" ) {
	        throw new Error('A URL must be provided.');
	    }

	    options = Simples.merge({}, Simples.ajaxDefaults, options);
		var type = options.type.toUpperCase(); 

	    // How long to wait before considering the request to be a timeout
	    // Create the request object
	    var xhr = options.xhr();
	
	    if ( options.data ) {
            options.data = Simples.params( options.data );
        }

	    if (type === 'POST') {
	        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    } else if( type === GET){
			url = ( url + ( url.indexOf('?') > 0 ? '&' : '?' ) + options.data );
		}

	    // Open the asynchronous POST request
	    xhr.open( type, url, options.async );

	    // Keep track of when the request has been succesfully completed
	    var requestDone = false;

	    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

	    xhr.setRequestHeader("Accept", ACCEPTS[ options.dataType ] || ACCEPTS._default );
		// up ajax Counter
	    ActiveAjaxRequests++;
	    // Watch for when the state of the document gets updated
	    function onreadystatechange() {
	        // Wait until the data is fully loaded,
	        // and make sure that the request hasn't already timed out
	        if (xhr.readyState == 4 && !requestDone) {
	            // clear poll interval
	            if (ival) {
	                clearInterval(ival);
	                ival = null;
	            }
	            // clearTimeout( TIMEOUT_ID );
	            // Check to see if the request was successful
	            if (httpSuccess(xhr)) {

	                // Execute the success callback with the data returned from the server
	                var data;
	                try {
	                    data = httpData(xhr, options.dataType);
	                } catch(e) {
	                    options.error.call( options.context, xhr, PARSEERROR);
	                }

	                options.success.call( options.context, data, 'success', xhr);

	                // Otherwise, an error occurred, so execute the error callback
	            } else {
	                options.error.call( options.context, xhr, 'error');
	            }
	            // Call the completion callback
	            options.complete.call( options.context, xhr, 'complete' );

	            ActiveAjaxRequests--;
	            // Clean up after ourselves, to avoid memory leaks
	            xhr = null;
	        }
	    }
        // to enable headers etc to be added to request
        options.beforeSend( xhr );

	    // Setup async ajax call
	    if (options.async) {
	        // don't attach the handler to the request, just poll it instead
	        var ival = setInterval(onreadystatechange, 13);
	        // Initalize a callback which will fire 5 seconds from now, cancelling
	        // the request (if it has not already occurred).
	        setTimeout(function() {
	            requestDone = true;
	        },
	        options.timeout);
	    }

	    // Establish the connection to the server
		// Send the data
		try {
			xhr.send( (type !== GET && s.data) || null );
		} catch( sendError ) {
			onreadystatechange();
		}
	    // non-async requests
	    if (!options.async) {
	        onreadystatechange();
	    }

	},
	/**
	 * @description used to get scripts from a server
	 * @param src {String} the source to point to for the request
	 * @param callback {Function} called when the script is finished loading
	 */
	scriptLoader : function( src, callback ){

		var script = DOC.createElement(SCRIPT),
			head = DOC.getElementsByTagName("head")[0] || DOC.documentElement;
		
	    if (script.readyState) {
			/** @private */
	        script.onreadystatechange = function() {
	            if (script.readyState === "loaded" || script.readyState === "complete") {
	                script.onreadystatechange = null;
	                ( ( typeof callback === "function" ) ? callback : Simples.noop ).call( this, src, this );
					this.parentNode.removeChild( this );
	            }
	        };
	    } else {
			/** @private */
	        script.onload = function() {
	            ( ( typeof callback === "function" ) ? callback : Simples.noop ).call( this, src, this );
				this.parentNode.removeChild( this );
	        };
		}

	    script.type = "text/javascript";
	    script.async = true;
	    script.src = src;

	    head.appendChild(script);
	
	    // cleanup memory
	    script = null;
	},
	/**
	 * @description used to update the global default settings, see Simples.ajaxDefaults description
	 */
    ajaxSettings: function(opts) {
	    Simples.ajaxDefaults = Simples.merge(Simples.ajaxDefaults, opts);
	},
	/**
	 * @description used to format data into a transmittable format takes either one argument of an object of array of objects or 2 arguments of strings
	 * @param {Object|Array|String} name : value OR [{name:'',value:''}] OR "name" 
	 * @param {String} value 
	 */
    params: function(obj,value) {

	    if( arguments.length === 1 ){ 
			var arr = [],
				klass = Simples.getConstructor( obj );
		    if ( klass === "Object" ) {
		        for (var key in obj) {

		            arr[ arr.length ] = formatData( key, obj[key] );
				}
		    } else if ( klass === "Array" ) {
		        for (var i = 0, l = obj.length; i < l; i++) {

		            if ( Simples.isConstructor( obj[i], "Object" ) ) {

		                arr[ arr.length ] = formatData( obj[i].name, obj[i].value );
		            }
		        }                        
			}
			return arr.join('&');
	    } else if( arguments.length === 2 ) {
			return formatData( arguments[0], arguments[1] );
		}
	}
});