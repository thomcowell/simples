module("Messaging");
// sense check to ensure no browser incorrectly returns bad values
test("correct api defined", function(){
	var apis = ["listenFor","send","silence","count","isListening"];
	expect( apis.length );
	for(var i=0,l=apis.length;i<l;i++){
		equal( typeof Simples.message[apis[i]], "function", "should have api - Simples.message."+apis[i] );
	}
});

test("listeners bound", 7, function(){

	ok( !Simples.message.listenFor(), "should return false if no type and callback is specified" );
	ok( !Simples.message.listenFor("hammer"), "should return false if no callback is specified" );
	ok( !Simples.message.listenFor(undefined,function(){ok(false,"nope shouldn't fire")}), "should return false if no callback is specified" );

	var guid = Simples.message.listenFor("data-drum",function( data ){
		ok( true, "should have bound listener");
	});
	equal( guid, "simples-guid-" + ( Simples.guid - 1 ), "should have guid returned" );
	equal( Simples.message.count("data-drum"), 1, "Should have 1 bound callback" );
	ok( Simples.message.isListening("data-drum", guid), "Should have 1 bound callback" );

	var testFunction = function( data ){
		ok( true, "should have bound listener");
	};
	testFunction.guid = "my-special-guid-12932"
	var guid2 = Simples.message.listenFor("data-drum", testFunction );

	equal( guid2, "my-special-guid-12932", "should not alter existing guid" );
});

test("single listeners bound", 1, function(){

});

test("stopListening for listeners ", 1, function(){

});

test("stopListening for single listeners ", 1, function(){

});

test("send for listeners ", 1, function(){

});

test("send for single listeners ", 1, function(){

});

test("send for single listeners and listeners", 1, function(){

});