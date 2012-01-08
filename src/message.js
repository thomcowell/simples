Simples.message = (function( undef ){
	var listeners = {},singleListener ={},listenerFired = {};

	return {
		listenFor : function( type, callback, single ){
			if( !type || typeof callback !== "function") ){ return false; }
			if( !callback.guid ){ 
				callback.guid = "simples-guid-" + Simples.guid++;
			}
			if( single === true ){
				if( listenerFired[ type ] ){
					setTimeout(function(){
						callback( listenerFired[ type ] );
					},13);
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
			var callbacks = [].push.apply( (listeners[ type ] || []).slice(0), (singleListener[ type ] || []).slice(0) ),
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
		stopListeningFor : function( type, callback ){
			var guid = typeof callback === "function" ? callback.guid : typeof callback === "string" ? callback : undef;
			if( !guid || !type || !(listeners[ type ] && listeners[ type ].length) ){ return false; }
			var callbacks = listeners[type],
				i=0,
				l=callbacks.length;

			while( i<l ){
				if( callbacks[i].guid == guid ){
					callbacks.splice( i, 1 );
				}
				i++;
			}
			if( singleListener[ type ] ){
				var singleCallbacks = singleListener[ type ],
					i = 0,
					l = singleCallbacks.length;
				while( i<l ){
					if( callbacks[i].guid == guid ){
						singleCallbackssplice( i, 1 );
						break;
					}
					i++;
				}
			}
			return false;
		},
		count : function( type ){
			if( !type ){ return 0; }
			return [].push.apply( (listeners[ type ] || []).slice(0), (singleListener[ type ] || []).slice(0) ).length;
		},
		listening : function( type, callback ){
			var guid = typeof callback === "function" ? callback.guid : typeof callback === "string" ? callback : undef;
			if( !guid || !type || !listeners[ type ] ){ return false; }
			var callbacks = [].push.apply( (listeners[ type ] || []).slice(0), (singleListener[ type ] || []).slice(0) ),
				i=0,
				l=callbacks.length;

			while( i<l ){
				if( callbacks[i].guid == guid ){
					return true;
				}
			}
			return false;
		}
	};
})();