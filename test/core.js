module("Core");

test('create selector', 6, function(){
	
	var div1 = select.call( {},'<div/>');
	same( div1.length, 1, "should create 1 elements as a div" );
	same( div1[0].tagName, 'DIV', "should have created the element as a div");

	var div2 = select.call( {}, '<div/>.row');
	same( div2.length, 1, "should create 1 elements as a div" );
	same( div2[0].tagName, 'DIV', "should have created the element as a div"); 
	
	var div3 = select.call( {}, '<div></div>');
	same( div3.length, 1, "should create 1 elements as a div" );
	same( div3[0].tagName, 'DIV', "should have created the element as a div");

});

test('simple selector', 6, function(){
	var rows = select.call( {}, '.row');
	same( rows.length, 8, ".row -- should find 8 elements with the class rows" );
	same( rows[0].tagName, 'DIV', ".row -- should have a tagName of div");
	
	same( select.call( {}, '#test-area').length, 1, "#test-area -- should find 1 element with the id test-area" );
	
	var body = select.call( {}, 'body');
	same( body.length, 1, "body -- should find 1 element with the tagName of body");
	same( body[0].tagName, 'BODY', "body -- should have a tagName of body");

	var none = select.call( {}, 'hammer');
	same( none.length, 0, "hammer -- should have returned no elements");
	
	// var input = select.call( {}, 'name=hammer');
	// same( input.length, 1, "name=hammer -- should find 1 element with the tagName of body");
	// same( input[0].tagName, 'INPUT', "name=hammer -- should have a tagName of body");  	
});

test('chained selector', 9, function(){
	var rows1 = select.call( {}, '#row-wrapper .row');
	same( rows1.length, 8, "#row-wrapper .row -- should find 8 elements with the class row" );
	same( rows1[0].tagName, 'DIV', "#row-wrapper .row -- should have a tagName of div");

	var rows2 = select.call( {}, '.row .cell');
	same( rows2.length, 36, ".row .cell -- should find 36 elements with the class cell" );
	same( rows2[0].tagName, 'DIV', ".row .cell -- should have a tagName of div");
		
	same( select.call( {}, 'body #test-area').length, 1, "body #test-area -- should find 1 element with the id test-area" );
	
	var body1 = select.call( {}, 'body .row');
	same( body1.length, 8, "body .row -- should find 8 elements with the className of row");
	same( body1[0].tagName, 'DIV', "body .row -- should have a tagName of body");
	
	var body2 = select.call( {}, 'body h2');
	same( body2.length, 2, "body h2 -- should find 2 elements with the tagName of h2");
	same( body2[0].tagName, 'H2', "body h2 -- should have a tagName of h2");	
	
	// var rows = select.call( {}, '#row-wrapper name=row');
	// same( rows.length, 2, "#row-wrapper name=row -- should find 2 elements with the class cell" );
	// same( rows[0].tagName, 'INPUT', "#row-wrapper name=row -- should have a tagName of input");	
});

test('badly constructed selector', 12, function(){
	var rows1 = select.call( {}, '#row-wrapper.row');
	same( rows1.length, 1, "#row-wrapper.row -- should find 1 element with the id of row-wrapper" );
	same( rows1[0].tagName, 'DIV', "#row-wrapper.row -- should have a tagName of div");

	var rows2 = select.call( {}, '.row.cell');
	same( rows2.length, 8, ".row.cell -- should find 8 elements with the class rows" );
	same( rows2[0].tagName, 'DIV', ".row.cell -- should have a tagName of div");

	var rows3 = select.call( {}, '.row.cell.row#hammer');
	same( rows3.length, 8, ".row.cell.row#hammer -- should find 8 elements with the class rows" );
	same( rows3[0].tagName, 'DIV', ".row.cell.row#hammer -- should have a tagName of div");
		
	var body1 = select.call( {}, 'body.row');
	same( body1.length, 1, "body.row -- should find 8 elements with the className of row");
	same( body1[0].tagName, 'BODY', "body.row -- should have a tagName of body");

	var body2 = select.call( {}, 'body#test-area');
	same( body2.length, 1, "body#test-area -- should find 8 elements with the className of row");
	same( body2[0].tagName, 'BODY', "body#test-area -- should have a tagName of body");
		
	var body3 = select.call( {}, '.row#cell-test');
	same( body3.length, 8, ".row#cell-test -- should find 8 elements with the className of row");
	same( body3[0].tagName, 'DIV', "body#test-area -- should have a tagName of body");
});

