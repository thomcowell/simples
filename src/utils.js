Simples.merge( Simples, {
	setContext : function( context, func ){
		return function(){
			return func.apply( context, arguments );
		};
	},
	noop : function(){},
	isArray : function( obj ){ 
		if( !obj ){ return false; }
		return ( obj.constructor === Array );
	},
	isObject : function( obj ){
		if( !obj ){ return false; }
		return ( obj.toString() === '[object Object]' );
	}
});