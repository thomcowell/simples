var FRAME_RATE = 24,
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
	
function init( opts ){

	this._interval = Math.round(1000/ ( opts.frameRate || FRAME_RATE ) );
	this._frames = Math.round( ( opts.duration || 600 ) * ( ( opts.frameRate || FRAME_RATE ) / 1000 ) );   
	this._start = {};
	this._delta = {};
	
	// check for supported css animated features and prep for animation
	for( var key in opts.setStyle ){
		
		var opacity = ( key === 'opacity' && opts.setStyle[ key ] >= 0 && opts.setStyle[ key ] <= 1 );
		
		if( opacity || TEST_TYPE.test( key ) ){

			this._appendString = opacity ? '' : 'px';

			var start = ( currentCSS( this[0], key ) + '' || '0').replace('px','') * 1;

			this._start[ key ] = start;				
			this._delta[ key ] = ( (opts.setStyle[ key ] + '' || '0').replace('px','') * 1 ) - start;
		}                                        
	}                                            
	this._tween = opts.tween && TWEENS.propertyIsEnumerable( opts.tween ) ? TWEENS[ opts.tween ] : TWEENS.easing;
	
	this._callback = ( typeof opts.callback === 'function' ) ? opts.callback : opts.reverse ? Simples.setContext( this, this.reverse ) : null;

	this._autoStart = opts.manualStart !== true; 
	
	return this._autoStart ? this.start() : this;	
}

function Animation( elem, opts ){
	if( !( elem && opts ) ){
		throw new Error('Not all options have been provided!');
	}
	
	this[0] = elem;
	this.length = 1;
	
	return init.call( this, opts );
}

Animation.prototype = { 
	start : function( frame ){
		
		this._frame = ( typeof frame === 'number' ) ? frame : 0;  
		var that = this;
		
		this._intervalId = setInterval( Simples.setContext( this, this.advance ), this._interval ); 
		
		return this;
	}, 
	stop : function(){
		
		clearInterval( this._intervalId );                                                      
		
		if( typeof this._callback === 'function' ){ 
			this._callback.call( this[0] ); 
		}      

		return this; 
	}, 
	reverse : function(){
		for( var key in this._start ){  
			
			var start = this._start[ key ];

			this._start[ key ] = start + this._delta[ key ];
			this._delta[ key ] = this._start[ key ] - start;
		}
		if( this._autoStart ){ this.start(); }
		
		return this;
	},
	advance : function(){
		
		for( var key in this._start ){
			this[0].style[ key ] = this._tween( this._frame, this._frames, this._start[ key ], this._delta[ key ] );
		}
		
		this._frame++;   
		
		if ( this._frame > this._frames ) { this.stop(); }
		    
		return this;
	}
};  


function CompositeAnimation( elems, opts ){
	this.length = 0;
	var that = this;
	
	elems.each(function(){
		that[ that.length ] = new Animation( this, opts );
		that.length++;
	});
	
	return this;
}

for( var key in Animation.prototype ){
	CompositeAnimation.prototype[ key ] = function(){
		for(var i=0,l=this.length;i<l;i++){
			this[ i ][ key ]();
		}
		return this;
	};
}

Simples.merge(Simples, {
    animationDefaults: function( opts ){
	  	opts = opts || {};
		FRAME_RATE = opts.frameRate || FRAME_RATE;
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
		if( this.length === 1){
			return new Animation( this[0], opts );
		} else {
			return new CompositeAnimation( this, opt );
		}                                
	}
});	