(function( Simples ){   
	
	// Test to determine whether the toString call is faster than the typeof and checks
	// Browser 	| typeof:toString per 50000 calls average ms
	// Safari 	| 62:92                      
    var test = perfTester.test, count = 50000;

	function getElementSwitch( selector, context ){

		context = context || document;
		var tag = selector.substring(1);
	    switch( selector.charAt(0) ){
			case '#':
				// Native function
				var id = ( context && context.nodeType === 9 ? context : document ).getElementById( tag ); 
				// test to make sure id is the own specified, because of name being read as id in some browsers
				return id && id.id === tag ? [ id ] : [];  
			case '.':
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
			case '[' : 
				if( selector.indexOf('[name=') === 0 ){
					var name = selector.slice(0,5).replace(/\].+/,'');
					if( context.getElementsByName ){
						return slice.call( context.getElementsByName( name ) )
					} else {
						// For IE which doesn't support getElementsByClassName
						var elems = context.getElementsByTagName('*'),
							nodes = [];
						// Loop over elements to test for correct class
						for(var i=0,l=elems.length;i<l;i++){
							// Detect whether this element has the class specified
							if( (" " + ( elems[i].name || elems[i].getAttribute("name") ) + " ").indexOf( name ) > -1 ) {
								nodes.push( elems[i] );
							}
						}
						return nodes;					
					}				
				}
				break;
			default :
				// assume that if not id or class must be tag
				var find = context.getElementsByTagName( selector );
				return find ? slice.call( find, 0 ) : [];
		}
	}
	
	function getElementIndex( selector, context ){
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
		} else if( selector.indexOf('[name=') === 0 ){            
			var name = selector.slice(0,5).replace(/\].+/,''); 
			if( context.getElementsByName ){
				return slice.call( context.getElementsByName( name ) )
			} else {
				// For IE which doesn't support getElementsByClassName
				var elems = context.getElementsByTagName('*'),
					nodes = [];
				// Loop over elements to test for correct class
				for(var i=0,l=elems.length;i<l;i++){
					// Detect whether this element has the class specified
					if( (" " + ( elems[i].name || elems[i].getAttribute("name") ) + " ").indexOf( name ) > -1 ) {
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
	
	perfTester.log( '<strong>Testing getElementSwitch and getElementIndex - <em>'+count+'</em> times</strong>' );
	test( getElementSwitch, count, 'getElementSwitch - id', this, ['#row-element', document] );
	test( getElementIndex, count, 'getElementIndex - id', this, ['#row-element', document] );
	test( getElementSwitch, count, 'getElementSwitch - className', this, ['.cell', document] );
	test( getElementIndex, count, 'getElementIndex - className', this, ['.cell', document] );
	test( getElementSwitch, count, 'getElementSwitch - tagName', this, ['span', document] );
	test( getElementIndex, count, 'getElementIndex - tagName', this, ['span', document] );	
	test( getElementIndex, count, 'getElementIndex - id', this, ['#row-element', document] );
	test( getElementSwitch, count, 'getElementSwitch - id', this, ['#row-element', document] );
	test( getElementIndex, count, 'getElementIndex - className', this, ['.cell', document] );  
	test( getElementSwitch, count, 'getElementSwitch - className', this, ['.cell', document] );
	test( getElementIndex, count, 'getElementIndex - tagName', this, ['span', document] );		
	test( getElementSwitch, count, 'getElementSwitch - tagName', this, ['span', document] );
	
})( Simples );  