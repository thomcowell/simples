Simples.merge({
	support : {
		boxModel : (function(){
			var div = document.createElement("div");
			div.style.width = div.style.paddingLeft = "1px";

			document.body.appendChild( div );
			var isBoxModel = div.offsetWidth === 2;
			document.body.removeChild( div ).style.display = 'none';
			div = null;       
			return isBoxModel;	
		})(),
		opacity : /^0.55$/.test( a.style.opacity ),
		cssFloat: !!a.style.cssFloat
	}
})