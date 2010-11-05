var REGEX_PIXEL = /px\s?$/;

Simples.Animation = {
	animations : {},
	frameRate : 24,
	length : 0,
	guid : 1e6,
	allowTypes : /padding|margin|height|width|top|left|right|bottom|fontSize/,
	tweens : {
		easing : function( frame, frameCount, start, delta ) {
			return ((frame /= frameCount / 2) < 1) ? delta / 2 * frame * frame + start : -delta / 2 * ((--frame) * (frame - 2) - 1) + start;
		},
		linear : function( frame, frameCount, start, delta ){
			return start + ( delta * ( frame/frameCount ));
		},
		quadratic : function( frame, frameCount, start, delta ){
			return start + (((Math.cos((frame/frameCount)*Math.PI) )/2) * delta );
		}
	},  
	timerID : null,
	interval : Math.round( 1000 / this.frameRate ),
	/**
	 * @name Simples.Animation.create
	 * @description used to to create an animation object which can be used by the animation queue runner
	 * elem {Element}
	 * setStyle {Object} 
	 * opts {Object}  
	 * opts.callback {Function}
	 * opts.reverse {Boolean}
	 * opts.duration {Object}
	 */
	create : function( elem, setStyle, opts ){
		opts = opts || {};
		if ( !( elem && elem.nodeType ) || Simples.isEmptyObject( setStyle ) ) {
			if (typeof opts.callback === "function") {
				opts.callback.call(elem);
			}
			return null;
		}

		var anim = {
			0 : elem,
			id : Simples.Animation.guid++,
			callback : ( typeof opts.callback === 'function' ) ? opts.callback : Simples.noop,
			duration : ( typeof opts.duration === "number" && opts.duration > -1 ) ? opts.duration : 600,
			tween : ( typeof opts.tween === "function" ) ? opts.tween : ( Simples.Animation.tweens[ opts.tween ] || Simples.Animation.tweens.easing ),
			start : {},
			finish : {}
		};

		// check for supported css animated features and prep for animation
		for( var key in setStyle ){
			var cKey = key.replace( RDASH_ALPHA, fcamelCase ),
				opacity = ( cKey === 'opacity' && setStyle[ key ] >= 0 && setStyle[ key ] <= 1 );

			if( opacity || Simples.Animation.allowTypes.test( cKey ) ){
				anim.start[ cKey ] = ( Simples.getStyle( elem, cKey ) + '' || '0').replace(REGEX_PIXEL,'') * 1;
				anim.finish[ cKey ] = ( setStyle[ key ] + '' || '0').replace(REGEX_PIXEL,'') * 1;
			}                                        
		}

		var data = Simples.data(elem);
		data.animations = data.animations || {};
		data.animations[anim.id] = anim;

		if( opts.manualStart !== true ){
			Simples.Animation.start( anim );
		}
		return anim;
	},
	/**
	 * @name Simples.Animation.start
	 * @description used to add the animation to the animation runner queue
	 * animation {Object} animation to perform action on
	 */
	start : function( animation ){

		if( animation && animation.id ){
			if( !hasOwn.call( this.animations, animation.id ) ){
				this.length++;
				this.animations[ animation.id ] = animation;
				if( animation.duration === 0 ){
					this.stop( animation );
				} else if( !animation.startTime ){
					animation.startTime = new Date().getTime();
				}
			}
			
			if( !this.timerID ){
				this.interval = Math.round( 1000/ this.frameRate );
				this.timerID = window.setInterval(function(){ Simples.Animation._step(); }, this.interval );
			}
		}
	},
	/**
	 * @name Simples.Animation.reverse
	 * @description used to take an animation in its current position and reverse and run
	 * animation {Object} animation to perform action on
	 */
	reverse : function( animation ){
		var start = animation.start, finish = animation.finish;

		animation.start = finish;
		animation.finish = start;
		
		if( animation.startTime ){
			var now = new Date().getTime(),
				diff = now - animation.startTime;

			animation.startTime = now - ( animation.duration - diff );
			this.length--;
		} else {
			this.start( animation );
		}
	}, 
	/**
	 * @description used to reset an animation to either the start or finish position
	 * animation {Object} animation to perform action on
	 * resetToEnd {Boolean} whether to reset to finish (true) or start (false||undefined) state
	 */
	reset : function( animation, resetToEnd ){

		var cssObj = resetToEnd ? animation.finish : animation.start,
			elem = animation[0];
			
		for( var name in cssObj ){
			Simples.setStyle( elem, name, cssObj[ name ] );
		}
		
		if( animation.startTime ){
			this.stop( animation );
		}
	},
	/**
	 * @private
	 * @description a private method used by the queue runner to iterate over queued animations and update each postion
	 */
	_step : function(){
		if( this.length ){ 
			var now = new Date().getTime();    
			for( var id in this.animations ){
				var anim = this.animations[ id ],
					diff = now - anim.startTime,
					elem = anim[0],
					duration = anim.duration;
					
				if ( diff > duration ) {
					this.stop( anim, true );
				} else {
					for( var name in anim.start ){
						var start = anim.start[ name ];
						Simples.setStyle( elem, name, anim.tween( diff, duration, start, anim.finish[ name ] - start ) );
					
					}
				}
			}
		} else if( this.timerID ){
			window.clearInterval( this.timerID );
			this.timerID = null;
		}
	},
	/**
	 * @description used to stop a supplied animation and cleanup after itsef
	 * animation {Object} the animation object to use and work on.
	 * jumpToEnd {Boolean} whether to leave in current position or set css to finish position
	 */
	stop : function( animation, jumpToEnd ){
		if( animation && hasOwn.call( this.animations, animation.id ) ){

			animation.startTime = null;

			if ( jumpToEnd ){
				this.reset( animation, true );
			}

			var data = Simples.data( animation[0] );
			data.animations = data.animations || {};
			delete data.animations[ animation.id ];

			animation.callback.call(animation[0], animation);
			delete this.animations[ animation.id ];
			this.length--;
		}
	}
};

Simples.merge({
	animate : Simples.Animation.create,
	animations : function( elem, action ) {
		if( elem && Simples.Animation[ action ] ){
			var anims = Simples.data( elem, "animation" );

			if( anims && action != ("create" || "_step") ){
				for( var id in anims ){
					var anim = anims[ id ];
					Simples.Animation[ action ]( anim, arguments[2] );
				}
			}
		}
	}
});

Simples.extend({
	animations: function(action) {
		var i = this.length;
		while (i) {
			Simples.animations( this[--i], action, arguments[1] );
		}
		return this;
	},
	animate: function(css, opts) {
		var i = this.length;
		while (i) {
			Simples.animate( this[--i], css, opts );
		}
		return this;
	}
});