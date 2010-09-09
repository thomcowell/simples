(function( Simples ){   
	
	// Test to determine whether the checking of time each tween or for each group/step
	// Browser 	| each:group over 2000ms count
	// Safari 	| ~290100:~439500                      

	var elements = Simples('.row'), start = {opacity:1}, end = { opacity:0 }, duration = 2000, 
		startTime, tween = AnimationController.tweens.easing, counter, now; 

	perfTester.log( '<strong>Testing of animation tweening - <em>'+duration+'</em> milliseconds</strong>' );
	
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
		return 'Testing <span class="duration">'+duration+' ms</span> <span class="">new Date().getTime() for each loop</span> - <span class="count">'+counter+' times</span>'; 
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
    
		return 'Testing <span class="duration">'+duration+' ms</span> <span class="">new Date().getTime() for each change</span> - <span class="count">'+counter+' times</span>';
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
    
		return 'Testing <span class="duration">'+duration+' ms</span> <span class="">new Date().getTime() for each loop</span> - <span class="count">'+counter+' times</span>';
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
    
		return 'Testing <span class="duration">'+duration+' ms</span> <span class="">new Date().getTime() for each change</span> - <span class="count">'+counter+' times</span>';
	});
	
})( Simples ); 