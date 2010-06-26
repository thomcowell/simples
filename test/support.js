module("Support");
test("test that values are assigned", 3, function() {
	ok( typeof Simples.support.opacity === 'boolean', "opacity is a boolean value" );
	ok( typeof Simples.support.cssFloat === 'boolean', "opacity is a boolean value" );
	ok( typeof Simples.support.isBoxModel === 'boolean', "opacity is a boolean value" );  
});           

test("test that broswer values are returned", function() {
	ok( isObject( browserMatch ), "should have a browser object" );
	ok( parseFloat( browserMatch.version ) > 0, "Is a number" );
	ok( /mozilla|webkit|msie|opera/.test( browserMatch.browser ), "Is a string" );	
});