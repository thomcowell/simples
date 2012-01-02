module("Core");
// sense check to ensure no browser incorrectly returns bad values
test("Class representations", 8, function(){
	ok( Simples.isConstructor({0:'red',1:'green'}, "Object" ), "Should be [object Object]" );
	ok( Simples.isConstructor([1,2], "Array" ), "Should be [object Array]" );
	ok( Simples.isConstructor("ham", "String" ), "Should be [object String]" );
	ok( Simples.isConstructor(12, "Number" ), "Should be [object Number]" );
	ok( Simples.isConstructor(function(){ return false; }, "Function" ), "Should be [object Function]" ); 
	ok( Simples.isConstructor(false, "Boolean" ), "Should be [object Boolean]" );
	ok( Simples.isConstructor(true, "Boolean" ), "Should be [object Boolean]" );
	if( document.getElementsByClassName ){
		var isNLorHC = Simples.getConstructor( document.getElementsByClassName('row') );
		ok( isNLorHC === "NodeList" || isNLorHC === "HTMLCollection", "Should be [object NodeList] or [object HTMLCollection]" );
	} else {
		ok( Simples.isConstructor(document.getElementsByTagName('div'), "Object" ), "Should be [object Object]" );
	}
});

test("Class String representations", 9, function(){
	equal( Simples.getConstructor(undefined), false, "undefined Should be false" );
	equal( Simples.getConstructor(null), false, "null Should be false" );
	equal( Simples.getConstructor({0:'red',1:'green'}), "Object", "Should be [object Object]" );
	equal( Simples.getConstructor([1,2]), "Array", "Should be [object Array]" );
	equal( Simples.getConstructor("ham"), "String", "Should be [object String]" );
	equal( Simples.getConstructor(12), "Number", "Should be [object Number]" );
	equal( Simples.getConstructor(function(){ return false; }), "Function", "Should be [object Function]" ); 
	equal( Simples.getConstructor(false), "Boolean","Should be [object Boolean]" );
	equal( Simples.getConstructor(true), "Boolean", "Should be [object Boolean]" );
});

// sense check to ensure no browser incorrectly returns bad values
test("isArray", 8, function() {
	ok( !Simples.isConstructor( undefined, "Array" ), "empty arguments should return false" );
	ok( !Simples.isConstructor({simples:true}, "Array"), 'passing in an object should return false' );
	ok( !Simples.isConstructor( null, "Array" ), 'passing in null should return false' );
	ok( !Simples.isConstructor( 1, "Array" ), 'passing in a number should return false' );
	ok( !Simples.isConstructor( 'string', "Array" ), 'passing in a string should return false' );
	ok( !Simples.isConstructor( true, "Array" ), 'passing in a booelan should return false' );
	ok( !Simples.isConstructor( function(){}, "Array" ), 'passing in a function should return false' );
	ok( Simples.isConstructor( ['simples'], "Array" ), 'passing in an array should return true' );
}); 
// sense check to ensure no browser incorrectly returns bad values
test("isObject", 8, function() {
	ok( !Simples.isConstructor( undefined, "Object" ), 'empty arguments should return false' );
	ok( !Simples.isConstructor(['simples'], "Object"), 'passing in an array should return false' );
	ok( !Simples.isConstructor( null, "Object" ), 'passing in null should return false' );
	ok( !Simples.isConstructor( 1, "Object" ), 'passing in a number should return false' );
	ok( !Simples.isConstructor( 'string', "Object" ), 'passing in a string should return false' );
	ok( !Simples.isConstructor( true, "Object" ), 'passing in a booelan should return false' );
	ok( !Simples.isConstructor( function(){}, "Object" ), 'passing in a function should return false' );
	ok( Simples.isConstructor({simples:true}, "Object"), 'passing in an object should return true' );
});
// sense check to ensure no browser incorrectly returns bad values
test("isFunction", 8, function() {
	ok( !Simples.isConstructor( undefined, "Function" ), 'empty arguments should return false' );
	ok( !Simples.isConstructor(['simples'], "Function"), 'passing in an array should return false' );
	ok( !Simples.isConstructor( null, "Function" ), 'passing in null should return false' );
	ok( !Simples.isConstructor( 1, "Function" ), 'passing in a number should return false' );
	ok( !Simples.isConstructor( 'string', "Function" ), 'passing in a string should return false' );
	ok( !Simples.isConstructor( true, "Function" ), 'passing in a booelan should return false' );
	ok( !Simples.isConstructor({simples:true}, "Function"), 'passing in an object should return true' );
	ok( Simples.isConstructor( function(){}, "Function" ), 'passing in a function should return false' );
});

