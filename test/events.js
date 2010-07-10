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

test("check event bound correctly", 3, function(){ 
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

test("bind/one/unbind(Object)", function(){
	expect(6);
	
	var clickCounter = 0, mouseoverCounter = 0;
	function handler(event) {
		if (event.type == "click")
			clickCounter++;
		else if (event.type == "mouseover")
			mouseoverCounter++;
	};
	
	function handlerWithData(event) {
		if (event.type == "click")
			clickCounter += event.data;
		else if (event.type == "mouseover")
			mouseoverCounter += event.data;
	};
	
	function trigger(){
		$elem.trigger("click").trigger("mouseover");
	}
	
	var $elem = Simples("#firstp")
		// Regular bind
		.bind({
			click:handler,
			mouseover:handler
		})
		// Bind with data
		.one({
			click:handlerWithData,
			mouseover:handlerWithData
		}, 2 );
	
	trigger();
	
	equals( clickCounter, 3, "bind(Object)" );
	equals( mouseoverCounter, 3, "bind(Object)" );
	
	trigger();
	equals( clickCounter, 4, "bind(Object)" );
	equals( mouseoverCounter, 4, "bind(Object)" );
	
	Simples("#firstp").unbind({
		click:handler,
		mouseover:handler
	});

	trigger();
	equals( clickCounter, 4, "bind(Object)" );
	equals( mouseoverCounter, 4, "bind(Object)" );
});

test("bind(), iframes", function() {
	// events don't work with iframes, see #939 - this test fails in IE because of contentDocument
	var doc = Simples("#loadediframe").contents();
	
	Simples("div", doc).bind("click", function() {
		ok( true, "Binding to element inside iframe" );
	}).click().unbind('click');
});

test("bind(), trigger change on select", function() {
	expect(3);
	var counter = 0;
	function selectOnChange(event) {
		equals( event.data, counter++, "Event.data is not a global event object" );
	};
	Simples("#form select").each(function(i){
		Simples(this).bind('change', i, selectOnChange);
	}).trigger('change');
});

test("bind(), namespaced events, cloned events", function() {
	expect(6);

	Simples("#firstp").bind("custom.test",function(e){
		ok(true, "Custom event triggered");
	});

	Simples("#firstp").bind("click",function(e){
		ok(true, "Normal click triggered");
	});

	Simples("#firstp").bind("click.test",function(e){
		ok(true, "Namespaced click triggered");
	});

	// Trigger both bound fn (2)
	Simples("#firstp").trigger("click");

	// Trigger one bound fn (1)
	Simples("#firstp").trigger("click.test");

	// Remove only the one fn
	Simples("#firstp").unbind("click.test");

	// Trigger the remaining fn (1)
	Simples("#firstp").trigger("click");

	// Remove the remaining fn
	Simples("#firstp").unbind(".test");

	// Trigger the remaining fn (0)
	Simples("#firstp").trigger("custom");

	// using contents will get comments regular, text, and comment nodes
	Simples("#nonnodes").contents().bind("tester", function () {
		equals(this.nodeType, 1, "Check node,textnode,comment bind just does real nodes" );
	}).trigger("tester");

	// Make sure events stick with appendTo'd elements (which are cloned) #2027
	Simples("<a href='#fail' class='test'>test</a>").click(function(){ return false; }).appendTo("p");
	ok( Simples("a.test:first").triggerHandler("click") === false, "Handler is bound to appendTo'd elements" );
});

test("bind(), multi-namespaced events", function() {
	expect(6);
	
	var order = [
		"click.test.abc",
		"click.test.abc",
		"click.test",
		"click.test.abc",
		"click.test",
		"custom.test2"
	];
	
	function check(name, msg){
		same(name, order.shift(), msg);
	}

	Simples("#firstp").bind("custom.test",function(e){
		check("custom.test", "Custom event triggered");
	});

	Simples("#firstp").bind("custom.test2",function(e){
		check("custom.test2", "Custom event triggered");
	});

	Simples("#firstp").bind("click.test",function(e){
		check("click.test", "Normal click triggered");
	});

	Simples("#firstp").bind("click.test.abc",function(e){
		check("click.test.abc", "Namespaced click triggered");
	});
	
	// Those would not trigger/unbind (#5303)
	Simples("#firstp").trigger("click.a.test");
	Simples("#firstp").unbind("click.a.test");

	// Trigger both bound fn (1)
	Simples("#firstp").trigger("click.test.abc");

	// Trigger one bound fn (1)
	Simples("#firstp").trigger("click.abc");

	// Trigger two bound fn (2)
	Simples("#firstp").trigger("click.test");

	// Remove only the one fn
	Simples("#firstp").unbind("click.abc");

	// Trigger the remaining fn (1)
	Simples("#firstp").trigger("click");

	// Remove the remaining fn
	Simples("#firstp").unbind(".test");

	// Trigger the remaining fn (1)
	Simples("#firstp").trigger("custom");
});

test("bind(), with same function", function() {
	expect(2)

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

test("bind(), make sure order is maintained", function() {
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
 
test("bind(), with different this object", function() {
	expect(4);
	var thisObject = { myThis: true },
		data = { myData: true },
		handler1 = function( event ) {
			equals( this, thisObject, "bind() with different this object" );
		},
		handler2 = function( event ) {
			equals( this, thisObject, "bind() with different this object and data" );
			equals( event.data, data, "bind() with different this object and data" );
		};
	
	Simples("#firstp")
		.bind("click", Simples.proxy(handler1, thisObject)).click().unbind("click", handler1)
		.bind("click", data, Simples.proxy(handler2, thisObject)).click().unbind("click", handler2);

	ok( !readData(Simples("#firstp")[0], "events"), "Event handler unbound when using different this object and data." );
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
	expect( 2 );

	var obj = {};

	// Make sure it doesn't complain when no events are found
	Simples(obj).trigger("test");

	// Make sure it doesn't complain when no events are found
	Simples(obj).unbind("test");

	Simples(obj).bind("test", function(){
		ok( true, "Custom event run." );
	});

	ok( Simples(obj).data("events"), "Object has events bound." );

	// Should trigger 1
	Simples(obj).trigger("test");

	Simples(obj).unbind("test");

	// Should trigger 0
	Simples(obj).trigger("test");

	// Make sure it doesn't complain when no events are found
	Simples(obj).unbind("test");
});

test("unbind(type)", function() {
	expect( 0 );
	
	var $elem = Simples("#firstp"),
		message;

	function error(){
		ok( false, message );
	}
	
	message = "unbind passing function";
	$elem.bind('error1', error).unbind('error1',error).triggerHandler('error1');
	
	message = "unbind all from event";
	$elem.bind('error1', error).unbind('error1').triggerHandler('error1');
	
	message = "unbind all";
	$elem.bind('error1', error).unbind().triggerHandler('error1');
	
	message = "unbind many with function";
	$elem.bind('error1 error2',error)
		 .unbind('error1 error2', error )
		 .trigger('error1').triggerHandler('error2');

	message = "unbind many"; // #3538
	$elem.bind('error1 error2',error)
		 .unbind('error1 error2')
		 .trigger('error1').triggerHandler('error2');
	
	message = "unbind without a type or handler";
	$elem.bind("error1 error2.test",error)
		 .unbind()
		 .trigger("error1").triggerHandler("error2");
});

test("unbind(eventObject)", function() {
	expect(4);
	
	var $elem = Simples("#firstp"),
		num;

	function assert( expected ){
		num = 0;
		$elem.trigger('foo').triggerHandler('bar');
		equals( num, expected, "Check the right handlers are triggered" );
	}
	
	$elem
		// This handler shouldn't be unbound
		.bind('foo', function(){
			num += 1;
		})
		.bind('foo', function(e){
			$elem.unbind( e )
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

test("trigger() shortcuts", function() {
	expect(6);
	Simples('<li><a href="#">Change location</a></li>').prependTo('#firstUL').find('a').bind('click', function() {
		var close = Simples('spanx', this); // same with Simples(this).find('span');
		equals( close.length, 0, "Context element does not exist, length must be zero" );
		ok( !close[0], "Context element does not exist, direct access to element must return undefined" );
		return false;
	}).click();
	
	Simples("#check1").click(function() {
		ok( true, "click event handler for checkbox gets fired twice, see #815" );
	}).click();
	
	var counter = 0;
	Simples('#firstp')[0].onclick = function(event) {
		counter++;
	};
	Simples('#firstp').click();
	equals( counter, 1, "Check that click, triggers onclick event handler also" );
	
	var clickCounter = 0;
	Simples('#simon1')[0].onclick = function(event) {
		clickCounter++;
	};
	Simples('#simon1').click();
	equals( clickCounter, 1, "Check that click, triggers onclick event handler on an a tag also" );
	
	Simples('<img />').load(function(){
		ok( true, "Trigger the load event, using the shortcut .load() (#2819)");
	}).load();
});

test("trigger() bubbling", function() {
	expect(14);

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

test("trigger(type, [data], [fn])", function() {
	expect(14);

	var handler = function(event, a, b, c) {
		equals( event.type, "click", "check passed data" );
		equals( a, 1, "check passed data" );
		equals( b, "2", "check passed data" );
		equals( c, "abc", "check passed data" );
		return "test";
	};

	var $elem = Simples("#firstp");

	// Simulate a "native" click
	$elem[0].click = function(){
		ok( true, "Native call was triggered" );
	};

	// Triggers handlrs and native
	// Trigger 5
	$elem.bind("click", handler).trigger("click", [1, "2", "abc"]);

	// Simulate a "native" click
	$elem[0].click = function(){
		ok( false, "Native call was triggered" );
	};

	// Trigger only the handlers (no native)
	// Triggers 5
	equals( $elem.triggerHandler("click", [1, "2", "abc"]), "test", "Verify handler response" );

	var pass = true;
	try {
		Simples('#form input:first').hide().trigger('focus');
	} catch(e) {
		pass = false;
	}
	ok( pass, "Trigger focus on hidden element" );
	
	pass = true;
	try {
		Simples('table:first').bind('test:test', function(){}).trigger('test:test');
	} catch (e) {
		pass = false;
	}
	ok( pass, "Trigger on a table with a colon in the even type, see #3533" );

	var form = Simples("<form action=''></form>").appendTo("body");

	// Make sure it can be prevented locally
	form.submit(function(){
		ok( true, "Local bind still works." );
		return false;
	});

	// Trigger 1
	form.trigger("submit");

	form.unbind("submit");

	Simples(document).submit(function(){
		ok( true, "Make sure bubble works up to document." );
		return false;
	});

	// Trigger 1
	form.trigger("submit");

	Simples(document).unbind("submit");

	form.remove();
});

test("trigger(eventObject, [data], [fn])", function() {
	expect(25);
	
	var $parent = Simples('<div id="par" />').hide().appendTo('body'),
		$child = Simples('<p id="child">foo</p>').appendTo( $parent );
	
	var event = Simples.Event("noNew");	
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
	
	// test with an event object
	event = new Simples.Event("foo");
	event.secret = 'boo!';
	$child.trigger(event);
	
	// test with a literal object
	$child.trigger({type:'foo', secret:'boo!'});
	
	$parent.unbind();

	function error(){
		ok( false, "This assertion shouldn't be reached");
	}
	
	$parent.bind('foo', error );
	
	$child.bind('foo',function(e, a, b, c ){
		equals( arguments.length, 4, "Check arguments length");
		equals( a, 1, "Check first custom argument");
		equals( b, 2, "Check second custom argument");
		equals( c, 3, "Check third custom argument");
		
		equals( e.isDefaultPrevented(), false, "Verify isDefaultPrevented" );
		equals( e.isPropagationStopped(), false, "Verify isPropagationStopped" );
		equals( e.isImmediatePropagationStopped(), false, "Verify isImmediatePropagationStopped" );
		
		// Skips both errors
		e.stopImmediatePropagation();
		
		return "result";
	});
	
	// We should add this back in when we want to test the order
	// in which event handlers are iterated.
	//$child.bind('foo', error );
	
	event = new Simples.Event("foo");
	$child.trigger( event, [1,2,3] ).unbind();
	equals( event.result, "result", "Check event.result attribute");
	
	// Will error if it bubbles
	$child.triggerHandler('foo');
	
	$child.unbind();
	$parent.unbind().remove();
});

test("Simples.Event.currentTarget", function(){
	expect(1);
	
	var counter = 0,
		$elem = Simples('<button>a</button>').click(function(e){
		equals( e.currentTarget, this, "Check currentTarget on "+(counter++?"native":"fake") +" event" );
	});
	
	// Fake event
	$elem.trigger('click');
	
	// Cleanup
	$elem.unbind();
});