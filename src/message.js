Simples.message = (function( undef ){
	var listeners = {},singleListener ={},listenerFired = {};

	return {
		listenFor : function( type, callback, single ){
			if( !type || typeof callback !== "function" ){ return false; }
			if( !callback.guid ){ 
				callback.guid = "simples-guid-" + Simples.guid++;
			}
			if( single === true ){
				if( listenerFired[ type ] ){
					setTimeout(function(){
						callback( listenerFired[ type ] );
					},0);
					return true;
				} else {
					singleListener[ type ] = singleListener[ type ] || [];
					singleListener[ type ].push( callback );
				}
			} else {
				listeners[ type ] = listeners[ type ] || [];
				listeners[ type ].push( callback );
			}
			return callback.guid;
		},
		send : function( type, data ){
			if( !type ){ return false; }
			var callbacks = (listeners[ type ] || []).slice(0).concat((singleListener[ type ] || []).slice(0) ),
				i=0,
				l=callbacks.length;
			while( i<l ){
				callbacks[i++]( data );
			}
			listenerFired[ type ] = data;
			if( singleListener[ type ] ){
				delete singleListener[ type ];
			}
			return true;
		},
		silence : function( type, callback ){
			var guid = typeof callback === "function" ? callback.guid : typeof callback === "string" ? callback : undef;
			if( !guid || !type ){ return false; }
	
			if( listeners[type] ){
				var callbacks = listeners[type],
					i=0,
					l=callbacks.length;
				while( i<l ){
					if( callbacks[i].guid == guid ){
						callbacks.splice( i, 1 );
					}
					i++;
				}
			}
			if( singleListener[ type ] ){
				var singleCallbacks = singleListener[ type ],
					m = 0,
					n = singleCallbacks.length;
				while( m<n ){
					if( singleCallbacks[m].guid == guid ){
						singleCallbacks.splice( m, 1 );
						break;
					}
					m++;
				}
			}
			return false;
		},
		count : function( type ){
			if( !type ){ return 0; }
			return (listeners[ type ] || []).slice(0).concat((singleListener[ type ] || []).slice(0) ).length;
		},
		isListening : function( type, callback ){
			var guid = typeof callback === "function" ? callback.guid : typeof callback === "string" ? callback : undef;
			if( !guid || !type ){ return false; }
			var callbacks = (listeners[ type ] || []).slice(0).concat((singleListener[ type ] || []).slice(0) ),
				i=0,
				l=callbacks.length;

			while( i<l ){
				if( callbacks[i++].guid == guid ){
					return true;
				}
			}
			return false;
		}
	};
})();