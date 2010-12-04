var accessID = 'simples'+ new Date().getTime(),
	// The following elements throw uncatchable exceptions if you
	// attempt to add data properties to them.
	noData = {
		"embed": true,
		"object": true,
		"applet": true
	},
	HAS_DATASET = Simples.support.hasDataset,
	/** @private */
	canDoData = function( elem ){
		return elem && elem.nodeName && !( elem == window || noData[ elem.nodeName.toLowerCase() ] );
	},
	/** @private */
	removeHTML5Data = function( elem, key ){
		if( HAS_DATASET && elem.dataset[ key ] ){
			delete elem.dataset[ key ];
		} else if( !HAS_DATASET && elem.getAttribute('data-'+key) ){
			elem.removeAttribute('data-'+key);
		}
	},
	readHTML5Data = function( elem, key ){
		if( key ){
			return HAS_DATASET ? elem.dataset[ key ] : elem.getAttribute( "data-" + key );
		} else {
			var data = {};
			if (HAS_DATASET) {
				data = Simples.merge( data, elem.dataset );
			} else {
				var attrs = elem.attributes, i = attrs.length;
				while (i) {
					var attr = attrs[ --i ];
					if (attr.name.indexOf('data-') === 0) {
						data[attr.name.substr(5)] = attr.value;
					}
				}
			}
			return data;
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
				if( value !== null ){
					// To remove the existing data-* attribute to ensure data is the ultimate source
					removeHTML5Data( elem, key );
					data[ key ] = value;
				} else {
					// To remove the existing data-* attribute as well as the data value
					removeHTML5Data( elem, key );
					delete data[ key ];
				}      
			} else if( value === undefined ){
				if( key === undefined ){
					return Simples.merge( readHTML5Data( elem ), data );
				} else if( key ) {
					return data[ key ] || readHTML5Data( elem, key );
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