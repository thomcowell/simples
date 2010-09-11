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

test("removeClass", 6, function() {
	
	var div = Simples('<div>'); 
	function testRemoveClass( startClass, className, endClass ){
		endClass = endClass === undefined ? startClass : endClass;
		div[0].className = startClass;
		div.removeClass( className );
		equal( div[0].className, endClass, "should not have className "+ className );
	}
	
	testRemoveClass( "hammer", "hammer", "" );
	testRemoveClass( "hammer\nred\tdog good help", "hammer", "red dog good help" );
	testRemoveClass( "red\tdog goodhammer\nhelp", "hammer" );
	testRemoveClass( "red\tdog hammergood help", "hammer" );		
	testRemoveClass( "red\tdog good hammer\nhelp", "hammer", "red dog good help" );
	testRemoveClass( "red\tdog good\nhelp hammer", "hammer", "red dog good help" );	
});

// basic sanity check of the function
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
	equal( div[0].getAttribute('date'), null, "should remove the date attribute" )
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
});

test("attr(Hash)", 1, function() {
	var pass = true;
	Simples("div").attr({foo: 'baz', zoo: 'ping'}).each(function(){
		if ( this.getAttribute('foo') != "baz" || this.getAttribute('zoo') != "ping" ) pass = false;
	});
	ok( pass, "Set Multiple Attributes" );
});

test("attr('tabindex')", function() {
	expect(8);

	// elements not natively tabbable
	equals(Simples('#listWithTabIndex').attr('tabindex'), 5, 'not natively tabbable, with tabindex set to 0');
	equals(Simples('#divWithNoTabIndex').attr('tabindex'), undefined, 'not natively tabbable, no tabindex set');

	// anchor with href
	equals(Simples('#linkWithNoTabIndex').attr('tabindex'), null, 'anchor with href, no tabindex set');
	equals(Simples('#linkWithTabIndex').attr('tabindex'), 2, 'anchor with href, tabindex set to 2');
	equals(Simples('#linkWithNegativeTabIndex').attr('tabindex'), -1, 'anchor with href, tabindex set to -1');

	// anchor without href
	equals(Simples('#linkWithNoHrefWithNoTabIndex').attr('tabindex'), undefined, 'anchor without href, no tabindex set');
	equals(Simples('#linkWithNoHrefWithTabIndex').attr('tabindex'), 1, 'anchor without href, tabindex set to 2');
	equals(Simples('#linkWithNoHrefWithNegativeTabIndex').attr('tabindex'), -1, 'anchor without href, no tabindex set');
});

test("attr('tabindex', value)", function() {
	expect(9);

	var element = Simples('#divWithNoTabIndex');
	equals(element.attr('tabindex'), undefined, 'start with no tabindex');

	// set a positive string
	element.attr('tabindex', '1');
	equals(element.attr('tabindex'), 1, 'set tabindex to 1 (string)');

	// set a zero string
	element.attr('tabindex', '0');
	equals(element.attr('tabindex'), 0, 'set tabindex to 0 (string)');

	// set a negative string
	element.attr('tabindex', '-1');
	equals(element.attr('tabindex'), -1, 'set tabindex to -1 (string)');

	// set a positive number
	element.attr('tabindex', 1);
	equals(element.attr('tabindex'), 1, 'set tabindex to 1 (number)');

	// set a zero number
	element.attr('tabindex', 0);
	equals(element.attr('tabindex'), 0, 'set tabindex to 0 (number)');

	// set a negative number
	element.attr('tabindex', -1);
	equals(element.attr('tabindex'), -1, 'set tabindex to -1 (number)');

	element = Simples('#linkWithTabIndex');
	equals(element.attr('tabindex'), 2, 'start with tabindex 2');

	element.attr('tabindex', -1);
	equals(element.attr('tabindex'), -1, 'set negative tabindex');
});

test("html('inner')", 8, function(){
    
	var div = Simples('<div/>');	
	function testInner( location, html, endHTML ){
		location = location || html;
		div[0].innerHTML = "";
		if( html ){	
			div.html( location, html );
		} else {
			div.html( location );
		}
		equal( div[0].innerHTML, endHTML, "location:"+location +" and html:"+html );
	}
	
	testInner( "<p>No Location</p>", undefined, "<p>No Location</p>");
	testInner( "inner", "<p>Location is 'inner'</p>", "<p>Location is 'inner'</p>");

	var p = document.createElement('p');
	p.innerText = "DOM Element";
		
	testInner( p, undefined, "<p>DOM Element</p>");
	testInner( "inner", p, "<p>DOM Element</p>");
    
    testInner( "inner", 1, "1"); 
	testInner( "inner", true, "true");
	
	var innerHTML = '<p class="test-war-hammer">This should be here</p><span class="test-war-hammer">Super Duper 1</span><span class="test-war-hammer">Super Duper 2</span>'
	Simples('#test-area').html( innerHTML );
	testInner( "inner", Simples('.test-war-hammer'), innerHTML );
	
	Simples('#test-area').html( innerHTML );
	testInner( Simples('.test-war-hammer'), undefined, innerHTML );	
	
});

