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

function createAnim( id, elemId ){
	return {     
		0 : document.getElementById( elemId || 'test-area'),
		id: id,  
		callback : Simples.noop,
		duration : 600,
		tween : Simples.Animation.tweens.linear,
		start : { opacity : 1 },
		finish : { opacity : 0 } 
	};
}

var testArea = document.getElementById('test-area');
module("Simples.Animation", {
	setup:function(){
		window.__clearInterval__ = window.clearInterval;
		Simples.setStyle( testArea, "opacity", 1 );
		Simples.Animation.timerID = null;
		Simples.Animation.animations = {};
		Simples.Animation.length = 0;
		Simples.Animation.frameRate = 24;
		Simples.Animation.interval = Math.round( 1000 / 24 );
	},
	teardown:function(){                                                    
		window.clearInterval = window.__clearInterval__;
		window.clearInterval( Simples.Animation.timerID );
	}
});
test("test singleton", 8, function(){
	
	testObject( Simples.Animation, 'animations', 'Object' );
	testObject( Simples.Animation, 'frameRate', 'Number' );
	testObject( Simples.Animation, 'length', 'Number' );
	testObject( Simples.Animation, 'interval', 'Number' );
	testObject( Simples.Animation, 'tweens', 'Object' );		
	testObject( Simples.Animation, 'start', 'Function' );
	testObject( Simples.Animation, 'step', 'Function' );
	testObject( Simples.Animation, 'stop', 'Function' );
});

