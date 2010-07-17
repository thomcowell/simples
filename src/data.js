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

function addData( elem, key, value ){
	if ( canDoData( elem ) ) {
		if( !elem[ accessID ] ){
			elem[ accessID ] = elem[ accessID ] || {};
		}
		elem[ accessID ][ key ] = value;
	}	
}

function readData( elem, key ){
	if ( canDoData( elem ) ) {
		if( elem[ accessID ] ){
			return elem[ accessID ][ key ];
		}
	}
	return null;
}   

function removeData( elem, key ){
	if ( canDoData( elem ) ) {
		if( elem[ accessID ] && elem[ accessID ][ key ] ){
			delete elem[ accessID ][ key ];
		}
	}	
} 

function cleanData( elem, andSelf ){ 
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

Simples.extend({
	data : function( key, value ){   
		if( typeof key === 'string' && value !== undefined ){
			var func = value === null ? removeData : addData;
			this.each(function(){
				func( this, key, value );
			});
		} else {
			return this[0] ? readData( this[0], key ) : null;
		}
		return this;
	}
});