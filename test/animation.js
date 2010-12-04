var t_start_anim = [], t_stop_anim = [], anim_id, test_now;

function clone( obj ){
	var nobj = {};
	for( var name in obj ){
		nobj[ name ] = obj[ name ];
	}
	return nobj;
}

var prefix_ = 't_comp_';

function testObject( Obj, name, type ){
 	equal( toString.call( Obj[ name ] ), "[object "+ type+"]", "should have "+name+" of type [object "+ type+"]" );
}

function isWithIn( expected, actual, range, message ){ 
	function escapeHtml(s) {
		s = s === null ? "" : s + "";
		return s.replace(/[\&"<>\\]/g, function(s) {
			switch(s) {
				case "&": return "&amp;";
				case "\\": return "\\\\";
				case '"': return '\"';
				case "<": return "&lt;";
				case ">": return "&gt;";
				default: return s;
			}
		});
	}
	
	var result = false;
	if( !isNaN( actual ) ){
		result = ( expected + range ) > actual && ( expected - range ) < actual;
	}
	message = escapeHtml(message) || (result ? "okay" : "failed");
	message = '<span class="test-message">' + message + "</span>";
	expected = escapeHtml(QUnit.jsDump.parse(expected));
	actual = escapeHtml(QUnit.jsDump.parse(actual));
	var output = message + ', expected: <span class="test-expected">' + expected + '</span>';
	if (!result) {
		output += ' result: <span class="test-actual">' + actual + '</span>, diff: ' + QUnit.diff(expected, actual);
	}
	
	// can't use ok, as that would double-escape messages
	QUnit.log(result, output);
	QUnit.config.assertions.push({
		result: result,
		message: output
	});
	
}

function createAnim( id, elemId ){
	var elem;
	if ( elemId ){
		elem = document.getElementById( elemId );
	}
	if( !elem ){
		elem = document.createElement('div');
		document.body.appendChild( elem );
		elem.style.opacity = 1;
	}
	var data = {},
	anim = {     
		0 : elem,
		id: id,  
		callback : Simples.noop,
		duration : 600,
		tween : Simples.Animation.tweens.linear,
		start : { opacity : 1 },
		finish : { opacity : 0 } 
	};
	data[ id ] = anim;
	Simples.data( elem, 'animations', data );
	return anim;
}

var testArea = document.getElementById('test-area');
module("Simples.Animation", {
	setup:function(){
		window.__clearInterval__ = window.clearInterval;
		Simples.setStyle( testArea, "opacity", 1 );
		TIMER_ID = null;
		Simples.Animation.animations = {};
		Simples.Animation.length = 0;
		Simples.Animation.frameRate = 24;
		Simples.Animation.interval = Math.round( 1000 / 24 );
	},
	teardown:function(){                                                    
		window.clearInterval = window.__clearInterval__;
		window.clearInterval( TIMER_ID );
		TIMER_ID = null;
		Simples.Animation.animations = {};
	}
});
test("test singleton", 8, function(){
	
	testObject( Simples.Animation, 'animations', 'Object' );
	testObject( Simples.Animation, 'frameRate', 'Number' );
	testObject( Simples.Animation, 'length', 'Number' );
	testObject( Simples.Animation, 'interval', 'Number' );
	testObject( Simples.Animation, 'tweens', 'Object' );		
	testObject( Simples.Animation, 'start', 'Function' );
	testObject( Simples.Animation, '_step', 'Function' );
	testObject( Simples.Animation, 'stop', 'Function' );
});

test("create()", 9, function(){
	var elem = testArea;
		
	Simples.Animation._start = Simples.Animation.start;
	Simples.Animation.start = function( anim ){
		var data = Simples.data( anim[0], "animations" )
		ok( true, "expected start to be called");
		
		equal( anim[0], elem, "expected anim to have elem passed in" );
		equal( anim.id, Simples.guid - 1, "to have the guid assigned" );
		equal( anim.duration, 600, "should have default duration" );
		equal( anim.tween, Simples.Animation.tweens.easing, "should have default tween" );
		equal( typeof anim.callback, "function", "should always set a callback function" );
		same( anim.start, {opacity:1}, "should have the start state" );
		same( anim.finish, {opacity:0}, "should have the finish state" );
		equal( anim, data[ anim.id ], "elem data should have anim");
	}
	
	Simples.Animation.create( elem, { opacity: 0 } );
	
	Simples.Animation.start = Simples.Animation._start;
});
                                                     
