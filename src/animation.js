var FRAME_RATE = 24,
	GUID = 1e6,
	TEST_TYPE = /padding|margin|height|width|top|left|right|bottom/,
	TWEENS = {
		easing : function( frame, frameCount, start, delta) {
			return ((frame /= frameCount / 2) < 1) ? delta / 2 * frame * frame + start : -delta / 2 * ((--frame) * (frame - 2) - 1) + start;
		},
		linear : function( frame, frameCount, start, delta){
			return start + ( delta * ( frame/frameCount ));
		},
		quadratic : function( frame, frameCount, start, delta ){
			return start + (((Math.cos((frame/frameCount)*Math.PI) )/2) * delta );
		}
	};   

var AnimationController = {
	animations : {},
	length : 0,
	timerID : null,
	cycle : false,    
	last : 0,
	interval : Math.round( 1000/ FRAME_RATE ),
	start : function( animation ){
		if( !hasOwn.call( this.animations, animation._id ) ){
			this.length++;
			this.animations[ animation._id ] = animation;
		}
		
		if( !this.timerID ){
			this.interval = Math.round( 1000/ FRAME_RATE );
			this.timerID = window.setInterval( AnimationController.step, this.interval );
			this.step();
		}
	},
	step : function(){          
		if( this.length ){     
			if( this.cycle ){
				for( var id in this.animations ){
					this.animations[ id ]._frame++;
				}
			} else {
				this.cycle = true;
				for( di in this.animations ){
					this.animations[ di ].step();
				}
				this.cycle = false;
			}			
		} else if( this.timerID ){
			window.clearInterval( this.timerID );
			this.timerID = null;
		}
	},
	stop : function( animation ){
		if( animation ){
			if( hasOwn.call( this.animations, animation._id ) ){
				delete this.animations[ animation._id ];        
				this.length--;
			}
		}
	}
};

function Animation( elem, opts ){
	
	if( !( elem && elem.nodeType === 1 && opts ) ){
		throw new Error('Not all options have been provided!');
	}
	
	this[0] = elem; 
	this.length = 1;
	this._id = ++GUID;
	this._callback = ( typeof opts.callback === 'function' ) ? opts.callback : Simples.noop;
	this._reverse = ( opts.reverse === true ) ? this.reverse : Simples.noop;
	this._autoStart = opts.manualStart !== true;

	var frames = Math.round( ( opts.duration || 600 ) * ( FRAME_RATE / 1000 ) ), _start = {}, _delta = {}, _end = {};
	
	// check for supported css animated features and prep for animation
	for( var key in opts.setStyle ){
		
		var opacity = ( key === 'opacity' && opts.setStyle[ key ] >= 0 && opts.setStyle[ key ] <= 1 );

		if( opacity || TEST_TYPE.test( key ) ){
			_start[ key ] = ( this.css( key ) + '' || '0').replace('px','') * 1;
            _end[ key ] = (opts.setStyle[ key ] + '' || '0').replace('px','') * 1;
			_delta[ key ] = _end[ key ] - _start[ key ];
		}                                        
	}
	
	var _tween = opts.tween && TWEENS.propertyIsEnumerable( opts.tween ) ? TWEENS[ opts.tween ] : TWEENS.easing;
	this._frames = [ _start ];
	
	for(var i=0;i<=frames;i++){
		
		var css = {};
		for( var name in _start ){
			css[ name ] = _tween( i, frames, _start[ name ], _delta[ name ] );
		}
		
		this._frames.push( css );
	}
	
	this._frames.push( _end );
	
	return this._autoStart ? this.start() : this;
}

Animation.prototype = {  
	css : Simples.prototype.css,
	start : function( frame ){
		this._frame = ( typeof frame !== 'number' ) ? 0 : ( 0 < frame ? frame : this._frames.length + frame );
		AnimationController.start( this );
		
		return this;
	}, 
	stop : function(){
		
		AnimationController.stop( this );
		this._callback.call( this );
		this._reverse.call( this );
		return this; 
	},                          
	reverse : function( start ){
		this._frames.reverse();
		if( this._autoStart || start ){ this.start(); }
		
		return this;
	},
	reset : function(){
		this.css( this._frames[0] );
		
		return this;
	},
	step : function(){                                                                               
		
		this.css( this.frames[ this._frame ] );
		this._frame++;   
		
		if ( this._frame >= this._frames.length ) { this.stop(); }
		    
		return this;
	}
}; 

function CompositeAnimation( animations ){
	
	if( toString.call(animations) === ArrayClass ){
		push.apply( this, animations );
	}
	
	return this;
}

for( var key in Animation.prototype ){
	CompositeAnimation.prototype[ key ] = function(){
		for(var i=0,l=this.length;i<l;i++){
			if( this[ i ][ key ] ){
				this[ i ][ key ].apply( this[ i ], arguments );
			}
		}
		return this;
	};
}

Simples.merge(Simples, {
    animationDefaults: function( opts ){
	  	opts = opts || {};
		
		if( !AnimationController.timerID ){
			FRAME_RATE = opts.frameRate || FRAME_RATE;
		}
		
		if( opts.tweens ){
			for( var key in opts.tweens ){
				if( !hasOwn.call( TWEENS, key ) ){
					TWEENS[ key ] = opts.tweens[ key ];
				}
			}
		}
	}
});

Simples.extend({
    animate: function( opts ){
		var animations = [];
		if( opts ){		
			this.each(function(){
				animations.push( new Animation( this, opts ) );
			});
		}
		return animations.length > 1 ? new CompositeAnimation( animations ) : animations[0];
	}
});	