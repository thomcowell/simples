/**
 * @private
 */
function returnFalse() {
	return false;
}
/**
 * @private
 */
function returnTrue() {
	return true;
}
/**
 * @private used to clear all events on a provided element
 */
function clearEvents( elem, type, events, handlers ){
	// check whether it is a W3C browser or not
	if ( elem.removeEventListener ) {
		// remove event listener and unregister element event
		elem.removeEventListener( type, handlers[ type ], false );
	} else if ( elem.detachEvent ) {

		elem.detachEvent( "on" + type, handlers[ type ] );
	}
	if( events && events[type] ){ delete events[ type ]; }
	if( handlers && handlers[type] ){ delete handlers[ type ]; }
}
/**
 * Simples.Event: the event constructor to provide unified event object support
 * @param {String|Event} the name or event to coerce into a Simples.Event to bridge the differences between implementations
 */
Simples.Event = function( event ){
	// Allow instantiation without the 'new' keyword
	if ( !this.isDefaultPrevented ) {
		return new Simples.Event( event );
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
};
/**
 * Simples.Event: the event constructor to provide unified event object support
 */
Simples.Event.prototype = {
	/** 
	 * Simples.Event( '*' ).preventDefault: used to prevent the browser from performing its default action
	 */
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
	/** 
	 * Simples.Event( '*' ).stopPropagation: used to stop the event from continuing its bubbling
	 */	
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
	/** 
	 * Simples.Event( '*' ).stopImmediatePropagation: used to stop the event bubbling up and any other event callbacks from being triggered on the current element
	 */	
	stopImmediatePropagation: function() {
	    this.isImmediatePropagationStopped = returnTrue;
	    this.stopPropagation();
	},
	/** 
	 * Simples.Event( '*' ).isDefaultPrevented: used to determine wherther the event has had preventDefault called
	 */	
	isDefaultPrevented: returnFalse,
	/** 
	 * Simples.Event( '*' ).isPropagationStopped: used to determine wherther the event has had stopPropagation called
	 */	
	isPropagationStopped: returnFalse,
	/** 
	 * Simples.Event( '*' ).isImmediatePropagationStopped: used to determine wherther the event has had stopImmediatePropagation called
	 */	
	isImmediatePropagationStopped: returnFalse
};
	
Simples.Events = {
	/**
	 * Simples.Events.attach: to add the event to the provided element
	 * @param {Element} elem the element to attach the event to	
	 * @param {String} type the type of event to bind i.e. click, custom, etc
	 * @param {Function} callback the callback to bind, false can be specified to have a return false callback
	 */
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
        
		if( toString.call( callback ) === FunctionClass && canDoData( elem ) ){ 
			
			var data = Simples.data( elem ),
				events = data.events ? data.events : data.events = {},
				handlers = data.handlers ? data.handlers : data.handlers = {},
				sEvts = Simples.Events;
			
			var guid = !callback.guid ? callback.guid = sEvts.guid++ : callback.guid, 
				handler = handlers[ type ];
				
			if( !handler ){
				handler = handlers[ type ] = function( evt ){
					return Simples !== undefined ? sEvts.handler.apply( handler.elem, arguments ) : undefined;
				};
				handler.elem = elem;
				// Attach to the element
				if ( elem.addEventListener ) {

			        elem.addEventListener(type, handler, false);
			    } else if ( elem.attachEvent ) {

			        elem.attachEvent("on" + type, handler);
			    }
			}
			
			events[ type ] = events[ type ] || [];
			events[ type ].push( { callback : callback, guid : guid } );
			
		}
	},
	/**
	 * Simples.Events.detach: to remove the event from the provided element
	 * @param {Element} elem the element to detach the event from
	 * @param {String} type the type of event to unbind i.e. click, custom, etc, if no type is specifed then all events are unbound
	 * @param {Function} callback the callback to unbind, if not specified will unbind all the callbacks to this event	
	 */
	detach : function( elem, type, callback ){
		
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		if( type && type.type ){
			callback = type.handler;
			type = type.type;
		} else if ( callback === false ) {
			callback = returnFalse;
		}
		   
		var elemData = Simples.data( elem ),
			events = elemData.events,
			handlers = elemData.handlers,
			sEvts = Simples.Events;
		
		if( type === undefined ){
			for( var eventType in events ){
				sEvts.clearEvent( elem, eventType, events, handlers );
			}
		} else {
			var event = events[ type ];

			for(var i=0;i<event.length;i++){
				if( callback === undefined || callback.guid === event[i].guid ){
					event.splice( i--, 1 );
				}
			}

			if( event.length === 0 ){
				sEvts.clearEvent( elem, type, events, handlers );
			}
		}
	},
	/**
	 * Simples.Events.trigger: to trigger an event on a supplied element
	 * @param {Element} elem the element to trigger the event on
	 * @param {String} type the type of event to trigger i.e. click, custom, etc
	 * @param {Any} data the data to attach to the event	
	 */
	trigger : function( elem, type, data ){
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}
		if ( canDoData( elem ) ) {
			// Use browser event generators
			var e;
			if( elem.dispatchEvent ){
				// Build Event
				e = document.createEvent("HTMLEvents");
				e.initEvent(type, true, true); 
				if( data ){ e.data = data; }
				// Dispatch the event to the ELEMENT
				elem.dispatchEvent(e);
			} else if( elem.fireEvent ) {
				e = document.createEventObject();
				if( data ){ e.data = data; }
				e.target = elem;
				e.eventType = "on"+type;
				elem.fireEvent( "on"+type, e );
			} 
		}		                                         
	},
	/**
	 * @private properties as part of the fix process
	 */
	properties : "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
	/**
	 * @private to fix the native Event
	 */
	fix : function( event ){
		 if( event[ accessID ] ){
			return event;
		}
	    // store a copy of the original event object
	    // and "clone" to set read-only properties 
		var originalEvent = event,
			sEvts = Simples.Events;
		
		event = Simples.Event( originalEvent );

	    for (var i=sEvts.properties.length, prop; i;) {
	        prop = sEvts.properties[--i];
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
	/**
	 * @private to create a unique identifier for each event callback
	 */
	guid : 1e6,
	/**
	 * @private event handler this is bound to the elem event
	 */
	handler : function( event ){ 
		var events, callbacks;
		var args = slice.call( arguments );
		event = args[0] = Simples.Events.fix( event || window.event );
        event.currentTarget = this;

		events = Simples.data( this, "events" );
		callbacks = (events || {})[ event.type ];
         
		if( events && callbacks ){
			callbacks = callbacks.slice(0);
			
			for( var i=0,l=callbacks.length;i<l;i++){ 
				var callback = callbacks[i];
				event.handler = callback.callback;
				
				var ret = event.handler.apply( this, args );
				if( ret !== undefined ){
					event.result = ret;
					if ( ret === false ) { 
						event.preventDefault();
						event.stopPropagation();
					}
				}
				
				if ( event.isImmediatePropagationStopped() ) {
					break;
				}
			}
		}
		return event.result;
	}
};

Simples.extend({
	/**
	 * Simples( '*' ).bind: to add the event from the elements on the Simples object
	 * @param {String} type the type of event to bind i.e. click, custom, etc
	 * @param {Function} callback the callback to bind, false can be specified to have a return false callback
	 */
	bind : function( type, callback ){
		if( typeof type === STRING && ( callback === false || toString.call( callback ) === FunctionClass ) ){
			// Loop over elements    
			var attach = Simples.Events.attach,i=0,l=this.length;
			while(i<l){
				// Register each original event and the handled event to allow better detachment
				attach( this[i++], type, callback );
			}
		}
		return this;	
	},
	/**
	 * Simples( '*' ).unbind: to remove the event from the elements on the Simples object
	 * @param {String} type the type of event to unbind i.e. click, custom, etc, if no type is specifed then all events are unbound
	 * @param {Function} callback the callback to unbind, if not specified will unbind all the callbacks to this event
	 */
	unbind : function( type, callback ){
		// Loop over elements    
		var detach = Simples.Events.detach,i=0,l=this.length;
		while(i<l){
			// Register each original event and the handled event to allow better detachment    
			detach( this[i++], type, callback );
		}
		return this;
	},
	/**
	 * Simples( '*' ).trigger: to trigger an event on the elements on the Simples object
	 * @param {String} type the type of event to trigger i.e. click, custom, etc
	 * @param {Any} data the data to attach to the event
	 */
	trigger : function( type, data ){
		if( typeof type === STRING){ 
			// Loop over elements
			var trigger = Simples.Events.trigger,i=0,l=this.length;
			while(i<l){
				// Register each original event and the handled event to allow better detachment    
				trigger( this[i++], type, data );
			}
		}
		return this;
	}
});