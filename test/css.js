module("CSS");

Simples.extend({
	is : function(state){ 
		if( this[0] ){
			switch(state){
			case ':visible':
				return this[0].offsetWidth > 0 || this[0].offsetHeight > 0;
			}             
		}
		return false;
	}
});

test("css(String|Hash)", function() {
	expect(30);

	equals( Simples('#main').css("display"), 'none', 'Check for css property "display"');

	ok( Simples('#nothiddendiv').is(':visible'), 'Modifying CSS display: Assert element is visible');
	Simples('#nothiddendiv').css({display: 'none'});
	ok( !Simples('#nothiddendiv').is(':visible'), 'Modified CSS display: Assert element is hidden');
	Simples('#nothiddendiv').css({display: 'block'});
	ok( Simples('#nothiddendiv').is(':visible'), 'Modified CSS display: Assert element is visible');

	// handle negative numbers by ignoring #1599, #4216
	Simples('#nothiddendiv').css({ 'width': 1, 'height': 1 });

	var width = parseFloat(Simples('#nothiddendiv').css('width')), height = parseFloat(Simples('#nothiddendiv').css('height'));
	Simples('#nothiddendiv').css({ width: -1, height: -1 });
	equals( parseFloat(Simples('#nothiddendiv').css('width')), width, 'Test negative width ignored')
	equals( parseFloat(Simples('#nothiddendiv').css('height')), height, 'Test negative height ignored')

	Simples('#floatTest').css({styleFloat: 'right'});
	equals( Simples('#floatTest').css('styleFloat'), 'right', 'Modified CSS float using "styleFloat": Assert float is right');
	Simples('#floatTest').css({cssFloat: 'left'});
	equals( Simples('#floatTest').css('cssFloat'), 'left', 'Modified CSS float using "cssFloat": Assert float is left');
	Simples('#floatTest').css({'float': 'right'});
	equals( Simples('#floatTest').css('float'), 'right', 'Modified CSS float using "float": Assert float is right');
	Simples('#floatTest').css({'font-size': '30px'});
	equals( Simples('#floatTest').css('font-size'), '30px', 'Modified CSS font-size: Assert font-size is 30px');

    var opacity = "0,0.25,0.5,0.75,1".split(',');
	for (var i=0,l=opacity.length;i<l;i++){
		var n = opacity[i];
		Simples('#foo').css({opacity: n});
		equals( Simples('#foo').css('opacity'), parseFloat(n), "Assert opacity is " + parseFloat(n) + " as a String" );
		Simples('#foo').css({opacity: parseFloat(n)});
		equals( Simples('#foo').css('opacity'), parseFloat(n), "Assert opacity is " + parseFloat(n) + " as a Number" );
	}
	Simples('#foo').css({opacity: ''});
	equals( Simples('#foo').css('opacity'), '1', "Assert opacity is 1 when set to an empty String" );

	equals( Simples('#empty').css('opacity'), '0', "Assert opacity is accessible via filter property set in stylesheet in IE" );
	Simples('#empty').css({ opacity: '1' });
	equals( Simples('#empty').css('opacity'), '1', "Assert opacity is taken from style attribute when set vs stylesheet in IE with filters" );

	var div = Simples('#nothiddendiv'), child = Simples('#nothiddendivchild');

	equals( parseInt(div.css("fontSize")), 16, "Verify fontSize px set." );
	equals( parseInt(div.css("font-size")), 16, "Verify fontSize px set." );
	equals( parseInt(child.css("fontSize")), 16, "Verify fontSize px set." );
	equals( parseInt(child.css("font-size")), 16, "Verify fontSize px set." );

	child[0].className = "em";
	equals( parseInt(child.css("fontSize")), 32, "Verify fontSize em set." );

	// Have to verify this as the result depends upon the browser's CSS
	// support for font-size percentages
	child[0].className = "prct";
	var prctval = parseInt(child.css("fontSize")), checkval = 0;
	if ( prctval === 16 || prctval === 24 ) {
		checkval = prctval;
	}

	equals( prctval, checkval, "Verify fontSize % set." );

	equals( typeof child.css("width"), "string", "Make sure that a string width is returned from css('width')." );
});

