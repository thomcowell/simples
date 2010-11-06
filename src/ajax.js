
// ======= AJAX ========== //
/** @const */
// borrowed from jQuery
var ACCEPTS = {
    xml: "application/xml, text/xml",
    html: "text/html",
    script: "text/javascript, application/javascript",
    json: "application/json, text/javascript",
    text: "text/plain",
    _default: "*/*"
},
AJAX_IS_JSON = /^[\],:{}\s]*$/,
AJAX_AT = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
AJAX_RIGHT_SQUARE = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
AJAX_EMPTY = /(?:^|:|,)(?:\s*\[)+/g,
LAST_AMP = /&$/,
PARSEERROR = "parsererror",
TYPEOF = /number|string/;

var ActiveAjaxRequests = 0;

function formatData(name, value) {

    var str = EMPTY_STRING;

    if (typeof name === STRING) {
        var objClass = toString.call(value);
		if (objClass === FunctionClass) {

            str = formatData(name, value());
        } else if (objClass === ObjectClass) {
            var arr = [];

            for (var key in value) {

                var result = formatData(name + "[" + key + "]", value[key]);
                if (result) {
                    arr.push(result);
                }
            }

            str = arr.join('&');
        } else if (objClass === ArrayClass) {
            str = formatData(name, value.join(','));
        } else if( value != null ){
            str = ( encodeURIComponent(name) + '=' + encodeURIComponent(value) );
		}
    }
    return str;
}

// Determine the success of the HTTP response
function httpSuccess(xhr) {
    try {
        // If no server status is provided, and we're actually
        // requesting a local file, then it was successful
        return ! xhr.status && location.protocol == "file:" ||

        // Any status in the 200 range is good
        (xhr.status >= 200 && xhr.status < 300) ||

        // Successful if the document has not been modified
        xhr.status == 304 ||

        // Safari returns an empty status if the file has not been modified
        navigator.userAgent.indexOf("Safari") >= 0 && typeof xhr.status == "undefined";
    } catch(e) {}

    // If checking the status failed, then assume that the request failed too
    return false;
}

// httpData parsing is from jQuery 1.4
function httpData(xhr, type, dataFilter) {

    var ct = xhr.getResponseHeader("content-type") || EMPTY_STRING,
    xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
    data = xml ? xhr.responseXML: xhr.responseText;

    if (xml && data.documentElement.nodeName === PARSEERROR) {
        throw PARSEERROR;
    }

    if (typeof dataFilter === FUNC) {
        data = dataFilter(data, type);
    }

    // The filter can actually parse the response
    if (typeof data === STRING) {
        // Get the JavaScript object, if JSON is used.
        if (type === "json" || !type && ct.indexOf("json") >= 0) {
            // Make sure the incoming data is actual JSON
            // Logic borrowed from http://json.org/json2.js
            if (AJAX_IS_JSON.test(data.replace(AJAX_AT, "@").replace(AJAX_RIGHT_SQUARE, "]").replace(AJAX_EMPTY, EMPTY_STRING))) {

                // Try to use the native JSON parser first
                if (window.JSON && window.JSON.parse) {
                    data = window.JSON.parse(data);

                } else {
                    data = ( new Function("return " + data) )();
                }

            } else {
                throw "Invalid JSON: " + data;
            }

            // If the type is "script", eval it in global context
        } else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {

            eval.call(window, data);
        }
    }

    return data;
}

Simples.merge({
	ajaxDefaults : {
	    // Functions to call when the request fails, succeeds,
	    // or completes (either fail or succeed)
	    complete: function() {},
	    error: function() {},
	    success: function() {},
	    additionalData: [],
	    dataType: 'json',
	    async: true,
		cache: true,
	    type: "GET",
	    timeout: 5000,
		xhr: window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject) ?
			function() {
				return new window.XMLHttpRequest();
			} :
			function() {
				try {
					return new window.ActiveXObject("Microsoft.XMLHTTP");
				} catch(e) {}
			},
	    // The data type that'll be returned from the server
	    // the default is simply to determine what data was returned from the
	    // and act accordingly.
	    data: null
	},
    ajax: function(url, options) {

	    // Load the options object with defaults, if no
	    // values were provided by the user
	    if (!url) {
	        throw new Error('A URL must be provided.');
	    }

	    options = Simples.merge({}, Simples.ajaxDefaults, options);
		var type = options.type.toUpperCase(); 

	    // How long to wait before considering the request to be a timeout
	    // Create the request object
	    var xhr = options.xhr();

	    // Open the asynchronous POST request
	    xhr.open(type, url, options.async);

	    // Keep track of when the request has been succesfully completed
	    var requestDone = false;

	    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

	    if (type === 'POST') {
	        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	        if ( options.data ) {
	            options.data = Simples.params(options.data).replace( LAST_AMP, EMPTY_STRING);

	            if ( toString.call( options.additionalData ) === ObjectClass || options.additionalData.length || typeof options.additionalData === STRING) {
	                options.data += ("&" + Simples.params(options.additionalData));
	            }
	        }

	    }
		var content = ACCEPTS[ options.dataType ];
	    xhr.setRequestHeader("Accept", content ? content +', '+ACCEPTS._default : ACCEPTS._default );
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
	                    options.error(xhr, PARSEERROR);
	                }

	                options.success(data, 'success');

	                // Otherwise, an error occurred, so execute the error callback
	            } else {
	                options.error(xhr, 'error');
	            }
	            ActiveAjaxRequests--;
	            // Call the completion callback
	            options.complete(xhr);

	            // Clean up after ourselves, to avoid memory leaks
	            xhr = null;
	        }
	    }

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
			xhr.send( (type !== "GET" && s.data) || null );
		} catch( sendError ) {
			onreadystatechange();
		}
	    // non-async requests
	    if (!options.async) {
	        onreadystatechange();
	    }

	},
    ajaxSettings: function(opts) {
	    Simples.ajaxDefaults = Simples.merge(Simples.ajaxDefaults, opts);
	},
    params: function(obj) {

	    if( arguments.length === 1 ){ 
			var arr = [];
			var objClass = toString.call( obj );	
		    if ( objClass === ObjectClass ) {
		        for (var key in obj) {

		            arr[ arr.length ] = formatData( key, obj[key] );
				}
		    } else if ( objClass === ArrayClass ) {
		        for (var i = 0, l = obj.length; i < l; i++) {

		            if ( toString.call( obj[i] ) === ObjectClass ) {

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