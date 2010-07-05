module("Data");
test("noData", 6, function() {
	var div = document.createElement('div');
	var embed = document.createElement('embed');
	var object = document.createElement('object');
	var applet = document.createElement('applet');
	
	ok( notNoData(div), "a div should return true");          
	ok( notNoData( document ), "a document should return true");	    
	ok( !notNoData( window ), "a window should return false");   
	ok( !notNoData( embed ), "a embed should return false");
	ok( !notNoData( object ), "a object should return false");
	ok( !notNoData( applet ), "a applet should return false");	
});

module("Data: addData");
var data = {ham:'sandwich',"super":true};
test("addData to element with no accessId", 3, function() { 
	ok( /simplesData\d+/.test(accessID), "accessID is as expected" )
	var div = document.createElement('div');
	addData( div, 'test', data);

	notEqual( div[ accessID ], null, "a div should have the attribute of "+accessID+" set"); 	
	same( div[ accessID ][ 'test' ], data, "div should return the same data as provided");   
});

test("addData to element with existing accessId", 1, function() { 
	var div = document.createElement('div');
	div[ accessID ] = {};
	addData( div, 'test', data);

	same( div[ accessID ][ 'test' ], data, "div should return the same data as provided");   
});

test("addData to element with existing accessId", 2, function() { 
	var string = 'ready steady go';
	var div = document.createElement('div');
	div[ accessID ] = {hammer: string};
	addData( div, 'test', data);

	same( div[ accessID ][ 'test' ], data, "div should return the same data as provided");   
	same( div[ accessID ][ 'hammer' ], string, "div should return the same data as provided");   
});

test("addData to element with existing accessId", 1, function() { 
	var string = 'ready steady go';
	var div = document.createElement('div');
	div[ accessID ] = {hammer: string};
	addData( div, 'hammer', data);

	same( div[ accessID ][ 'hammer' ], data, "div should return the same data as provided");   
});

test("addData to element with existing accessId", 1, function() { 
	var div = document.createElement('div');
	div[ accessID ] = {};
	addData( div, 'test', data);

	same( div[ accessID ][ 'test' ], data, "div should return the same data as provided");   
});

test("addData on invalid element", 1, function() { 
	var object = document.createElement('object');
	addData( object, 'test', data);

	equal( object[ accessID ], undefined, "a div should have the attribute of "+accessID+" set"); 	
});

module("Data: readData");
test("readData on element without data attribute", 1, function() {
	var div = document.createElement('div');
	same( readData( div, 'test'), null, "a div should return undefined as provided");
});

test("readData on invalid element", 1, function() {
	var object = document.createElement('object');
	same( readData( object, 'test'), null, "a div should return undefined as provided");
});

test("readData on element with data as requested", 2, function() {
	var r_div = document.createElement('div');
	r_div[ accessID ] = {test:data};
	
	same( readData( r_div, 'test'), data, "a div should return the same as provided");
	same( readData( r_div, 'note'), undefined, "a div should return undefined as provided");
}); 

module("Data: removeData");
test("removeData on invalid element", 1, function() {
	var object = document.createElement('object');
	var noError = true;
	try{
		removeData( object, 'test');
	}catch(e){ noError = false; }
	ok( noError, "should not throw an error");
});

test("removeData on element with data as requested", 1, function() {
	var r_div = document.createElement('div');
	r_div[ accessID ] = {test:data};
	
	removeData( r_div, 'test');	
	same( r_div[ accessID ].test, undefined, "a div should have data removed");
});

module("Data: cleanData");
test("cleanData on invalid element", 1, function() {
	var object = document.createElement('object');
	var noError = true;
	try{
		cleanData( object );
	}catch(e){ noError = false; }
	ok( noError, "should not throw an error");
});
                
test("cleanData on valid element without data", 1, function() {
	var div = document.createElement('div');
	var noError = true;
	try{
		cleanData( div );
	}catch(e){ noError = false; }
	ok( noError, "should not throw an error");
});

test("cleanData on element with data as requested", 1, function() {
	var r_div = document.createElement('div');
	r_div[ accessID ] = {test:data};
	
	cleanData( r_div );	
	equal( r_div[ accessID ], undefined, "a div should have data removed");
});

function spyFn(){
	window.__spy__ = arguments;
}
module("Data: Simples instance", {
	setup: function(){
		window.old_addData = addData;
		window.old_removeData = removeData;
		window.old_readData = readData;
		
	},
	teardown : function(){
		addData = window.old_addData;
		readData = window.old_readData;
		removeData = window.old_removeData;
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
	
	addData( div, 'hammer', 'thor\'s' );
	same(s_obj.data('hammer', null), s_obj, "should not return anything and shouldn't throw an exception"); 
	equal( readData(div, 'hammer'), null, "should call the removeData function");
	  
	same(s_obj.data('hammer', 'thor\'s'), s_obj, "should return self and shouldn't throw an exception");	
	s_obj.data('hammer', 'thor\'s');
	same('thor\'s', readData( div, 'hammer'), "set the data on the element");
	same('thor\'s', s_obj.data('hammer'), "return the data from the element");	
	
});

test("on an simples object with multiple elements",function(){
	var s_obj = new Simples('.row'); 
	same(s_obj.data, Simples.prototype.data, "should have the function prototyped onto Simples");  
	
	equal(s_obj.data('hammer'), null, "should return null when reading data");
	same(s_obj.data('hammer', null), s_obj, "should return self and shouldn't throw an exception");
	
	s_obj.each(function(){
		addData( this, 'hammer', 'thor\'s' );
		if( !readData( this, 'hammer' ) ){
			ok(false, "Test not correctly setup");
		}
	});
	
	same(s_obj.data('hammer', null), s_obj, "should not return anything and shouldn't throw an exception");
	
	s_obj.each(function(){
		equal( readData(this, 'hammer'), null, "should call the removeData function");
	});
	  
	same(s_obj.data('hammer', 'thor\'s'), s_obj, "should return self and shouldn't throw an exception");
	
	s_obj.data('hammer', 'thor\'s');
	s_obj.each(function(){ 
		same('thor\'s', readData( this, 'hammer'), "set the same data on all the elements");
	});
	
	s_obj.data('hammer', null);
	addData( s_obj[0], 'hammer', 'head');
	same('head', s_obj.data('hammer'), "should only return data from the first element");	
	
});