test("create() with opts", 31, function(){
	var elem = testArea,
		duration, tween, callback;
		
	Simples.Animation._start = Simples.Animation.start;
	
	function testAnim( anim ){
		var actualTween = typeof tween === "function" ? tween : ( Simples.Animation.tweens[ tween ] || Simples.Animation.tweens.easing )

		equal( anim[0], elem, "expected anim to have elem passed in" );
		equal( anim.id, Simples.guid - 1, "to have the guid assigned" );
		equal( anim.duration, duration || 600, "should have duration specified "+duration );
		equal( anim.callback, callback || Simples.noop, "should always set a callback function" );
		equal( anim.tween, actualTween, "should always have a tween set" );
		same( anim.start, {opacity:1}, "should have the start state" );
		same( anim.finish, {opacity:0}, "should have the finish state" );
	}
	
	Simples.Animation.start = function( anim ){

		ok( true, "expected start to be called");
		testAnim( anim );
	}
	
	Simples.Animation.create( elem, { opacity: 0 }, { duration: undefined, tween : 2, callback : "hammer" } );
	duration = 1000;
	tween = function(){ return "super" };
	callback = function(){ return "all done" };
	Simples.Animation.create( elem, { opacity: 0 }, { duration: duration, tween : tween, callback : callback } );
	
	tween = "linear"
	Simples.Animation.create( elem, { opacity: 0 }, { duration: duration, tween : tween, callback : callback } );
	
	Simples.Animation.start = function( anim ){

		ok( false, "expected start not to be called");
	}
	
	testAnim( Simples.Animation.create( elem, { opacity: 0 }, { duration: duration, tween : tween, callback : callback, manualStart : true } ) );
	
	Simples.Animation.start = Simples.Animation._start;
});

test("start() basics", 10, function(){
	//setup
	Simples.Animation._step_ = Simples.Animation._step;
	// test setup
	Simples.Animation._step = function(){
		ok( false, "Should not have called _step" );
	};

	Simples.Animation.frameRate = 1;
	Simples.Animation.start();

	equal( Simples.Animation.interval, Math.round( 1000 / 24 ), "should have a default interval" );
	same( TIMER_ID, null, "should have a timer of undefined" );

	var anim = createAnim( 1e6 ),
		id = TIMER_ID;

	Simples.Animation.start( anim );

	equal( Simples.Animation.length, 1, "should have one animation" );
	ok( TIMER_ID > id, "should start the timer" );
	equal( Simples.Animation.interval, 1000, "should have set the interval correctly" );   
	ok( anim.startTime > ( new Date().getTime() - 100 ), "should have correctly set the start time" );  
    
	Simples.Animation.frameRate = 12;
	id = TIMER_ID;
	Simples.Animation.start( anim );

	equal( Simples.Animation.length, 1, "should have one animation" );
	equal( TIMER_ID, id, "should have one timer" );
	equal( Simples.Animation.interval, 1000, "should have one animation" );	
	 
	var startTime = new Date().getTime() - 200;
    anim.startTime = startTime;

	Simples.Animation.start( anim );
	equal( anim.startTime, startTime, "should not alter existing startTime" );
	// cleanup	
	Simples.Animation._step = Simples.Animation._step_;
});

test("_step() thorough", 52, function(){

	window.clearInterval = function( id ){
		ok( true, "should call clearInterval" );
	};
	
	TIMER_ID = 34324;
 	Simples.Animation._step();

	equal( TIMER_ID, null, "when timerID but no animations should stop timer");
	
	for( var id=0;id<10;id++){
		var anim = createAnim( id );
		Simples.Animation.animations[ id ] = anim;
		Simples.Animation.length = id+1;
		anim.startTime = new Date().getTime() - 300;
	}
	
	Simples.Animation._step();
	
	for( var id=0;id<10;id++){
		var anim = Simples.Animation.animations[ id ];
		isWithIn( 0.5, anim[0].style.opacity, 0.05, "should set the opacity to be 0.5 +/- 0.05" );
	}
	
	Simples.Animation._stop = Simples.Animation.stop;
    var count = 0;
	Simples.Animation.stop = function( anim, resetToEnd ){
		ok( true, "should call stop");
		equal( anim.id, count++, "should pass in valid anim" );
		ok( resetToEnd, "should tell stop to resetToEnd")
	};
	for( id=0;id<10;id++){
		Simples.Animation.animations[ id ].startTime = new Date().getTime() - 610;		
	}	
	
	Simples.Animation._step();
	
	for( var id=0;id<10;id++){
		var anim = Simples.Animation.animations[ id ];
		isWithIn( 0.5, anim[0].style.opacity, 0.05, "should set the opacity to 0.5 +/- 0.05" );
	}
	
	Simples.Animation.stop = Simples.Animation._stop;
});

