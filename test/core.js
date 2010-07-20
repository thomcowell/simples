module("Core");

function isClass( obj, ClassName ){
	return toString.call( obj ) === ClassName;
}

// sense check to ensure no browser incorrectly returns bad values
test("Class String representations", 8, function(){
	ok( isClass({0:'red',1:'green'}, ObjectClass ), "Should be "+ObjectClass );
	ok( isClass([1,2], ArrayClass ), "Should be "+ArrayClass );
	ok( isClass("ham", StringClass ), "Should be "+StringClass );
	ok( isClass(12, NumberClass ), "Should be "+NumberClass );
	ok( isClass(function(){ return false; }, FunctionClass ), "Should be "+FunctionClass ); 
	ok( isClass(false, BooleanClass ), "Should be "+BooleanClass );
	ok( isClass(true, BooleanClass ), "Should be "+BooleanClass );
	
	var isNLorHC = toString.call( document.getElementsByClassName('row') );
	ok( isNLorHC === NodeListClass || isNLorHC === HTMLCollectionClass, "Should be "+NodeListClass+' or '+HTMLCollectionClass );
});
// sense check to ensure no browser incorrectly returns bad values
test("isArray", 8, function() {
	ok( !isClass( undefined, ArrayClass ), "Should not be "+ArrayClass );
	ok( !isClass({simples:true}, ArrayClass), 'passing in an object should return false' );
	ok( !isClass( null, ArrayClass ), 'passing in null should return false' );
	ok( !isClass( 1, ArrayClass ), 'passing in a number should return false' );
	ok( !isClass( 'string', ArrayClass ), 'passing in a string should return false' );
	ok( !isClass( true, ArrayClass ), 'passing in a booelan should return false' );
	ok( !isClass( function(){}, ArrayClass ), 'passing in a function should return false' );
	ok( isClass( ['simples'], ArrayClass ), 'passing in an array should return true' );
}); 
// sense check to ensure no browser incorrectly returns bad values
test("isObject", 8, function() {
	ok( !isClass( undefined, ObjectClass ), 'empty arguments should return false' );
	ok( !isClass(['simples'], ObjectClass), 'passing in an array should return false' );
	ok( !isClass( null, ObjectClass ), 'passing in null should return false' );
	ok( !isClass( 1, ObjectClass ), 'passing in a number should return false' );
	ok( !isClass( 'string', ObjectClass ), 'passing in a string should return false' );
	ok( !isClass( true, ObjectClass ), 'passing in a booelan should return false' );
	ok( !isClass( function(){}, ObjectClass ), 'passing in a function should return false' );
	ok( isClass({simples:true}, ObjectClass), 'passing in an object should return true' );
});
// sense check to ensure no browser incorrectly returns bad values
test("isFunction", 8, function() {
	ok( !isClass( undefined, FunctionClass ), 'empty arguments should return false' );
	ok( !isClass(['simples'], FunctionClass), 'passing in an array should return false' );
	ok( !isClass( null, FunctionClass ), 'passing in null should return false' );
	ok( !isClass( 1, FunctionClass ), 'passing in a number should return false' );
	ok( !isClass( 'string', FunctionClass ), 'passing in a string should return false' );
	ok( !isClass( true, FunctionClass ), 'passing in a booelan should return false' );
	ok( !isClass({simples:true}, FunctionClass), 'passing in an object should return true' );
	ok( isClass( function(){}, FunctionClass ), 'passing in a function should return false' );
});

test("noop is a empty function", 1, function() {
	strictEqual( Simples.noop(), undefined, 'noop should return undefined' );
});

