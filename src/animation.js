var FRAME_RATE = 24,
	TEST_TYPE = /padding|margin|height|width|top|left|right|bottom/;   
	
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
	
	this._callback = ( typeof opts.callback === 'function' ) ? opts.callback : opts.reverse ? Simples.setContext( this, this.reverse ) : null;

	this._autoStart = opts.manualStart !== true;  
	debugger;
	
	return this._autoStart ? this.start() : this;	
}         

function tween( frame, frameCount, start, delta) {
	return ((frame /= frameCount / 2) < 1) ? delta / 2 * frame * frame + start : -delta / 2 * ((--frame) * (frame - 2) - 1) + start;
};

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
		
		this._frame = typeof frame === 'number' ? frame : 0;  
		var that = this;
		
		this._intervalId = setInterval( function(){      
			
			that.advance();

			if ( that._frame > that._frames ) {  
				that.stop();
			}
		}, this._interval ); 
		
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
			this[0].style[ key ] = tween( this._frame, this._frames, this._start[ key ], this._delta[ key ] );
		}
		
		this._frame++;       
		return this;
	}
};

// function testForSimpleCSS( simple, css ){    
// 	var length = 0;
// 	
// 	if( Simples.isObject( css ) ){
// 		for( var key in css ){
// 			length++;
// 		}
// 	} else if ( typeof css === 'string' ){
// 		length = 1;
// 	}
// 	
// 	return ( length === 1 );
// }

Simples.merge(Simples, {
    animationDefaults: function( opts ){
	  	opts = opts || {};
		FRAME_RATE = opts.frameRate || FRAME_RATE;
	}
});

Simples.extend({
    animate: function( opts ){    
		return this.each(function(){     
			return new Animation( this, opts );
		});                                     
	}
});	