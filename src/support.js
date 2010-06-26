var div = document.createElement("div");
div.style.display = "none";
div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

var a = div.getElementsByTagName("a")[0];

var userAgent = navigator.userAgent, browserMatch;

Simples.merge({
	support : {
		opacity : /^0.55$/.test( a.style.opacity ),
		cssFloat: !!a.style.cssFloat
	},
	// Use of Simples.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
			/(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
			/(msie) ([\w.]+)/.exec( ua ) ||
			!/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},
	browser : {}
});

browserMatch = Simples.uaMatch( userAgent );
if ( browserMatch.browser ) {
	Simples.browser[ browserMatch.browser ] = true;
	Simples.browser.version = browserMatch.version;
}

Simples(document).ready(function(){
	var div = document.createElement("div");
	div.style.width = div.style.paddingLeft = "1px";

	document.body.appendChild( div );
	Simples.support.isBoxModel = div.offsetWidth === 2;
	document.body.removeChild( div ).style.display = 'none';
	div = null;	
});