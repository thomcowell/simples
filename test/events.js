module("Events");

test("bind() and unbind() setup data correctly", 4, function() {

	var callback = function(event) {
		ok(false, "this callback shouldn't be called");
	};
	
	Simples("#firstp").bind("click", callback);
    same( callback.guid, SimplesEvents.guid, "should have the guid set" );
	ok( typeof callback.handled === "function", 'should attach handler function to function' );
	same( readData(Simples("#firstp")[0], "events"), {click:[{handler: callback.handled, guid:callback.guid}]},"Event handler bound correctly." );
	
	Simples('#firstp').unbind( 'click' );
	same( readData( Simples("#firstp")[0], "events"), {}, "Event handler unbound when using data.");
});

test("check event bound bind() and unbind() and trigger() correctly", 3, function(){ 
	// test binding is working
	var counter = 0;
   	var first = function(event) {
		ok( counter === 0, "Event " + (counter === 0 ? "is correctly" : "should not be" ) +" bound. - First" ); 
	};
	
	Simples("#firstp").bind("click", first ); 
	
	Simples("#firstp").trigger( 'click' );

	Simples('#firstp').unbind( 'click', first );
	// should only have 
	counter = 1;
	var callback = function(event) {
		ok( counter === 1, counter === 1 ? "Event is correctly bound. - callback" : "Event should not be bound. - callback" );
	};
	
	Simples("#firstp").bind("click", callback );
	
	Simples("#firstp").trigger( 'click' );
	
	Simples('#firstp').unbind( 'click', callback ); 
	// should be no events bound	
	counter = 2;
	Simples("#firstp")[0].onclick = function(){
		ok( counter === 2, counter === 2 ? "Event is correctly bound. - onclick" : "Event should not be bound. - onclick" );
	}
	Simples("#firstp").trigger( 'click' );
	Simples("#firstp")[0].onclick = null;
});

test("trigger(), with data", 2, function() {
	var handler = function(event) {
		ok( event.data, "trigger() with data, check passed data exists" );
		equals( event.data.foo, "bar", "trigger() with data, Check value of passed data" );
	};
	
	Simples("#firstp").bind('data', handler);
	Simples("#firstp").trigger('data', {foo: "bar"});
	Simples("#firstp").unbind("data", handler);
});

test("bind(), no data", 1, function() {
	var handler = function(event) {
		ok ( !event.data, "Check that no data is added to the event object" );
	};
	Simples("#firstp").bind("click", handler).trigger("click").unbind('click');
});

test("bind(), iframes", 169, function() {
	// events don't work with iframes, see #939 - this test fails in IE because of contentDocument
	var doc = Simples("#loadediframe").traverse(function(){
		return this.contentDocument || this.contentWindow.document;
	})[0];
	
	Simples("div", doc).bind("click", function() {
		ok( true, "Binding to element inside iframe" );
	}).trigger('click').unbind('click');
});

test("bind(), trigger change on select", 3, function() {
	var counter = 0;
	function selectOnChange(event) {
		equals( Simples( event.target ).data( "pos" ), counter++, "Event.data is not a global event object" );
	};
	Simples("#form select").each(function(i){
		Simples(this).data('pos', i).bind('change', selectOnChange);
	}).trigger('change');
});

test("bind()only on real nodes", 1, function() {

	// using contents will get comments regular, text, and comment nodes
	Simples("#nonnodes").traverse("childNodes").bind("tester", function () {
		equals( this.nodeType, 1, "Check node,textnode,comment bind just does real nodes" );
	}).trigger("tester");
});

test("bind(), with same function", 2, function() {

	var count = 0 ,  func = function(){
		count++;
	};

	Simples("#liveHandlerOrder").bind("foo.bar", func).bind("foo.zar", func);
	Simples("#liveHandlerOrder").trigger("foo.bar");

	equals(count, 1, "Verify binding function with multiple namespaces." );

	Simples("#liveHandlerOrder").unbind("foo.bar", func).unbind("foo.zar", func);
	Simples("#liveHandlerOrder").trigger("foo.bar");

	equals(count, 1, "Verify that removing events still work." );
});

test("bind(), make sure order is maintained", 1, function() {
	expect(1);

	var elem = Simples("#firstp"), log = [], check = [];

	for ( var i = 0; i < 100; i++ ) (function(i){
		elem.bind( "click", function(){
			log.push( i );
		});

		check.push( i );
	})(i);

	elem.trigger("click");

	equals( log.join(","), check.join(","), "Make sure order was maintained." );

	elem.unbind("click");
});