test("html('text')", 4, function(){
    var p = Simples('<p/>');	
	function testText( text, endText ){
		if( text === null ){
			p[0].innerText = endText;
			equal( p.html("text"), endText, "location:text no html provided" );			
		} else {
			endText = endText || text;	
			p[0].innerText = "";
			p.html( "text", text );
			equal( p[0].innerText, endText, "location:text and html:"+text );			
		}
	}

	testText( "This is a test" ); 
	testText( true, "true" ); 
	testText( {}, "[object Object]" );
	testText( null, "This is a test" );
	
});

test("html('outer')", 4, function(){
	var div = Simples('<div/>'), parent;
	equal( div.html("outer"), "<div></div>", "Should return the html for the selected element" );
	
	function testOuter( html, endHTML ){     
		endHTML = endHTML || html;
		parent = Simples('#test-area').html('<p id="war-hammer">This should not be here</p>');
		div = Simples('#war-hammer');
		div.html("outer", html )
		equal( parent.html(), endHTML, "should have "+ endHTML );
	}

	var p = document.createElement('p');
	p.innerText = "DOM Element";
		
	testOuter( "<span>Super Duper</span>" );
	
	testOuter( p, "<p>DOM Element</p>" ); 
	
	testOuter( Simples( Simples('<div/>').html("<span>Super Duper 1</span><span>Super Duper 2</span>")[0].childNodes ), "<span>Super Duper 1</span><span>Super Duper 2</span>" );
});

test("html('top')", 3, function(){  
	var contents = '<span>1</span><span>2</span><span>3</span><span>4</span>', div = Simples('<div/>');
	
	function testTop( html, endHTML ){
		endHTML = endHTML || html;
		div[0].innerHTML = contents;
		div.html( 'top', html );
		equal( div[0].innerHTML, endHTML+contents, "should insert at the top "+endHTML );
	}

	testTop( "<p>I am Top</p>" );
	
	var p = document.createElement('p');
	p.innerText = "DOM Element";	
	testTop( p, "<p>DOM Element</p>" );
	
	testTop( Simples( Simples('<div/>').html("<span>Super Duper 1</span><span>Super Duper 2</span>")[0].childNodes ), "<span>Super Duper 1</span><span>Super Duper 2</span>" );
});
             
test("html('bottom')", 3, function(){
	var contents = '<span>1</span><span>2</span><span>3</span><span>4</span>', div = Simples('<div/>');
	
	function testBottom( html, endHTML ){    
		endHTML = endHTML || html;
		div[0].innerHTML = contents;
		div.html( 'bottom', html );
		equal( div[0].innerHTML, contents+endHTML, "should insert at the bottom "+endHTML );
	}

	testBottom( "<p>I am Bottom</p>" ); 
	
	var p = document.createElement('p');
	p.innerText = "DOM Element";	
	testBottom( p, "<p>DOM Element</p>" );
	
	testBottom( Simples( Simples('<div/>').html("<span>Super Duper 1</span><span>Super Duper 2</span>")[0].childNodes ), "<span>Super Duper 1</span><span>Super Duper 2</span>" );
});

test("html('remove')",function(){
	var contents = '<span>1</span><span>2</span><span>3</span><span>4</span>', parent = Simples('#test-area');
	
	parent[0].innerHTML = contents;
	equal( parent.html(), contents, "ensure setup correct");
	span = Simples('span', parent );
	span.html( 'remove' );
	equal( parent[0].innerHTML, "", "should remove all children of parent" );
	
	parent[0].innerHTML = contents;
	equal( parent.html(), contents, "ensure setup correct");
	
	span = Simples('span', parent );
	span.slice( -1 ).html( 'remove' );
	equal( parent[0].innerHTML, '<span>1</span><span>2</span><span>3</span>', "should remove all children of parent" );
	
	span.slice( 1 ).html( 'remove' );
	equal( parent[0].innerHTML, '<span>1</span><span>3</span>', "should remove all children of parent" );
});
   
test("html('before')", 3, function(){
	var div, parent, content = '<p id="war-hammer">This should be here</p>';
	
	function testBefore( html, endHTML ){
		endHTML = endHTML || html;
		parent = Simples('#test-area').html( content );
		div = Simples('#war-hammer');
		div.html("before", html )
		equal( parent.html(), endHTML + content, "should insert before "+ endHTML );
	}

	var p = document.createElement('p');
	p.innerText = "DOM Element";
		
	testBefore( "<span>Super Duper</span>" );
	
	testBefore( p, "<p>DOM Element</p>" ); 
	
	testBefore( Simples( Simples('<div/>').html("<span>Super Duper 1</span><span>Super Duper 2</span>")[0].childNodes ), "<span>Super Duper 1</span><span>Super Duper 2</span>" );
});

