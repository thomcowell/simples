module("Utils");

test("noop is a empty function", 1, function() {
	same( Simples.noop(), undefined, 'noop should return undefined' );
});

test("setContext", 3, function() {                                                                           
	var object = {hammer:true};
	var context = Simples.setContext( object, function(){ return this; });   
	equal( typeof context, 'function', 'should be an object');
	equal( context( 'hammer' ).toString(), '[object Object]', 'should be an object');
	same( context( 'hammer' ), object, 'should return object' );
});