test("bind(name, false), unbind(name, false)", function() {
	expect(3);

	var main = 0;
	Simples("#main").bind("click", function(e){ main++; });
	Simples("#ap").trigger("click");
	equals( main, 1, "Verify that the trigger happened correctly." );

	main = 0;
	Simples("#ap").bind("click", false);
	Simples("#ap").trigger("click");
	equals( main, 0, "Verify that no bubble happened." );

	main = 0;
	Simples("#ap").unbind("click", false);
	Simples("#ap").trigger("click");
	equals( main, 1, "Verify that the trigger happened correctly." );
});

test("bind()/trigger()/unbind() on plain object", function() {
	expect( 1 );

	var obj = {};

	// Make sure it doesn't complain when no events are found
	Simples(obj).trigger("test");

	// Make sure it doesn't complain when no events are found
	Simples(obj).unbind("test");

	Simples(obj).bind("test", function(){
		ok( true, "Custom event run." );
	});

	same( Simples(obj).data("events"), null, "Object has events bound." );

	// Should trigger 1
	Simples(obj).trigger("test");

	Simples(obj).unbind("test");
});

test("unbind(type)", 0, function() {
	
	var $elem = Simples("#firstp"),
		message;

	function error(){
		ok( false, message );
	}
	
	message = "unbind passing function";
	$elem.bind('error1', error).unbind('error1',error).trigger('error1');
	
	message = "unbind all from event";
	$elem.bind('error1', error).unbind('error1').trigger('error1');
	
	message = "unbind all";
	$elem.bind('error1', error).unbind().trigger('error1');
	
	message = "unbind many with function";
	$elem.bind('error1 error2',error)
		 .unbind('error1 error2', error )
		 .trigger('error1').trigger('error2');

	message = "unbind many"; // #3538
	$elem.bind('error1 error2',error)
		 .unbind('error1 error2')
		 .trigger('error1').trigger('error2');
	
	message = "unbind without a type or handler";
	$elem.bind("error1 error2.test",error)
		 .unbind()
		 .trigger("error1").trigger("error2");
});

test("unbind(eventObject)", 4, function() {
	var $elem = Simples("#firstp"),
		num;

	function assert( expected ){
		num = 0;
		$elem.trigger('foo').trigger('bar');
		equals( num, expected, "Check the right handlers are triggered" );
	}
	
	$elem
		// This handler shouldn't be unbound
		.bind('foo', function(){
			num += 1;
		})
		.bind('foo', function(e){ 
			$elem.unbind( e );
			num += 2;
		})
		// Neither this one
		.bind('bar', function(){
			num += 4;
		});
		
	assert( 7 );
	assert( 5 );
	
	$elem.unbind('bar');
	assert( 1 );
	
	$elem.unbind();	
	assert( 0 );
});

test("trigger() bubbling", 14, function() {
	var doc = 0, html = 0, body = 0, main = 0, ap = 0;

	Simples(document).bind("click", function(e){ if ( e.target !== document) { doc++; } });
	Simples("html").bind("click", function(e){ html++; });
	Simples("body").bind("click", function(e){ body++; });
	Simples("#main").bind("click", function(e){ main++; });
	Simples("#ap").bind("click", function(){ ap++; return false; });

	Simples("html").trigger("click");
	equals( doc, 1, "HTML bubble" );
	equals( html, 1, "HTML bubble" );

	Simples("body").trigger("click");
	equals( doc, 2, "Body bubble" );
	equals( html, 2, "Body bubble" );
	equals( body, 1, "Body bubble" );

	Simples("#main").trigger("click");
	equals( doc, 3, "Main bubble" );
	equals( html, 3, "Main bubble" );
	equals( body, 2, "Main bubble" );
	equals( main, 1, "Main bubble" );

	Simples("#ap").trigger("click");
	equals( doc, 3, "ap bubble" );
	equals( html, 3, "ap bubble" );
	equals( body, 2, "ap bubble" );
	equals( main, 1, "ap bubble" );
	equals( ap, 1, "ap bubble" );
});

