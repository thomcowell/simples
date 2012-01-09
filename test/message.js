module("Messaging");
// sense check to ensure no browser incorrectly returns bad values
test("correct api defined", function(){
	var apis = ["listenFor","send","silence","count","isListening"];
	expect( apis.length );

	for(var i=0,l=apis.length;i<l;i++){
		equal( typeof Simples.message[apis[i]], "function", "should have api - Simples.message."+apis[i] );
	}
});

test("listeners bound", 10, function(){
	// Test that listenFor responds correctly to bad passed in values
	strictEqual( false, Simples.message.listenFor(), "should return false if no type and callback is specified" );
	strictEqual( false, Simples.message.listenFor("hammer"), "should return false if no callback is specified" );
	strictEqual( false, Simples.message.listenFor("hammer","time"), "should return false if no callback is specified" );
	strictEqual( false, Simples.message.listenFor(undefined,function(){ok(false,"nope shouldn't fire"); }), "should return false if no callback is specified" );

	// Test that listenFor queues up callback correctly
	var guid = Simples.message.listenFor("data-drum",function( data ){
		ok( true, "should have bound listener");
	});
	equal( guid, "simples-guid-" + ( Simples.guid - 1 ), "should have guid returned" );
	equal( Simples.message.count("data-drum"), 1, "Should have 1 bound callback" );
	ok( Simples.message.isListening("data-drum", guid), "Should have 1 bound callback" );

	// // Test callback with guid is handled correctly
	function testFunction( data ){
		ok( true, "should have bound listener");
	}
	testFunction.guid = "my-special-guid-12932";
	var guid2 = Simples.message.listenFor("data-drum", testFunction );

	equal( guid2, "my-special-guid-12932", "should not alter existing guid" );
	equal( Simples.message.count("data-drum"), 2, "Should have 1 bound callback" );
 	ok( Simples.message.isListening("data-drum", testFunction), "Should have 1 bound callback" );
});

test("single listeners bound", 6, function(){
	// Test that listenFor queues up callback correctly
	var guid = Simples.message.listenFor("data-drum-singles",function( data ){
		ok( true, "should have bound listener");
	}, true);
	equal( guid, "simples-guid-" + ( Simples.guid - 1 ), "should have guid returned" );
	equal( Simples.message.count("data-drum-singles"), 1, "Should have 1 bound callback" );
	ok( Simples.message.isListening("data-drum-singles", guid), "Should have 1 bound callback" );

	// Test callback with guid is handled correctly
	function testFunction( data ){
		ok( true, "should have bound listener");
	}
	testFunction.guid = "my-special-guid-12932";
	var guid2 = Simples.message.listenFor("data-drum-singles", testFunction, true );

	equal( guid2, "my-special-guid-12932", "should not alter existing guid" );
	equal( Simples.message.count("data-drum-singles"), 2, "Should have 2 bound callback" );
	ok( Simples.message.isListening("data-drum-singles", testFunction ), "Should have 1 bound callback" );
});

test("stopListening for listeners ", 6, function(){
	// Test that listenFor queues up callback correctly
	var guid = Simples.message.listenFor("data-test",function( data ){
		ok( true, "should have bound listener");
	});
	equal( Simples.message.count("data-test"), 1, "Should have 1 bound callback" );
	ok( Simples.message.isListening("data-test", guid), "Should have 1 bound callback" );

	Simples.message.silence("data-test", guid);
	equal( Simples.message.count("data-test"), 0, "Should have 1 bound callback" );

	// Test callback with guid is handled correctly
	function testFunction( data ){
		ok( true, "should have bound listener");
	}

	Simples.message.listenFor("data-test", testFunction );
	equal( Simples.message.count("data-test"), 1, "Should have 1 bound callback" );
	ok( Simples.message.isListening("data-test", testFunction ), "Should have 1 bound callback" );

	Simples.message.silence("data-test", testFunction );
	equal( Simples.message.count("data-test"), 0, "Should have 1 bound callback" );
});

test("stopListening for single listeners ", 6, function(){
	// Test that listenFor queues up callback correctly (single)
	var guid = Simples.message.listenFor("data-test",function( data ){
		ok( true, "should have bound listener");
	}, true);
	equal( Simples.message.count("data-test"), 1, "Should have 1 bound callback" );
	ok( Simples.message.isListening("data-test", guid), "Should have 1 bound callback" );

	Simples.message.silence("data-test", guid);
	equal( Simples.message.count("data-test"), 0, "Should have 1 bound callback" );	

	// Test callback with guid is handled correctly
	function testFunction( data ){
		ok( true, "should have bound listener");
	}

	Simples.message.listenFor("data-test", testFunction, true );
	equal( Simples.message.count("data-test"), 1, "Should have 1 bound callback" );
	ok( Simples.message.isListening("data-test", testFunction ), "Should have 1 bound callback" );

	Simples.message.silence("data-test", testFunction );
	equal( Simples.message.count("data-test"), 0, "Should have 1 bound callback" );
});

test("send for listeners ", 6, function(){
	var testData = {super:5,hammer:true};
	var guid = Simples.message.listenFor("test-send",function( data ){
		ok( true, "should have bound listener");
		deepEqual( testData, data, "data should be the same");
	});

	equal( Simples.message.count("test-send"), 1, "Should have 1 bound callback" );
	Simples.message.send( "test-send", testData );
	Simples.message.send( "test-send", testData );

	Simples.message.silence("test-send", guid);

	equal( Simples.message.count("test-send"), 0, "Should have 1 bound callback" );

	Simples.message.send( "test-send", testData );
});

test("send for single listeners ", 6, function(){
	stop();

	var testData = {super:5,hammer:true};
	var guid = Simples.message.listenFor("test-send-single",function( data ){
		ok( true, "should have bound listener");
		deepEqual( testData, data, "data should be the same");
	}, true);

	equal( Simples.message.count("test-send-single"), 1, "Should have 1 bound callback" );

	Simples.message.send( "test-send-single", testData );
	equal( Simples.message.count("test-send-single"), 0, "Should have 1 bound callback" );
	Simples.message.send( "test-send-single", testData );

	Simples.message.listenFor("test-send-single",function( data ){
		ok( true, "should have bound listener");
		deepEqual( testData, data, "data should be the same");
		start();
	}, true);

	Simples.message.send( "test-send-single", testData );
});

test("send for single listeners and listeners", 11, function(){

	var testData = {super:5,hammer:true};
	var guid = Simples.message.listenFor("test-send-2",function( data ){
		ok( true, "should have bound listener");
		deepEqual( testData, data, "data should be the same");
	}, true);

	var guid2 = Simples.message.listenFor("test-send-2",function( data ){
		ok( true, "should have bound listener");
		deepEqual( testData, data, "data should be the same");
	});	

	equal( Simples.message.count("test-send-2"), 2, "Should have 2 bound callback" );
	Simples.message.send( "test-send-2", testData );

	equal( Simples.message.count("test-send-2"), 1, "Should have 1 bound callback" );
	Simples.message.send( "test-send-2", testData );
	Simples.message.send( "test-send-2", testData );

	Simples.message.silence( "test-send-2", guid );
	Simples.message.silence( "test-send-2", guid2 );
	equal( Simples.message.count("test-send-2"), 0, "Should have 0 bound callback" );

	Simples.message.send( "test-send-2", testData );
});