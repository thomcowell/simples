var accessID = 'simplesData',
	// The following elements throw uncatchable exceptions if you
	// attempt to add data properties to them.
	noData = {
		"embed": true,
		"object": true,
		"applet": true
	};
	
function notNoData( elem ){
	return !noData[ elem.nodeName.toLowerCase() ];
}

function addData( elem, key, value ){
	if ( elem.nodeName && notNoData( elem ) ) {
		if( !elem[ accessID ] ){
			elem[ accessID ] = elem[ accessID ] || {};
		}
		elem[ accessID ][ key ] = value;
	}	
}

function readData( elem, key ){
	if ( elem.nodeName && notNoData( elem ) ) {
		if( elem[ accessID ] ){
			return elem[ accessID ][ key ];
		}
	}
	return null;
}   

function removeData( elem, key ){
	if ( elem.nodeName && notNoData( elem ) ) {
		if( elem[ accessID ] && elem[ accessID ][ key ] ){
			delete elem[ accessID ][ key ];
		}
	}	
} 

function cleanData( elem ){
	// Clean up the element expando
	try {
		delete elem[ accessID ];
	} catch( e ) {
		// IE has trouble directly removing the expando
		// but it's ok with using removeAttribute
		if ( elem.removeAttribute ) {
			elem.removeAttribute( accessID );
		}
	}	
} 

Simples.extend({
	data : function( key, value ){   
		if( typeof key === 'string' && value !== undefined ){
			var func = value === null ? removeData : addData;
			this.each(function(){
				addData( this, key, value );
			});
		} else {
			return readData( this[0], key );
		}
		return this;
	}
});