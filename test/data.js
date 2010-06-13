module("Data");
test("noData", 4, function() {
	var div = document.createElement('div');
	var embed = document.createElement('embed');
	var object = document.createElement('object');
	var applet = document.createElement('applet');
	
	ok( notNoData(div), "a div should return undefined");
	equal( notNoData( embed ), false, "a embed should return true");
	equal( notNoData( object ), false, "a object should return true");
	equal( notNoData( applet ), false, "a applet should return true");	
});

module("Data: addData");
var data = {ham:'sandwich',"super":true};
test("addData to element with no accessId", 2, function() { 
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
		removeData( object, 'test')
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
		cleanData( object )
	}catch(e){ noError = false; }
	ok( noError, "should not throw an error");
});
                
test("cleanData on valid element without data", 1, function() {
	var div = document.createElement('div');
	var noError = true;
	try{
		cleanData( div )
	}catch(e){ noError = false; }
	ok( noError, "should not throw an error");
});

test("cleanData on element with data as requested", 1, function() {
	var r_div = document.createElement('div');
	r_div[ accessID ] = {test:data};
	
	cleanData( r_div );	
	equal( r_div[ accessID ], undefined, "a div should have data removed");
});

module("Data: simples");
var s_obj = new Simples()
test("on an empty simples object",function(){
	ok(false, "test not written");
});
 
test("on an simples object add data",function(){
	ok(false, "test not written");
});

test("on an simples object read data",function(){
	ok(false, "test not written");
});                              

test("on an simples object remove data",function(){
	ok(false, "test not written");
});

