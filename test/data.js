module("Data");
test("noData", 6, function() {
	var div = document.createElement('div');
	var embed = document.createElement('embed');
	var object = document.createElement('object');
	var applet = document.createElement('applet');
	
	ok( canDoData(div), "a div should return true");          
	ok( canDoData( document ), "a document should return true");	    
	ok( !canDoData( window ), "a window should return false");   
	ok( !canDoData( embed ), "a embed should return false");
	ok( !canDoData( object ), "a object should return false");
	ok( !canDoData( applet ), "a applet should return false");	
});

module("Data: Simples.data( add )");
var data = {ham:'sandwich',"super":true};
test("Simples.data to element with no accessId", 3, function() { 
	ok( /simples\d+/.test(accessID), "accessID is as expected" )
	var div = document.createElement('div');
	Simples.data( div, 'test', data);

	notEqual( div[ accessID ], null, "a div should have the attribute of "+accessID+" set"); 	
	same( div[ accessID ][ 'test' ], data, "div should return the same data as provided");   
});

test("Simples.data to element with random data", 9, function() { 
	function testDataValue( elem, key, value ){
		Simples.data( div, key, null );
		Simples.data( div, key, value );
		same( div[ accessID ][ key ], value, "div should return the same data as provided - "+ value);   
	}
	var div = document.createElement('div');

	testDataValue( div, 'test', 0 );
	testDataValue( div, 'test', 1 );
	testDataValue( div, 'test', false );
	testDataValue( div, 'test', true ); 
	testDataValue( div, 'test', "string" );
	testDataValue( div, 'test', {obj:1} );
	testDataValue( div, 'test', [1,2,3,4] );
	testDataValue( div, 'test', function(){ return "test"; } );
	testDataValue( div, 'test', /\w+\s+/ );	
});

test("Simples.data to element with existing accessId", 1, function() { 
	var div = document.createElement('div');
	div[ accessID ] = {};
	Simples.data( div, 'test', data);

	same( div[ accessID ][ 'test' ], data, "div should return the same data as provided");   
});

test("Simples.data to element with existing data different key", 2, function() { 
	var string = 'ready steady go';
	var div = document.createElement('div');
	div[ accessID ] = {hammer: string};
	Simples.data( div, 'test', data);

	same( div[ accessID ][ 'test' ], data, "div should return the same data as provided");   
	same( div[ accessID ][ 'hammer' ], string, "div should return the same data as provided");   
});

test("Simples.data to element with existing data same key", 1, function() { 
	var string = 'ready steady go';
	var div = document.createElement('div');
	div[ accessID ] = {hammer: string};
	Simples.data( div, 'hammer', data);

	same( div[ accessID ][ 'hammer' ], data, "div should return the same data as provided");   
});

test("Simples.data on invalid element", 1, function() { 
	var object = document.createElement('object');
	Simples.data( object, 'test', data);

	equal( object[ accessID ], undefined, "a div should have the attribute of "+accessID+" set"); 	
});

module("Data: Simples.data( read )");
test("Simples.data on element without data attribute", 2, function() {
	var div = document.createElement('div');
	same( Simples.data( div ), {}, "a div should return undefined as provided");
	same( div[ accessID ], {}, "a div should return undefined as provided");
});

test("Simples.data on element without data attribute", 2, function() {
	var div = document.createElement('div');
	same( Simples.data( div, 'test'), undefined, "a div should return undefined as provided");
	same( div[ accessID ], {}, "a div should return undefined as provided");
});

test("Simples.data on invalid element", 1, function() {
	var object = document.createElement('object');
	same( Simples.data( object, 'test'), null, "a div should return undefined as provided");
});

test("Simples.data on element with data as requested", 2, function() {
	var r_div = document.createElement('div');
	r_div[ accessID ] = { test: data };
	
	same( Simples.data( r_div, 'test'), data, "a div should return the same as provided");
	same( Simples.data( r_div, 'note'), undefined, "a div should return undefined as provided");
}); 

module("Data: Simples.data( remove )");
test("Simples.data on invalid element", 1, function() {
	var object = document.createElement('object');
	var noError = true;
	try{
		Simples.data( object, 'test', null);
	}catch(e){ noError = false; }
	ok( noError, "should not throw an error");
});

