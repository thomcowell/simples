Simples.PubSub = (function(){
	var listeners = {},singleListener ={},listenerFired = {};
	return {
		listen : function( type, callback, single ){
			if( !(type && typeof callback === "function") ){ return false; }
			if( !callback.guid ){ callback.guid = "simples-guid-" + Simples.guid++; }
			listeners[ type ] = listeners[ type ] || [];
			listeners[ type ].push( callback );
			return callback.guid;
		},
		send : function( type, data ){
			if( !data ){ return false; }
			var callbacks = listeners[ type ] || [],i=0,l=callbacks.length;
			while( i<l ){
				callbacks[i++]( data );
			}
			return true;
		},
		stopListening : function( type, callback ){
			if( !type || typeof callback !== "function" || !callback.guid || !listeners[ type ] ){ return false; }
			var callbacks = listeners[ type ],i=0,l=callbacks.length;
			while( i<l ){
				if( callbacks[i].guid == callback.guid ){
					callbacks.splice( i, 1 );
					return true;
				}
				i++;
			}
			return false;
		}
	};
})();