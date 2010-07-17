module("DOM");
test("hasClass", 6, function() {
	
	var div = Simples('<div>').html('<div></div><div></div><div></div><div></div><div></div>');
	function testHasClass( startClass, className, detected ){
		div[0].className = startClass;
		ok( div.hasClass( className ) === detected, "should " + ( detected ? "" : "not " ) + "have className "+ className );
	}
	
	testHasClass( "test", "test", true );
	testHasClass( "testHammer", "test", false );
	testHasClass( "AttestHammer", "test", false );
	testHasClass( "Attest", "test", false );
	testHasClass( "ham\ttest\nhammer", "test", true );
	testHasClass( "ham hammer\ttest", "test", true );	
});
           
test("addClass", 3, function() {
	var div = Simples('<div>');
	
	function testAddClass( startClass, className, endClass ){
		div[0].className = startClass;
		div.addClass( className );
		console.log( div );
		equal( div[0].className, endClass, "should have className "+ className );
	}

	testAddClass( "", "hammer", "hammer" );
	testAddClass( "hammer\nred\tdog good help", "hammer", "hammer\nred\tdog good help" );
	testAddClass( "red\tdog good help", "hammer", "red dog good help hammer" );
});

test("removeClass", 5, function() {
	
	var div = Simples('<div>'); 
	function testRemoveClass( startClass, className, endClass ){
		div[0].className = startClass;
		div.removeClass( className );
		equal( div[0].className, endClass, "should not have className "+ className );
	}
	
	testRemoveClass( "hammer", "hammer", "" );
	testRemoveClass( "hammer\nred\tdog good help", "hammer", "red dog good help" );
	testRemoveClass( "red\tdog goodhammer\nhelp", "hammer", "red dog goodhammer help" );	
	testRemoveClass( "red\tdog good hammer\nhelp", "hammer", "red dog good help" );
	testRemoveClass( "red\tdog good\nhelp hammer", "hammer", "red dog good help" );	
});

test("attr", 4, function() {
	var div = Simples('<div/>');
	div[0].id = "testArea";
	equal( div.attr("id"), "testArea", "should read the attr id as testArea");
	div.attr("id", 'hampster-city');
	equal( div[0].id, 'hampster-city', "should set the attr id as hampser-city");
	var time = new Date().getTime();
	div.attr("date", new Date().getTime() );
	equal( div.attr('date'), time, "should set the attr id as hampser-city");
	div.attr('date', null );
	ok( !div[0].date, "should remote the date attribute" )
});                                	