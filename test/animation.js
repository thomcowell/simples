var t_start_anim = [], t_stop_anim = [], anim_id, test_now;

function setUpStartTime( animation, frame, frameRate ){
	animation._startTime = start = new Date().getTime() - ( animation._duration * frame / frameRate );
	return animation;
}

function clone( obj ){
	var nobj = {};
	for( var name in obj ){
		nobj[ name ] = obj[ name ];
	}
	return nobj;
}

module("Animation",{
	setup : function(){
		window.__AnimationController__ = clone( window.AnimationController ); 
		t_start_anim = []; t_stop_anim = [];
		
		window.AnimationController.start = function( animation, frame ){
			test_now = new Date().getTime();
			animation._startTime = test_now;
			animation._calledFrame = frame;
			t_start_anim.push( animation );
		};
		window.AnimationController.stop = function( animation ){
			t_stop_anim.push( animation );
		};
	},
	teardown : function(){   
		t_start_anim = []; t_stop_anim = [];
		Simples('#test-area').css('opacity', 1 );
		window.AnimationController = clone( window.__AnimationController__ );
		window.__AnimationController__ = null;
	}
});

test("Animation contructor checks defaults", 8, function() {                                                 
	
	equal( Animation( Simples('#test-area')[0] ), null, "should not return a animation object" );
	
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} );
	
	equal( anim._duration, 600, "should have x frames" );
	ok( !anim._reverse, "should set to reverse to false" );
	ok( anim._autoStart, "should autoStart animation" );
	equal( typeof anim._callback, "function", "should always set a callback function" );
	same( anim._start, {opacity:1}, "should have the start state as first frame" );
	same( anim._finish, {opacity:0}, "should have the start state as first frame" );
	equal( anim._id, AnimationController.guid - 1, "should have an id" );
});

test("Animation contructor checks opts", 7, function() {                                                 

	var anim = Animation( Simples('#test-area')[0], {'opacity': 0}, {reverse:true, manualStart:true, duration:1000});
	
	equal( anim._duration, 1000, "should have duration" );
	ok( anim._reverse, "should set to reverse to false" );
	ok( !anim._autoStart, "should autoStart animation" );
	equal( typeof anim._callback, "function", "should always set a callback function" );
	same( anim._start, {opacity:1}, "should have the start state as first frame" );
	same( anim._finish, {opacity:0}, "should have the start state as first frame" );  
	equal( anim._id, AnimationController.guid - 1, "should have an id" );
});

test("Animation.start()", 5, function() {
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} );
 
   	// set correct context
	anim._startTime = undefined; t_start_anim = [];
	anim.start();
	equal( anim._startTime, test_now, "should set the startTime");
	same( anim, t_start_anim[0], "should call AnimationController.start");
	
	anim._startTime = undefined; t_start_anim = [];
	anim.start( 6 );
	equal( anim._startTime, Math.round( test_now - ( anim._duration/1000 * 6 / AnimationController.frameRate)) , "should set the startTime minus current Frame");
	equal( anim._calledFrame, 6, "should call AnimationController.start with frame");
	same( anim, t_start_anim[0], "should call AnimationController.start with animation");
});
	
test("Animation.stop()", 8, function() {
	var start, anim = Animation( Simples('#test-area')[0], {'opacity': 0}, {
		callback:function( animation ){
			ok( true, "should call callback");
			same( this, anim[0], "this should be the element" );
			same( anim, animation, "this should be the animation" );
		}
	});
	
    anim.reverse = function(){
		ok( false, 'should not call reverse' );
	};
   	// set correct context
	anim = setUpStartTime( anim, 12, 24 );
	start = anim._startTime;
	t_stop_anim = [];
	anim.stop();
	equal( anim._startTime, start, "should set the frame to 0");
	same( anim, t_stop_anim[0], "should call AnimationController.start");
	
	anim = Animation( Simples('#test-area')[0], {'opacity': 0}, { reverse:true } );
	anim.reverse = function(){
		ok( true, 'should call reverse' );
	};
   	// set correct context
	anim = setUpStartTime( anim, 4, 24 );
	start = anim._startTime;
	t_stop_anim = [];
	anim.stop();	
	
	equal( anim._startTime, start, "should set the frame to 0");
	same( anim, t_stop_anim[0], "should call AnimationController.start");
	
});

