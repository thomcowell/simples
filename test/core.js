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

test("setContext", 3, function() {                                                                           
	var object = {hammer:true};
	var context = Simples.setContext( object, function(){ return this; });   
	equal( typeof context, 'function', 'should be an object');
	equal( context( 'hammer' ).toString(), '[object Object]', 'should be an object');
	same( context( 'hammer' ), object, 'should return object' );
});

test('getElements with only selector', 9, function(){ 
	var id = getElements( '#test-area' );
	same( id.length, 1, "should return an aray with 1 element");
	same( id[0].tagName, 'DIV', "should return a div");
	same( id[0].id, 'test-area', "should return an element with the same id"); 
	
	var className = getElements( '.row' );
	same( className.length, 8, "should return an aray with 8 elements");
	same( className[0].tagName, 'DIV', "should return a div");
	same( className[0].className, 'row', "should return an element with the same className");
	
	var tag = getElements( 'h2' );
	same( tag.length, 2, "should return an aray with 8 elements");
	same( tag[0].tagName, 'H2', "should return a div");
	same( tag[0].className, '', "should return an element with no className");		
});  

test('getElements with context', 9, function(){
	var body = document.getElementsByTagName('body')[0];
	
	var id = getElements( '#test-area', body );
	same( id.length, 1, "should return an aray with 1 element");
	same( id[0].tagName, 'DIV', "should return a div");
	same( id[0].id, 'test-area', "should return an element with the same id"); 
	
	var className = getElements( '.row', document.getElementById('row-wrapper') );
	same( className.length, 8, "should return an aray with 8 elements");
	same( className[0].tagName, 'DIV', "should return a div");
	same( className[0].className, 'row', "should return an element with the same className");
	
	var tag = getElements( 'h2', body );
	same( tag.length, 2, "should return an aray with 8 elements");
	same( tag[0].tagName, 'H2', "should return a div");
	same( tag[0].className, '', "should return an element with no className");		
});

test('create selector', 12, function(){
	
	var div1 = select.call( {},'<div/>');   
	same( div1.context, document, "should have a context of document");
	same( div1.selector, '<div/>', "<div/> -- should have a selector of <div/>");	
	same( div1.elems.length, 1, "should create 1 elements as a div" );
	same( div1.elems[0].tagName, 'DIV', "should have created the element as a div");

	var div2 = select.call( {}, '<div/>.row');
	same( div2.context, document, "should have a context of document");	
	same( div2.selector, '<div/>', "<div/>.row -- should have a selector of <div/>");	
	same( div2.elems.length, 1, "should create 1 elements as a div" );
	same( div2.elems[0].tagName, 'DIV', "should have created the element as a div"); 
	
	var div3 = select.call( {}, '<div></div>');
	same( div3.context, document, "should have a context of document");	
	same( div2.selector, '<div/>', "<div></div> -- should have a selector of <div/>");	
	same( div3.elems.length, 1, "should create 1 elements as a div" );
	same( div3.elems[0].tagName, 'DIV', "should have created the element as a div");

});

test('simple selector', 14, function(){
	var rows = select.call( {}, '.row');
	same( rows.context, document, "should have a context of document");	
	same( rows.selector, '.row', ".row -- should have a selector of .row");
	same( rows.elems.length, 8, ".row -- should find 8 elements with the class rows" );
	same( rows.elems[0].tagName, 'DIV', ".row -- should have a tagName of div");
	
	var id = select.call( {}, '#test-area'); 
	same( id.context, document, "should have a context of document");
	same( id.selector, '#test-area', "#test-area -- should have a selector of #test-area");	
	same( id.elems.length, 1, "#test-area -- should find 1 element with the id test-area" );
	
	var body = select.call( {}, 'body');
	same( body.context, document, "should have a context of document");	
	same( body.selector, 'body', "body -- should have a selector of body");	
	same( body.elems.length, 1, "body -- should find 1 element with the tagName of body");
	same( body.elems[0].tagName, 'BODY', "body -- should have a tagName of body");

	var none = select.call( {}, 'hammer');
	same( none.context, document, "should have a context of document");	
	same( none.selector, 'hammer', "hammer -- should have a selector of hammer");		
	same( none.elems.length, 0, "hammer -- should have returned no elements");
	
	// var input = select.call( {}, 'name=hammer');
	// same( input.length, 1, "name=hammer -- should find 1 element with the tagName of body");
	// same( input[0].tagName, 'INPUT', "name=hammer -- should have a tagName of body");  	
});

