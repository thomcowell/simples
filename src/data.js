var accessID = 'simples'+ new Date().getTime(),
	// The following elements throw uncatchable exceptions if you
	// attempt to add data properties to them.
	noData = {
		"embed": true,
		"object": true,
		"applet": true
	};
	
function canDoData( elem ){
	return elem && elem.nodeName && !( elem == window || noData[ elem.nodeName.toLowerCase() ] );
}

Simples.merge({
	data : function( elem, key, value ){
		if ( canDoData( elem ) && ( key === undefined || typeof key === "string" ) ) {
			var data = !elem[ accessID ] ? elem[ accessID ] = {} : elem[ accessID ];
			if( key && value !== undefined ){
				if( value !== null ){
					data[ key ] = value; 
				} else {
					delete data[ key ];
				}      
			} else if( value === undefined ){
				if( key === undefined ){
					return data;
				} else if( key ) {
					return data[ key ];
				}
			}
		}
		return null;
	},
	cleanData : function( elem, andSelf ){
		// Remove element nodes and prevent memory leaks
		var canClean = canDoData( elem );
		var elems = canClean ? slice.call( elem.getElementsByTagName("*") ) : [];
		if( canClean && andSelf !== false ){
			elems.push( elem );
		}
		var i=elems.length;
		while( i ){
			// decrement to ensure correct array position
			i--;
			if ( elems[ i ].nodeType === 1 ) {
				// Clean up the element expando
				try {
					delete elems[ i ][ accessID ];
				} catch( e ) {
					// IE has trouble directly removing the expando
					// but it's ok with using removeAttribute
					if ( elems[ i ].removeAttribute ) {
						elems[ i ].removeAttribute( accessID );
					}
				}
			}
		}
	}
});

Simples.extend({
	data : function( key, value ){   
		if( typeof key === 'string' ){
			if( value !== undefined ){
				this.each(function(){
					Simples.data( this, key, value );
				});
			} else {
				return this[0] ? Simples.data( this[0], key ) : null;
			}
		}
		return this;
	}
});