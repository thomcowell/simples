var accessID = 'simples'+ new Date().getTime(),
	// The following elements throw uncatchable exceptions if you
	// attempt to add data properties to them.
	noData = {
		"embed": true,
		"object": true,
		"applet": true
	},
	/** @private */
	canDoData = function( elem ){
		return elem && elem.nodeName && !( elem == window || noData[ elem.nodeName.toLowerCase() ] );
	},
	/** @private */
	removeHTML5Data = function( elem, key ){
		
		var data = elem.dataset;
		
		if( data && data[ key ] ){
			delete elem.dataset[ key ];
		} else if( !data ){
			Simples.attr( elem, "data-" + key, null );
		}
	},
	/** @private */
	readHTML5Data = function( elem, key, original ){
		
		var data = elem.dataset;
		
		if( key ){
			var val = data ? data[ key ] : Simples.attr( elem, "data-" + key );
			return ( val == null || val == "" ) ? undefined : val;
		} else {
			if (!data) {
				data = {};
				var attrs = elem.attributes, i = attrs ? attrs.length : 0;
				while (i) {
					var attr = attrs[ --i ];
					if (attr.name.indexOf('data-') === 0) {
						data[attr.name.substr(5)] = attr.value;
					}
				}
			} else {
				var newData = {};
				for( var name in data ){
					newData[ name ] = data[ name ];
				}
				data = newData;
			}
			return Simples.merge( data, original || {} );
		}
	};

Simples.merge( /** @lends Simples */ {
	/**
	 * @description for the provided element you can save data to the elements dataset where a simple string or read data off of the element
	 * @param {Element} elem the element to read and manipulate dataset
	 * @param {String} key the name of the dataset to work with
	 * @param {All} value the value to write to the dataset, where value is undefined will read, where value is null will remove the key and data
	 * @returns {Object|Null|All} returns dataset object for read where no key, returns value where read and null for eveything else
	 */
	data : function( elem, key, value ){
		if ( canDoData( elem ) && ( key === undefined || typeof key === STRING ) ) {
			var data = !elem[ accessID ] ? elem[ accessID ] = {} : elem[ accessID ];

			if( key && value !== undefined ){
				// To remove the existing data-* attribute as well as the data value
				removeHTML5Data( elem, key );
				if( value !== null ){
					data[ key ] = value;
				} else {
					delete data[ key ];
				}      
			} else if( value === undefined ){
				if( !key ){
					return Simples.merge( data, readHTML5Data( elem, null, data ) );
				} else {
					var val = data[ key ];
					return typeof val === "undefined" ? readHTML5Data( elem, key ) : val;
				}
			}
		}
		return null;
	},
	/**
	 * @description for the provided element you can save data to the elements dataset where a simple string or read data off of the element
	 * @param {Element} elem the element to clean all data off of the children
	 * @param {Boolean} andSelf whether to include the provided element in with its children in the cleaning process
	 */
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

Simples.extend( /** @lends Simples.fn */ {
	/**
	 * Simples( '*' ).data: for the elements on the Simples object you can save data to the elements dataset where a simple string or read data off of the element, Simples.data for more information
	 * @param {String} key the name of the dataset to work with
	 * @param {All} value the value to write to the dataset
	 * @returns {Simples|All} returns Simples object for write and delete and the value for read
	 */	
	data : function( key, value ){   
		if( typeof key === STRING ){
			if( value !== undefined ){
				var l=this.length;
				while( l ){
					Simples.data( this[--l], key, value );
				}
			} else {
				return this[0] ? Simples.data( this[0], key ) : null;
			}
		}
		return this;
	}
});