function returnFalse() {
	return false;
}

function returnTrue() {
	return true;
}

function SimplesEvent( event ){
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof SimplesEvent) ) {
		return new SimplesEvent( event );
	}

	// Event object
	if ( event && event.type ) {
		this.originalEvent = event;
		this.type = event.type;
	// Event type
	} else {
		this.type = event;
	}
    
	// timeStamp is buggy for some events on Firefox(#3843)
	// So we won't rely on the native value
	this.timeStamp = new Date().getTime();

	// set the event to be fixed
	this[ accessID ] = true;
	// return self
	return this;   
}

SimplesEvent.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		
		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();
		}
		// otherwise set the returnValue property of the original event to false (IE)
		e.returnValue = false;
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

var SimplesEvents = {
	attach : function( elem, type, callback ){
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}
		
		if ( callback === false ) {
			callback = returnFalse;
		}
		// For whatever reason, IE has trouble passing the window object
		// around, causing it to be cloned in the process
		if ( elem.setInterval && ( elem !== window && !elem.frameElement ) ) {
			elem = window;
		}

		if( isFunction( callback ) && notNoData( elem ) ){ 
			
			var data = readData( elem, 'events' ) || {};
			
			if( !callback.guid ){
				callback.guid = ++this.guid;
				callback.handled = this.handler( callback );
			}
			
			var guid = callback.guid, 
				handled = callback.handled;
			
			data[ type ] = data[ type ] || [];
			data[ type ].push( {handler:handled, guid:guid} );
			
			addData( elem, 'events', data );
			
			// Attach to the element
			if ( elem.addEventListener ) {
				
		        elem.addEventListener(type, handled, false);
		    } else if ( elem.attachEvent ) {
			
		        elem.attachEvent("on" + type, handled);
		    }
		}
	},
	clearEvent : function( elem, type, events, callback ){
		events = events || [];
		var results = [];
		// clear out data for functions
       	for( var i=0,l=events.length;i<l;i++ ){
			if( callback === undefined || events[ i ].guid === callback.guid ){
				// check whether it is a W3C browser or not
				if ( elem.removeEventListener ) {
					// remove event listener and unregister element event
					elem.removeEventListener( type, events[ i ].handler, false );
				} else if ( elem.detachEvent ) {

					elem.detachEvent( "on" + type, events[ i ].handler );
				}
			} else {
				results.push( events[ i ] );
			}
		}
		return results;
	},
	detach : function( elem, type, callback ){
		
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}
		
		if ( callback === false ) {
			callback = returnFalse;
		}

		var data = readData( elem, 'events' ) || {};
		
		if( type && type.type ){
			callback = type.originalFn;
			type = type.type;
		}
		
		if( type === undefined ){
			for( type in data ){
				data[ type ] = this.clearEvent( elem, type, data[ type ], callback );
				if( data[ type ].length === 0 ){
					delete data[ type ];
				}
			}
		} else {
			data[ type ] = this.clearEvent( elem, type, data[ type ], callback );
			if( data[ type ].length === 0 ){
				delete data[ type ];
			}
		}

		addData( elem, 'events', data );
	},
	trigger : function( elem, type, data ){
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}
		
		if ( !(elem && elem.nodeName && !notNoData( elem ) ) ) {
			// Use browser event generators
			var e;
			if( elem.dispatchEvent ){
				// Build Event
				e = document.createEvent("HTMLEvents");
				e.initEvent(type, true, false);
				if (data){
					e.data = data;              
				}
				// Dispatch the event to the ELEMENT
				elem.dispatchEvent(e);
			} else if( elem.fireEvent ) {
				if (data){
					e = document.createEventObject();
					e.data = data;
					e.eventType = "on"+type;
				}
				elem.fireEvent( "on"+type, e );
			} 
		}		
	},
	properties : "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement originalFn keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
	fix : function( event ){
		 if( event[ accessID ] ){
			return event;
		}
	    // store a copy of the original event object
	    // and "clone" to set read-only properties 
		var originalEvent = event;
		
		event = SimplesEvent( originalEvent );

	    for (var i=this.properties.length, prop; i;) {
	        prop = this.properties[--i];
	        event[ prop ] = originalEvent[ prop ];
	    }

		// Fix target property, if necessary
		if ( !event.target ) {
			event.target = event.srcElement || document; // Fixes #1925 where srcElement might not be defined either
		}

		// check if target is a textnode (safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement ) {
			event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
		}

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var doc = document.documentElement, body = document.body;
			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add which for key events
		if ( !event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode) ) {
			event.which = event.charCode || event.keyCode;
		}

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey ) {
			event.metaKey = event.ctrlKey;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button !== undefined ) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}

	    return event;
	},       
	guid : 1e6,
	handler : function( callback ){ 
		
	    return function( event ) {

			event = arguments[0] = SimplesEvents.fix( event || window.event );
			event.originalFn = callback;

	        if ( callback.apply( this, arguments ) === false ) { 
				event.preventDefault();
				event.stopPropagation();
			}
	    };
	}
};

Simples.extend({
	bind : function( type, callback ){
		if( typeof type === "string" && ( isFunction( callback ) || callback === false ) ){
			// Loop over elements 
			this.each(function(){
				// Register each original event and the handled event to allow better detachment
				SimplesEvents.attach( this, type, callback );
			});
		}
		return this;	
	},
	unbind : function( type, callback ){
		// Loop over elements
		this.each(function(){
			// Register each original event and the handled event to allow better detachment    
			SimplesEvents.detach( this, type, callback );
		});
		return this;
	}, 
	trigger : function( type, data ){
		if( typeof type === "string"){ 
			// Loop over elements
			this.each(function(){
				// Register each original event and the handled event to allow better detachment    
				SimplesEvents.trigger( this, type, data );
			});
		}
		return this;
	}
});