test("stop() thorough", 34, function(){
	var shouldBeCalled = false;
   	Simples.Animation._reset = Simples.Animation.reset;
	Simples.Animation.reset = function( animation, resetToEnd ){
		ok( shouldBeCalled, "should be called");
		equal( anim, animation, "should be the animation stop is called with");
		ok( resetToEnd, "should reset to the end when stopping with jump to end." )
	}
	
	for( var id=0;id<10;id++){
		var anim = createAnim( id );
		Simples.Animation.animations[ id ] = anim
		Simples.Animation.length = id+1;
		anim.startTime = new Date().getTime();
	}
	
	var length = 10;
	for( var i=0;i<10;i++){
		var animation = Simples.Animation.animations[ i ];
		Simples.Animation.stop( animation );
		equal( animation.startTime, undefined, "should not have a startTime" );
		equal( Simples.Animation.animations[ i ], undefined, "should not have a record of the animation - "+animation.id );
		equal( Simples.Animation.length, --length, "should decrement length" );
	}
	var id = 12,
		anim = createAnim( id );

	shouldBeCalled = true;
	Simples.Animation.length = 1;
	Simples.Animation.animations[ id ] = anim;
	
	Simples.Animation.stop( anim, true );

	ok( Simples.isEmptyObject( Simples.data( anim[0], "animations" ) ), "should remove animations on stop" );
	
	Simples.Animation.reset = Simples.Animation._reset;
}); 

test("reverse()", 11, function(){
	var id = 79, willStart = true, length=2, startAnim, time = undefined;
	
	Simples.Animation.length = length;
	Simples.Animation._start = Simples.Animation.start;
	Simples.Animation.start = function( anim ){
		ok( willStart, "should call Simples.Animation.start");
		equal( startAnim.id, anim.id, "should pass in valid anim" );
		equal( startAnim.finish, anim.start, "should reverse css start");
		equal( startAnim.start, anim.finish, "should reverse css finish");
		equal( time, anim.startTime, "should set the correct time +/- 20ms");
		equal( length, Simples.Animation.length, "should reduce the length when calling start");
	};

	var anim = createAnim( id++ );
	startAnim = clone( anim );

	Simples.Animation.reverse( anim );

	var anim = createAnim( id++ ),
		now = new Date().getTime();
	
	Simples.Animation.animations[ anim.id ] = anim;
	time = now - 400;
	anim.startTime = now - 200;
	willStart = false;
	startAnim = clone( anim );
		
	Simples.Animation.reverse( anim );
	
	equal( startAnim.id, anim.id, "should pass in valid anim" );
	equal( startAnim.finish, anim.start, "should reverse css start");
	equal( startAnim.start, anim.finish, "should reverse css finish");
	isWithIn( time, anim.startTime, 20, "should set the correct time +/- 20ms");
	equal( length, Simples.Animation.length, "should reduce the length when calling start");

	Simples.Animation.start = Simples.Animation._start; 	
});

