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
	 * elem {Element}
	 * setStyle {Object} 
	 * opts {Object}  
	 * opts.callback {Function}
	 * opts.reverse {Boolean}
	 * opts.duration {Object}
	 */
	create : function( elem, setStyle, opts ){
        opts = opts || {};
		if( !( elem && elem.nodeType ) && Simples.isEmptyObject( setStyle ) ){
			return null;
		}
		
		var anim = {
			0 : elem,
			id : Simples.Animation.guid++,
			callback : ( typeof opts.callback === 'function' ) ? opts.callback : Simples.noop,
			duration : ( typeof opts.duration === "number" && opts.duration > -1 ) ? opts.duration : 600,
			tween : typeof opts.tween === "function" ? opts.tween : ( Simples.Animation.tweens[ opts.tween ] || Simples.Animation.tweens.easing ),
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
		
		var data = Simples.data( elem, "animation" );
		data = data || {};
		data[ anim.id ] = anim;
		
		if( opts.manualStart !== true ){
			Simples.Animation.start( anim );
		}
		
		return anim;   	
	},
	/**
	 * anim {Object} animation to perform action on
	 */
	start : function( anim ){                            
		
		if( anim && anim.id ){ 
			if( !hasOwn.call( this.animations, anim.id ) ){
				this.length++;
				this.animations[ anim.id ] = anim;
				if( anim.duration === 0 ){
					this.stop( anim ); 
				} else if( !anim.startTime ){
					anim.startTime = new Date().getTime();
				}
			}
			
			if( !this.timerID ){
				this.interval = Math.round( 1000/ this.frameRate );
				this.timerID = window.setInterval(function(){ Simples.Animation.step(); }, this.interval );
			}
		}
	},
	/**
	 * anim {Object} animation to perform action on
	 */
	reverse : function( anim ){
	 	var start = anim.start, finish = anim.finish;

		anim.start = finish;
		anim.finish = start;
		
		if( anim.startTime ){
			var now = new Date().getTime(),
				diff = now - anim.startTime;

			anim.startTime = now - ( anim.duration - diff );
		}
		
		this.length--;
		this.start( anim );   
	}, 
	/**
	 * anim {Object} animation to perform action on
	 * resetToEnd {Boolean} whether to reset to finish (true) or start (false||undefined) state
	 */
	reset : function( anim, resetToEnd ){

		var cssObj = resetToEnd ? anim.finish : anim.start,
			elem = anim[0];
			
		for( var name in cssObj ){
			Simples.setStyle( elem, name, cssObj[ name ] );
		}
		
		if( anim.startTime ){
			this.stop( anim );
		}
	},
	step : function(){    
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
	stop : function( animation, jumpToEnd ){
		if( animation && hasOwn.call( this.animations, animation.id ) ){
			
			delete animation.startTime;
			
			if ( jumpToEnd ){
				this.reset( animation, true )
			}
			
			var data = Simples.data( animation[0], 'animations' ) || {};
			delete data[ animation.id ];

			animation.callback.call( animation[0], animation )

			delete this.animations[ animation.id ];  
			this.length--;
		}
	}
};

Simples.merge({
	animate : Simples.Animation.create,
	animation : function( elem, name, opts ){
		if( elem && name && Simples.Animation[ name ] ){
			var anims = Simples.data( elem, "animation" ); 

			for( var id in anims ){ 
				var anim = anims[ id ];
				Simples.Animation[ name ]( anim, opts );
			}
		}
	}
});

if( Simples.buildInstanceWrapper ){
	(function( Simples ){
		var animActions = ['stop','reverse','reset'],
			extendObj = {};  
	
		function create( name ){
	     	extendObj[ name ] = function(){
				var i=this.length;
				while( i ){
					Simples.animation( this[ --i ], name, opt );
				}
				return this;		
			};
		}
	
		for(var i=0,l=animActions.length;i<l;i++){
			create( animActions[i] );
		}
		
		Simples.fn.animate = function( css, opts ){
			var i=this.length;
			while( i ){
				Simples.animate( this[ --i ], css, opts );
			}
			return this;			
		};
		
		Simples.extend( extendObj );
	
	})( Simples );
}