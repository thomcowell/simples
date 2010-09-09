(function( Simples ){   
	
	var count = 50000,
		names = [],
		choices = {
			outer : function( location ){ return location; },
			inner : function( location ){ return location; },
			remove : function( location ){ return location; },
			unwrap : function( location ){ return location; },
			empty : function( location ){ return location; },
			top : function( location ){ return location; },
			bottom : function( location ){ return location; },
			before : function( location ){ return location; },
			after : function( location ){ return location; },
			wrap : function( location ){ return location; }
		};  

	for( var name in choices ){
		names.push( name );
	}
	
	function objectStatement( location, html ){
		var singleArg = OTHER_SINGLE_ARGUMENTS.test( location ), parent = true;
		
		if( !singleArg && arguments.length === 1 ) {
			html = location;
			location = "inner";
		}
		var choice = choices[ location ];
		if( choice ){
			return choice( html, location );
		}
	}
	
	function switchStatement( location, html ){
		var parent = true;
		switch( location ){
			case 'outer' :
				if( parent ){ location = html; }
				break;
			case 'top' :
				location = html;
				break;
			case 'bottom' : 
				location = html;
				break;
			case 'remove' :
				if( parent ){ location = html; }
				break;
			case 'unwrap' :
				if( parent ){ location = html; }
				break;
			case 'empty' :
				location = html;
				break;
			case 'before' :
				if( parent ){ location = html; }
				break;
			case 'after' :
				if( parent ){ location = html; }
				break;
			case 'wrap' :
				if( parent ){ location = html; }
				break;
			default : 
				if( html === undefined ){
					location = location;
				} else {
					lcoation = html;
				}
		}
		return location;
	}
	
	var OTHER_SINGLE_ARGUMENTS = /^remove$|^empty$|^unwrap$/;
	function ifElseStatement( location, html ){
		
		var singleArg = OTHER_SINGLE_ARGUMENTS.test( location ), parent = true;
		if( location === "outer" && html === undefined ){
			location = "outer";
		} else if( !singleArg && arguments.length === 1 ) {
			html = location;
			location = "inner";
		}
		if( singleArg ){
			if (location == "remove" && parent) {
			   location = html;
		    } else if( location == "unwrap" && parent ){
				location = html;
			} else if( location == "empty" ) {
				location = html;
			} 
		} else {
			if (location == "inner") {
				location = html;
			} else if (location == "outer" && parent ) {     
				location = html;
		    } else if (location == "top") {
				location = html;
		    } else if (location == "bottom") {
		        location = html;
		    } else if (location == "before" && parent) {
		        location = html;
		    } else if (location == "after" && parent) {
		        location = html;
			} else if (location == "wrap" && parent) {  
				location = html;
			}
		}
		return location;
	}
	
	perfTester.log( '<strong>Testing switch, if else and object[ name ] statements - <em>'+count+'</em> times</strong>' );
	for( var i=0,l=names.length; i<l;i++){
		perfTester.test( switchStatement, count, "switch statement "+names[i], window, [names[i], "this is some text"] );
		perfTester.test( objectStatement, count, "object statement "+names[i], window, [names[i], "this is some text"] );
		perfTester.test( ifElseStatement, count, "if-else statement "+names[i], window, [names[i], "this is some text"] );
	}
	
})( Simples );