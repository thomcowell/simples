var REGEX_PIXEL = /px\s?$/,
	AnimationController = {
	animations : {},
	frameRate : 24,
	length : 0,
	guid : 1e6,
	allowTypes : /padding|margin|height|width|top|left|right|bottom|fontSize/,
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
				if( animation._duration === 0 ){
					animation.stop(); 
				} else{
					frame = ( frame > 0 ) ? ( animation._duration / AnimationController.frameRate * frame ) : 0;
					animation._startTime = new Date().getTime() - frame;
				}
			}    
			
			if( !this.timerID ){
				this.interval = Math.round( 1000/ this.frameRate );
				this.timerID = window.setInterval(function(){ AnimationController.step(); }, this.interval ); 
				if( frame > 0 ){
					animation.step( new Date().getTime() );
				}
			}
		}
	},
	reset : function(){    
		for( var id in this.animations ){
			this.stop( this.animations[ id ] );
		}
		window.clearInterval( this.timerID );
		this.timerID = null;
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
			if( animation[0] && !( animation.store || animation._reverse ) ){
				var data = animation[0].data('animations') || {};
				delete data[ animation._id ];
			}
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
	if( !( elem && elem.nodeType === 1 && setStyle && !Simples.isEmptyObject( setStyle ) ) ){  
		return null;
	} 
	// check instance invoked
	if( !( this instanceof Animation ) ){
		return new Animation( elem, setStyle, opts );
	}

	opts = opts || {};
	this[0] = elem; 
	this._id = AnimationController.guid++;
	this._callback = ( typeof opts.callback === 'function' ) ? opts.callback : Simples.noop;
	this._reverse = opts.reverse === true;
	this._autoStart = opts.manualStart !== true;
	this._duration = ( typeof opts.duration === "number" && opts.duration > -1 ) ? opts.duration : 600;
	this._tween = AnimationController.tweens[ opts.tween ] || AnimationController.tweens.easing;
	this._start = {};
	this._finish = {};	
	
	// check for supported css animated features and prep for animation
	for( var key in setStyle ){
		var cKey = key.replace( RDASH_ALPHA, fcamelCase ),
			opacity = ( cKey === 'opacity' && setStyle[ key ] >= 0 && setStyle[ key ] <= 1 );

		if( opacity || AnimationController.allowTypes.test( cKey ) ){
			this._start[ cKey ] = ( Simples.getStyle( elem, cKey ) + '' || '0').replace(REGEX_PIXEL,'') * 1;
			this._finish[ cKey ] = ( setStyle[ key ] + '' || '0').replace(REGEX_PIXEL,'') * 1;
		}                                        
	}
	
	return this._autoStart ? this.start() : this;
}

Animation.prototype = {
	start : function( frame ){

		AnimationController.start( this, frame );
		
		return this;
	}, 
	stop : function( jumpToEnd, shouldReverse ){
		
		AnimationController.stop( this );
		if( jumpToEnd ){ this.reset( true ); }
		this._callback.call( this[0], this );
		
		return shouldReverse === false ? this : ( this._reverse || shouldReverse ) ? this.reverse() : this; 
	},                          
	reverse : function( shouldStart ){
		var start = this._start, finish = this._finish;

		this._start = finish;
		this._finish = start;
		
		return shouldStart === false ? this : ( this._autoStart || shouldStart ) ? this.start() : this; 
	},
	reset : function( resetToEnd ){
		
		if( this._startTime ){
			this.stop( null, false );
		}
        var cssObj = resetToEnd ? this._finish : this._start;
		for( var name in cssObj ){
			Simples.setStyle( this[0], name, cssObj[ name ] );
		}

		return this;
	},
	step : function( now ){
		now = ( now || new Date().getTime() ) - this._startTime;
		
		for( var name in this._start ){
			Simples.setStyle( this[0], name, this._tween( now > this._duration ? this._duration : now, this._duration, this._start[ name ], this._finish[ name ] - this._start[ name ] ) );
		}
		
		if ( now > this._duration ) {

			this.stop();
		} 

		return this;
	}
}; 

function CompositeAnimation( animations ){
	var objType = toString.call(animations);
	if( animations instanceof Animation ){
		this[0] = animations; 
		this.length = 1;
	} else if( objType === ArrayClass ){
		push.apply( this, animations );
	} else if( objType === ObjectClass ){
		var id, i=0;
		for( id in animations ){
			this[i++] = animations[ id ];
		}
		this.length = i;
	}
	
	return this;
}

(function( CA ){
	function addMethod( name ){
		CA.prototype[ name ] = function(){
			for(var i=0,l=this.length;i<l;i++){
				if( this[ i ][ name ] ){
					this[ i ][ name ].apply( this[ i ], arguments );
				}
			}
			return this;
		};
	}
	
	for( var key in Animation.prototype ){
		addMethod( key );
	}
})( CompositeAnimation );

Simples.merge({
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
	},
	Animation : Animation
});

Simples.extend({
	animations : function(){
		var data = {},i=this.length;
		while( i ){
			Simples.merge( data, Simples.data( this[i--], 'animations' ) );
		}
		return new CompositeAnimation( data );
	},
    animate: function( css, opts ){
		if( css ){
			var i=this.length;
			while( i ){
				var elem = this[i--],
					anim = Animation( elem, css, opts );
				if( anim ){
					var data = Simples.data( elem );
					data = data.animations ? data.animations : data.animations = {};
					data[ anim._id ] = anim;
				}
			}
		}
		return this;
	}
});	