test("Animation.reverse()", 6, function() { 
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} ),
		states = [ anim._start, anim._finish ];

	anim._autoStart = true;
	t_start_anim = [];
	anim.reverse();
	same( [ anim._finish, anim._start ], states, "frames are reversed" );
	same( t_start_anim[0], anim, "should automatically call start" );
	
	anim._autoStart = false;
	t_start_anim = [];
	anim.reverse();
	same( [ anim._start, anim._finish ], states, "frames are reversed" );
	same( t_start_anim[0], undefined, "should automatically call start" );
	
	t_start_anim = [];
	anim.reverse( true );
	same( [ anim._finish, anim._start ], states, "frames are reversed" );
	same( t_start_anim[0], anim, "should automatically call start" );
});   

function testStep( anim, frameNumber, frameMax, factor ){
	var stop = false, now = new Date().getTime(), frameTime = now + ( ( frameNumber / frameMax ) * anim._duration );
	anim.stop = function(){
		ok( stop, "should "+(stop ? "": "not ")+"call stop");
	};

	if( frameNumber > frameMax ){
		stop = true;
	}
	
	anim._startTime = now;
	anim.step( frameTime );    
    
	var opacity = AnimationController.tweens.easing( Math.min( frameNumber / frameMax, 1 ) * anim._duration, anim._duration, anim._start.opacity, anim._finish.opacity - anim._start.opacity );
	equal( Math.floor( opacity * factor ) / factor, Math.floor( anim[0].style.opacity * factor ) / factor, "should set to frame opacity - "+frameNumber+" of "+frameMax );			
}

test("Animation.step()", 27, function() { 
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0}, { manualStart:true, duration:1000 } ), max = 24;
	for(var i=0;i<=max+1;i++){
		testStep( anim, i, max, 1000 );
	}
});

test("Animation.reset()", 3, function() {    
	
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0}, { manualStart:true, duration:1000 } ), factor = 1000;
	
	testStep( anim, 8, 24, factor );
	 
	anim.stop = Animation.prototype.stop;
	anim.reset();
	
	equal( t_stop_anim[0], anim, "should call stop, as not on first frame");
	equal( anim._start.opacity, anim[0].style.opacity, "set back to first frame");
});

var prefix_ = 't_comp_';

function testObject( Obj, name, type ){
 	equal( typeof Obj[ name ], type, "should have "+name+" of type "+type );
}

function createCA( count ){
	count = count > 0 ? count : 6;
	var anims = [];
	for(var i=0;i<count;i++){
		anims.push( createAnim( i ) );
	}
	return new CompositeAnimation( anims );	
}

function createAnim( id ){
	var anim = { _id: id };
	for( var name in Animation.prototype ){ (function( n, a ){
		a[n] = function(){
			window._test[ prefix_ + n ].push( a );
		};
	})( name, anim ); }
	return anim;	
} 

module("CompositeAnimation", {
	setup : function(){     
		window._test = {};
		for( var name in Animation.prototype ){
			window._test[ prefix_ + name ] = [];
		} 
	},
	teardown : function(){
		for( var name in Animation.prototype ){
			window._test[ prefix_ + name ] = null;
		}
		delete window._test;
	}
}); 

test("properly setup", 7, function(){
   	var ca = createCA( 2 );
	
	for( var name in Animation.prototype ){
		testObject( ca, name, 'function' );
	}
	testObject( ca, '0', 'object');
	testObject( ca, '1', 'object');
});

test("without passing array of animations", 6, function(){
   	var ca = new CompositeAnimation();
	
	for( var name in Animation.prototype ){
		testObject( ca, name, 'function' );
	}
	testObject( ca, '0', 'undefined');
});                                      