test("trigger(type, [data], [fn])", 8, function() {

	var handler = function(event, a, b, c) {
		equals( event.type, "click", "check passed data" );
		same( event.data, [ 1, "2", "abc"], "check passed data" );
		return "test";
	};

	var $elem = Simples("#firstp");

	// Triggers handlrs and native
	// Trigger 5
	$elem.bind("click", handler).trigger("click", [1, "2", "abc"]);

	// Simulate a "native" click
	$elem[0].onclick = function(){
		ok( true, "Native call was triggered" );
	};

	// Trigger only the handlers (no native)
	// Triggers 5
	$elem.trigger("click", [1, "2", "abc"]);

	var pass = true;
	try { 
		Simples('#form input').eq(0).hide().trigger('focus');
	} catch(e) { 
		pass = false;
	}
	ok( pass, "Trigger focus on hidden element" );
	
	pass = true;
	try {
		Simples('table').eq(0).bind('test:test', function(){}).trigger('test:test');
	} catch (e) {
		pass = false;
	}
	ok( pass, "Trigger on a table with a colon in the even type, see #3533" );

	var form = Simples("<form/>").attr('action','');
	Simples('body').append( form );

	// Make sure it can be prevented locally
	form.bind("submit", function(){
		ok( true, "Local bind still works." );
		return false;
	});

	// Trigger 1
	form.trigger("submit");

	form.unbind("submit");

	Simples(document).bind("submit",function(){
		ok( true, "Make sure bubble works up to document." );
		return false;
	});

	// Trigger 1
	form.trigger("submit");

	Simples(document).unbind("submit");

	form.remove();
});

test("trigger(eventObject, [data], [fn])", 15, function() {
	
	var $parent = Simples('<div>').attr('id', 'par').hide(),
		$child = Simples('<p>').attr('id','child').html('foo');
		Simples('body').append( $parent );
		$parent.append( $child );
	
	var event = SimplesEvent("noNew");	
	ok( event != window, "Instantiate Simples.Event without the 'new' keyword" );
	equals( event.type, "noNew", "Verify its type" );
	
	equals( event.isDefaultPrevented(), false, "Verify isDefaultPrevented" );
	equals( event.isPropagationStopped(), false, "Verify isPropagationStopped" );
	equals( event.isImmediatePropagationStopped(), false, "Verify isImmediatePropagationStopped" );
	
	event.preventDefault();
	equals( event.isDefaultPrevented(), true, "Verify isDefaultPrevented" );
	event.stopPropagation();
	equals( event.isPropagationStopped(), true, "Verify isPropagationStopped" );
	
	event.isPropagationStopped = function(){ return false };
	event.stopImmediatePropagation();
	equals( event.isPropagationStopped(), true, "Verify isPropagationStopped" );
	equals( event.isImmediatePropagationStopped(), true, "Verify isPropagationStopped" );
	
	$parent.bind('foo',function(e){
		// Tries bubbling
		equals( e.type, 'foo', 'Verify event type when passed passing an event object' );
		equals( e.target.id, 'child', 'Verify event.target when passed passing an event object' );
		equals( e.currentTarget.id, 'par', 'Verify event.target when passed passing an event object' );
		equals( e.secret, 'boo!', 'Verify event object\'s custom attribute when passed passing an event object' );
	});
	
	$child.trigger("foo");
	
	$parent.unbind();

	function error(){
		ok( false, "This assertion shouldn't be reached");
	}
	
	$parent.bind('foo', error );
	
	var event;
	$child.bind('foo',function( e ){
		equals( arguments.length, 1, "Check arguments length");
		same( e.data, [1,2,3], "Check event.data");
		
		equals( e.isDefaultPrevented(), false, "Verify isDefaultPrevented" );
		equals( e.isPropagationStopped(), false, "Verify isPropagationStopped" );
		equals( e.isImmediatePropagationStopped(), false, "Verify isImmediatePropagationStopped" );
		
		// Skips both errors
		e.stopImmediatePropagation();
		event = e;
		return "result";
	});
	
	// We should add this back in when we want to test the order
	// in which event handlers are iterated.
	//$child.bind('foo', error );
	
	$child.trigger( "foo", [1,2,3] ).unbind();
	
	equals( event.result, "result", "Check event.result attribute");
	// Will error if it bubbles
	$child.trigger('foo');
	
	$child.unbind();
	$parent.unbind().remove();
});

test("Simples.Event.currentTarget", function(){
	expect(2);
	
	var counter = 0,
		$elem = Simples('<button>a</button>').bind("click", function(e){
		equals( e.currentTarget, this, "Check currentTarget on "+(counter++?"native":"fake") +" event" );
	});
	
	// Fake event
	$elem.trigger('click');
	
	// Cleanup
	$elem.unbind();
	
	same( readData( $elem[0], "events"), {}, "should have no events" );
});