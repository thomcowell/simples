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
	equal( div[0].id, 'hampster-city', "should set the attr id as hampster-city");
	
	var time = new Date().getTime();
	div.attr("date", time );
	equal( div[0].getAttribute('date'), time, "should have set the attr date");
	
	div.attr('date', null );
	ok( !div[0].date, "should remote the date attribute" )
}); 

test("attr(String)",function(){
	// This one sometimes fails randomly ?!
	equals( Simples('#text1').attr('value'), "Test", 'Check for value attribute' );

	equals( Simples('#text1').attr('value', "Test2").attr('defaultValue'), "Test", 'Check for defaultValue attribute' );
	equals( Simples('#text1').attr('type'), "text", 'Check for type attribute' );
	equals( Simples('#radio1').attr('type'), "radio", 'Check for type attribute' );
	equals( Simples('#check1').attr('type'), "checkbox", 'Check for type attribute' );
	equals( Simples('#simon1').attr('rel'), "bookmark", 'Check for rel attribute' );
	equals( Simples('#google').attr('title'), "Google!", 'Check for title attribute' );
	equals( Simples('#mark').attr('hreflang'), "en", 'Check for hreflang attribute' );
	equals( Simples('#en').attr('lang'), "en", 'Check for lang attribute' );
	equals( Simples('#simon').attr('class'), "blog link", 'Check for class attribute' );
	equals( Simples('#name').attr('name'), "name", 'Check for name attribute' );
	equals( Simples('#text1').attr('name'), "action", 'Check for name attribute' );

	ok( Simples('#form').attr('action').indexOf("formaction") >= 0, 'Check for action attribute' );
	// Temporarily disabled. See: #4299
	// ok( Simples('#form').attr('action','newformaction').attr('action').indexOf("newformaction") >= 0, 'Check that action attribute was changed' );
	equals( Simples('#text1').attr('maxlength'), '30', 'Check for maxlength attribute' );
	equals( Simples('#text1').attr('maxLength'), '30', 'Check for maxLength attribute' );
	equals( Simples('#area1').attr('maxLength'), '30', 'Check for maxLength attribute' );
	equals( Simples('#select2').attr('selectedIndex'), 3, 'Check for selectedIndex attribute' );
	equals( Simples('#foo').attr('nodeName').toUpperCase(), 'DIV', 'Check for nodeName attribute' );
	equals( Simples('#foo').attr('tagName').toUpperCase(), 'DIV', 'Check for tagName attribute' );	

	Simples('#main').html( 'bottom', "<a href='#5' id='tAnchor5'></a>" );
	equals( Simples('#tAnchor5').attr('href'), "#5", 'Check for non-absolute href (an anchor)' );

	equals( Simples("<option/>").attr("selected"), false, "Check selected attribute on disconnected element." );
})

test("html",function(){
	ok( false, "tests not written" );
});

test("clone",function(){
	ok( false, "tests not written" );
});

test("wrap",function(){
	ok( false, "tests not written" );
});

test("unwrap",function(){
	ok( false, "tests not written" );
});

test("empty", 3, function(){
	
	equals( Simples("#ap").empty().html().length, 0, "Check text is removed" );
	equals( Simples("#ap").length, 4, "Check elements are not removed" );

	// using contents will get comments regular, text, and comment nodes
	var j = Simples("#nonnodes").traverse('childNodes');
	j.empty();
	equals( j.html(), "", "Check node,textnode,comment empty works" );	
});

test("remove",function(){
	ok( false, "tests not written" );
});  

test("fetch",function(){
	ok( false, "tests not written" );
});

test("eq",function(){
	ok( false, "tests not written" );
});
// prepend append => 'string' and nodes check order                                	