test("with passing Animation", 7, function(){
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} );
   	var ca = new CompositeAnimation( anim );
	
	for( var name in Animation.prototype ){
		testObject( ca, name, 'function' );
	}
	testObject( ca, '0', 'object');
	equal( ca[0]._id, anim._id, "should be the animation" );
});

test("functions", 15,function(){
   	var ca = createCA( 2 );

	for( var name in Animation.prototype ){
		ca[ name ]();
		equal( window._test[ prefix_ + name ].length, 2, name+" should have 2 animation calls" );
		for(var i=0;i<2;i++){
			equal( window._test[ prefix_ + name ][ i ]._id, i, name+" should have same id" );
		}  
	}
});

module("AnimationController", {
	setup:function(){     
		AnimationController.frameRate = 24;
		AnimationController.interval = Math.round( 1000 / 24 );
		
		for( var name in Animation.prototype ){
			Animation.prototype[ '_' + name ] = Animation.prototype[ name ];
			Animation.prototype[ name ] = function(){
				ok( true, name + " called" );
			};
		}
	},
	teardown:function(){                                                    
		for( var name in Animation.prototype ){
			Animation.prototype[ name ] = Animation.prototype[ '_' + name ];
			delete Animation.prototype[ '_' + name ];
		}
		
		window.clearInterval( AnimationController.timerID );
		AnimationController.timerID = null;
		AnimationController.animations = {};
		AnimationController.length = 0;
	}
});
test("test singleton", 8, function(){
	
	testObject( AnimationController, 'animations', 'object' );
	testObject( AnimationController, 'frameRate', 'number' );
	testObject( AnimationController, 'length', 'number' );
	testObject( AnimationController, 'interval', 'number' );
	testObject( AnimationController, 'tweens', 'object' );		
	testObject( AnimationController, 'start', 'function' );
	testObject( AnimationController, 'step', 'function' );
	testObject( AnimationController, 'stop', 'function' );
});

test("start() basics", 10, function(){
	//setup
	AnimationController._step = AnimationController.step;
	// test setup
	AnimationController.step = function(){
		ok( false, "Should not have called step" );
	};

	AnimationController.frameRate = 1;
	AnimationController.start();

	equal( AnimationController.interval, Math.round( 1000 / 24 ), "should have a default interval" );
	equal( AnimationController.timerID, undefined, "should have a frameRate of undefined" );

	var anim = Animation( Simples('#test-area')[0], {'opacity': 0 }, { manualStart:true } ),
		id = AnimationController.timerID;
		
	AnimationController.step = function(){
		ok( true, "Should have called step" );
	};

	AnimationController.start( anim );

	equal( AnimationController.length, 1, "should have one animation" );
	ok( AnimationController.timerID > id, "should start the timer" );
	equal( AnimationController.interval, 1000, "should have set the interval correctly" );   
	ok( anim._startTime > ( new Date().getTime() - 100 ), "should have correctly set the start time" );  
    
	AnimationController.frameRate = 12;
	id = AnimationController.timerID;
	AnimationController.start( anim );

	equal( AnimationController.length, 1, "should have one animation" );
	equal( AnimationController.timerID, id, "should have one timer" );
	equal( AnimationController.interval, 1000, "should have one animation" );	

	// cleanup	
	AnimationController.step = AnimationController._step;
});

test("step() thorough", 12, function(){
	window.__clearInterval__ = window.clearInterval;
	window.clearInterval = function(){
		ok( true, "should call clearInterval" );
	};
	
	AnimationController.timerID = 34324;
 	AnimationController.step();

	equal( AnimationController.timerID, undefined, "when timerID but no animations should stop timer");
   
	window.clearInterval = window.__clearInterval__; 
	
	for( var id=0;id<10;id++){
		AnimationController.animations[ id ] = createAnim( id );
		AnimationController.length = id+1;
		AnimationController.animations[ id ].step = (function(id){
			return function( now ){ 
				var current = new Date().getTime();
				ok( current+10 > now && current - 10 < now, "should call and pass now "+id );
			};
		})( id );
	}
	
	AnimationController.step();
});

