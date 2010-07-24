var AnimationController = {
	animations : {},
	frameRate : 24,
	length : 0,
	guid : 1e6,
	allowTypes : /padding|margin|height|width|top|left|right|bottom/,
	tweens : {
		easing : function( frame, frameCount, start, delta) {
			return ((frame /= frameCount / 2) < 1) ? delta / 2 * frame * frame + start : -delta / 2 * ((--frame) * (frame - 2) - 1) + start;
		},
		linear : function( frame, frameCount, start, delta){
			return start + ( delta * ( frame/frameCount ));
		},
		quadratic : function( frame, frameCount, start, delta ){
			return start + (((Math.cos((frame/frameCount)*Math.PI) )/2) * delta );
		}
	},  
	timerID : null,
	cycle : false,
	interval : Math.round( 1000/ this.frameRate ),
	start : function( animation ){
		if( !hasOwn.call( this.animations, animation._id ) ){
			this.length++;
			this.animations[ animation._id ] = animation;
		}
		
		if( !this.timerID ){
			this.interval = Math.round( 1000/ this.frameRate );
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
 
/**
 * elem {Element}
 * setStyle {Object} 
 * opts {Object}  
 * opts.callback {Function}
 * opts.reverse {Boolean}
 * opts.manualStart {Boolean}
 * opts.duration {Object}
 */
function Animation( elem, setStyle, opts ){
	// sanity check arguments
	if( !( elem && elem.nodeType === 1 && setStyle ) ){  
		return null;
	} 
	// check instance invoked
	if( !( this instanceof Animation ) ){
		return new Animation( elem, setStyle, opts );
	}
	
	opts = opts || {}; 
	this[0] = elem; 
	this.length = 1;
	this._id = AnimationController.guid++;
	this._callback = ( typeof opts.callback === 'function' ) ? opts.callback : Simples.noop;
	this._reverse = opts.reverse === true;
	this._autoStart = opts.manualStart !== true;
	this._frames = [];

	var frames = Math.round( ( opts.duration || 600 ) * ( AnimationController.frameRate / 1000 ) ), _start = {}, _delta = {},
		_tween = AnimationController.tweens[ opts.tween ] || AnimationController.tweens.easing;
	
	// check for supported css animated features and prep for animation
	for( var key in setStyle ){
		
		var opacity = ( key === 'opacity' && setStyle[ key ] >= 0 && setStyle[ key ] <= 1 );

		if( opacity || AnimationController.allowTypes.test( key ) ){
			_start[ key ] = ( currentCSS( elem, key ) + '' || '0').replace('px','') * 1;
			_delta[ key ] = ( setStyle[ key ] + '' || '0').replace('px','') * 1 - _start[ key ];
		}                                        
	}
	
	for(var i=0;i<=frames;i++){
		
		var css = {};
		for( var name in _start ){
			css[ name ] = _tween( i, frames, _start[ name ], _delta[ name ] );
		}
		
		this._frames.push( css );
	}
	
	return this._autoStart ? this.start() : this;
}

Animation.prototype = {
	start : function( frame ){
		this._frame = ( typeof frame !== 'number' ) ? 0 : ( 0 < frame ? frame : this._frames.length + frame );
		AnimationController.start( this );
		
		return this;
	}, 
	stop : function(){
		
		AnimationController.stop( this );
		this._callback.call( this[0], this );
		
		return this._reverse ? this.reverse() : this; 
	},                          
	reverse : function( start ){
		this._frames.reverse();
		if( this._autoStart || start ){ this.start(); }
		
		return this;
	},
	reset : function(){
		var frame = this._frames[0];
		var callStop = this._frame !== 0;
		this._frame = 0;
		
		for( var name in frame ){
			setStyle( this[0], name, frame[ name ] );
		}
		
		return callStop ? this.stop() : this;
	},
	step : function(){  

		this._frame++;

		var frame = this._frames[ this._frame ] || this._frames[ this._frames.length - 1 ];
		for( var name in frame ){
			setStyle( this[0], name, frame[ name ] );
		}
		             
		if ( this._frame >= this._frames.length ) { 
			return this.stop(); 
		}
		    
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
	
		AnimationController.frameRate = opts.frameRate || AnimationController.frameRate;
		
		if( opts.tweens ){
			for( var key in opts.tweens ){
				if( !hasOwn.call( AnimationController.tweens, key ) ){
					AnimationController.tweens[ key ] = opts.tweens[ key ];
				}
			}
		}
	}
});

Simples.extend({
    animate: function( css, opts ){
		var animations = [];
		if( opts ){		
			this.each(function(){
				var anim = Animation( this, css, opts );
				if( anim ){
					animations.push( anim );
				}
			});
		}
		return animations.length > 1 ? new CompositeAnimation( animations ) : animations[0];
	}
});	