test("setContext", 4, function() {                                                                           
	var object = {hammer:true};
	var context = Simples.setContext( object, function(){ return this; });   
	same( typeof context, 'function', 'should be an object');
	same( toString.call( context() ), '[object Object]', 'should be an object');
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

module("Core: instantiating an instance of Simples where select isn't called", { 
	setup : function(){
		window.old_select = SimplesSelector;
		window.SimplesSelector = function(){ throw new Error("shouldn't call select in selector.js"); };              
	},
	teardown : function(){
		SimplesSelector = window.old_select;
	}
});

test('Simples constructor when instantiated with no selector', 8, function(){   
	var s_obj = Simples(undefined);
	ok( s_obj instanceof Simples, "should return an instance of Simples" ); 	
	equal( s_obj.version, '@VERSION', "should have a version id on instance");
	
	strictEqual( Simples("")[0], undefined, "should return empty if empty string" );	   	
	strictEqual( Simples(null)[0], undefined, "should return empty if null supplied" );	   	 
	strictEqual( s_obj[0], undefined, "should return empty if undefined or nothing is supplied" );
	strictEqual( s_obj.context, undefined, "should return undefined context" );
	equal( s_obj.length, 0, "should return 0 length" );
	equal( s_obj.selector, "", "should return undefined selector" );		                                                                 
});

test("Simples constructor when instantiated with a dom node", 5, function(){		
	var div = document.createElement('div');  
	var s_obj = Simples( div );                                        
	ok( s_obj instanceof Simples, "should return an instance of Simples" ); 

	equal( s_obj[0], div, "should return with an Element, when supplied" );  
	equal( s_obj.context, div, "should set the context to the element" );
	equal( s_obj.selector, "", "should set the selector to an empty string because no string selector supplied" );	
	equal( s_obj.length, 1, "should set the selector to an empty string because no string selector supplied" );		
});

test("Simples constructor when instantiated with the selector as 'body'", 5, function(){ 

	ok( Simples( 'body' ) instanceof Simples, "should return an instance of Simples" );  	

	equal( Simples( 'body' )[0], document.body, "should return with an Element, when supplied" );  
	equal( Simples( 'body' ).context, document, "should set the context to the element" );
	equal( Simples( 'body' ).selector, "body", "should set the selector to an empty string because no string selector supplied" );
	equal( Simples( 'body' ).length, 1, "should set the selector to an empty string because no string selector supplied" );
});

test('Simples constructor when instantiated with NodeList passed as selector', 4, function(){ 
	var rows = document.getElementsByClassName('row');
	var s_obj = Simples( rows );
	same( s_obj.selector, '', "node list of .row -- should have empty selector");	              
	same( s_obj.context, undefined, "node list of .row -- should have empty context");
	same( s_obj.length, rows.length, "node list of .row -- should have the same length as the supplied nodeList" );
	same( slice.call( s_obj, 0), slice.call( rows ), "node list of .row -- should have the same as nodeList elems");
});

test('Simples constructor when instantiated with Array passed as selector', 4, function(){
	function create( tag, opts ){
		var elem = document.createElement( tag );
		if( elem && opts ){
			for( var key in opts ){       
				if( opts[ key ] && elem[ key ] ){ elem[ key ] = opts[ key ]; }
			}
		}
		return elem;
	}
	
	var elem1 = create('div'), elem2 = create('input',{name:'hammer'});
	var array = [ "string", elem1, true, elem2, false, {}, 98];
	var s_obj = Simples( array ); 
	
	same( s_obj.selector, '', "node list of .row -- should have empty selector");	              
	same( s_obj.context, undefined, "node list of .row -- should have empty context");
	same( s_obj.length, 2, "node list of .row -- should have the same length as the supplied nodeList" );
	same( slice.call( s_obj ), [elem1, elem2], "node list of .row -- should have the same as nodeList elems");
});

test("Simples constructor when instantiated with a Simples Object", 3, function(){
	var results = Simples( document.getElementById('row-wrapper' ) );
	results.__hammer__ = true;
	var s_obj = Simples( results );
	ok( s_obj instanceof Simples, "should return an instance of Simples" );  		
    ok( results.__hammer__, "should be the same object");
	same( s_obj[0], results[0], "should return with an Element, when supplied" );  
});
    
test("Simples constructor when instantiated with Window", 5, function(){
	var s_obj = Simples( window );
	ok( s_obj instanceof Simples, "should return an instance of Simples" );  		

	same( s_obj[0], window, "should return with Window, when supplied" );
	equal( s_obj.context, window, "should set the context to the Window" );
	equal( s_obj.selector, "", "should set the selector to an empty string because no string selector supplied" );	
	equal( s_obj.length, 1, "should set the length to 1" );  
});

module("Core: instantiating an instance of Simples"); 

test("Simples constructor when instantiated with a call through to selector", 4, function(){
	var results = SimplesSelector('#row-wrapper');
	var s_obj = Simples('#row-wrapper');
	ok( s_obj instanceof Simples, "should return an instance of Simples" );  		
 
	equal( s_obj[0], results.elems[0], "should return with an Element, when supplied" );  
	equal( s_obj.context, results.context, "should set the context to the element" );
	equal( s_obj.selector, results.selector, "should set the selector to an empty string because no string selector supplied" );	                             
});

test('Simples.each',function(){
	var s_obj = Simples('.row'), counter = 0, length = s_obj.length;
    s_obj.each(function(i,l){
		same( this, s_obj[i], "should be the same dom elem as position on instance" );
	  	equal(i, counter, "counter should be the same position as passed through");
		if(l!==length){
			ok(false, "length should be the same as instance length" );
		}
		counter++;
	});
});

test('Simples.filter', 6, function(){
	var s_obj = Simples('div'), counter=0, length = s_obj.length;
	var results = s_obj.filter(function(i,l){ 
		if( i !== counter ){
			ok( false, "i doesn't equal counter ");
		} 
		if(l!==length){
			ok(false, "length should be the same as instance length" );
		}  
		counter++;     
		return this.className === "row";
	});

	ok( results instanceof Simples, "should return an instance of Simples");
	notDeepEqual( results, s_obj, "should return an instance of Simples");	
	same( results.selector, '', "node list of .row -- should have empty selector");	              
	same( results.context, document, "node list of .row -- should have empty context");
	equal( results.length, 8, "should return an instance of Simples");
	
	var badResponses = s_obj.filter(function(i,l){  
		if(i===0){ 
			return undefined; 
		} else if( i===(length-1) ){
			return null;
		} else if( i%5 === 0) {
			return this;
		} else if(i%4 === 0 ){
			return [];
		} else if( i%3 === 0 ){
			return new Simples();
		}
		return {};
	});
	equal( badResponses.length, 0, "should return an instance of Simples");   
});
