module("Utils");

test("noop is a empty function", 1, function() {
	same( Simples.noop(), undefined, 'noop should return undefined' );
});

test("isArray ", 7, function() {
	same( Simples.isArray(), false, 'empty arguments should return false' );  
	same( Simples.isArray({simples:true}), false, 'passing in an object should return false' );   
	same( Simples.isArray( null ), false, 'passing in null should return false' );   
	same( Simples.isArray( 1 ), false, 'passing in a number should return false' );   		
	same( Simples.isArray( 'string' ), false, 'passing in a string should return false' );   			
	same( Simples.isArray( true ), false, 'passing in a booelan should return false' );   				
	ok( Simples.isArray(['simples']), 'passing in an array should return true' );   	
});