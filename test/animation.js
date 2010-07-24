var t_start_anim = [], t_stop_anim = [];
module("Animation",{
	setup : function(){
		window.__AnimationController__ = window.AnimationController; 
		t_start_anim = []; t_stop_anim = [];
		window.AnimationController.start = function(){
			t_start_anim.push( arguments[0] );
		};
		window.AnimationController.stop = function(){
			t_stop_anim.push( arguments[0] );
		};
	},
	teardown : function(){    
		t_start_anim = []; t_stop_anim = [];
		Simples('#test-area').css('opacity', 1 );
		window.AnimationController = window.__AnimationController__;
	}
});
var anim_id;
test("Animation contructor checks defaults", 8, function() {                                                 
	
	equal( Animation( Simples('#test-area')[0] ), null, "should not return a animation object" );
	
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} );
	
	equal( anim._frames.length, Math.floor( 600 * 24/1000 ) + 1, "should have x frames" );
	ok( !anim._reverse, "should set to reverse to false" );
	ok( anim._autoStart, "should autoStart animation" );
	equal( typeof anim._callback, "function", "should always set a callback function" );
	same( anim._frames.slice( 0 )[0], {opacity:1}, "should have the start state as first frame" );
	same( anim._frames.slice( -1 )[0], {opacity:0}, "should have the start state as first frame" );
	anim_id = anim._id;
	ok( anim._id >= 1e6, "should have an id" );
});

test("Animation contructor checks opts", 7, function() {                                                 

	var anim = Animation( Simples('#test-area')[0], {'opacity': 0}, {reverse:true, manualStart:true, duration:1000});
	
	equal( anim._frames.length, Math.floor( 1000 * 24/1000 ) + 1, "should have x frames" );
	ok( anim._reverse, "should set to reverse to false" );
	ok( !anim._autoStart, "should autoStart animation" );
	equal( typeof anim._callback, "function", "should always set a callback function" );
	same( anim._frames.slice( 0 )[0], {opacity:1}, "should have the start state as first frame" );
	same( anim._frames.slice( -1 )[0], {opacity:0}, "should have the start state as first frame" );
	ok( anim._id === anim_id + 1, "should have an id" );
});

test("Animation.start()", 2, function() {
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} );
 
   	// set correct context
	anim._frame = undefined; t_start_anim = [];
	anim.start();
	equal( anim._frame, 0, "should set the frame to 0");
	same( anim, t_start_anim[0], "should call AnimationController.start");
});
	
test("Animation.stop()", 8, function() {
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0}, {
		callback:function( animation ){
			ok( true, "should call callback");
			same( this, anim[0], "this should be the element" );
			same( anim, animation, "this should be the animation" );
		}
	});
	
    anim.reverse = function(){
		ok( false, 'should not call reverse' );
	}
   	// set correct context
	anim._frame = 12;
	t_stop_anim = [];
	anim.stop();
	equal( anim._frame, 12, "should set the frame to 0");
	same( anim, t_stop_anim[0], "should call AnimationController.start");
	
	anim = Animation( Simples('#test-area')[0], {'opacity': 0}, {reverse:true} );
	anim.reverse = function(){
		ok( true, 'should call reverse' );
	}
   	// set correct context
	anim._frame = 4;
	t_stop_anim = [];
	anim.stop();	
	
	equal( anim._frame, 4, "should set the frame to 0");
	same( anim, t_stop_anim[0], "should call AnimationController.start");
	
});

test("Animation.reverse()", 7, function() { 
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} ),
		frames = anim._frames;
			   		
	same( anim._frames, frames, "check validity of setup" );
	anim._autoStart = true;
	t_start_anim = [];
	anim.reverse();
	same( anim._frames, frames.reverse(), "frames are reversed" );
	same( t_start_anim[0], anim, "should automatically call start" );
	
	anim._autoStart = false;
	t_start_anim = [];
	anim.reverse();
	same( anim._frames, frames.reverse(), "frames are reversed" );
	same( t_start_anim[0], undefined, "should automatically call start" );
	
	t_start_anim = [];
	anim.reverse( true );
	same( anim._frames, frames.reverse(), "frames are reversed" );
	same( t_start_anim[0], anim, "should automatically call start" );
});

test("Animation.step()", 7, function() { 
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} ), factor = 1000;
	anim._frame = 3;
	anim.stop = function(){
		ok( false, "should not call stop");
	}
	function testStep( frameNumber ){
		anim.step();    
		equal( anim._frame, frameNumber, "should increment the frame by one");
		var frame = anim._frames[ frameNumber ] || anim._frames[ anim._frames.length -1 ];
		equal( Math.floor( frame.opacity * factor ) / factor, Math.floor( anim[0].style.opacity * factor ) / factor, "should set to frame opacity" );
	}
	
	testStep( 4 );
	testStep( 5 );       
	anim._frame = anim._frames.length - 1
	anim.stop = function(){
		ok( true, "should call stop");
	}
	testStep( anim._frames.length );
	
});

test("Animation.reset()", 4, function() {    
	
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0} ), factor = 1000;
	
	anim._frame = 4;
	anim.step();
	equal( Math.floor( anim._frames[5].opacity * factor ) / factor, Math.floor( anim[0].style.opacity * factor ) / factor, "should set to frame opacity" );
	
	anim.reset();
	
	equal( t_stop_anim[0], anim, "should call stop, as not on first frame");
	equal( anim._frame, 0, "set back to first frame");
	equal( Math.floor( anim._frames[0].opacity * factor ) / factor, Math.floor( anim[0].style.opacity * factor ) / factor, "should set to frame opacity" );
});

module("AnimationController");
test("AnimationController singleton", 6, function(){
   	function testObject( Obj, name, type ){
	 	equal( typeof Obj[ name ], type, "should have "+name+" of type "+type );
	}
	
	testObject( AnimationController, 'animations', 'object' );
	testObject( AnimationController, 'length', 'number' );
	testObject( AnimationController, 'cycle', 'boolean' );		
	testObject( AnimationController, 'start', 'function' );
	testObject( AnimationController, 'step', 'function' );
	testObject( AnimationController, 'stop', 'function' );
});

test("Nothing",function(){
	
});