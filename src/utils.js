Simples.merge( Simples, {
	setContext : function( context, func ){
		return function(){
			return func.apply( context, arguments );
		};
	},
	noop : function(){},
	isArray : function( obj ){ 
		if( !obj ){ return false; }
		return ( toString.call( obj ) === '[object Array]' );
	},
	isObject : function( obj ){
		if( !obj ){ return false; }
		return ( toString.call( obj ) === '[object Object]' );
	},
	// Do I need this?
	hasOwnProperty : function( obj, key ){
		if( !obj || ! key ){ return false; }
		return hasOwnProperty.call( obj, key );
	}
});