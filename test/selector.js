module("Selector"); 
QUERY_SELECTOR = false;
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
	var body = document.body, tag, id;
	
	id = getElements( '#test-area', body );
	same( id.length, 1, "should return an aray with 1 element");
	same( id[0].tagName, 'DIV', "should return a div");
	same( id[0].id, 'test-area', "should return an element with the same id"); 
	
	className = getElements( '.row', document.getElementById('row-wrapper') );
	same( className.length, 8, "should return an aray with 8 elements");
	same( className[0].tagName, 'DIV', "should return a div");
	same( className[0].className, 'row', "should return an element with the same className");
	
	tag = getElements( 'h2', body );
	same( tag.length, 2, "should return an aray with 2 elements");
	same( tag[0].tagName, 'H2', "should return a div");
	same( tag[0].className, '', "should return an element with no className");
	
	tag = getElements( '[name=checkedtestcheckboxes]', body );
	same( tag.length, 2, "should return an aray with 2 elements");
	same( tag[0].type, 'checkbox', "should return a type of checkbox");
	same( tag[0].tagName, 'INPUT', "should return a tagName of input");
	ok( tag[0].checked, "should return checked");	       
	same( tag[1].type, 'checkbox', "should return a type of checkbox");
	same( tag[1].tagName, 'INPUT', "should return a tagName of input");
	ok( !tag[1].checked, "should return checked");	  	 	
});

test('create selector', 16, function(){
	
	var div1 = Simples.Selector('<div/>');   
	same( div1.context, document, "should have a context of document");
	same( div1.selector, '<div/>', "<div/> -- should have a selector of <div/>");	
	same( div1.length, 1, "should create 1 elements as a div" );
	same( div1[0].tagName, 'DIV', "should have created the element as a div");

	var div2 = Simples.Selector('<div/>.row');
	same( div2.context, document, "should have a context of document");	
	same( div2.selector, '<div/>', "<div/>.row -- should have a selector of <div/>");	
	same( div2.length, 1, "should create 1 elements as a div" );
	same( div2[0].tagName, 'DIV', "should have created the element as a div"); 
	
	var div3 = Simples.Selector('<div></div>');
	same( div3.context, document, "should have a context of document");	
	same( div2.selector, '<div/>', "<div></div> -- should have a selector of <div/>");	
	same( div3.length, 1, "should create 1 elements as a div" );
	same( div3[0].tagName, 'DIV', "should have created the element as a div");

	var div4 = Simples.Selector('<div />');   
	same( div4.context, document, "should have a context of document");
	same( div4.selector, '<div />', "<div /> -- should have a selector of <div />");	

	same( div4.length, 1, "should create 1 elements as a div" );
	same( div4[0].tagName, 'DIV', "should have created the element as a div");
});

test('simple selector', 14, function(){
	var rows = Simples.Selector('.row');
	same( rows.context, document, "should have a context of document");	
	same( rows.selector, '.row', ".row -- should have a selector of .row");
	same( rows.length, 8, ".row -- should find 8 elements with the class rows" );
	same( rows[0].tagName, 'DIV', ".row -- should have a tagName of div");
	
	var id = Simples.Selector('#test-area'); 
	same( id.context, document, "should have a context of document");
	same( id.selector, '#test-area', "#test-area -- should have a selector of #test-area");	
	same( id.length, 1, "#test-area -- should find 1 element with the id test-area" );
	
	var body = Simples.Selector('body');
	same( body.context, document, "should have a context of document");	
	same( body.selector, 'body', "body -- should have a selector of body");	
	same( body.length, 1, "body -- should find 1 element with the tagName of body");
	same( body[0].tagName, 'BODY', "body -- should have a tagName of body");

	var none = Simples.Selector('hammer');
	same( none.context, document, "should have a context of document");	
	same( none.selector, 'hammer', "hammer -- should have a selector of hammer");		
	same( none.length, 0, "hammer -- should have returned no elements");
	
	// var input = Simples.Selector('name=hammer');
	// same( input.length, 1, "name=hammer -- should find 1 element with the tagName of body");
	// same( input[0].tagName, 'INPUT', "name=hammer -- should have a tagName of body");  	
});

test('chained selector', 20, function(){
	var rows1 = Simples.Selector('#row-wrapper .row');
	same( rows1.context, document, "should have a context of document");	
	same( rows1.selector, '#row-wrapper .row', "#row-wrapper .row -- should have a selector of #row-wrapper .row");	
	same( rows1.length, 8, "#row-wrapper .row -- should find 8 elements with the class row" );
	same( rows1[0].tagName, 'DIV', "#row-wrapper .row -- should have a tagName of div");

	var rows2 = Simples.Selector('.row .cell');
	same( rows2.context, document, "should have a context of document");	
	same( rows2.selector, '.row .cell', ".row .cell -- should have a selector of .row .cell");	
	same( rows2.length, 36, ".row .cell -- should find 36 elements with the class cell" );
	same( rows2[0].tagName, 'DIV', ".row .cell -- should have a tagName of div");

	var id = Simples.Selector('body #test-area');
	same( id.context, document, "should have a context of document");	
	same( id.selector, 'body #test-area', "body #test-area -- should have a selector of #test-area");	
	same( id.length, 1, "body #test-area -- should find 1 element with the id test-area" );
	same( id[0].id, "test-area", "body #test-area -- should find 1 element with the id test-area" );
	
	var body1 = Simples.Selector('body .row');
	same( body1.context, document, "should have a context of document");	
	same( body1.selector, 'body .row', "body .row -- should have a selector of body .row");	
	same( body1.length, 8, "body .row -- should find 8 elements with the className of row");
	same( body1[0].tagName, 'DIV', "body .row -- should have a tagName of body");
	
	var body2 = Simples.Selector('body h2');
	same( body2.context, document, "should have a context of document");	
	same( body2.selector, 'body h2', "body h2 -- should have a selector of body h2");	
	same( body2.length, 2, "body h2 -- should find 2 elements with the tagName of h2");
	same( body2[0].tagName, 'H2', "body h2 -- should have a tagName of h2");	
	
	// var rows = Simples.Selector('#row-wrapper name=row');
	// same( rows.length, 2, "#row-wrapper name=row -- should find 2 elements with the class cell" );
	// same( rows[0].tagName, 'INPUT', "#row-wrapper name=row -- should have a tagName of input");	
});
   
