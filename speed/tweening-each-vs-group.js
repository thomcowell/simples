(function( Simples ){   
	
	// Test to determine whether the checking of time each tween or for each group/step
	// Browser 	| each:group over 2000ms count
	// Safari 	| ~290100:~439500                      

	var elements = Simples('.row'), start = {opacity:1}, end = { opacity:0 }, duration = 2000, 
		startTime, tween = AnimationController.tweens.easing, counter, now; 

	perfTester.log( 'Testing of animation tweening - '+duration+' milliseconds' );
	
	perfTester.queueTest(function(){
		counter = 0;
		startTime = now = new Date().getTime();
		while( startTime + duration >= now ){
			counter++;      
			for( var i=0,l=elements.length;i<l;i++ ){
				now = new Date().getTime();
				Simples.setStyle( elements[i], 'opacity', tween( now - startTime, duration, start.opacity, end.opacity - start.opacity ) );
			}                      
		}
		return 'Testing of with new Date().getTime() for each tween - '+counter+' times'; 
	});
	
	perfTester.queueTest(function(){
		counter = 0;
		startTime = now = new Date().getTime();
		while( startTime + duration >= now ){
			counter++;                               
			now = new Date().getTime(); 
			for( var i=0,l=elements.length;i<l;i++ ){
				Simples.setStyle( elements[i], 'opacity', tween( now - startTime, duration, start.opacity, end.opacity - start.opacity ) );
			}                      
		}
    
		return 'Testing of with new Date().getTime() for each iteration - '+counter+' times';
	});
	
    perfTester.queueTest(function(){
		counter = 0;
		startTime = now = new Date().getTime();
		while( startTime + duration >= now ){
			counter++;                               
			now = new Date().getTime(); 
			for( var i=0,l=elements.length;i<l;i++ ){
				Simples.setStyle( elements[i], 'opacity', tween( now - startTime, duration, start.opacity, end.opacity - start.opacity ) );
			}                      
		}
    
		return 'Testing of with new Date().getTime() for each iteration - '+counter+' times';
	});
	
	perfTester.queueTest(function(){
		counter = 0;
		startTime = now = new Date().getTime();
		while( startTime + duration >= now ){
			counter++;      
			for( var i=0,l=elements.length;i<l;i++ ){
				now = new Date().getTime();
				Simples.setStyle( elements[i], 'opacity', tween( now - startTime, duration, start.opacity, end.opacity - start.opacity ) );
			}                      
		}
    
		return 'Testing of with new Date().getTime() for each tween - '+counter+' times';
	});
	
})( Simples ); 