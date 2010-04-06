module("Core");

test('getElements with only selector', 9, function(){ 
	var id = getElements( '#test-area' );
	same( id.length, 1, "should return an aray with 1 element");
	same( id[0].tagName, 'DIV', "should return a div");
	same( id[0].id, 'test-area', "should return an element with the same id"); 
	
	var className = getElements( '.row' );
	same( className.length, 8, "should return an aray with 8 elements");
	same( className[0].tagName, 'DIV', "should return a div");
	same( className[0].className, 'row', "should return an element with the same className");
	
	var tag = getElements( 'h2' );
	same( tag.length, 2, "should return an aray with 8 elements");
	same( tag[0].tagName, 'H2', "should return a div");
	same( tag[0].className, '', "should return an element with no className");		
});  

test('getElements with context', 9, function(){
	var body = document.getElementsByTagName('body')[0];
	
	var id = getElements( '#test-area', body );
	same( id.length, 1, "should return an aray with 1 element");
	same( id[0].tagName, 'DIV', "should return a div");
	same( id[0].id, 'test-area', "should return an element with the same id"); 
	
	var className = getElements( '.row', document.getElementById('row-wrapper') );
	same( className.length, 8, "should return an aray with 8 elements");
	same( className[0].tagName, 'DIV', "should return a div");
	same( className[0].className, 'row', "should return an element with the same className");
	
	var tag = getElements( 'h2', body );
	same( tag.length, 2, "should return an aray with 8 elements");
	same( tag[0].tagName, 'H2', "should return a div");
	same( tag[0].className, '', "should return an element with no className");		
});

test('create selector', 12, function(){
	
	var div1 = select.call( {},'<div/>');   
	same( div1.context, document, "should have a context of document");
	same( div1.selector, '<div/>', "<div/> -- should have a selector of <div/>");	
	same( div1.length, 1, "should create 1 elements as a div" );
	same( div1[0].tagName, 'DIV', "should have created the element as a div");

	var div2 = select.call( {}, '<div/>.row');
	same( div2.context, document, "should have a context of document");	
	same( div2.selector, '<div/>', "<div/>.row -- should have a selector of <div/>");	
	same( div2.length, 1, "should create 1 elements as a div" );
	same( div2[0].tagName, 'DIV', "should have created the element as a div"); 
	
	var div3 = select.call( {}, '<div></div>');
	same( div3.context, document, "should have a context of document");	
	same( div2.selector, '<div/>', "<div></div> -- should have a selector of <div/>");	
	same( div3.length, 1, "should create 1 elements as a div" );
	same( div3[0].tagName, 'DIV', "should have created the element as a div");

});

test('simple selector', 14, function(){
	var rows = select.call( {}, '.row');
	same( rows.context, document, "should have a context of document");	
	same( rows.selector, '.row', ".row -- should have a selector of .row");
	same( rows.length, 8, ".row -- should find 8 elements with the class rows" );
	same( rows[0].tagName, 'DIV', ".row -- should have a tagName of div");
	
	var id = select.call( {}, '#test-area'); 
	same( id.context, document, "should have a context of document");
	same( id.selector, '#test-area', "#test-area -- should have a selector of #test-area");	
	same( id.length, 1, "#test-area -- should find 1 element with the id test-area" );
	
	var body = select.call( {}, 'body');
	same( body.context, document, "should have a context of document");	
	same( body.selector, 'body', "body -- should have a selector of body");	
	same( body.length, 1, "body -- should find 1 element with the tagName of body");
	same( body[0].tagName, 'BODY', "body -- should have a tagName of body");

	var none = select.call( {}, 'hammer');
	same( none.context, document, "should have a context of document");	
	same( none.selector, 'hammer', "hammer -- should have a selector of hammer");		
	same( none.length, 0, "hammer -- should have returned no elements");
	
	// var input = select.call( {}, 'name=hammer');
	// same( input.length, 1, "name=hammer -- should find 1 element with the tagName of body");
	// same( input[0].tagName, 'INPUT', "name=hammer -- should have a tagName of body");  	
});