test("stop() thorough", 30, function(){

	for( var id=0;id<10;id++){
		AnimationController.animations[ id ] = createAnim( id );
		AnimationController.length = id+1;
		AnimationController.animations[ id ]._startTime = new Date().getTime();
	}
	var length = 10;
	for( var i=0;i<10;i++){
		var animation = AnimationController.animations[ i ];
		AnimationController.stop( animation );
		equal( animation._startTime, undefined, "should not have a startTime" );
		equal( AnimationController.animations[ i ], undefined, "should not have a record of the animation - "+animation._id );
		equal( AnimationController.length, --length, "should decrement length" );
	}
	
}); 

module( "Simples( element ).animate()", {
   setup : function(){
		AnimationController.frameRate = 24;
		AnimationController.interval = Math.round( 1000 / 24 );
		AnimationController.guid = 1e6;
	},
	teardown: function(){
		window.clearInterval( AnimationController.timerID );
		AnimationController.timerID = null;
		AnimationController.animations = {};
		AnimationController.length = 0;
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
    debugger;
	foo.animate({});
	foo.animate({top: 10}, { duration : 100, callback:function(){
		ok( true, "Animation was properly dequeued." );
		start();
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
			start();
		},
		duration:100,
	}); 
	
	
}); 

test("animate negative height", 1, function() {
	
    stop();
    Simples("#foo").animate({ height: -100 }, {
        callback: function() {
            equals( this.offsetHeight, 0, "Verify height.");
            start();
        },
		duration : 100
    });	
});
   

// 
// test("animate duration 0", function() {
// 	expect(11);
// 	
// 	stop();
// 	
// 	var $elems = Simples([{ a:0 },{ a:0 }]), counter = 0;
// 	
// 	equals( Simples.timers.length, 0, "Make sure no animation was running from another test" );
// 		
// 	$elems.eq(0).animate( {a:1}, 0, function(){
// 		ok( true, "Animate a simple property." );
// 		counter++;
// 	});
// 	
// 	// Failed until [6115]
// 	equals( Simples.timers.length, 0, "Make sure synchronic animations are not left on Simples.timers" );
// 	
// 	equals( counter, 1, "One synchronic animations" );
// 	
// 	$elems.animate( { a:2 }, 0, function(){
// 		ok( true, "Animate a second simple property." );
// 		counter++;
// 	});
// 	
// 	equals( counter, 3, "Multiple synchronic animations" );
// 	
// 	$elems.eq(0).animate( {a:3}, 0, function(){
// 		ok( true, "Animate a third simple property." );
// 		counter++;
// 	});
// 	$elems.eq(1).animate( {a:3}, 200, function(){
// 		counter++;
// 		// Failed until [6115]
// 		equals( counter, 5, "One synchronic and one asynchronic" );
// 		start();
// 	});
// 	
// 	var $elem = Simples("<div />");
// 	$elem.show(0, function(){ 
// 		ok(true, "Show callback with no duration");
// 	});
// 	$elem.hide(0, function(){ 
// 		ok(true, "Hide callback with no duration");
// 	});
// });
// 
// test("animate hyphenated properties", function(){
// 	expect(1);
// 	stop();
// 
// 	Simples("#nothiddendiv")
// 		.css("font-size", 10)
// 		.animate({"font-size": 20}, 200, function(){
// 			equals( this.style.fontSize, "20px", "The font-size property was animated." );
// 			start();
// 		});
// });
// 
// test("animate non-element", function(){
// 	expect(1);
// 	stop();
// 
// 	var obj = { test: 0 };
// 
// 	Simples(obj).animate({test: 200}, 200, function(){
// 		equals( obj.test, 200, "The custom property should be modified." );
// 		start();
// 	});
// });
// 
// test("stop()", function() {
// 	expect(3);
// 	stop();
// 
// 	var $foo = Simples("#nothiddendiv");
// 	var w = 0;
// 	$foo.hide().width(200).width();
// 
// 	$foo.animate({ width:'show' }, 1000);
// 	setTimeout(function(){
// 		var nw = $foo.width();
// 		ok( nw != w, "An animation occurred " + nw + "px " + w + "px");
// 		$foo.stop();
// 
// 		nw = $foo.width();
// 		ok( nw != w, "Stop didn't reset the animation " + nw + "px " + w + "px");
// 		setTimeout(function(){
// 			equals( nw, $foo.width(), "The animation didn't continue" );
// 			start();
// 		}, 100);
// 	}, 100);
// });
// 
// test("stop() - several in queue", function() {
// 	expect(3);
// 	stop();
// 
// 	var $foo = Simples("#nothiddendivchild");
// 	var w = 0;
// 	$foo.hide().width(200).width();
// 
// 	$foo.animate({ width:'show' }, 1000);
// 	$foo.animate({ width:'hide' }, 1000);
// 	$foo.animate({ width:'show' }, 1000);
// 	setTimeout(function(){
// 		equals( $foo.queue().length, 3, "All 3 still in the queue" );
// 		var nw = $foo.width();
// 		ok( nw != w, "An animation occurred " + nw + "px " + w + "px");
// 		$foo.stop();
// 
// 		nw = $foo.width();
// 		ok( nw != w, "Stop didn't reset the animation " + nw + "px " + w + "px");
// 		// Disabled, being flaky
// 		//equals( $foo.queue().length, 1, "The next animation continued" );
// 		$foo.stop(true);
// 		start();
// 	}, 100);
// });
// 
// test("stop(clearQueue)", function() {
// 	expect(4);
// 	stop();
// 
// 	var $foo = Simples("#nothiddendiv");
// 	var w = 0;
// 	$foo.hide().width(200).width();
// 
// 	$foo.animate({ width:'show' }, 1000);
// 	$foo.animate({ width:'hide' }, 1000);
// 	$foo.animate({ width:'show' }, 1000);
// 	setTimeout(function(){
// 		var nw = $foo.width();
// 		ok( nw != w, "An animation occurred " + nw + "px " + w + "px");
// 		$foo.stop(true);
// 
// 		nw = $foo.width();
// 		ok( nw != w, "Stop didn't reset the animation " + nw + "px " + w + "px");
// 
// 		equals( $foo.queue().length, 0, "The animation queue was cleared" );
// 		setTimeout(function(){
// 			equals( nw, $foo.width(), "The animation didn't continue" );
// 			start();
// 		}, 100);
// 	}, 100);
// });
// 
// test("stop(clearQueue, gotoEnd)", function() {
// 	expect(1);
// 	stop();
// 
// 	var $foo = Simples("#nothiddendivchild");
// 	var w = 0;
// 	$foo.hide().width(200).width();
// 
// 	$foo.animate({ width:'show' }, 1000);
// 	$foo.animate({ width:'hide' }, 1000);
// 	$foo.animate({ width:'show' }, 1000);
// 	$foo.animate({ width:'hide' }, 1000);
// 	setTimeout(function(){
// 		var nw = $foo.width();
// 		ok( nw != w, "An animation occurred " + nw + "px " + w + "px");
// 		$foo.stop(false, true);
// 
// 		nw = $foo.width();
// 		// Disabled, being flaky
// 		//equals( nw, 1, "Stop() reset the animation" );
// 
// 		setTimeout(function(){
// 			// Disabled, being flaky
// 			//equals( $foo.queue().length, 2, "The next animation continued" );
// 			$foo.stop(true);
// 			start();
// 		}, 100);
// 	}, 100);
// });
// 
// test("toggle()", function() {
// 	expect(6);
// 	var x = Simples("#nothiddendiv");
// 	ok( x.is(":visible"), "is visible" );
// 	x.toggle();
// 	ok( x.is(":hidden"), "is hidden" );
// 	x.toggle();
// 	ok( x.is(":visible"), "is visible again" );
// 	
// 	x.toggle(true);
// 	ok( x.is(":visible"), "is visible" );
// 	x.toggle(false);
// 	ok( x.is(":hidden"), "is hidden" );
// 	x.toggle(true);
// 	ok( x.is(":visible"), "is visible again" );
// });
// 
// Simples.checkOverflowDisplay = function(){
// 	var o = Simples.css( this, "overflow" );
// 
// 	equals(o, "visible", "Overflow should be visible: " + o);
// 	equals(Simples.css( this, "display" ), "inline", "Display shouldn't be tampered with.");
// 
// 	start();
// }
// 
// test("JS Overflow and Display", function() {
// 	expect(2);
// 	stop();
// 	Simples.makeTest( "JS Overflow and Display" )
// 		.addClass("widewidth")
// 		.css({ overflow: "visible", display: "inline" })
// 		.addClass("widewidth")
// 		.text("Some sample text.")
// 		.before("text before")
// 		.after("text after")
// 		.animate({ opacity: 0.5 }, "slow", Simples.checkOverflowDisplay);
// });
// 		
// test("CSS Overflow and Display", function() {
// 	expect(2);
// 	stop();
// 	Simples.makeTest( "CSS Overflow and Display" )
// 		.addClass("overflow inline")
// 		.addClass("widewidth")
// 		.text("Some sample text.")
// 		.before("text before")
// 		.after("text after")
// 		.animate({ opacity: 0.5 }, "slow", Simples.checkOverflowDisplay);
// });
// 
// Simples.each( {
// 	"CSS Auto": function(elem,prop){
// 		Simples(elem).addClass("auto" + prop)
// 			.text("This is a long string of text.");
// 		return "";
// 	},
// 	"JS Auto": function(elem,prop){
// 		Simples(elem).css(prop,"auto")
// 			.text("This is a long string of text.");
// 		return "";
// 	},
// 	"CSS 100": function(elem,prop){
// 		Simples(elem).addClass("large" + prop);
// 		return "";
// 	},
// 	"JS 100": function(elem,prop){
// 		Simples(elem).css(prop,prop == "opacity" ? 1 : "100px");
// 		return prop == "opacity" ? 1 : 100;
// 	},
// 	"CSS 50": function(elem,prop){
// 		Simples(elem).addClass("med" + prop);
// 		return "";
// 	},
// 	"JS 50": function(elem,prop){
// 		Simples(elem).css(prop,prop == "opacity" ? 0.50 : "50px");
// 		return prop == "opacity" ? 0.5 : 50;
// 	},
// 	"CSS 0": function(elem,prop){
// 		Simples(elem).addClass("no" + prop);
// 		return "";
// 	},
// 	"JS 0": function(elem,prop){
// 		Simples(elem).css(prop,prop == "opacity" ? 0 : "0px");
// 		return 0;
// 	}
// }, function(fn, f){
// 	Simples.each( {
// 		"show": function(elem,prop){
// 			Simples(elem).hide().addClass("wide"+prop);
// 			return "show";
// 		},
// 		"hide": function(elem,prop){
// 			Simples(elem).addClass("wide"+prop);
// 			return "hide";
// 		},
// 		"100": function(elem,prop){
// 			Simples(elem).addClass("wide"+prop);
// 			return prop == "opacity" ? 1 : 100;
// 		},
// 		"50": function(elem,prop){
// 			return prop == "opacity" ? 0.50 : 50;
// 		},
// 		"0": function(elem,prop){
// 			Simples(elem).addClass("noback");
// 			return 0;
// 		}
// 	}, function(tn, t){
// 		test(fn + " to " + tn, function() {
// 			var elem = Simples.makeTest( fn + " to " + tn );
// 	
// 			var t_w = t( elem, "width" );
// 			var f_w = f( elem, "width" );
// 			var t_h = t( elem, "height" );
// 			var f_h = f( elem, "height" );
// 			var t_o = t( elem, "opacity" );
// 			var f_o = f( elem, "opacity" );
// 			
// 			var num = 0;
// 			
// 			if ( t_h == "show" ) num++;
// 			if ( t_w == "show" ) num++;
// 			if ( t_w == "hide"||t_w == "show" ) num++;
// 			if ( t_h == "hide"||t_h == "show" ) num++;
// 			if ( t_o == "hide"||t_o == "show" ) num++;
// 			if ( t_w == "hide" ) num++;
// 			if ( t_o.constructor == Number ) num += 2;
// 			if ( t_w.constructor == Number ) num += 2;
// 			if ( t_h.constructor == Number ) num +=2;
// 			
// 			expect(num);
// 			stop();
// 	
// 			var anim = { width: t_w, height: t_h, opacity: t_o };
// 	
// 			elem.animate(anim, 50, function(){
// 				if ( t_w == "show" )
// 					equals( this.style.display, "block", "Showing, display should block: " + this.style.display);
// 					
// 				if ( t_w == "hide"||t_w == "show" )
// 					equals(this.style.width.indexOf(f_w), 0, "Width must be reset to " + f_w + ": " + this.style.width);
// 					
// 				if ( t_h == "hide"||t_h == "show" )
// 					equals(this.style.height.indexOf(f_h), 0, "Height must be reset to " + f_h + ": " + this.style.height);
// 					
// 				var cur_o = Simples.style(this, "opacity");
// 				if ( cur_o !== "" ) cur_o = parseFloat( cur_o );
// 	
// 				if ( t_o == "hide"||t_o == "show" )
// 					equals(cur_o, f_o, "Opacity must be reset to " + f_o + ": " + cur_o);
// 					
// 				if ( t_w == "hide" )
// 					equals(this.style.display, "none", "Hiding, display should be none: " + this.style.display);
// 					
// 				if ( t_o.constructor == Number ) {
// 					equals(cur_o, t_o, "Final opacity should be " + t_o + ": " + cur_o);
// 					
// 					ok(Simples.curCSS(this, "opacity") != "" || cur_o == t_o, "Opacity should be explicitly set to " + t_o + ", is instead: " + cur_o);
// 				}
// 					
// 				if ( t_w.constructor == Number ) {
// 					equals(this.style.width, t_w + "px", "Final width should be " + t_w + ": " + this.style.width);
// 					
// 					var cur_w = Simples.css(this,"width");
// 
// 					ok(this.style.width != "" || cur_w == t_w, "Width should be explicitly set to " + t_w + ", is instead: " + cur_w);
// 				}
// 					
// 				if ( t_h.constructor == Number ) {
// 					equals(this.style.height, t_h + "px", "Final height should be " + t_h + ": " + this.style.height);
// 					
// 					var cur_h = Simples.css(this,"height");
// 
// 					ok(this.style.height != "" || cur_h == t_h, "Height should be explicitly set to " + t_h + ", is instead: " + cur_w);
// 				}
// 				
// 				if ( t_h == "show" ) {
// 					var old_h = Simples.curCSS(this, "height");
// 					Simples(elem).append("<br/>Some more text<br/>and some more...");
// 					ok(old_h != Simples.css(this, "height" ), "Make sure height is auto.");
// 				}
// 	
// 				start();
// 			});
// 		});
// 	});
// });
// 
// Simples.fn.saveState = function(){
// 	var check = ['opacity','height','width','display','overflow'];	
// 	expect(check.length);
// 	
// 	stop();
// 	return this.each(function(){
// 		var self = this;
// 		self.save = {};
// 		Simples.each(check, function(i,c){
// 			self.save[c] = Simples.css(self,c);
// 		});
// 	});
// };
// 
// Simples.checkState = function(){
// 	var self = this;
// 	Simples.each(this.save, function(c,v){
// 		var cur = Simples.css(self,c);
// 		equals( v, cur, "Make sure that " + c + " is reset (Old: " + v + " Cur: " + cur + ")");
// 	});
// 	start();
// }
// 
// // Chaining Tests
// test("Chain fadeOut fadeIn", function() {
// 	Simples('#fadein div').saveState().fadeOut('fast').fadeIn('fast',Simples.checkState);
// });
// test("Chain fadeIn fadeOut", function() {
// 	Simples('#fadeout div').saveState().fadeIn('fast').fadeOut('fast',Simples.checkState);
// });
// 
// test("Chain hide show", function() {
// 	Simples('#show div').saveState().hide('fast').show('fast',Simples.checkState);
// });
// test("Chain show hide", function() {
// 	Simples('#hide div').saveState().show('fast').hide('fast',Simples.checkState);
// });
// 
// test("Chain toggle in", function() {
// 	Simples('#togglein div').saveState().toggle('fast').toggle('fast',Simples.checkState);
// });
// test("Chain toggle out", function() {
// 	Simples('#toggleout div').saveState().toggle('fast').toggle('fast',Simples.checkState);
// });
// 
// test("Chain slideDown slideUp", function() {
// 	Simples('#slidedown div').saveState().slideDown('fast').slideUp('fast',Simples.checkState);
// });
// test("Chain slideUp slideDown", function() {
// 	Simples('#slideup div').saveState().slideUp('fast').slideDown('fast',Simples.checkState);
// });
// 
// test("Chain slideToggle in", function() {
// 	Simples('#slidetogglein div').saveState().slideToggle('fast').slideToggle('fast',Simples.checkState);
// });
// test("Chain slideToggle out", function() {
// 	Simples('#slidetoggleout div').saveState().slideToggle('fast').slideToggle('fast',Simples.checkState);
// });
// 
// Simples.makeTest = function( text ){
// 	var elem = Simples("<div></div>")
// 		.attr("id", "test" + Simples.makeTest.id++)
// 		.addClass("box");
// 
// 	Simples("<h4></h4>")
// 		.text( text )
// 		.appendTo("#fx-tests")
// 		.click(function(){
// 			Simples(this).next().toggle();
// 		})
// 		.after( elem );
// 
// 	return elem;
// }
// 
// Simples.makeTest.id = 1;
// 
// test("Simples.show('fast') doesn't clear radio buttons (bug #1095)", function () {
// 	expect(4);
//   stop();
// 
// 	var $checkedtest = Simples("#checkedtest");
// 	// IE6 was clearing "checked" in Simples(elem).show("fast");
// 	$checkedtest.hide().show("fast", function() {
//   	ok( !! Simples(":radio:first", $checkedtest).attr("checked"), "Check first radio still checked." );
//   	ok( ! Simples(":radio:last", $checkedtest).attr("checked"), "Check last radio still NOT checked." );
//   	ok( !! Simples(":checkbox:first", $checkedtest).attr("checked"), "Check first checkbox still checked." );
//   	ok( ! Simples(":checkbox:last", $checkedtest).attr("checked"), "Check last checkbox still NOT checked." );
//   	start();
// 	});
// });
// 
// test("animate with per-property easing", function(){
// 	
// 	expect(3);
// 	stop();
// 	
// 	var _test1_called = false;
// 	var _test2_called = false;
// 	var _default_test_called = false;
// 	
// 	Simples.easing['_test1'] = function() {
// 		_test1_called = true;
// 	};
// 	
// 	Simples.easing['_test2'] = function() {
// 		_test2_called = true;
// 	};
// 	
// 	Simples.easing['_default_test'] = function() {
// 		_default_test_called = true;
// 	};
// 	
// 	Simples({a:0,b:0,c:0}).animate({
// 		a: [100, '_test1'],
// 		b: [100, '_test2'],
// 		c: 100
// 	}, 400, '_default_test', function(){
// 		start();
// 		ok(_test1_called, "Easing function (1) called");
// 		ok(_test2_called, "Easing function (2) called");
// 		ok(_default_test_called, "Easing function (_default) called");
// 	});
// 	
// });
