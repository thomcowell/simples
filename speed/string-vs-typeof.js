(function($){   
	
	// Test to determine whether the toString call is faster than the typeof and checks
	// Browser 	| typeof:toString per 50000 calls average ms
	// Safari 	| 62:92                      
    var test = perfTester.test;


	var toString = (function(){
		var toString = Object.prototype.toString;
                                                
  		return function( obj, klass ){
			return toString.call( obj ) === klass;
		};
	})();

	function isDomNode( obj ){ 
		return typeof obj === 'object' && ( obj.nodeType === 1 || obj.nodeType === 9 );
	}
	
	function isNodeList( obj ){ 
		return typeof obj === 'object' && obj.item;
	}
	
	function isFunction( obj ){ 
		return typeof obj === 'function';
	}                                   
	
	function isArray( obj ){ 
		return typeof obj === 'object'  && obj.length && obj.push;
	} 
	
	function isObject( obj ){ 
		return typeof obj === 'object' && obj !== null && !obj.length;
	}
	
	function isWindow( obj ){
		return ( obj.setInterval ) ? true : false;
	}
	
	var count = 50000, 
	ArrayClass = '[object Array]',
	ObjectClass = '[object Object]',
	NodeListClass = '[object NodeList]', 
	StringClass = "[object String]", 
	NumberClass = "[object Number]",
	FunctionClass = "[object Function]",
	BooleanClass = "[object Boolean]",
	HTMLCollectionClass = "[object HTMLCollection]",
	WindowClass = "[object Window]";
	
	perfTester.write( 'Testing typeOf and toString - '+count+' times' );
	test( isObject, count, 'isObject', window, [{ham:'sandwich'}] );
	test( toString, count, 'toString - Object', window, [{ham:'sandwich'}, ObjectClass ] );
	test( isArray, count, 'isArray', window, [[1,2,3]] );
	test( toString, count, 'toString - Array', window, [[1,2,3], ArrayClass ] );
	test( isNodeList, count, 'isNodeList', window, [document.getElementsByTagName('p')] );
	test( toString, count, 'toString - NodeList', window, [document.getElementsByTagName('p'), NodeListClass] );
	test( isDomNode, count, 'isDomNode', window, [document.createElement('p')] );
	test( toString, count, 'toString - DomNode', window, [document.createElement('p'), NodeListClass] ); 
	test( isFunction, count, 'isFunction', window, [function(){}] );
	test( toString, count, 'toString - Function', window, [function(){}, FunctionClass] );		   	
	test( isWindow, count, 'isWindow', window, [window] );
	test( toString, count, 'toString - Window', window, [window, WindowClass] );
	perfTester.write();
	
})( Simples );