test('chained selector', 19, function(){
	var rows1 = select.call( {}, '#row-wrapper .row');
	same( rows1.context, document, "should have a context of document");	
	same( rows1.selector, '#row-wrapper .row', "#row-wrapper .row -- should have a selector of #row-wrapper .row");	
	same( rows1.length, 8, "#row-wrapper .row -- should find 8 elements with the class row" );
	same( rows1[0].tagName, 'DIV', "#row-wrapper .row -- should have a tagName of div");

	var rows2 = select.call( {}, '.row .cell');
	same( rows2.context, document, "should have a context of document");	
	same( rows2.selector, '.row .cell', ".row .cell -- should have a selector of .row .cell");	
	same( rows2.length, 36, ".row .cell -- should find 36 elements with the class cell" );
	same( rows2[0].tagName, 'DIV', ".row .cell -- should have a tagName of div");

	var id = select.call( {}, 'body #test-area');
	same( id.context, document, "should have a context of document");	
	same( id.selector, '#test-area', "body #test-area -- should have a selector of #test-area");	
	same( id.length, 1, "body #test-area -- should find 1 element with the id test-area" );
	
	var body1 = select.call( {}, 'body .row');
	same( body1.context, document, "should have a context of document");	
	same( body1.selector, 'body .row', "body .row -- should have a selector of body .row");	
	same( body1.length, 8, "body .row -- should find 8 elements with the className of row");
	same( body1[0].tagName, 'DIV', "body .row -- should have a tagName of body");
	
	var body2 = select.call( {}, 'body h2');
	same( body2.context, document, "should have a context of document");	
	same( body2.selector, 'body h2', "body h2 -- should have a selector of body h2");	
	same( body2.length, 2, "body h2 -- should find 2 elements with the tagName of h2");
	same( body2[0].tagName, 'H2', "body h2 -- should have a tagName of h2");	
	
	// var rows = select.call( {}, '#row-wrapper name=row');
	// same( rows.length, 2, "#row-wrapper name=row -- should find 2 elements with the class cell" );
	// same( rows[0].tagName, 'INPUT', "#row-wrapper name=row -- should have a tagName of input");	
});

test('badly constructed selector', 19, function(){
	var rows1 = select.call( {}, '#row-wrapper.row');
	same( rows1.selector, '#row-wrapper', "#row-wrapper.row -- should have a selector of #row-wrapper");	
	same( rows1.length, 1, "#row-wrapper.row -- should find 1 element with the id of row-wrapper" );
	same( rows1[0].tagName, 'DIV', "#row-wrapper.row -- should have a tagName of div");

	var rows2 = select.call( {}, '.row.cell');    
	same( rows2.selector, '.row', ".row.cell -- should have a selector of .row");	
	same( rows2.length, 8, ".row.cell -- should find 8 elements with the class rows" );
	same( rows2[0].tagName, 'DIV', ".row.cell -- should have a tagName of div");

	var rows3 = select.call( {}, '.row.cell.row#test-area');
	same( rows3.length, 8, ".row.cell.row#test-area -- should find 8 elements with the className of row" );
	same( rows3.selector, '.row', ".row.cell.row#test-area -- should have a selector of .row.cell.row#test-area");
	same( rows3[0].className, 'row', ".row.cell.row#test-area -- should have an className of .row.cell.row#test-area");            
	same( rows3[0].tagName, 'DIV', ".row.cell.row#test-area -- should have a tagName of div");
		
	var body1 = select.call( {}, 'body.row');
	same( body1.selector, 'body', "body.row -- should have a selector of body");	
	same( body1.length, 1, "body.row -- should find 8 elements with the className of row");
	same( body1[0].tagName, 'BODY', "body.row -- should have a tagName of body");

	var body2 = select.call( {}, 'body#test-area');   
	same( body2.selector, 'body', "body#test-area -- should have a selector of body");
	same( body2.length, 1, "body#test-area -- should find 1 elements with the tagName of body");
	same( body2[0].tagName, 'BODY', "body#test-area -- should have a tagName of body");
		
	var body3 = select.call( {}, '.row#cell-test');
	same( body3.selector, '.row', ".row#cell-test -- should have a selector of .row");	
	same( body3.length, 8, ".row#cell-test -- should find 8 elements with the className of row");
	same( body3[0].tagName, 'DIV', "body#test-area -- should have a tagName of body");
});

