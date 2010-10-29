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
	/**
	 * elem {Element}
	 * setStyle {Object} 
	 * opts {Object}  
	 * opts.callback {Function}
	 * opts.reverse {Boolean}
	 * opts.duration {Object}
	 */
	create : function( elem, setStyle, opts ){
		var anim = {
			0 : elem,
			_id : AnimationController.guid++,
			_callback : ( typeof opts.callback === 'function' ) ? opts.callback : Simples.noop,
			_reverse : opts.reverse === true,
			_duration : ( typeof opts.duration === "number" && opts.duration > -1 ) ? opts.duration : 600,
			_tween : AnimationController.tweens[ opts.tween ] || AnimationController.tweens.easing,
			_start : {},
			_finish : {}
		};
		
		// check for supported css animated features and prep for animation
		for( var key in setStyle ){
			var cKey = key.replace( RDASH_ALPHA, fcamelCase ),
				opacity = ( cKey === 'opacity' && setStyle[ key ] >= 0 && setStyle[ key ] <= 1 );

			if( opacity || AnimationController.allowTypes.test( cKey ) ){
				anim._start[ cKey ] = ( Simples.getStyle( elem, cKey ) + '' || '0').replace(REGEX_PIXEL,'') * 1;
				anim._finish[ cKey ] = ( setStyle[ key ] + '' || '0').replace(REGEX_PIXEL,'') * 1;
			}                                        
		}
		
		var data = Simples.data( elem, "animation" );
		data = data || {};
		data[ anim._id ] = anim;
		
		AnimationController.start( anim );   	
	},
	start : function( anim ){                            
		
		if( anim && anim._id ){ 
			if( !hasOwn.call( this.animations, v._id ) ){
				this.length++;
				this.animations[ anim._id ] = anim;
				if( anim._duration === 0 ){
					this.stop( anim ); 
				} else if( !anim._startTime ){
					anim._startTime = new Date().getTime();
				}
			}    
			
			if( !this.timerID ){
				this.interval = Math.round( 1000/ this.frameRate );
				this.timerID = window.setInterval(function(){ AnimationController.step(); }, this.interval );
			}
		}
	},
	reverse : function( anim ){
	 	var start = anim._start, finish = anim._finish;

		anim._start = finish;
		anim._finish = start;
		
		if( anim._startTime ){
			anim._startTime = new Date().getTime() - Math.max( anim.duration - anim._startTime, 0 );
		}
		
		this.length--;
		this.start( anim );   
	},
	reset : function( anim, resetToEnd ){

		var cssObj = resetToEnd ? anim._finish : anim._start,
			elem = anim[0];
			
		for( var name in cssObj ){
			Simples.setStyle( elem, name, cssObj[ name ] );
		}
		this.stop( anim );
	},
	step : function(){    
		if( this.length ){ 
			var now = new Date().getTime();    
			for( var id in this.animations ){
				var anim = this.animations[ id ],
					diff = current - anim._startTime;

				for( var name in anim._start ){
					Simples.setStyle( anim[0], name, anim._tween( diff > anim._duration ? anim._duration : diff, anim._duration, anim._start[ name ], anim._finish[ name ] - anim._start[ name ] ) );
				}

				if ( diff > anim._duration ) {
					this.stop( anim );
				}
			}
		} else if( this.timerID ){
			window.clearInterval( this.timerID );
			this.timerID = null;
		}
	},
	stop : function( animation, jumpToEnd ){
		if( animation && hasOwn.call( this.animations, animation._id ) ){
			delete animation._startTime;
			
			if( animation[0] && !( animation.store || animation._reverse ) ){
				var data = Simples.data( animation[0], 'animations' ) || {};
				delete data[ animation._id ];
			}

			animation._callback.call( animation[0], animation )

			delete this.animations[ animation._id ];  
			this.length--;
		}
	}
};

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
	animation : function( elem, name, opts ){
		if( elem && AnimationController[ name ] ){
			var anims = Simples.data( elem, "animation" ); 

			for( var id in anims ){ 
				var anim = anims[ id ];
				AnimationController[ name ]( anim, opts );
			}			
		}
	}
});

Simples.extend({
	stop : function( jumpToEnd ){
		
		var i=this.length;
		while( i ){
			Simples.animation( this[ --i ], "stop", jumpToEnd );
		}
		
		return this;
	},                          
	reverse : function(){
		
		var i=this.length;
		while( i ){
			Simples.animation( this[ --i ], "reverse", jumpToEnd );
		}
		
		return this;
	},
	reset : function( resetToEnd ){
		
		var i=this.length;
		while( i ){
			Simples.animation( this[ --i ], "reset", jumpToEnd );
		}

		return this;
	},
    animate: function( css, opts ){
		if( css ){
			var i=this.length;
			while( i ){
				anim = AnimationController.create( this[--i], css, opts );
			}
		}
		return this;
	}
});	