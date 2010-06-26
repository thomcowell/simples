// Constants
var TAG = /\<(\w+)\s?\/?\>/,
	// TAG_STRIP = /\b[\.|\#\|\[].+/g, 
	// TAG_STRIP = /\b(\.|\#|\[)|(\=?<!(name))(.)*/, /(?:\w+)\b((\.|\#|\[)|(\=?>!(name)))(.)*/, /(?:\w+)\b[\.|\#|\[]{1}.*/g,
	FIRST_ID = '#',
	TAG_STRIP = /\b[\.\#\|\[\=].+/g,
	SPACE_WITH_BOUNDARY = /\b\s+/g,
	COMMA_WITH_BOUNDARY = /\s?\,\s?/g;
	
function SimplesSelector( selector, context ){

	var results = {
		context : context,
		selector : selector,
		elems : []
	};

    if ( typeof( selector ) === 'string' ) {
		// if it is a multi select split and short cut the process
		if( COMMA_WITH_BOUNDARY.test( selector ) ){ 

			var get = selector.split( COMMA_WITH_BOUNDARY ), els = [];

			for(var x=0,y=get.length;x<y;x++){
				
				els = els.concat( SimplesSelector( get[x], context ).elems );
			}
            // return interface
			return {
				context : ( context && context.nodeType === 9 ? context : document ),
				selector : selector,
				elems : els
			};
		}
		// clean up selector           
        selector = selector.replace( TAG_STRIP, '');
		// get last id in selector 
		var index = selector.lastIndexOf( FIRST_ID );
		selector = selector.substring( index > 0 ? index : 0 );
		// check selector if structured to create element
		var tag = TAG.exec( selector );
		if( tag !== null && tag.length > 1 ){
			return {
				context : document,
				selector : tag[0],
				elems : [ document.createElement( tag[1] ) ]
			};
		} else { 
			// reset the selector to one used
			results.selector = selector;
			// allow another document to be used for context where getting by id
			results.context = context = selector.indexOf('#') === 0 ? ( context && context.nodeType === 9 ? context : document ) : ( context || document );

			var split = selector.split( SPACE_WITH_BOUNDARY );     

			for(var i=0,l=split.length;i<l;i++){           
			   	if( context.length > 0){

					var result = [];
					for(var m=0,n=context.length;m<n;m++){

						result = result.concat( getElements( split[i], context[m] ) );
					}
					context = result;
				} else {  
					context = getElements( split[i], context );
				}
			}
			results.elems = context;
		}
    }
	return results;
}

function getElements( selector, context ){

	context = context || document;
	var tag = selector.substring(1);

	if ( selector.indexOf('#') === 0) {
        // Native function
		var id = ( context && context.nodeType === 9 ? context : document ).getElementById( tag ); 
		// test to make sure id is the own specified, because of name being read as id in some browsers
		return id && id.id === tag ? [ id ] : [];

    } else if ( selector.indexOf('.') === 0) {
     	if( context.getElementsByClassName ){
            // Native function
         	return slice.call( context.getElementsByClassName( tag ), 0 );
		} else {
			// For IE which doesn't support getElementsByClassName
			var elems = context.getElementsByTagName('*'),
				nodes = [];
			// Loop over elements to test for correct class
			for(var i=0,l=elems.length;i<l;i++){
				// Detect whether this element has the class specified
				if( (" " + ( elems[i].className || elems[i].getAttribute("class") ) + " ").indexOf( tag ) > -1 ) {
					nodes.push( elems[i] );
				}
			}
			return nodes;
		} 
	} else {
		// assume that if not id or class must be tag
		var find = context.getElementsByTagName( selector );
		return find ? slice.call( find, 0 ) : [];
	}
}