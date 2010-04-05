module("Core");

test('create selector', 4, function(){                                             
	var div1 = Simples('<div/>');
	same( div1.length, 1, "should create 1 elements as a div" );
	same( div1[0].tagName, 'DIV', "should have created the element as a div");

	var div2 = Simples('<div/>.row');
	
	same( div2.length, 1, "should create 1 elements as a div" );
	same( div2[0].tagName, 'DIV', "should have created the element as a div");

});

test('simple selector', 6, function(){
	var rows = Simples('.row');
	same( rows.length, 8, ".row -- should find 8 elements with the class rows" );
	same( rows[0].tagName, 'DIV', ".row -- should have a tagName of div");
	
	same( Simples('#test-area').length, 1, "#test-area -- should find 1 element with the id test-area" );
	
	var body = Simples('body');
	same( body.length, 1, "body -- should find 1 element with the tagName of body");
	same( body[0].tagName, 'BODY', "body -- should have a tagName of body");
	
	var none = Simples('hammer');
	same( none.length, 0, "hammer -- should have returned no elements");		
});

test('chained selector', 7, function(){
	var rows = Simples('#row-wrapper .row');
	same( rows.length, 8, "#row-wrapper .row -- should find 8 elements with the class rows" );
	same( rows[0].tagName, 'DIV', "#row-wrapper .row -- should have a tagName of div");
	
	same( Simples('body #test-area').length, 1, "body #test-area -- should find 1 element with the id test-area" );
	
	var body = Simples('body .row');
	same( body.length, 8, "body .row -- should find 8 elements with the className of row");
	same( body[0].tagName, 'DIV', "body .row -- should have a tagName of body");
	
	var body = Simples('body h2');
	same( body.length, 2, "body h2 -- should find 2 elements with the tagName of h2");
	same( body[0].tagName, 'H2', "body h2 -- should have a tagName of h2");	
});

