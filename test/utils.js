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

test("isArray", 7, function() {
	same( Simples.isArray(), false, 'empty arguments should return false' );  
	same( Simples.isArray({simples:true}), false, 'passing in an object should return false' );   
	same( Simples.isArray( null ), false, 'passing in null should return false' );   
	same( Simples.isArray( 1 ), false, 'passing in a number should return false' );   		
	same( Simples.isArray( 'string' ), false, 'passing in a string should return false' );   			
	same( Simples.isArray( true ), false, 'passing in a booelan should return false' );   				
	ok( Simples.isArray(['simples']), 'passing in an array should return true' );   	
}); 

test("isObject", 7, function() {
	same( Simples.isObject(), false, 'empty arguments should return false' );  
	same( Simples.isObject(['simples']), false, 'passing in an array should return false' );   
	same( Simples.isObject( null ), false, 'passing in null should return false' );   
	same( Simples.isObject( 1 ), false, 'passing in a number should return false' );   		
	same( Simples.isObject( 'string' ), false, 'passing in a string should return false' );   			
	same( Simples.isObject( true ), false, 'passing in a booelan should return false' );   				
	ok( Simples.isObject({simples:true}), 'passing in an object should return true' );   	
});