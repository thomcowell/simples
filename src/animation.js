var FRAME_RATE = 24,
	TEST_TYPE = /padding|margin|height|width|top|left|right|bottom/;

function Animation( elem, opts ){
	if( !( elem && opts ) ){
		throw new Error('Not all options have been provided!');
	} 
	this.elem = elem;
	
	this.init( opts );
	
	return this;
}

Animation.prototype = { 
	init : function( opts ){           

		this.interval = Math.round(1000/ ( opts.frameRate || FRAME_RATE ) );
		this.frames = Math.round( ( opts.duration || 600 ) * ( ( opts.frameRate || FRAME_RATE ) / 1000 ) );
		
		// check for supported css animated features and prep for animation
		for( var key in opts.setStyle ){
			
			var opacity = key === 'opacity';
			
			this.appendString = opacity ? '' : 'px';
			
			if( ( opacity && opts.setStyle[ key ] >= 0 && opts.setStyle[ key ] <= 1 ) || TEST_TYPE.test( key ) ){
				var start = ( curCSS( elem, key ) + '' || '0').replace('px','') * 1;                                       
				this.start[ key ] = start;				
				this.delta[ key ] = ( (opts.setStyle[ key ] + '' || '0').replace('px','') * 1 ) - start;
			}
		}
		
		if( opts.manualStart !== true ){
			this.start();
		}
		
		this.init = function(){ return this; };
		
		return this;
	},
	start : function( frame ){
		
		this.frame = frame || 0;
		
		this.intervalId = setInterval( function(){      
			
			this.advance();

			if ( this.frame > this.frames ) {  
                  	this.stop();
			}
		}, this.interval );
	}, 
	stop : function(){
		clearInterval( this.intervalId );                                                      
		
		if( typeof this.callback === 'function' ){ 
			this.callback.call( this.elem ); 
		}      

		return this; 
	},  
	advance : function(){
		
		for( var key in this.start ){  
			this.elem.style[ key ] = ((this.frame /= this.frames / 2) < 1) ? this.delta[ key ] / 2 * this.frame * this.frame + this.start[ key ] : -this.delta[ key ] / 2 * ((--this.frame) * (this.frame - 2) - 1) + this.start[ key ] + this.appendString;
		}
		
		this.frame++;
	}
};    

function advanceSingle(){
   this.elem.style[ this.key ] = ((this.frame /= this.frames / 2) < 1) ? this.delta[ this.key ] / 2 * this.frame * this.frame + this.start[ key ] : -this.delta[ key ] / 2 * ((--this.frame) * (this.frame - 2) - 1) + this.start[ this.key ] + this.appendString;
}
	
Simples.merge(Simples, {
    animationDefaults: function(){
	  	
	},
    animate: function(){     
		
		return testForSimple ? new SimpleAnimation() : new Animation();
	}
});	