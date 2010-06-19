// Constants
var TAG = /\<(\w+)\/?\>/,
	// TAG_STRIP = /\b[\.|\#\|\[].+/g,
	FIRST_ID = /#/,
	TAG_STRIP = /\b[\.\#\|\[\=].+/g,
	SPACE_WITH_BOUNDARY = /\b\s+/g;
	
function select( selector, context ){

	var results = {
		context : context,
		selector : selector,
		elems : []
	};

    if ( typeof( selector ) === 'string' ) {
		// clean up selector           
        selector = selector.replace( TAG_STRIP, '');
		// get last id in selector
		var index = selector.lastIndexOf( FIRST_ID );
		selector = selector.substring( index > 0 ? index : 0 );
		// check selector if structured to create element
		var tag = TAG.exec( selector );
		if( tag !== null && tag.length > 1 ){

			results.context = document;
			results.selector = tag[0];
            results.elems = [ document.createElement( tag[1] ) ];
		} else {
			results.selector = selector;
			results.context = context = selector.indexOf('#') === 0 ? document : ( context || document );

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
	tag = selector.substring(1);

	if ( selector.indexOf('#') === 0) {
        // Native function
		var id = document.getElementById( tag ); 
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
		return slice.call( context.getElementsByTagName( selector ), 0 );
	}
}