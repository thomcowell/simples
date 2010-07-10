module("Selector"); 

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

test('getElements with context', 16, function(){
	var body = document.body;
	
	var id = getElements( '#test-area', body );
	same( id.length, 1, "should return an aray with 1 element");
	same( id[0].tagName, 'DIV', "should return a div");
	same( id[0].id, 'test-area', "should return an element with the same id"); 
	
	var className = getElements( '.row', document.getElementById('row-wrapper') );
	same( className.length, 8, "should return an aray with 8 elements");
	same( className[0].tagName, 'DIV', "should return a div");
	same( className[0].className, 'row', "should return an element with the same className");
	
	var tag = getElements( 'h2', body );
	same( tag.length, 2, "should return an aray with 2 elements");
	same( tag[0].tagName, 'H2', "should return a div");
	same( tag[0].className, '', "should return an element with no className");
	
	var tag = getElements( '[name=checkedtestcheckboxes]', body );
	same( tag.length, 2, "should return an aray with 2 elements");
	same( tag[0].type, 'checkbox', "should return a type of checkbox");
	same( tag[0].tagName, 'INPUT', "should return a tagName of input");
	ok( tag[0].checked, "should return checked");	       
	same( tag[1].type, 'checkbox', "should return a type of checkbox");
	same( tag[1].tagName, 'INPUT', "should return a tagName of input");
	ok( !tag[1].checked, "should return checked");	  	 	
});

test('create selector', 16, function(){
	
	var div1 = SimplesSelector('<div/>');   
	same( div1.context, document, "should have a context of document");
	same( div1.selector, '<div/>', "<div/> -- should have a selector of <div/>");	
	same( div1.elems.length, 1, "should create 1 elements as a div" );
	same( div1.elems[0].tagName, 'DIV', "should have created the element as a div");

	var div2 = SimplesSelector('<div/>.row');
	same( div2.context, document, "should have a context of document");	
	same( div2.selector, '<div/>', "<div/>.row -- should have a selector of <div/>");	
	same( div2.elems.length, 1, "should create 1 elements as a div" );
	same( div2.elems[0].tagName, 'DIV', "should have created the element as a div"); 
	
	var div3 = SimplesSelector('<div></div>');
	same( div3.context, document, "should have a context of document");	
	same( div2.selector, '<div/>', "<div></div> -- should have a selector of <div/>");	
	same( div3.elems.length, 1, "should create 1 elements as a div" );
	same( div3.elems[0].tagName, 'DIV', "should have created the element as a div");

	var div4 = SimplesSelector('<div />');   
	same( div4.context, document, "should have a context of document");
	same( div4.selector, '<div />', "<div /> -- should have a selector of <div />");	
	same( div4.elems.length, 1, "should create 1 elements as a div" );
	same( div4.elems[0].tagName, 'DIV', "should have created the element as a div");
});

test('simple selector', 14, function(){
	var rows = SimplesSelector('.row');
	same( rows.context, document, "should have a context of document");	
	same( rows.selector, '.row', ".row -- should have a selector of .row");
	same( rows.elems.length, 8, ".row -- should find 8 elements with the class rows" );
	same( rows.elems[0].tagName, 'DIV', ".row -- should have a tagName of div");
	
	var id = SimplesSelector('#test-area'); 
	same( id.context, document, "should have a context of document");
	same( id.selector, '#test-area', "#test-area -- should have a selector of #test-area");	
	same( id.elems.length, 1, "#test-area -- should find 1 element with the id test-area" );
	
	var body = SimplesSelector('body');
	same( body.context, document, "should have a context of document");	
	same( body.selector, 'body', "body -- should have a selector of body");	
	same( body.elems.length, 1, "body -- should find 1 element with the tagName of body");
	same( body.elems[0].tagName, 'BODY', "body -- should have a tagName of body");

	var none = SimplesSelector('hammer');
	same( none.context, document, "should have a context of document");	
	same( none.selector, 'hammer', "hammer -- should have a selector of hammer");		
	same( none.elems.length, 0, "hammer -- should have returned no elements");
	
	// var input = SimplesSelector('name=hammer');
	// same( input.length, 1, "name=hammer -- should find 1 element with the tagName of body");
	// same( input[0].tagName, 'INPUT', "name=hammer -- should have a tagName of body");  	
});

