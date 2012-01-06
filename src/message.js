Simples.message = (function( undef ){
	var listeners = {},singleListener ={},listenerFired = {};
	return {
		listen : function( type, callback, single ){
			if( !(type && typeof callback === "function") ){ return false; }
			if( !callback.guid ){ callback.guid = "simples-guid-" + Simples.guid++; }
			if( single === true ){
				if( listenerFired[ type ] ){
					callback( listenerFired[ type ] );
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
			if( !data ){ return false; }
			var callbacks = singleListener[ type ] || listeners[ type ] || [],i=0,l=callbacks.length;
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
			if( !guid || !type || !listeners[ type ] ){ return false; }
			var callbacks = listeners[ type ],
				i=0,
				l=callbacks.length;

			while( i<l ){
				if( callbacks[i].guid == guid ){
					callbacks.splice( i, 1 );
					return true;
				}
				i++;
			}
			return false;
		},
		count : function( type ){
			if( !type ){ return 0; }
			var l = listeners[ type ] || 0, s = singleListener[ type ] || 0;
			return l + s;
		}
	};
})();