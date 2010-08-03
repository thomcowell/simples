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
	interval : Math.round( 1000 / this.frameRate ),
	start : function( animation, frame ){                            

		if( animation && animation instanceof Animation ){ 
			if( !hasOwn.call( this.animations, animation._id ) ){
				this.length++;
				this.animations[ animation._id ] = animation; 
				animation._startTime = new Date().getTime() - ( typeof frame !== 'number' ||  0 < frame ) ? 0 : frame / this._duration / 1000 * AnimationController.frameRate;
			}
 			
			if( !this.timerID ){
				this.interval = Math.round( 1000/ this.frameRate );
				this.timerID = window.setInterval( AnimationController.step, this.interval );
				this.step();
			}
		}
	},
	step : function(){          
		if( this.length ){ 
			var now = new Date().getTime();    
			for( var id in this.animations ){
				this.animations[ id ].step( now );
			}   	       
		} else if( this.timerID ){
			window.clearInterval( this.timerID );
			this.timerID = null;
		}
	},
	stop : function( animation ){
		if( animation && hasOwn.call( this.animations, animation._id ) ){
			delete animation._startTime;
			delete this.animations[ animation._id ];        
			this.length--;
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
	this._duration = ( opts.duration || 600 );
	this._tween = AnimationController.tweens[ opts.tween ] || AnimationController.tweens.easing;
	this._start = {};
	this._finish = {};	
	
	// check for supported css animated features and prep for animation
	for( var key in setStyle ){
		
		var opacity = ( key === 'opacity' && setStyle[ key ] >= 0 && setStyle[ key ] <= 1 );

		if( opacity || AnimationController.allowTypes.test( key ) ){
			this._start[ key ] = ( currentCSS( elem, key ) + '' || '0').replace('px','') * 1;
			this._finish[ key ] = ( setStyle[ key ] + '' || '0').replace('px','') * 1;
		}                                        
	}
	
	return this._autoStart ? this.start() : this;
}

Animation.prototype = {
	start : function( frame ){
		AnimationController.start( this, frame );
		
		return this;
	}, 
	stop : function(){
		
		AnimationController.stop( this );
		this._callback.call( this[0], this );
		
		return this._reverse ? this.reverse() : this; 
	},                          
	reverse : function( shouldStart ){
		var start = this._start, finish = this._finish;

		this._start = finish;
		this._finish = start;

		if( this._autoStart || shouldStart ){ this.start(); }
		
		return this;
	},
	reset : function(){
		
		if( this._startTime ){
			this.stop();
		}

		for( var name in this._start ){
			setStyle( this[0], name, this._start[ name ] );
		}

		return this;
	},
	step : function( now ){
		now = ( now || new Date().getTime() ) - this._startTime;
		
		for( var name in this._start ){
			setStyle( this[0], name, this._tween( now > this._duration ? this._duration : now, this._duration, this._start[ name ], this._finish[ name ] - this._start[ name ] ) );
		}
		
		if ( now > this._duration ) {

			this.stop();
		} 

		return this;
	}
}; 

function CompositeAnimation( animations ){
	if( animations instanceof Animation ){
		animations = [ animations ];
	}
	if( toString.call(animations) === ArrayClass ){
		push.apply( this, animations );
	}
	
	return this;
}

for( var key in Animation.prototype ){
	CompositeAnimation.prototype[ key ] = (function( name ){ 
		return function(){
			for(var i=0,l=this.length;i<l;i++){
				if( this[ i ][ name ] ){
					this[ i ][ name ].apply( this[ i ], arguments );
				}
			}
			return this;
		};
	})( key );
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
				// debugger;
				var anim = Animation( this, css, opts );
				if( anim ){
					animations.push( anim );
				}
			});
		}
		return animations.length > 1 ? new CompositeAnimation( animations ) : animations[0];
	}
});	