test("create()", 8, function(){
	var elem = testArea;
		
	Simples.Animation._start = Simples.Animation.start;
	Simples.Animation.start = function( anim ){
		ok( true, "expected start to be called");
		equal( anim[0], elem, "expected anim to have elem passed in" );
		equal( anim.id, Simples.Animation.guid - 1, "to have the guid assigned" );
		equal( anim.duration, 600, "should have default duration" );
		equal( anim.tween, Simples.Animation.tweens.easing, "should have default tween" );
		equal( typeof anim.callback, "function", "should always set a callback function" );
		same( anim.start, {opacity:1}, "should have the start state" );
		same( anim.finish, {opacity:0}, "should have the finish state" );
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
		equal( anim.id, Simples.Animation.guid - 1, "to have the guid assigned" );
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

test("start() basics", 9, function(){
	//setup
	Simples.Animation._step = Simples.Animation.step;
	// test setup
	Simples.Animation.step = function(){
		ok( false, "Should not have called step" );
	};

	Simples.Animation.frameRate = 1;
	Simples.Animation.start();

	equal( Simples.Animation.interval, Math.round( 1000 / 24 ), "should have a default interval" );
	equal( Simples.Animation.timerID, undefined, "should have a frameRate of undefined" );

	var anim = Simples.Animation.create( Simples('#test-area')[0], {'opacity': 0 }, { manualStart:true } ),
		id = Simples.Animation.timerID;

	Simples.Animation.start( anim );

	equal( Simples.Animation.length, 1, "should have one animation" );
	ok( Simples.Animation.timerID > id, "should start the timer" );
	equal( Simples.Animation.interval, 1000, "should have set the interval correctly" );   
	ok( anim.startTime > ( new Date().getTime() - 100 ), "should have correctly set the start time" );  
    
	Simples.Animation.frameRate = 12;
	id = Simples.Animation.timerID;
	Simples.Animation.start( anim );

	equal( Simples.Animation.length, 1, "should have one animation" );
	equal( Simples.Animation.timerID, id, "should have one timer" );
	equal( Simples.Animation.interval, 1000, "should have one animation" );	
	
	// cleanup	
	Simples.Animation.step = Simples.Animation._step;
});

test("step() thorough", 12, function(){

	window.clearInterval = function( id ){
		ok( true, "should call clearInterval" );
	};
	
	Simples.Animation.timerID = 34324;
 	Simples.Animation.step();

	equal( Simples.Animation.timerID, undefined, "when timerID but no animations should stop timer");
	
	for( var id=0;id<10;id++){
		var anim = createAnim( id );
		Simples.Animation.animations[ id ] = anim;
		Simples.Animation.length = id+1;
		anim = new Date().getTime() - 300;
	}
	
	Simples.Animation.step();
	
	for( var id=0;id<10;id++){
		var anim = Simples.Animation.animations[ id ];
		Simples.Animation.length = id+1;
		Simples.Animation.startTime = new Date().getTime() - 300;
	}
});

test("stop() thorough", 30, function(){

	for( var id=0;id<10;id++){
		Simples.Animation.animations[ id ] = createAnim( id );
		Simples.Animation.length = id+1;
		Simples.Animation.animations[ id ]._startTime = new Date().getTime();
	}
	var length = 10;
	for( var i=0;i<10;i++){
		var animation = Simples.Animation.animations[ i ];
		Simples.Animation.stop( animation );
		equal( animation._startTime, undefined, "should not have a startTime" );
		equal( Simples.Animation.animations[ i ], undefined, "should not have a record of the animation - "+animation._id );
		equal( Simples.Animation.length, --length, "should decrement length" );
	}
	
});

test("reset()", 4, function(){ 
	window.__clearInterval__ = window.clearInterval;
	window.clearInterval = function( id ){
		ok( true, "should call clearInterval" );
		window.__clearInterval__( id );
	};
	  
	for( var id=0;id<10;id++){
		Simples.Animation.animations[ id ] = createAnim( id );
		Simples.Animation.length = id+1;
		Simples.Animation.animations[ id ]._startTime = new Date().getTime();
	}
	
	Simples.Animation.timerID = 3434;
	
	Simples.Animation.reset();
	
	ok( !Simples.Animation.timerID, "should clear timerID");
	equal( Simples.Animation.length, 0, "should reset the length to 0");
	same( Simples.Animation.animations, {}, "should have an empty list of animations");
	
	window.clearInterval = window.__clearInterval__; 
}); 

module( "Simples( element ).animate()", {
   setup : function(){
		Simples.Animation.frameRate = 24;
		Simples.Animation.interval = Math.round( 1000 / 24 );
		Simples.Animation.guid = 1e6;
	},
	teardown: function(){
		window.clearInterval( Simples.Animation.timerID );
		Simples.Animation.timerID = null;
		Simples.Animation.animations = {};
		Simples.Animation.length = 0;
	}
});

test("with no properties", 2, function() {

	var divs = Simples("div"), count = 0;

	divs.animate({}, {callback: function(){
		count++;
	}});

	equals( 0, count, "Make sure that callback is called for each element in the set." );

	stop();

	var foo = Simples("#foo");

	foo.animate({});
	foo.animate({top: 10}, { duration : 100, callback:function(){
		ok( true, "Animation was properly dequeued." );
		QUnit.start();
	}});
});

test("animate(Hash, Object, Function)", 2, function() { 

	stop();
	var hash = {opacity: 'show'},
		hashCopy = clone( hash ),
		startOpacity = Simples('#foo').css('opacity');
		
	var anim = Simples('#foo').animate({opacity: 'show'}, {
		callback: function( animate ) {
			ok( !animate._start.opacity, 'Should not set opacity' ); 
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
	
	var $elems = Simples('#test-area, #nothiddendiv'), counter = 0;
	
	equals( Simples.Animation.length, 0, "Make sure no animation was running from another test" );
    
	var elem = $elems.slice(0);
	
	elem.slice(0).animate( {a:1}, { duration: 0, callback : function(){
		ok( true, "Animate a simple property." );
		counter++;
	}});
	debugger;
	var anims = elem.data('animations');
	equals( anims.length, 1, "should have 1 animation" );
	var anim = anims[0];
	equals( anim._duration, 0, "should not set default duration" );
	
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
	var elem = Simples("#nothiddendiv")
		.css("font-size", 10)
		.animate({"font-size": 20}, { duration:200, callback:function(){
				equals( this.style.fontSize, "20px", "The font-size property was animated." );
				QUnit.start();                                         
			}
		});
}); 
