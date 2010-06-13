module("Core");

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

test("noop is a empty function", 1, function() {
	same( Simples.noop(), undefined, 'noop should return undefined' );
});

test("setContext", 4, function() {                                                                           
	var object = {hammer:true};
	var context = Simples.setContext( object, function(){ return this; });   
	equal( typeof context, 'function', 'should be an object');
	equal( context().toString(), '[object Object]', 'should be an object');
	same( context(), object, 'should return object' );
	ok( context().hammer, 'should return object' );
});

test('merge works as expected with 1 argument', 8, function(){
	var array = ['red','blue','green'];
	var result = merge( array );
	same( result.length, array.length, "Should have the same length as the array");
	
	for(var i=0,l=3;i<l;i++){
		same( result[i], array[i], "obj should have the same response as array["+i+"] => "+array[i]);
	}
	
	var insert = {bool:true,func:function(){},str:'string',num:1};
	result = merge( insert );
	for(var key in insert){
		same( result[key], insert[key], "obj should have the same response as insert."+key+" => "+insert[ key ]);
	}
});

test('merge works as expected with 2 argument', 8, function(){
	var array = ['red','blue','green'];
	var result = merge( {}, array );
	same( result.length, array.length, "Should have the same length as the array");
	
	for(var i=0,l=3;i<l;i++){
		same( result[i], array[i], "obj should have the same response as array["+i+"] => "+array[i]);
	}
	
	var insert = {bool:true,func:function(){},str:'string',num:1};
	result = merge({},insert);
	for(var key in insert){
		same( result[key], insert[key], "obj should have the same response as insert."+key+" => "+insert[ key ]);
	}
});

test('merge works as expected with 3 argument', 8, function(){
	var array = ['red','blue','green'],
		insert = { bool:true, func:function(){}, str:'string', num:1 };
		
	var result = merge( {}, array, insert );

	same( result.length, array.length, "Should have the same length as the array");

	for(var i=0,l=3;i<l;i++){
		same( result[i], array[i], "obj should have the same response as array["+i+"] => "+array[i]);
	}

	for(var key in insert){
		same( result[key], insert[key], "obj should have the same response as insert."+key+" => "+insert[ key ]);
	}
});

test('extend works as expected with 1 arguments', 10, function(){
	function Class(){ this.start = false; return this; }
	
	var length = 0;
	for(var func in Class.prototype ){
		length++;
	}
	
	same( length, 0, "Should have an empty prototype chain");
	
	var funcs = { 
		__start__ : function(){ this.start = new Date(); },
		__stop__ : function(){ this.start = false; },
		__reset__ : function(){ this.reset = new Date(); }
	};
    // to ensure that the window doesn't have the properties in funcs 
	for( var f in funcs ){
		same( window[ f ], undefined, "Should not have the same functions window."+f+" => undefined");
	}

	extend.call( window, funcs );
    // now test that the window doesn't have the properties in funcs	
	for( var e in funcs ){
		same( window[ e ], undefined, "Should not have the same functions window."+e+" => undefined");
	}
	
	extend.call( Class, funcs );
	
	for( var key in Class.prototype ){
		same( funcs[ key ], Class.prototype[key], "Should have the same functions Class.prototype."+key+" => "+funcs[ key ]);
	}

});
   
test('extend works as expected with 2 arguments', 4, function(){
	function Class(){ this.start = false; return this; }
	
	var length = 0;
	for(var func in Class.prototype ){
		length++;
	}
	
	same( length, 0, "Should have an empty prototype chain");
	
	var funcs = { 
		start : function(){ this.start = new Date(); },
		stop : function(){ this.start = false; },
		reset : function(){ this.reset = new Date(); }
	};

	extend( Class, funcs);

	for( var key in Class.prototype ){
		same( funcs[ key ], Class.prototype[key], "Should have the same functions Class.prototype."+key+" => "+funcs[ key ]);
	}
}); 

test('extend works as expected with 3 arguments', 7, function(){
	function SubClass(){ return this; }
	function Class(){ this.start = false; return this; }
	
	var length = 0;
	for(var func in Class.prototype ){ length++; }
	for(var sfunc in SubClass.prototype ){ length++; }
	same( length, 0, "Should have an empty prototype chain");
	
	var funcs = { 
		start : function(){ this.start = new Date(); },
		stop : function(){ this.start = false; },
		reset : function(){ this.reset = new Date(); }
	};

	Class.prototype = funcs;
	
	var extra = { 
		reset: function(){
			this.start = null;
		},
		more : function(){
			return 'I want more!!!';
		}
	};

	extend( SubClass, Class, extra );
	var result = merge( {}, funcs, extra );

	same( funcs, Class.prototype, "Should have the same functions Class.prototype.");
	same( SubClass.prototype.superclass, Class.prototype, "SubClass should have Class as the superClass" );

	for(var key in result ){
		if( key !== 'constructor' ){
			same( result[ key ], SubClass.prototype[ key ], "should have the same functions -> "+ key );
		}
	}
});

test('extend works as expected with 3 arguments and null addMethods', 6, function(){

	function SubClass(){ return this; }
	function Class(){ this.start = false; return this; }
	
	var length = 0;
	for(var func in Class.prototype ){ length++; }
	for(var sfunc in SubClass.prototype ){ length++; }
	
	same( length, 0, "Should have an empty prototype chain");
	
	var funcs = { 
		start : function(){ this.start = new Date(); },
		stop : function(){ this.start = false; },
		reset : function(){ this.reset = new Date(); }
	};

	Class.prototype = funcs;

	extend( SubClass, Class, null );

	same( funcs, Class.prototype, "Should have the same functions Class.prototype.");
	same( SubClass.prototype.superclass, Class.prototype, "SubClass should have Class as the superClass" );

	for(var key in funcs ){
		if( key !== 'constructor' ){
			same( funcs[ key ], SubClass.prototype[ key ], "should have the same functions -> "+ key );
		}
	}
});