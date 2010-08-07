module("Support");
test("test that values are assigned", 10, function() {
	ok( typeof Simples.support.opacity === 'boolean', "opacity is a boolean value" );
	ok( typeof Simples.support.cssFloat === 'boolean', "cssFloat is a boolean value" );
	ok( typeof Simples.support.leadingWhitespace === 'boolean', "leadingWhitespace is a boolean value" ); 
	ok( typeof Simples.support.checkOn === 'boolean', "checkOn is a boolean value" ); 
	ok( typeof Simples.support.checkClone === 'boolean', "checkClone is a boolean value" ); 
	ok( typeof Simples.support.submitBubbles === 'boolean', "submitBubbles is a boolean value" ); 
	ok( typeof Simples.support.changeBubbles === 'boolean', "changeBubbles is a boolean value" );		
	ok( typeof Simples.support.scriptEval === 'boolean', "scriptEval is a boolean value" );        
	ok( typeof Simples.support.noCloneEvent === 'boolean', "noCloneEvent is a boolean value" );        
	ok( typeof Simples.support.isBoxModel === 'boolean', "isBoxModel is a boolean value" );        		
});           

test("test that broswer values are returned", 3, function() {
	ok( !Simples.isEmptyObject( Simples.browser ), "should have a browser object" );
	ok( parseFloat( Simples.browser.version ) > 0, "Is a number" );
	var browsers = ["mozilla","webkit","msie","opera"];
	for(var i=0,l=browsers.length;i<l;i++){
		if( hasOwn.call( Simples.browser, browsers[i] ) ){
			ok( Simples.browser[ browsers[i] ], "Should have a browser type identified.")
		}
	}
});