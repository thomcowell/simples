var t_start_anim = [], t_stop_anim = [], anim_id;
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
	};
   	// set correct context
	anim._frame = 12;
	t_stop_anim = [];
	anim.stop();
	equal( anim._frame, 12, "should set the frame to 0");
	same( anim, t_stop_anim[0], "should call AnimationController.start");
	
	anim = Animation( Simples('#test-area')[0], {'opacity': 0}, {reverse:true} );
	anim.reverse = function(){
		ok( true, 'should call reverse' );
	};
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
	};
	function testStep( frameNumber ){
		anim.step();    
		equal( anim._frame, frameNumber, "should increment the frame by one");
		var frame = anim._frames[ frameNumber ] || anim._frames[ anim._frames.length -1 ];
		equal( Math.floor( frame.opacity * factor ) / factor, Math.floor( anim[0].style.opacity * factor ) / factor, "should set to frame opacity" );
	}
	
	testStep( 4 );
	testStep( 5 );       
	anim._frame = anim._frames.length - 1;
	anim.stop = function(){
		ok( true, "should call stop");
	};
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
	var anim = { test_id: id };
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
			equal( window._test[ prefix_ + name ][ i ].test_id, i, name+" should have same id" );
		}  
	}
});

module("AnimationController", {
	setup:function(){     
		AnimationController.frameRate = 24;
		AnimationController.cycle = false;
	},
	teardown:function(){
		window.clearInterval( AnimationController.timerID );
		AnimationController.timerID = null;
		AnimationController.animations = {};
		AnimationController.length = 0;
	}
});
test("test singleton", 9, function(){
	
	testObject( AnimationController, 'animations', 'object' );
	testObject( AnimationController, 'frameRate', 'number' );
	testObject( AnimationController, 'length', 'number' );
	testObject( AnimationController, 'interval', 'number' );
	testObject( AnimationController, 'tweens', 'object' );
	testObject( AnimationController, 'cycle', 'boolean' );		
	testObject( AnimationController, 'start', 'function' );
	testObject( AnimationController, 'step', 'function' );
	testObject( AnimationController, 'stop', 'function' );
});

test("start()", function(){
	//setup 
	AnimationController._step = AnimationController.step;
	AnimationController.step = function(){
		ok( false, "Should not have called step" );
	}      
	
	AnimationController.frameRate = 1;
	AnimationController.start();
	
	ok( !AnimationController.interval, "should have a frameRate of undefined" );
	equal( AnimationController.timerID, undefined, "should have a frameRate of undefined" );
    
	var anim = Animation( Simples('#test-area')[0], {'opacity': 0 }, { manualStart:true } );
	AnimationController.step = function(){
		ok( true, "Should have called step" );
	}
	AnimationController.start( anim );
	equal( AnimationController.length, 1, "should have one animation" );
	ok( AnimationController.timerID > 5, "should have one animation" );
	equal( AnimationController.interval, 1000, "should have one animation" );  

	// cleanup	
	AnimationController.step = AnimationController._step;
});