test("css(String, Object)", function() {
	expect(21);
	ok( Simples('#nothiddendiv').is(':visible'), 'Modifying CSS display: Assert element is visible');
	Simples('#nothiddendiv').css("display", 'none');
	ok( !Simples('#nothiddendiv').is(':visible'), 'Modified CSS display: Assert element is hidden');
	Simples('#nothiddendiv').css("display", 'block');
	ok( Simples('#nothiddendiv').is(':visible'), 'Modified CSS display: Assert element is visible');

	Simples("#nothiddendiv").css("top", "-1em");
	ok( Simples("#nothiddendiv").css("top"), -16, "Check negative number in EMs." );

	Simples('#floatTest').css('styleFloat', 'left');
	equals( Simples('#floatTest').css('styleFloat'), 'left', 'Modified CSS float using "styleFloat": Assert float is left');
	Simples('#floatTest').css('cssFloat', 'right');
	equals( Simples('#floatTest').css('cssFloat'), 'right', 'Modified CSS float using "cssFloat": Assert float is right');
	Simples('#floatTest').css('float', 'left');
	equals( Simples('#floatTest').css('float'), 'left', 'Modified CSS float using "float": Assert float is left');
	Simples('#floatTest').css('font-size', '20px');
	equals( Simples('#floatTest').css('font-size'), '20px', 'Modified CSS font-size: Assert font-size is 20px');

    var opacity = "0,0.25,0.5,0.75,1".split(',');
	for (var i=0,l=opacity.length;i<l;i++){
		var n = opacity[i];
		Simples('#foo').css('opacity', n);
		equals( Simples('#foo').css('opacity'), parseFloat(n), "Assert opacity is " + parseFloat(n) + " as a String" );
		Simples('#foo').css('opacity', parseFloat(n));
		equals( Simples('#foo').css('opacity'), parseFloat(n), "Assert opacity is " + parseFloat(n) + " as a Number" );
	}
	Simples('#foo').css('opacity', '');
	equals( Simples('#foo').css('opacity'), '1', "Assert opacity is 1 when set to an empty String" );

	// using contents will get comments regular, text, and comment nodes
	var j = Simples( Simples("#nonnodes")[0].childNodes );
	j.css("padding-left", "1px");
	equals( j.css("padding-left"), "1px", "Check node,textnode,comment css works" );

	// opera sometimes doesn't update 'display' correctly, see #2037
	Simples("#t2037")[0].innerHTML = Simples("#t2037")[0].innerHTML
	equals( Simples("#t2037 .hidden").css("display"), "none", "Make sure browser thinks it is hidden" );
});

test("Simples instance show and hide", function(){
	var elem = Simples('#foo').css('display','none');
	elem.show();
	equals( elem[0].style.display, 'block', 'show should set the display of element to block' );
	elem.hide();
	equals( elem[0].style.display, 'none', 'show should set the display of element to block' );
});

if(Simples.browser.msie) {
  test("css(String, Object) for MSIE", function() {
    // for #1438, IE throws JS error when filter exists but doesn't have opacity in it
	Simples('#foo').css("filter", "progid:DXImageTransform.Microsoft.Chroma(color='red');");
  	equals( Simples('#foo').css('opacity'), '1', "Assert opacity is 1 when a different filter is set in IE, #1438" );

    var filterVal = "progid:DXImageTransform.Microsoft.alpha(opacity=30) progid:DXImageTransform.Microsoft.Blur(pixelradius=5)";
    var filterVal2 = "progid:DXImageTransform.Microsoft.alpha(opacity=100) progid:DXImageTransform.Microsoft.Blur(pixelradius=5)";
    Simples('#foo').css("filter", filterVal);
    equals( Simples('#foo').css("filter"), filterVal, "css('filter', val) works" );
    Simples('#foo').css("opacity", 1)
    equals( Simples('#foo').css("filter"), filterVal2, "Setting opacity in IE doesn't clobber other filters" );
    equals( Simples('#foo').css("opacity"), 1, "Setting opacity in IE with other filters works" )
  });
}   

test("Simples.css(elem, 'height') doesn't clear radio buttons (bug #1095)", function () {
	expect(4);
    var checkedtest = getElements("#checkedtest")[0];
	var radio = Simples('input', checkedtest).filter(function(){
		if( this.type === 'radio' || this.type === 'RADIO' ){
			return true;
		}
	});
	var checkbox = Simples('input', checkedtest).filter(function(){
		if( this.type === 'checkbox' || this.type === 'CHECKBOX' ){
			return true;
		}
	});

	// IE6 was clearing "checked" in Simples.css(elem, "height");
	Simples.currentCSS( checkedtest, "height");

	ok( !! Simples(radio[0]).attr("checked"), "Check first radio still checked." );
	ok( ! Simples(radio[radio.length - 1]).attr("checked"), "Check last radio still NOT checked." );
	ok( !! Simples(checkbox[0]).attr("checked"), "Check first checkbox still checked." );
	ok( ! Simples(checkbox[radio.length - 1]).attr("checked"), "Check last checkbox still NOT checked." );
}); 

module("CSS: Width and Height");

