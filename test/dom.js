module("DOM");
test("hasClass", 3, function() {
	var div = document.getElementById('test-area');
	div.className = "test"
	ok( Simples(div).hasClass("test"), "should have className test"); 
});           
test("addClass", 3, function() {
	var div = Simples('#test-area');
	div[0].className = "test"
	ok( div.hasClass("test"), "should have className test");
});
test("removeClass", 3, function() {
	var div = Simples('#test-area');
	div[0].className = "test"
	ok( div.hasClass("test"), "should have className test");
});
test("attr", 3, function() {
	var div = Simples('#test-area');
	div[0].className = "test"
	ok( div.hasClass("test"), "should have className test");
});  

// prepend append => 'string' and nodes check order                                  	