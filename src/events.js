function returnFalse() {
	return false;
}

function returnTrue() {
	return true;
}

function SimplesEvent( event ){
	// Allow instantiation without the 'new' keyword
	if ( !this.preventDefault ) {
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

var Events = {
	register : function( elem, type, original, handled ){
		if( typeof(callback) === 'function' && elem ){ 
			elem.events = elem.events || {};
			elem.events[ type ] = elem.events[ type ] || {};

			elem.events[ type ][ Events.guid++ ] = { original: original, handled: handled };
			return Events.guid;
		}
	}, 
	unregister : function( elem, type, original ){
			
		if( typeof( orignal ) !== 'function' ){
			return original;
		}
		
		var evt = elem.events[ type ];
		
		for( var key in evt ){

			if( evt[ key ].original === original ){
			
				var h = evt[ key ].handled;
				delete evt[ key ];
				return h;
			}
		}
		return original;
	},
	properties : "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
	fix : function( event ){
		
	    // store a copy of the original event object
	    // and "clone" to set read-only properties 
		var originalEvent = event;
		
		event = SimplesEvent( originalEvent );

	    for (var i=this.properties.length, prop; i;) {
	        prop = this.properties[--i];
	        event[prop] = originalEvent[prop];
	    }

	    // Fix target property, if necessary
	    if (!event.target) {
	        event.target = event.srcElement || document;
	        // Fixes #1925 where srcElement might not be defined either
	    }

	    // check if target is a textnode (safari)
	    if (event.target.nodeType === 3) {
	        event.target = event.target.parentNode;
	    }

	    // Add relatedTarget, if necessary
	    if (!event.relatedTarget && event.fromElement) {
	        event.relatedTarget = event.fromElement === event.target ? event.toElement: event.fromElement;
	    }

	    // Calculate pageX/Y if missing and clientX/Y available
	    if (event.pageX == null && event.clientX != null) {
	        var doc = document.documentElement,
	        body = document.body;
	        event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
	        event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
	    }

	    // Add which for key events
	    if (!event.which && ((event.charCode || event.charCode === 0) ? event.charCode: event.keyCode)) {
	        event.which = event.charCode || event.keyCode;
	    }

	    // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
	    if (!event.metaKey && event.ctrlKey) {
	        event.metaKey = event.ctrlKey;
	    }

	    // Add which for click: 1 === left; 2 === middle; 3 === right
	    // Note: button is not normalized, so don't use it
	    if (!event.which && event.button !== undefined) {
	        event.which = (event.button & 1 ? 1: (event.button & 2 ? 3: (event.button & 4 ? 2: 0)));
	    }

	    return event;
	},       
	guid : 1,
	handler : function( elem, callback ){ 
		
	    return function( event ) {
			event = arguments[0] = Events.fix( event || window.event );
	        callback.apply( elem, arguments );
	    };
	}
};

Simples.extend({
	bind : function( type, callback ){
	    // create a single handled callback to ensure the function ids are the as much as possible
	    var handled = Events.handler( this, callback );
		// Loop over elements 
		this.each(function(){
			// Register each original event and the handled event to allow better detachment
			var guid = Events.register( this, type, callback, handled );
			// Attach to the element
			if (this.addEventListener) {
				
		        this.addEventListener(type, handled, false);
		    } else if (elem.attachEvent) {
			
		        this.attachEvent("on" + type, handled);
		    }
		});	
	},
	unbind : function( type, callback ){
		// Loop over elements
		this.each(function(){        
			// check whether it is a W3C browser or not
			if ( this.removeEventListener ) {
				// remove event listener and unregister element event
				this.removeEventListener( type, Events.unregister( this, type, callback ), false );
			} else if ( this.detachEvent ) {                                             
				
				this.detachEvent( "on" + type, Events.unregister( this, type, callback ) );
			}
		});
	}, 
	trigger : function( type, data ){
		this.each(function(){
			var evt = this.events ? this.events[ type ] : {};
			for(var key in evt ){
				evt[ key ].handled.call( SimplesEvent({ type: type, target: this, data: data }) );
			}
		});
	}
});