test("width()", function() {
	expect(7);

	var $div = Simples("#nothiddendiv");
	$div.width( 30 );
	equals($div.width(), 30, "Test set to 30 correctly");
	$div.hide();
	equals($div.width(), 30, "Test hidden div");
	$div.show();
	$div.width( -1 ); // handle negative numbers by ignoring #1599
	equals($div.width(), 30, "Test negative width ignored");
	$div.css("padding", "20px");
	equals($div.width(), 30, "Test padding specified with pixels");
	$div.css("border", "2px solid #fff");
	equals($div.width(), 30, "Test border specified with pixels");

	$div.css({ display: "", border: "", padding: "" });

	Simples("#nothiddendivchild").css({ width: 20, padding: "3px", border: "2px solid #fff" });
	equals(Simples("#nothiddendivchild").width(), 20, "Test child width with border and padding");
	Simples("#nothiddendiv, #nothiddendivchild").css({ border: "", padding: "", width: "" });

	var blah = Simples("blah");
	equals( blah.width( 10 ), blah, "Make sure that setting a width on an empty set returns the set." );
});

test("height()", function() {
	expect(6);

	var $div = Simples("#nothiddendiv");
	$div.height( 30 );
	equals($div.height(), 30, "Test set to 30 correctly");
	$div.hide();
	equals($div.height(), 30, "Test hidden div");
	$div.show();
	$div.height( -1 ); // handle negative numbers by ignoring #1599
	equals($div.height(), 30, "Test negative height ignored");
	$div.css("padding", "20px");
	equals($div.height(), 30, "Test padding specified with pixels");
	$div.css("border", "2px solid #fff");
	equals($div.height(), 30, "Test border specified with pixels");

	$div.css({ display: "", border: "", padding: "", height: "1px" });

	var blah = Simples("blah");
	equals( blah.height( 10 ), blah, "Make sure that setting a height on an empty set returns the set." );
});

test("innerWidth()", function() {
	expect(3);

	var $div = Simples("#nothiddendiv");
	// set styles
	$div.css({
		margin: 10,
		border: "2px solid #fff",
		width: 30
	});
	
	equals($div.innerWidth(), 30, "Test with margin and border");
	$div.css("padding", "20px");
	equals($div.innerWidth(), 70, "Test with margin, border and padding");
	$div.hide();
	equals($div.innerWidth(), 70, "Test hidden div");
	
	// reset styles
	$div.css({ display: null, border: null, padding: null, width: null, height: null });
});

test("innerHeight()", function() {
	expect(3);
	
	var $div = Simples("#nothiddendiv");
	// set styles
	$div.css({
		margin: 10,
		border: "2px solid #fff",
		height: 30
	});
	
	equals($div.innerHeight(), 30, "Test with margin and border");
	$div.css("padding", "20px");
	equals($div.innerHeight(), 70, "Test with margin, border and padding");
	$div.hide();
	equals($div.innerHeight(), 70, "Test hidden div");
	
	// reset styles
	$div.css({ display: "", border: "", padding: "", width: "", height: "" });
});

test("outerWidth()", function() {
	expect(6);
	
	var $div = Simples("#nothiddendiv");
	$div.css("width", 30);
	
	equals($div.outerWidth(), 30, "Test with only width set");
	$div.css("padding", "20px");
	equals($div.outerWidth(), 70, "Test with padding");
	$div.css("border", "2px solid #fff");
	equals($div.outerWidth(), 74, "Test with padding and border");
	$div.css("margin", "10px");
	equals($div.outerWidth(), 74, "Test with padding, border and margin without margin option");
	$div.css("position", "absolute");
	equals($div.outerWidth(true), 94, "Test with padding, border and margin with margin option");
	$div.hide();
	equals($div.outerWidth(true), 94, "Test hidden div with padding, border and margin with margin option");
	
	// reset styles
	$div.css({ position: "", display: "", border: "", padding: "", width: "", height: "" });
});

test("outerHeight()", function() {
	expect(6);
	
	var $div = Simples("#nothiddendiv");
	$div.css("height", 30);
	
	equals($div.outerHeight(), 30, "Test with only width set");
	$div.css("padding", "20px");
	equals($div.outerHeight(), 70, "Test with padding");
	$div.css("border", "2px solid #fff");
	equals($div.outerHeight(), 74, "Test with padding and border");
	$div.css("margin", "10px");
	equals($div.outerHeight(), 74, "Test with padding, border and margin without margin option");
	equals($div.outerHeight(true), 94, "Test with padding, border and margin with margin option");
	$div.hide();
	equals($div.outerHeight(true), 94, "Test hidden div with padding, border and margin with margin option");
	
	// reset styles
	$div.css({ display: "", border: "", padding: "", width: "", height: "" });
});