test('chained selector', 19, function(){
	var rows1 = SimplesSelector('#row-wrapper .row');
	same( rows1.context, document, "should have a context of document");	
	same( rows1.selector, '#row-wrapper .row', "#row-wrapper .row -- should have a selector of #row-wrapper .row");	
	same( rows1.elems.length, 8, "#row-wrapper .row -- should find 8 elements with the class row" );
	same( rows1.elems[0].tagName, 'DIV', "#row-wrapper .row -- should have a tagName of div");

	var rows2 = SimplesSelector('.row .cell');
	same( rows2.context, document, "should have a context of document");	
	same( rows2.selector, '.row .cell', ".row .cell -- should have a selector of .row .cell");	
	same( rows2.elems.length, 36, ".row .cell -- should find 36 elements with the class cell" );
	same( rows2.elems[0].tagName, 'DIV', ".row .cell -- should have a tagName of div");

	var id = SimplesSelector('body #test-area');
	same( id.context, document, "should have a context of document");	
	same( id.selector, '#test-area', "body #test-area -- should have a selector of #test-area");	
	same( id.elems.length, 1, "body #test-area -- should find 1 element with the id test-area" );
	
	var body1 = SimplesSelector('body .row');
	same( body1.context, document, "should have a context of document");	
	same( body1.selector, 'body .row', "body .row -- should have a selector of body .row");	
	same( body1.elems.length, 8, "body .row -- should find 8 elements with the className of row");
	same( body1.elems[0].tagName, 'DIV', "body .row -- should have a tagName of body");
	
	var body2 = SimplesSelector('body h2');
	same( body2.context, document, "should have a context of document");	
	same( body2.selector, 'body h2', "body h2 -- should have a selector of body h2");	
	same( body2.elems.length, 2, "body h2 -- should find 2 elements with the tagName of h2");
	same( body2.elems[0].tagName, 'H2', "body h2 -- should have a tagName of h2");	
	
	// var rows = SimplesSelector('#row-wrapper name=row');
	// same( rows.length, 2, "#row-wrapper name=row -- should find 2 elements with the class cell" );
	// same( rows[0].tagName, 'INPUT', "#row-wrapper name=row -- should have a tagName of input");	
});
   