test("Simples.data on element with data as requested", 1, function() {
	var r_div = document.createElement('div');
	r_div[ accessID ] = {test:data};
	
	Simples.data( r_div, 'test', null);	
	same( r_div[ accessID ].test, undefined, "a div should have data removed");
});

module("Data: cleanData");
test("cleanData on invalid element", 1, function() {
	var noError = true;
	try{
		Simples.cleanData( document.createElement('object') );
	}catch(e){ noError = false; }
	ok( noError, "should not throw an error");
});
                
test("cleanData on valid element without data", 1, function() {
	var noError = true;
	try{
		Simples.cleanData( document.createElement('div') );
	}catch(e){ noError = false; }
	ok( noError, "should not throw an error");
});

test("cleanData on element with data as requested", 1, function() {
	var r_div = document.createElement('div');
	r_div[ accessID ] = { test:data };
	
	Simples.cleanData( r_div );	
	equal( r_div[ accessID ], undefined, "a div should have data removed");
});

module("Data: Simples instance", {
	setup: function(){
		window.old_addData = Simples.data;
		window.old_removeData = Simples.data;
		window.old_readData = Simples.data;
		
	},
	teardown : function(){
		Simples.data = window.old_addData;
		Simples.data = window.old_readData;
		Simples.data = window.old_removeData;
	}
});

test("on an empty simples object", 4,function(){
	var s_obj = new Simples(); 
	same(s_obj.data, Simples.prototype.data, "should have the function prototyped onto Simples");  
	
	equal(s_obj.data('hammer'), null, "should return null when reading data"); 
	same(s_obj.data('hammer', null), s_obj, "should return self and shouldn't throw an exception");    
	same(s_obj.data('hammer', 'thor\'s'), s_obj, "should return self and shouldn't throw an exception");    
});
 
test("on an simples object with a single element",function(){
	var div = document.createElement('div');
	var s_obj = new Simples( div ); 
	same(s_obj.data, Simples.prototype.data, "should have the function prototyped onto Simples");  
	
	equal(s_obj.data('hammer'), null, "should return null when reading data");                              
	
	same(s_obj.data('hammer', null), s_obj, "should return self and shouldn't throw an exception");
	
	Simples.data( div, 'hammer', 'thor\'s' );
	same(s_obj.data('hammer', null), s_obj, "should not return anything and shouldn't throw an exception"); 
	equal( Simples.data(div, 'hammer'), null, "should call the Simples.data function");
	  
	same(s_obj.data('hammer', 'thor\'s'), s_obj, "should return self and shouldn't throw an exception");	
	s_obj.data('hammer', 'thor\'s');
	same('thor\'s', Simples.data( div, 'hammer'), "set the data on the element");
	same('thor\'s', s_obj.data('hammer'), "return the data from the element");	
	
});

test("on an simples object with multiple elements",function(){
	var s_obj = new Simples('.row'); 
	same(s_obj.data, Simples.prototype.data, "should have the function prototyped onto Simples");  
	
	equal(s_obj.data('hammer'), null, "should return null when reading data");
	same(s_obj.data('hammer', null), s_obj, "should return self and shouldn't throw an exception");
	
	s_obj.each(function(){
		Simples.data( this, 'hammer', 'thor\'s' );
		if( !Simples.data( this, 'hammer' ) ){
			ok(false, "Test not correctly setup");
		}
	});
	
	same(s_obj.data('hammer', null), s_obj, "should not return anything and shouldn't throw an exception");
	
	s_obj.each(function(){
		equal( Simples.data(this, 'hammer'), null, "should call the Simples.data function");
	});
	  
	same(s_obj.data('hammer', 'thor\'s'), s_obj, "should return self and shouldn't throw an exception");
	
	s_obj.data('hammer', 'thor\'s');
	s_obj.each(function(){ 
		same('thor\'s', Simples.data( this, 'hammer'), "set the same data on all the elements");
	});
	
	s_obj.data('hammer', null);
	Simples.data( s_obj[0], 'hammer', 'head');
	same('head', s_obj.data('hammer'), "should only return data from the first element");	
	
});