test('chained selector', 19, function(){
	var rows1 = select.call( {}, '#row-wrapper .row');
	same( rows1.context, document, "should have a context of document");	
	same( rows1.selector, '#row-wrapper .row', "#row-wrapper .row -- should have a selector of #row-wrapper .row");	
	same( rows1.elems.length, 8, "#row-wrapper .row -- should find 8 elements with the class row" );
	same( rows1.elems[0].tagName, 'DIV', "#row-wrapper .row -- should have a tagName of div");

	var rows2 = select.call( {}, '.row .cell');
	same( rows2.context, document, "should have a context of document");	
	same( rows2.selector, '.row .cell', ".row .cell -- should have a selector of .row .cell");	
	same( rows2.elems.length, 36, ".row .cell -- should find 36 elements with the class cell" );
	same( rows2.elems[0].tagName, 'DIV', ".row .cell -- should have a tagName of div");

	var id = select.call( {}, 'body #test-area');
	same( id.context, document, "should have a context of document");	
	same( id.selector, '#test-area', "body #test-area -- should have a selector of #test-area");	
	same( id.elems.length, 1, "body #test-area -- should find 1 element with the id test-area" );
	
	var body1 = select.call( {}, 'body .row');
	same( body1.context, document, "should have a context of document");	
	same( body1.selector, 'body .row', "body .row -- should have a selector of body .row");	
	same( body1.elems.length, 8, "body .row -- should find 8 elements with the className of row");
	same( body1.elems[0].tagName, 'DIV', "body .row -- should have a tagName of body");
	
	var body2 = select.call( {}, 'body h2');
	same( body2.context, document, "should have a context of document");	
	same( body2.selector, 'body h2', "body h2 -- should have a selector of body h2");	
	same( body2.elems.length, 2, "body h2 -- should find 2 elements with the tagName of h2");
	same( body2.elems[0].tagName, 'H2', "body h2 -- should have a tagName of h2");	
	
	// var rows = select.call( {}, '#row-wrapper name=row');
	// same( rows.length, 2, "#row-wrapper name=row -- should find 2 elements with the class cell" );
	// same( rows[0].tagName, 'INPUT', "#row-wrapper name=row -- should have a tagName of input");	
});

test('badly constructed selector', 19, function(){
	var rows1 = select.call( {}, '#row-wrapper.row');
	same( rows1.selector, '#row-wrapper', "#row-wrapper.row -- should have a selector of #row-wrapper");	
	same( rows1.elems.length, 1, "#row-wrapper.row -- should find 1 element with the id of row-wrapper" );
	same( rows1.elems[0].tagName, 'DIV', "#row-wrapper.row -- should have a tagName of div");

	var rows2 = select.call( {}, '.row.cell');    
	same( rows2.selector, '.row', ".row.cell -- should have a selector of .row");	
	same( rows2.elems.length, 8, ".row.cell -- should find 8 elements with the class rows" );
	same( rows2.elems[0].tagName, 'DIV', ".row.cell -- should have a tagName of div");

	var rows3 = select.call( {}, '.row.cell.row#test-area');
	same( rows3.elems.length, 8, ".row.cell.row#test-area -- should find 8 elements with the className of row" );
	same( rows3.selector, '.row', ".row.cell.row#test-area -- should have a selector of .row.cell.row#test-area");
	same( rows3.elems[0].className, 'row', ".row.cell.row#test-area -- should have an className of .row.cell.row#test-area");            
	same( rows3.elems[0].tagName, 'DIV', ".row.cell.row#test-area -- should have a tagName of div");
		
	var body1 = select.call( {}, 'body.row');
	same( body1.selector, 'body', "body.row -- should have a selector of body");	
	same( body1.elems.length, 1, "body.row -- should find 8 elements with the className of row");
	same( body1.elems[0].tagName, 'BODY', "body.row -- should have a tagName of body");

	var body2 = select.call( {}, 'body#test-area');   
	same( body2.selector, 'body', "body#test-area -- should have a selector of body");
	same( body2.elems.length, 1, "body#test-area -- should find 1 elements with the tagName of body");
	same( body2.elems[0].tagName, 'BODY', "body#test-area -- should have a tagName of body");
		
	var body3 = select.call( {}, '.row#cell-test');
	same( body3.selector, '.row', ".row#cell-test -- should have a selector of .row");	
	same( body3.elems.length, 8, ".row#cell-test -- should find 8 elements with the className of row");
	same( body3.elems[0].tagName, 'DIV', "body#test-area -- should have a tagName of body");
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
		_start : function(){ this.start = new Date(); },
		_stop : function(){ this.start = false; },
		_reset : function(){ this.reset = new Date(); }
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