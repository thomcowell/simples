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
	register : function( elem, type, callback ){
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

		if( typeof( callback ) === 'function' && notNoData( elem ) ){ 
			var data = readData( elem, 'events' ) || {};
			
			if( !callback.guid ){
				callback.guid = Events.guid++;
				callback.handled = this.handler( callback ); 
			}
			
			var guid = callback.guid, 
				handled = callback.handled;   

			data[ type ] = data[ type ] || [];
			data[ type ].push( {handled:handled, guid:guid} );
			
			addData( elem, 'events', data );
			
			// Attach to the element
			if ( elem.addEventListener ) {
				
		        elem.addEventListener(type, handled, false);
		    } else if ( elem.attachEvent ) {
			
		        elem.attachEvent("on" + type, handled);
		    }
			return guid; 
		}
		return;
	}, 
	unregister : function( elem, type, original ){
			
		if( typeof( orignal ) !== 'function' ){
			return elem;
		}
		
		if ( callback === false ) {
			callback = returnFalse;
		}
		
		var data = readData( elem, 'events' ) || {};
		var evt = data[ type ] || {};
		
		for( var i=0,l=evt.length;i<l;i++ ){

			if( evt[ i ].guid === original.guid ){
			
				original = evt[ i ].handled;
			    evt.splice( i, 1);
			}
		}
		
		// addData( elem, 'events', data );
		
		// check whether it is a W3C browser or not
		if ( this.removeEventListener ) {
			// remove event listener and unregister element event
			this.removeEventListener( type, original, false );
		} else if ( this.detachEvent ) {                                             
			
			this.detachEvent( "on" + type, original );
		}
	},
	properties : "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
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
	guid : 1,
	handler : function( elem, callback ){ 
		
	    return function( event ) {
			event = arguments[0] = SimplesEvents.fix( event || window.event );
	        callback.apply( this, arguments );
	    };
	}
};

Simples.extend({
	bind : function( type, callback ){
		// Loop over elements 
		this.each(function(){
			// Register each original event and the handled event to allow better detachment
			SimplesEvents.register( this, type, callback );
		});
		return this;	
	},
	unbind : function( type, callback ){
		// Loop over elements
		this.each(function(){  
			SimplesEvents.unregister( this, type, callback );
		});
		return this;
	}, 
	trigger : function( type, data ){
		this.each(function(){
			if ( !(this && this.nodeName && !notNoData( this ) ) ) { 
				
				// Trigger an inline bound script
				try {
					if ( elem[ "on" + type ] && elem[ "on" + type ].apply( elem, data ) === false ) {
						// exit as the script has return false and will not propigate any further
						return false;
					}

				// prevent IE from throwing an error for some elements with some event types, see #3533
				} catch (inlineError) {}
				// Use browser event generators
				if( this.dispatchEvent ){
					// Build Event
					var e = document.createEvent("Events");
					e.initEvent(type, true, false);
					if (data){
						e.data = data;              
					}
					// Dispatch the event to the ELEMENT
					this.dispatchEvent(e);
				} else if( this.fireEvent ) {
					var e = document.createEventObject();
					if (data){
						e.data = data;              
					}
					this.fireEvent( "on"+type, e );
				} 
			}
		});
		return this;
	}
});