test("Simples#makeArray", 3, function(){
	same( Simples.makeArray({a:1,b:2,3:"nope"}), [], "should produce an array from an object");
	var elems = Simples("#qunit-header, #qunit-banner, #qunit-userAgent");
	same( Simples.makeArray(elems), [elems[0],elems[1],elems[2]], "should produce an array from an object");
	elems = document.getElementsByTagName("input"),
	out = [];
	for(var i=0,l=43;i<l;i++){
		out.push(elems[i]);
	}
	same( Simples.makeArray(elems), out, "should produce an array from an object");
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
	var result = Simples.merge.call( {}, array );
	same( result.length, array.length, "Should have the same length as the array");
	
	for(var i=0,l=3;i<l;i++){
		same( result[i], array[i], "obj should have the same response as array["+i+"] => "+array[i]);
	}
	
	var insert = {bool:true,func:function(){},str:'string',num:1};
	result = Simples.merge.call( {}, insert );
	for(var key in insert){
		same( result[key], insert[key], "obj should have the same response as insert."+key+" => "+insert[ key ]);
	}
});

test('merge works as expected with 2 argument', 8, function(){
	var array = ['red','blue','green'];
	var result = Simples.merge( {}, array );
	same( result.length, array.length, "Should have the same length as the array");
	
	for(var i=0,l=3;i<l;i++){
		same( result[i], array[i], "obj should have the same response as array["+i+"] => "+array[i]);
	}
	
	var insert = {bool:true,func:function(){},str:'string',num:1};
	result = Simples.merge({},insert);
	for(var key in insert){
		same( result[key], insert[key], "obj should have the same response as insert."+key+" => "+insert[ key ]);
	}
});

test('merge works as expected with 3 argument', 8, function(){
	var array = ['red','blue','green'],
		insert = { bool:true, func:function(){}, str:'string', num:1 };
		
	var result = Simples.merge( {}, array, insert );

	same( result.length, array.length, "Should have the same length as the array");

	for(var i=0,l=3;i<l;i++){
		same( result[i], array[i], "obj should have the same response as array["+i+"] => "+array[i]);
	}

	for(var key in insert){
		same( result[key], insert[key], "obj should have the same response as insert."+key+" => "+insert[ key ]);
	}
});

test('extend works as expected with 1 arguments', 4, function(){
	
	var funcs = { 
		__start__ : function(){ this.start = new Date(); },
		__stop__ : function(){ this.start = false; },
		__reset__ : function(){ this.reset = new Date(); }
	};
	
	var length = 0;
	for(var name in funcs ){
		if( !Simples.fn[ name ] ){
			length++;
		}
	}
	
	same( length, 3, "Should not have funcs in prototype chain");
	
	Simples.extend( funcs );
	
	for( var key in funcs ){
		same( funcs[ key ], Simples.fn[key], "Should have the same functions Simples.fn."+key+" => "+funcs[ key ]);
	}

});

