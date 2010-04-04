module("Core")

test("isArray", 8, function() {
	same( Simples.isArray(), false, 'empty arguments should return false' );  
	same( Simples.isArray({simples:true}), false, 'passing in an object should return false' );   
	same( Simples.isArray( null ), false, 'passing in null should return false' );   
	same( Simples.isArray( 1 ), false, 'passing in a number should return false' );   		
	same( Simples.isArray( 'string' ), false, 'passing in a string should return false' );   			
	same( Simples.isArray( true ), false, 'passing in a booelan should return false' );   
	same( Simples.isArray( function(){} ), false, 'passing in a function should return false' );   				
	ok( Simples.isArray(['simples']), 'passing in an array should return true' );   	
}); 

test("isObject", 8, function() {
	same( Simples.isObject(), false, 'empty arguments should return false' );  
	same( Simples.isObject(['simples']), false, 'passing in an array should return false' );   
	same( Simples.isObject( null ), false, 'passing in null should return false' );   
	same( Simples.isObject( 1 ), false, 'passing in a number should return false' );   		
	same( Simples.isObject( 'string' ), false, 'passing in a string should return false' );   			
	same( Simples.isObject( true ), false, 'passing in a booelan should return false' );   				
	same( Simples.isObject( function(){} ), false, 'passing in a function should return false' );   					
	ok( Simples.isObject({simples:true}), 'passing in an object should return true' );   	
});

test("isFunction", 8, function() {
	same( Simples.isFunction(), false, 'empty arguments should return false' );  
	same( Simples.isFunction(['simples']), false, 'passing in an array should return false' );   
	same( Simples.isFunction( null ), false, 'passing in null should return false' );   
	same( Simples.isFunction( 1 ), false, 'passing in a number should return false' );   		
	same( Simples.isFunction( 'string' ), false, 'passing in a string should return false' );   			
	same( Simples.isFunction( true ), false, 'passing in a booelan should return false' );   				
	same( Simples.isFunction({simples:true}), false, 'passing in an object should return true' );   	
	ok( Simples.isFunction( function(){} ), 'passing in a function should return false' );   					
});