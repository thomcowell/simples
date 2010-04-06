function cleanData( ){
	
}

Simples.extend({
	appendChild : function( child ){                        

		if ( child.nodeType || child instanceof Simples ) {
			return this.each(function(){
				if( child instanceof Simples ){
					var that = this;
					child.each(function(){
						that.appendChild( this );
					});
				} else {
					this.appendChild( child );
				}
			});
		}                 	
		return this;
	}, 
	prependChild : function( child ){
		if ( child.nodeType || child instanceof Simples ) {
			return this.each(function(){       
				var parent = this.parentNode;
				if( child instanceof Simples ){
					var that = this;
					child.each(function(){
						parent.insertBefore( this, that );
					});
				} else {
					parent.insertBefore( child, this );
				}
			});
		}
		return this;
	},
	wrap : function( selector ) { 
		
		if( typeof selector === 'string' ){            
			
			var tag = TAG.exec( selector || '<div/>' );
			tag = ( tag !== null && tag.length === 2 ) ? tag[1] : 'div';
			
			this.each(function(){                          

				var elem = document.createElement( tag );

		        this.parentNode.insertBefore(elem, this);
		        elem.appendChild(this);
			});                                
		}
		
		return this;
    },
	empty : function(){             
		this.each(function(){
			// Remove element nodes and prevent memory leaks
			if ( this.nodeType === 1 ) {
				cleanData( this.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( this.firstChild ) {
				this.removeChild( this.firstChild );
			}
		});
	},
	hasClass : function( className ){
		return " "+this[0].className.indexOf( className )+" " > 0;
	},
	removeSelf : function(){
		this.each(function(){
			if ( this.parentNode ) { 
				if ( this.nodeType === 1 ) {
					cleanData( this.getElementsByTagName("*") );
				}
				
				this.parentNode.removeChild( this );
			}
		});
	}
});