module("Core: instantiating an instance of Simples where select isn't called", { 
	setup : function(){
		window.old_select = Simples.Selector;
		window.Simples.Selector = function(){ throw new Error("shouldn't call select in selector.js"); };              
	},
	teardown : function(){
		Simples.Selector = window.old_select;
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
	var rows = typeof document.getElementsByClassName === "function" ? document.getElementsByClassName('row') : document.getElementsByTagName("div");
	var s_obj = Simples( rows );
	same( s_obj.selector, '', "node list of .row -- should have empty selector");	              
	same( s_obj.context, undefined, "node list of .row -- should have empty context");
	same( s_obj.length, rows.length, "node list of .row -- should have the same length as the supplied nodeList" );
	var out = [];
	for(var i=0,l=s_obj.length;i<l;i++){
		out.push( s_obj[i] );
	}
	same( out, Simples.makeArray( rows, [] ), "node list of .row -- should have the same as nodeList elems");
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
	var results = Simples.Selector('#row-wrapper', null, { push:[].push, selector : "#row-wrapper" });
	var s_obj = Simples('#row-wrapper');
	ok( s_obj instanceof Simples, "should return an instance of Simples" );  		
 
	equal( s_obj[0], results[0], "should return with an Element, when supplied" );  
	equal( s_obj.context, results.context, "should set the context to the element" );
	equal( s_obj.selector, results.selector, "should set the selector to an empty string because no string selector supplied" );	                             
});

test('Simples.each',function(){
	var s_obj = Simples('.row'), counter = 0, length = s_obj.length;
    s_obj.each(function(item,index,array){
		equal( s_obj[counter], item, "should be the same dom elem as position on instance" );
		equal( index, counter, "counter should be the same position as passed through");
		equal( array, s_obj, "should have the same obj passed through")
		counter++;
	});
}); 

test('Simples.add', 8, function(){
	s_obj = Simples('<div/>');
	s_obj.add( '<p/>' );
	same( s_obj.length, 2, "should have 2 elements");
	same( s_obj[1].tagName, 'P', "should have p element as last");
	
	s_obj.add( document.createElement('span') );
	same( s_obj.length, 3, "should have 3 elements");
	same( s_obj[2].tagName, 'SPAN', "should have p element as last");
	
	s_obj.add( Simples('<a/>') );
	same( s_obj.length, 4, "should have 4 elements");
	same( s_obj[3].tagName, 'A', "should have p element as last");
	                                                              
	s_obj.add( [ document.createElement('strong') ] );
	same( s_obj.length, 5, "should have 5 elements");
	same( s_obj[4].tagName, 'STRONG', "should have p element as last");
});
                          
test('Simples.find',function(){
	var oldSelector = Simples.Selector,
		parent = Simples('#row-wrapper');

	Simples.Selector = function(){
		ok( true, "This function was called.");
		var args = slice.call( arguments, 0 );
		same( args[0], '.row', "Should have a selector of .row");		
		same( args[1], parent[0], "should have the context of parent selected element");
		ok( args[2] instanceof Simples, "Should pass in instance of Simples as 3rd argument.")
	}
	
	rows = parent.find('.row');
	Simples.Selector = oldSelector;
});

test('Simples.filter', 215, function(){ 

	var s_obj = Simples('div'), 
		counter=0, 
		length = s_obj.length, 
		set = Simples('.row');
	
	s_obj.filter(function(item,index,object){
		equal( item, s_obj[ counter + s_obj.length - length ], "should have the same item" );
		same( counter, index, "should have the same counter");
		equal( s_obj, object, "should be the same object" );
		counter++;
		return Simples.className( item, "row" );
	});

	ok( s_obj instanceof Simples, "should return an instance of Simples"); 
	equal( s_obj.length, set.length, "should return the same length" ); 
	for(var i=0,l=set.length;i<l;i++){
		same( s_obj[i], set[i], "should return an instance of Simples");	
	}
	same( s_obj.selector, 'div', "node list of .row -- should have empty selector");	              
	same( s_obj.context, document, "node list of .row -- should have empty context");
	equal( s_obj.length, 8, "should return an instance of Simples");
	
	s_obj = Simples('div');
	s_obj.filter(function(item,index,object){  
		if(index===0){ 
			return undefined; 
		} else if( index===(object.length-1) ){
			return null;
		} else if( index%5 === 0) {
			return this;
		} else if(index%4 === 0 ){
			return [];
		} else if( index%3 === 0 ){
			return new Simples();
		}
		return {};
	});
	equal( s_obj.length, 0, "should return an instance of Simples");   
});