test('multiple selector', 30, function(){
	var rows1 = Simples.Selector('#row-wrapper, #nothiddendiv');
	same( rows1.context, document, "#row-wrapper, #nothiddendiv -- should have a context of document");	
	same( rows1.selector, '#row-wrapper, #nothiddendiv', "#row-wrapper, #nothiddendiv -- should have selector");	
	same( rows1.length, 2, "#row-wrapper, #nothiddendiv -- should find 2 elements" );
	var hasIds = {
		'row-wrapper':false,
		'nothiddendiv':false
	};
	
	for( var i=0;i<2;i++){
		var result = hasIds[ rows1[i].id ] = true;
	}
	for(var name in hasIds ){
		ok( hasIds[name], "element should have an id of "+name );
	}
	
	var rows2 = Simples.Selector('.row, #nothiddendiv');
	same( rows2.context, document, ".row, #nothiddendiv -- should have a context of document");	
	same( rows2.selector, '.row, #nothiddendiv', ".row, #nothiddendiv -- should have selector");	
	same( rows2.length, 9, ".row, #nothiddendiv -- should find 9 elements" );
	same( rows2[0].tagName, 'DIV', ".row, #nothiddendiv -- should have a tagName");
	var num = ( rows2[8].id === 'nothiddendiv' ) ? 8 : 0;
	same( rows2[num].id, 'nothiddendiv', ".row, #nothiddendiv -- should have a id");	

	var id = Simples.Selector('body, #test-area');
	same( id.context, document, "body, #test-area -- should have a context of document");	
	same( id.selector, 'body, #test-area', "body, #test-area -- should have selector");	
	same( id.length, 2, "body, #test-area -- should find 2 elements" );
	same( id[0].tagName, 'BODY', "body, #test-area -- should have a tagName");
	same( id[1].id, 'test-area', "body, #test-area -- should have a id");
		
	var body1 = Simples.Selector('body, .row');
	same( body1.context, document, "body, .row -- should have a context of document");	
	same( body1.selector, 'body, .row', "body, .row -- should have selector");	
	same( body1.length, 9, "body, .row -- should find 9 elements");
	same( body1[0].tagName, 'BODY', "body, .row -- should have a tagName of body");
	same( body1[1].tagName, 'DIV', "body, .row -- should have a tagName of div");
		
	var body2 = Simples.Selector('body, h2');
	same( body2.context, document, "body, h2 -- should have a context of document");	
	same( body2.selector, 'body, h2', "body, h2 -- should have selector");	
	same( body2.length, 3, "body, h2 -- should find 3 elements");
	same( body2[0].tagName, 'BODY', "body, h2 -- should have a tagName of body");	
	same( body2[1].tagName, 'H2', "body, h2 -- should have a tagName of h2");	   
	 
	var id2 = Simples.Selector('#test-area, .row');
	same( id2.context, document, "#test-area, .row -- should have a context of document");	
	same( id2.selector, '#test-area, .row', "#test-area, .row -- should have selector");	
	same( id2.length, 9, "#test-area, .row -- should find 9 elements");
	same( id2[0].id, 'test-area', "#test-area, .row -- should have a id");
	same( id2[1].className, 'row', "body, .row -- should have a className"); 
});

test('badly constructed selector', 12, function(){
	var rows1 = Simples.Selector('#row-wrapper.row');
	same( rows1.selector, '#row-wrapper.row', "#row-wrapper.row -- should have a selector of #row-wrapper");	
	same( rows1.length, 0, "#row-wrapper.row -- should find 1 element with the id of row-wrapper" );

	var rows2 = Simples.Selector('.row.cell');    
	same( rows2.selector, '.row.cell', ".row.cell -- should have a selector of .row");	
	same( rows2.length, 0, ".row.cell -- should find 0 elements with the class rows" );

	var rows3 = Simples.Selector('.row.cell.row#test-area');
	same( rows3.length, 0, ".row.cell.row#test-area -- should find 8 elements with the className of row" );
	same( rows3.selector, '.row.cell.row#test-area', ".row.cell.row#test-area -- should have a selector of .row.cell.row#test-area");
		
	var body1 = Simples.Selector('body.row');
	same( body1.selector, 'body.row', "body.row -- should have a selector of body");	
	same( body1.length, 0, "body.row -- should find 8 elements with the className of row");

	var body2 = Simples.Selector('body#test-area');   
	same( body2.selector, 'body#test-area', "body#test-area -- should have a selector of body");
	same( body2.length, 0, "body#test-area -- should find 1 elements with the tagName of body");
		
	var body3 = Simples.Selector('.row#cell-test');
	same( body3.selector, '.row#cell-test', ".row#cell-test -- should have a selector of .row");	
	same( body3.length, 0, ".row#cell-test -- should find 8 elements with the className of row");
});