test('multiple selector', 30, function(){
	var rows1 = SimplesSelector('#row-wrapper, #nothiddendiv');
	same( rows1.context, document, "#row-wrapper, #nothiddendiv -- should have a context of document");	
	same( rows1.selector, '#row-wrapper, #nothiddendiv', "#row-wrapper, #nothiddendiv -- should have selector");	
	same( rows1.elems.length, 2, "#row-wrapper, #nothiddendiv -- should find 2 elements" );
	same( rows1.elems[0].id, 'row-wrapper', "#row-wrapper -- should have a id");
	same( rows1.elems[1].id, 'nothiddendiv', "#nothiddendiv -- should have a id");
	
	var rows2 = SimplesSelector('.row, #nothiddendiv');
	same( rows2.context, document, ".row, #nothiddendiv -- should have a context of document");	
	same( rows2.selector, '.row, #nothiddendiv', ".row, #nothiddendiv -- should have selector");	
	same( rows2.elems.length, 9, ".row, #nothiddendiv -- should find 9 elements" );
	same( rows2.elems[0].tagName, 'DIV', ".row, #nothiddendiv -- should have a tagName");
	same( rows2.elems[8].id, 'nothiddendiv', ".row, #nothiddendiv -- should have a id");	

	var id = SimplesSelector('body, #test-area');
	same( id.context, document, "body, #test-area -- should have a context of document");	
	same( id.selector, 'body, #test-area', "body, #test-area -- should have selector");	
	same( id.elems.length, 2, "body, #test-area -- should find 2 elements" );
	same( id.elems[0].tagName, 'BODY', "body, #test-area -- should have a tagName");
	same( id.elems[1].id, 'test-area', "body, #test-area -- should have a id");
		
	var body1 = SimplesSelector('body, .row');
	same( body1.context, document, "body, .row -- should have a context of document");	
	same( body1.selector, 'body, .row', "body, .row -- should have selector");	
	same( body1.elems.length, 9, "body, .row -- should find 9 elements");
	same( body1.elems[0].tagName, 'BODY', "body, .row -- should have a tagName of body");
	same( body1.elems[1].tagName, 'DIV', "body, .row -- should have a tagName of div");
		
	var body2 = SimplesSelector('body, h2');
	same( body2.context, document, "body, h2 -- should have a context of document");	
	same( body2.selector, 'body, h2', "body, h2 -- should have selector");	
	same( body2.elems.length, 3, "body, h2 -- should find 3 elements");
	same( body2.elems[0].tagName, 'BODY', "body, h2 -- should have a tagName of body");	
	same( body2.elems[1].tagName, 'H2', "body, h2 -- should have a tagName of h2");	   
	 
	var id2 = SimplesSelector('#test-area, .row');
	same( id2.context, document, "#test-area, .row -- should have a context of document");	
	same( id2.selector, '#test-area, .row', "#test-area, .row -- should have selector");	
	same( id2.elems.length, 9, "#test-area, .row -- should find 9 elements");
	same( id2.elems[0].id, 'test-area', "#test-area, .row -- should have a id");
	same( id2.elems[1].className, 'row', "body, .row -- should have a className"); 
});

test('badly constructed selector', 19, function(){
	var rows1 = SimplesSelector('#row-wrapper.row');
	same( rows1.selector, '#row-wrapper', "#row-wrapper.row -- should have a selector of #row-wrapper");	
	same( rows1.elems.length, 1, "#row-wrapper.row -- should find 1 element with the id of row-wrapper" );
	same( rows1.elems[0].tagName, 'DIV', "#row-wrapper.row -- should have a tagName of div");

	var rows2 = SimplesSelector('.row.cell');    
	same( rows2.selector, '.row', ".row.cell -- should have a selector of .row");	
	same( rows2.elems.length, 8, ".row.cell -- should find 8 elements with the class rows" );
	same( rows2.elems[0].tagName, 'DIV', ".row.cell -- should have a tagName of div");

	var rows3 = SimplesSelector('.row.cell.row#test-area');
	same( rows3.elems.length, 8, ".row.cell.row#test-area -- should find 8 elements with the className of row" );
	same( rows3.selector, '.row', ".row.cell.row#test-area -- should have a selector of .row.cell.row#test-area");
	same( rows3.elems[0].className, 'row', ".row.cell.row#test-area -- should have an className of .row.cell.row#test-area");            
	same( rows3.elems[0].tagName, 'DIV', ".row.cell.row#test-area -- should have a tagName of div");
		
	var body1 = SimplesSelector('body.row');
	same( body1.selector, 'body', "body.row -- should have a selector of body");	
	same( body1.elems.length, 1, "body.row -- should find 8 elements with the className of row");
	same( body1.elems[0].tagName, 'BODY', "body.row -- should have a tagName of body");

	var body2 = SimplesSelector('body#test-area');   
	same( body2.selector, 'body', "body#test-area -- should have a selector of body");
	same( body2.elems.length, 1, "body#test-area -- should find 1 elements with the tagName of body");
	same( body2.elems[0].tagName, 'BODY', "body#test-area -- should have a tagName of body");
		
	var body3 = SimplesSelector('.row#cell-test');
	same( body3.selector, '.row', ".row#cell-test -- should have a selector of .row");	
	same( body3.elems.length, 8, ".row#cell-test -- should find 8 elements with the className of row");
	same( body3.elems[0].tagName, 'DIV', "body#test-area -- should have a tagName of body");
});