test("reset()", 6, function(){ 
	var id = 53, willStop = false;
	
	Simples.Animation._stop = Simples.Animation.stop;
	Simples.Animation.stop = function( anim, resetToEnd ){
		ok( willStop, "should call stop");
		equal( anim.id, id, "should pass in valid anim" );
		equal( resetToEnd, undefined, "should tell stop to resetToEnd" );
	};
	
	var anim = createAnim( id );
	anim[0].style.opacity = 0.5;
	Simples.Animation.animations[ id ] = anim
	Simples.Animation.length = 1;
	TIMER_ID = 3434;
	
	Simples.Animation.reset( anim );
	equal( 1, anim[0].style.opacity, "will reset to start");
	
    anim[0].style.opacity = 0.5;
	
	Simples.Animation.reset( anim, true );
	equal( 0, anim[0].style.opacity, "will reset to start");
	
	anim.startTime = 7236723;
	willStop = true
	anim[0].style.opacity = 0.5;
	Simples.Animation.reset( anim, true );
	equal( 0, anim[0].style.opacity, "will reset to start");
			
	Simples.Animation.stop = Simples.Animation._stop;
}); 

module( "Simples( element ).animate()", {
   setup : function(){
		TIMER_ID = null;
		Simples.Animation.animations = {};
		Simples.Animation.length = 0;
		Simples.Animation.frameRate = 24;
		Simples.Animation.interval = Math.round( 1000 / 24 );
		Simples.Animation.guid = 1e6;
	},
	teardown: function(){
		window.clearInterval( TIMER_ID );
		TIMER_ID = null;
		Simples.Animation.animations = {};
		Simples.Animation.length = 0;
	}
});

test("with no properties", 2, function() {

	var divs = Simples("div"), count = 0;

	divs.animate({}, {callback: function(){
		count++;
	}});

	equals( divs.length, count, "Make sure that callback is called for each element in the set." );

	stop();

	var foo = Simples("#foo");

	foo.animate({});
	foo.animate({top: 10}, { duration : 100, callback:function(){
		ok( true, "Animation was properly dequeued." );
		QUnit.start();
	}});
});

test("animate(Hash, Object)", 2, function() { 

	stop();
	var hash = {opacity: 'show'},
		hashCopy = clone( hash ),
		startOpacity = Simples('#foo').css('opacity');
		
	var anim = Simples('#foo').animate({opacity: 'show'}, {
		callback: function( animate ) {
			ok( !animate.start.opacity, 'Should not set opacity' ); 
			equal( Simples('#foo').css('opacity'), startOpacity, "shouldn't change the opacity");
			QUnit.start();
		},
		duration:100
	}); 

}); 
	
test("animate negative height", 1, function() {
	
    stop();
    Simples("#foo").animate({ height: -100 }, {
        callback: function() {
            equals( this.offsetHeight, 0, "Verify height.");
            QUnit.start();
        },
		duration : 100
    });	
});

test("animate duration 0", 11, function() {
	stop();
	
	var $elems = Simples('#test-area, #nothiddendiv').data('animations', null ), counter = 0, anim;
	
	equals( Simples.Animation.length, 0, "Make sure no animation was running from another test" );
    
	var elem = $elems.slice(0).css("opacity", 1);

	elem.slice(0).animate( {a:1}, { duration : 0, callback : function( animation ){
		anim = animation;
		ok( true, "Animate a simple property." );
		counter++;
	}});

	var anims = elem.data('animations'), count = 0;
	
	for( var id in anims ){
		count++;
	}
	
	equals( count, 0, "should have 0 animation on the elem" );
	equals( anim.duration, 0, "should not set default duration" );

	// Failed until [6115]
	equals( Simples.Animation.length, 0, "Make sure synchronic animations are not left on Simples.Animation.length" );

	equals( counter, 1, "One synchronic animations" );
	
	$elems.animate( { a:2 }, { duration: 0, callback : function(){
		ok( true, "Animate a second simple property." );
		counter++;
	}});
	
	equals( counter, 3, "Multiple synchronic animations" );
	
	$elems.slice(0).animate( {a:3}, { duration: 0, callback : function(){
		ok( true, "Animate a third simple property." );
		counter++;
	}});
	$elems.slice(1).animate( {a:3}, { duration: 200, callback : function(){
		counter++;
		// Failed until [6115]
		equals( counter, 5, "One synchronic and one asynchronic" );
		QUnit.start();
	}});
});

test("animate hyphenated properties", 1, function(){
	stop();
	Simples("#nothiddendiv")
		.css("font-size", 10)
		.animate({"font-size": 20}, { duration:200, callback:function(){
				equals( this.style.fontSize, "20px", "The font-size property was animated" );
				QUnit.start();                                         
			}
		});
}); 
