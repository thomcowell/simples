(function( Simples ){   
	
	// Test to determine whether the toString call is faster than the typeof and checks
	// Browser 	| typeof:toString per 50000 calls average ms
	// Safari 	| 62:92                      
    var test = perfTester.test;

	var elements = Simples('.row'), count = 5000, css = {display:"block",opacity:1,textAlign:'left'};
	
	function forThenFunction(){
		for( var name in css ){
			elements.each(function(){
				Simples.setStyle( this, name, css[name] );
			});
		}
	}
	
	function functionThenFor(){
		elements.each(function(){
			for( var name in css ){
				Simples.setStyle( this, name, css[name] );
			}
		});		
	}
	
	perfTester.write( 'Testing of looping css - '+count+' times' );
	test( forThenFunction, count, 'forThenFunction' );
	test( functionThenFor, count, 'functionThenFor' );
	test( functionThenFor, count, 'functionThenFor' );	
	test( forThenFunction, count, 'forThenFunction' );
	perfTester.write();
	
})( Simples );