// Inside closure to prevent any collisions or leaks
(function( Simples ){

var root = document.documentElement, div = document.createElement("div"), script = document.createElement(SCRIPT), id = SCRIPT + new Date().getTime();

div.style.display = "none";
div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

var all = div.getElementsByTagName("*"), a = div.getElementsByTagName("a")[0];

// Can't get basic test support
if ( !all || !all.length || !a ) {
	return;
}
var fragment = document.createDocumentFragment(), testDiv = document.createElement("div");
testDiv.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";
fragment.appendChild( testDiv.firstChild );

// Technique from Juriy Zaytsev
// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
var eventSupported = function( eventName ) { 
	var el = document.createElement("div"); 
	eventName = "on" + eventName; 

	var isSupported = (eventName in el); 
	if ( !isSupported ) { 
		el.setAttribute(eventName, "return;"); 
		isSupported = typeof el[eventName] === FUNC; 
	} 
	el = null; 

	return isSupported; 
};

Simples.merge( /** @lends Simples */ {
	support : { 
		// to determine whether querySelector is avaliable
		useQuerySelector : typeof document.querySelectorAll === FUNC,
		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See jQuery #5145
		opacity : /^0.55$/.test( a.style.opacity ),
		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)		
		cssFloat: !!a.style.cssFloat,
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,
		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to EMPTY_STRING instead)
		checkOn: div.getElementsByTagName("input")[0].value === "on",
		// WebKit doesn't clone checked state correctly in fragments   
		checkClone : fragment.cloneNode(true).cloneNode(true).lastChild.checked, 
		// Event support
		submitBubbles : eventSupported("submit"),
		changeBubbles : eventSupported("change"),
		// standard setup
		scriptEval: false, 
		// standard setup
		noCloneEvent: true,
		// Box model support
		isBoxModel: null
	},
	// Use of Simples.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	/**
	 * @description takes a navigator.userAgent and returns a usable rendition of it 
	 * @params {String} navigator.userAgent
	 * @returns {Object} i.e. { browser: msie|opera|webkit|mozilla, version: 1 }
	 */
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
			/(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
			/(msie) ([\w.]+)/.exec( ua ) ||
			!/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
			[];

		return { browser: match[1] || EMPTY_STRING, version: match[2] || "0" };
	},
	browser : {}
}); 

script.type = "text/javascript";
try {
	script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
} catch(e) {}

root.insertBefore( script, root.firstChild );

// Make sure that the execution of code works by injecting a script
// tag with appendChild/createTextNode
// (IE doesn't support this, fails, and uses .text instead)
if ( window[ id ] ) {
	Simples.support.scriptEval = true;
	delete window[ id ];
}

root.removeChild( script );

if ( div.attachEvent && div.fireEvent ) {
	div.attachEvent("onclick", function click() {
		// Cloning a node shouldn't copy over any
		// bound event handlers (IE does this)
		jQuery.support.noCloneEvent = false;
		div.detachEvent("onclick", click);
	});
	div.cloneNode(true).fireEvent("onclick");
}

var browserMatch = Simples.uaMatch( navigator.userAgent );
if ( browserMatch.browser ) {
	Simples.browser[ browserMatch.browser ] = true;
	Simples.browser.version = browserMatch.version;
}

Simples.ready(function(){
	var div = document.createElement("div");
	div.style.width = div.style.paddingLeft = "1px";

	document.body.appendChild( div );
	Simples.support.isBoxModel = div.offsetWidth === 2;
	document.body.removeChild( div ).style.display = 'none';
	div = null;	
});
// nulling out support varaibles as finished
root = div = script = id = testDiv = null;

})( Simples );