test("html('after')", 3, function(){
	var div, parent, content = '<p id="war-hammer">This should be here</p>';
	
	function testAfter( html, endHTML ){     
		endHTML = endHTML || html;
		parent = Simples('#test-area').html( content );
		div = Simples('#war-hammer');
		div.html("after", html )
		equal( parent.html(), content + endHTML, "should insert after "+ endHTML );
	}

	var p = document.createElement('p');
	p.innerText = "DOM Element";
		
	testAfter( "<span>Super Duper</span>" );
	
	testAfter( p, "<p>DOM Element</p>" ); 
	
	testAfter( Simples( Simples('<div/>').html("<span>Super Duper 1</span><span>Super Duper 2</span>")[0].childNodes ), "<span>Super Duper 1</span><span>Super Duper 2</span>" );
});

test("html('empty')", 4, function(){
	
	ok( Simples("#ap").html().length > 0, "ensure test is valid" );
	Simples("#ap").html("empty")
	equals( Simples("#ap").html().length, 0, "Check text is removed" );
	equals( Simples("#ap").length, 1, "Check elements are not removed" );

	// using contents will get comments regular, text, and comment nodes
	var j = Simples("#nonnodes").traverse('childNodes');
	j.html("empty");
	equals( j.html(), "", "Check node,textnode,comment empty works" );	
});

test("html('wrap')", 3, function(){
	var div, parent = Simples('#test-area'), content = '<p id="war-hammer">This should be here</p>';
	
	function testWrap( html, endHTML ){     
		endHTML = endHTML || html;  
		var wrapper = endHTML.split('</');
		parent.html( content );
		div = Simples('#war-hammer');
		div.html("wrap", html )
		equal( parent.html(), wrapper.shift()+content+'</'+wrapper.join('</'), "should wrap after "+ endHTML );
	}

	var p = document.createElement('p');
	p.innerText = "DOM Element";
		
	testWrap( "<span>Super Duper</span>" );
	
	testWrap( p, "<p>DOM Element</p>" ); 
	
	testWrap( Simples( Simples('<div/>').html("<span>Super Duper 1</span><span>Super Duper 2</span>")[0].childNodes ), "<span>Super Duper 1</span><span>Super Duper 2</span>" );
});             

test("html('unwrap')", 2, function(){
	var content = '<div id="war-hammer"></div>', contents = '<span>1</span><span>2</span><span>3</span><span>4</span>';
	
	var parent = Simples('#test-area').html( content );
	var div = Simples('#war-hammer').html( contents );
	equal( parent.html(), content.replace('></', '>'+contents+'</'), "ensure test is correctly set up" );
	div.html( "unwrap" )
	equal( parent.html(), contents, "should remove div Element, but not children" );

});

test("traverse",function(){
	var div = Simples('#row-wrapper'); 
	
	function testTraverse( traverse, results, message ){
		for(var i=0,l=results.length;i<l;i++){
			equal( traverse[i], results[i], message );
		}
	}
	
	testTraverse( div.traverse('childNodes'), Simples( div[0].childNodes ), "fetch childNodes" );
	testTraverse( div.traverse('parentNode'), Simples( div[0].parentNode ), "fetch parentNode" );
	testTraverse( div.traverse(function(){
		var parent = this.parentNode;
		while( parent ){
			if( parent.nodeName.toLowerCase() === "body" ){
				break;
			}
			parent = parent.parentNode;
		}
		return parent
	}), Simples( document.body ), "fetch body" );
});

test("slice", 14, function(){             
	var contents = '<span id="one"></span><span id="two"></span><span id="three"></span><span id="four"></span>', div = Simples('<div/>');
	
	function testSlice( start, end ){
		count = end || 1;                                       
		var nodes = div.html( contents )[0].childNodes;
		var test = Simples( nodes ), testLength = test.length;
		var result = test.slice( start, end );           
		if( start < 0 ){
			count = Math.abs( start ); 
			start = nodes.length + start;
		}   
		equal( test.length, testLength, "should not affect original object");
		equal( result.length, count, "should have the same length" ); 
		for( var i=0;i<count;i++){
			same( result[i], nodes[ start+ i ], "should have the same elements");
		}
	}
	
	testSlice( 0 );
	testSlice( 1, 2 );
	testSlice( -1 );
	testSlice( -2 );
}); 
// prepend append => 'string' and nodes check order