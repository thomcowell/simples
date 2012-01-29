Simples.message = (function( undef ){
	var listeners = {},singleListener ={},listenerFired = {};

	return {
		/**
		 * @name Simples.message.listenFor
		 * @description to set up a listener for a specific type of callback
		 * @param {String} type the name of the listener event to listen for
		 * @param {Function} callback the method to be executed when the event is fired
		 * @returns {String} guid of the listener being bound
		 */
		on : function( type, callback, single ){
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
		/**
		 * @name Simples.message.send
		 * @description to initiate the execution of the callbacks for a given event name
		 * @param {String} type the name of the listener event being fired
		 * @param {Object|String|Number} data the message or data to be passed to callback
		 * @param {Boolean} single is this a single only fired event
		 */	
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
		/**
		 * @name Simples.message.silence
		 * @description to remove a listener for a specific type of callback
		 * @param {String} type the name of the listener event being fired
		 * @param {Function|String} callback|guid the callback bound or the guid of the callback to be removed
		 * @returns {Boolean}
		 */
		off : function( type, callback ){
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