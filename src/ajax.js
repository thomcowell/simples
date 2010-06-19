
// ======= AJAX ========== //
// Constants
var DEFAULTS = {
    // Functions to call when the request fails, succeeds,
    // or completes (either fail or succeed)
    complete: function() {},
    error: function() {},
    success: function() {},
    additionalData: [],
    dataType: 'json',
    async: true,
    type: "GET",
    timeout: 5000,
    // The data type that'll be returned from the server
    // the default is simply to determine what data was returned from the
    // and act accordingly.
    data: null
},    
// borrowed from jQuery
ACCEPTS = {
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
TYPEOF = /number|string/;

function ajaxDefaults(opts) {
    DEFAULTS = Simples.merge(DEFAULTS, opts);
}
// A generic function for performming AJAX requests
// It takes one argument, which is an object that contains a set of options
// All of which are outline in the comments, below
// From John Resig's book Pro JavaScript Techniques
// published by Apress, 2006-8
function ajax(url, options) {

    // Load the options object with defaults, if no
    // values were provided by the user
    if (!url) {
        throw new Error('A URL must be provided.');
    }

    options = Simples.merge({}, DEFAULTS, options);

    // How long to wait before considering the request to be a timeout
    // Create the request object
    var xhr = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();

    // Open the asynchronous POST request
    xhr.open(options.type, url, options.async);

    // Keep track of when the request has been succesfully completed
    var requestDone = false;

    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    if (options.type === 'POST') {
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        if (options.data !== null && options.data !== "") {
            options.data = serialise(options.data).replace(/&$/, '');

            if (options.additionalData.toString() === "[object Object]" || options.additionalData.length || typeof options.additionalData === 'string') {
                options.data += ("&" + serialise(options.additionalData));
            }
        }

    }

    var content = ACCEPTS[ options.dataType ];
    content = content ? content + ',': '';
    xhr.setRequestHeader("Accept", content + ACCEPTS._default);

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
                try {
                    var data = httpData(xhr, options.dataType);
                } catch(e) {
                    options.error(xhr, 'parseerror');
                }

                options.success(data, 'success');

                // Otherwise, an error occurred, so execute the error callback
            } else {
                options.error(xhr, 'error');
            }

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
    xhr.send(options.data);
    // non-async requests
    if (!options.async) {
        onreadystatechange();
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

        var ct = xhr.getResponseHeader("content-type") || "",
        xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
        data = xml ? xhr.responseXML: xhr.responseText;

        if (xml && data.documentElement.nodeName === "parsererror") {
            throw "parsererror";
        }

        if (typeof dataFilter === 'function') {
            data = dataFilter(data, type);
        }

        // The filter can actually parse the response
        if (typeof data === "string") {
            // Get the JavaScript object, if JSON is used.
            if (type === "json" || !type && ct.indexOf("json") >= 0) {
                // Make sure the incoming data is actual JSON
                // Logic borrowed from http://json.org/json2.js
                if (AJAX_IS_JSON.test(data.replace(AJAX_AT, "@").replace(AJAX_RIGHT_SQUARE, "]").replace(AJAX_EMPTY, ""))) {

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

}

function serialise(obj) {
    var arr = [];

    if ( Simples.isObject( obj ) ) {
        for (var key in obj) {
	
            arr[ arr.length ] = formatData( key, obj[key] );
		}
    } else if ( Simples.isArray( obj ) ) {
        for (var i = 0, l = obj.length; i < l; i++) {
	
            if ( Simples.isObject( obj[i] ) ) {
	
                arr[ arr.length ] = formatData( obj[i].name, obj[i].value );
            }
        }
    } else if( arguments.length === 2 ) {
		obj = formatData( arguments[0], arguments[1] );
	}

    return typeof( obj ) === 'string' ? obj : arr.join('&');
}

function formatData(name, value) {

	var str = "";

	if( typeof name === 'string' ){
		var objClass = toString.call( value );
		if( objClass === NumberClass || objClass === StringClass || objClass === BooleanClass) {

	        str = ( encodeURIComponent(name) + '=' + encodeURIComponent(value) );
		} else if( objClass === FunctionClass ){
		
		 	str = formatData( name, value() );
	    } else if ( objClass === ObjectClass ) {
	        var arr = [];

	        for (var key in value) { 

				var result = formatData(name + "[" + key + "]", value[ key ] );
	            if( result ){ arr.push( result ); }
	        }

	        str = arr.join('&');
	    } else if ( objClass === ArrayClass ) {
			str = formatData( name, value.join(',') )
		} 
	}
	return str;
}

Simples.merge({
    ajax: ajax,
    ajaxSettings: ajaxSettings,
    params: serialise
});