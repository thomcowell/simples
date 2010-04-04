Simples.merge({
	setContext : function( context, func ){
		return function(){
			return func.apply( context, arguments );
		};
	},
	noop : function(){},
	// Do I need this?
	hasOwnProperty : function( obj, key ){
		if( !obj || ! key ){ return false; }
		return hasOwnProperty.call( obj, key );
	}
}); 

