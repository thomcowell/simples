module("Position");

var supportsScroll = false;

function testoffset(name, fn) {
	
	test(name, function() {
		// pause execution for now
		stop();
		
		// load fixture in iframe
		var iframe = loadFixture(),
			win = iframe.contentWindow,
			interval = setInterval( function() {
				if ( win && win.Simples && win.Simples.isReady ) {
					clearInterval( interval );
					// continue
					start();
					// call actual tests passing the correct Simples isntance to use
					fn.call( this, win.Simples, win );
					document.body.removeChild( iframe );
					iframe = null;
				}
			}, 15 );
	});
	
	function loadFixture() {
		var src = './data/offset/' + name + '.html?' + parseInt( Math.random()*1000, 10 ),
			iframe = Simples('<iframe />').css({
				width: 500, height: 500, position: 'absolute', top: -600, left: -600, visiblity: 'hidden'
			})[0];

		document.body.appendChild( iframe );
		iframe.contentWindow.location = src;
		return iframe;
	}
}

testoffset("absolute"/* in iframe */, function($, iframe) {
	expect(4);
	
	var doc = iframe.document, tests;
	
	// force a scroll value on the main window
	// this insures that the results will be wrong
	// if the offset method is using the scroll offset
	// of the parent window
	var forceScroll = Simples('<div>', { width: 2000, height: 2000 }).appendTo('body');
	window.scrollTo(200, 200);

	if ( document.documentElement.scrollTop || document.body.scrollTop ) {
		supportsScroll = true;
	}

	window.scrollTo(1, 1);
	
	// get offset
	tests = [
		{ id: '#absolute-1', top: 1, left: 1 }
	];
	Simples.each( tests, function() {
		equals( Simples( this.id, doc ).offset().top,  this.top,  "Simples('" + this.id + "').offset().top" );
		equals( Simples( this.id, doc ).offset().left, this.left, "Simples('" + this.id + "').offset().left" );
	});


	// get position
	tests = [
		{ id: '#absolute-1', top: 0, left: 0 }
	];
	Simples.each( tests, function() {
		equals( Simples( this.id, doc ).position().top,  this.top,  "Simples('" + this.id + "').position().top" );
		equals( Simples( this.id, doc ).position().left, this.left, "Simples('" + this.id + "').position().left" );
	});
	
	forceScroll.remove();
});

testoffset("absolute", function( Simples ) {
	expect(178);
	
	// get offset tests
	var tests = [
		{ id: '#absolute-1',     top:  1, left:  1 }, 
		{ id: '#absolute-1-1',   top:  5, left:  5 },
		{ id: '#absolute-1-1-1', top:  9, left:  9 },
		{ id: '#absolute-2',     top: 20, left: 20 }
	];
	Simples.each( tests, function() {
		equals( Simples( this.id ).offset().top,  this.top,  "Simples('" + this.id + "').offset().top" );
		equals( Simples( this.id ).offset().left, this.left, "Simples('" + this.id + "').offset().left" );
	});
	
	
	// get position
	tests = [
		{ id: '#absolute-1',     top:  0, left:  0 },
		{ id: '#absolute-1-1',   top:  1, left:  1 },
		{ id: '#absolute-1-1-1', top:  1, left:  1 },
		{ id: '#absolute-2',     top: 19, left: 19 }
	];
	Simples.each( tests, function() {
		equals( Simples( this.id ).position().top,  this.top,  "Simples('" + this.id + "').position().top" );
		equals( Simples( this.id ).position().left, this.left, "Simples('" + this.id + "').position().left" );
	});
	
	// test #5781
	var offset = Simples( '#positionTest' ).offset({ top: 10, left: 10 }).offset();
	equals( offset.top,  10, "Setting offset on element with position absolute but 'auto' values." );
	equals( offset.left, 10, "Setting offset on element with position absolute but 'auto' values." );
	
	
	// set offset
	tests = [
		{ id: '#absolute-2',     top: 30, left: 30 },
		{ id: '#absolute-2',     top: 10, left: 10 },
		{ id: '#absolute-2',     top: -1, left: -1 },
		{ id: '#absolute-2',     top: 19, left: 19 },
		{ id: '#absolute-1-1-1', top: 15, left: 15 },
		{ id: '#absolute-1-1-1', top:  5, left:  5 },
		{ id: '#absolute-1-1-1', top: -1, left: -1 },
		{ id: '#absolute-1-1-1', top:  9, left:  9 },
		{ id: '#absolute-1-1',   top: 10, left: 10 },
		{ id: '#absolute-1-1',   top:  0, left:  0 },
		{ id: '#absolute-1-1',   top: -1, left: -1 },
		{ id: '#absolute-1-1',   top:  5, left:  5 },
		{ id: '#absolute-1',     top:  2, left:  2 },
		{ id: '#absolute-1',     top:  0, left:  0 },
		{ id: '#absolute-1',     top: -1, left: -1 },
		{ id: '#absolute-1',     top:  1, left:  1 }
	];
	Simples.each( tests, function() {
		Simples( this.id ).offset({ top: this.top, left: this.left });
		equals( Simples( this.id ).offset().top,  this.top,  "Simples('" + this.id + "').offset({ top: "  + this.top  + " })" );
		equals( Simples( this.id ).offset().left, this.left, "Simples('" + this.id + "').offset({ left: " + this.left + " })" );
		
		var top = this.top, left = this.left;
		
		Simples( this.id ).offset(function(i, val){
			equals( val.top, top, "Verify incoming top position." );
			equals( val.left, left, "Verify incoming top position." );
			return { top: top + 1, left: left + 1 };
		});
		equals( Simples( this.id ).offset().top,  this.top  + 1, "Simples('" + this.id + "').offset({ top: "  + (this.top  + 1) + " })" );
		equals( Simples( this.id ).offset().left, this.left + 1, "Simples('" + this.id + "').offset({ left: " + (this.left + 1) + " })" );
		
		Simples( this.id ).offset({ left: this.left + 2 }).offset({ top:  this.top  + 2 });
		equals( Simples( this.id ).offset().top,  this.top  + 2, "Setting one property at a time." );
		equals( Simples( this.id ).offset().left, this.left + 2, "Setting one property at a time." );
		
		Simples( this.id ).offset({ top: this.top, left: this.left, using: function( props ) {
			Simples( this ).css({
				top:  props.top  + 1,
				left: props.left + 1
			});
		}});
		equals( Simples( this.id ).offset().top,  this.top  + 1, "Simples('" + this.id + "').offset({ top: "  + (this.top  + 1) + ", using: fn })" );
		equals( Simples( this.id ).offset().left, this.left + 1, "Simples('" + this.id + "').offset({ left: " + (this.left + 1) + ", using: fn })" );
	});
});

testoffset("relative", function( Simples ) {
	expect(60);
	
	// IE is collapsing the top margin of 1px
	var ie = Simples.browser.msie && parseInt( Simples.browser.version, 10 ) < 8;
	
	// get offset
	var tests = [
		{ id: '#relative-1',   top: ie ?   6 :   7, left:  7 },
		{ id: '#relative-1-1', top: ie ?  13 :  15, left: 15 },
		{ id: '#relative-2',   top: ie ? 141 : 142, left: 27 }
	];
	Simples.each( tests, function() {
		equals( Simples( this.id ).offset().top,  this.top,  "Simples('" + this.id + "').offset().top" );
		equals( Simples( this.id ).offset().left, this.left, "Simples('" + this.id + "').offset().left" );
	});
	
	
	// get position
	tests = [
		{ id: '#relative-1',   top: ie ?   5 :   6, left:  6 },
		{ id: '#relative-1-1', top: ie ?   4 :   5, left:  5 },
		{ id: '#relative-2',   top: ie ? 140 : 141, left: 26 }
	];
	Simples.each( tests, function() {
		equals( Simples( this.id ).position().top,  this.top,  "Simples('" + this.id + "').position().top" );
		equals( Simples( this.id ).position().left, this.left, "Simples('" + this.id + "').position().left" );
	});
	
	
	// set offset
	tests = [
		{ id: '#relative-2',   top: 200, left:  50 },
		{ id: '#relative-2',   top: 100, left:  10 },
		{ id: '#relative-2',   top:  -5, left:  -5 },
		{ id: '#relative-2',   top: 142, left:  27 },
		{ id: '#relative-1-1', top: 100, left: 100 },
		{ id: '#relative-1-1', top:   5, left:   5 },
		{ id: '#relative-1-1', top:  -1, left:  -1 },
		{ id: '#relative-1-1', top:  15, left:  15 },
		{ id: '#relative-1',   top: 100, left: 100 },
		{ id: '#relative-1',   top:   0, left:   0 },
		{ id: '#relative-1',   top:  -1, left:  -1 },
		{ id: '#relative-1',   top:   7, left:   7 }
	];
	Simples.each( tests, function() {
		Simples( this.id ).offset({ top: this.top, left: this.left });
		equals( Simples( this.id ).offset().top,  this.top,  "Simples('" + this.id + "').offset({ top: "  + this.top  + " })" );
		equals( Simples( this.id ).offset().left, this.left, "Simples('" + this.id + "').offset({ left: " + this.left + " })" );
		
		Simples( this.id ).offset({ top: this.top, left: this.left, using: function( props ) {
			Simples( this ).css({
				top:  props.top  + 1,
				left: props.left + 1
			});
		}});
		equals( Simples( this.id ).offset().top,  this.top  + 1, "Simples('" + this.id + "').offset({ top: "  + (this.top  + 1) + ", using: fn })" );
		equals( Simples( this.id ).offset().left, this.left + 1, "Simples('" + this.id + "').offset({ left: " + (this.left + 1) + ", using: fn })" );
	});
});

testoffset("static", function( Simples ) {
	expect(80);
	
	// IE is collapsing the top margin of 1px
	var ie = Simples.browser.msie && parseInt( Simples.browser.version, 10 ) < 8;
	
	// get offset
	var tests = [
		{ id: '#static-1',     top: ie ?   6 :   7, left:  7 },
		{ id: '#static-1-1',   top: ie ?  13 :  15, left: 15 },
		{ id: '#static-1-1-1', top: ie ?  20 :  23, left: 23 },
		{ id: '#static-2',     top: ie ? 121 : 122, left:  7 }
	];
	Simples.each( tests, function() {
		equals( Simples( this.id ).offset().top,  this.top,  "Simples('" + this.id + "').offset().top" );
		equals( Simples( this.id ).offset().left, this.left, "Simples('" + this.id + "').offset().left" );
	});
	
	
	// get position
	tests = [
		{ id: '#static-1',     top: ie ?   5 :   6, left:  6 },
		{ id: '#static-1-1',   top: ie ?  12 :  14, left: 14 },
		{ id: '#static-1-1-1', top: ie ?  19 :  22, left: 22 },
		{ id: '#static-2',     top: ie ? 120 : 121, left:  6 }
	];
	Simples.each( tests, function() {
		equals( Simples( this.id ).position().top,  this.top,  "Simples('" + this.top  + "').position().top" );
		equals( Simples( this.id ).position().left, this.left, "Simples('" + this.left +"').position().left" );
	});
	
	
	// set offset
	tests = [
		{ id: '#static-2',     top: 200, left: 200 },
		{ id: '#static-2',     top: 100, left: 100 },
		{ id: '#static-2',     top:  -2, left:  -2 },
		{ id: '#static-2',     top: 121, left:   6 },
		{ id: '#static-1-1-1', top:  50, left:  50 },
		{ id: '#static-1-1-1', top:  10, left:  10 },
		{ id: '#static-1-1-1', top:  -1, left:  -1 },
		{ id: '#static-1-1-1', top:  22, left:  22 },
		{ id: '#static-1-1',   top:  25, left:  25 },
		{ id: '#static-1-1',   top:  10, left:  10 },
		{ id: '#static-1-1',   top:  -3, left:  -3 },
		{ id: '#static-1-1',   top:  14, left:  14 },
		{ id: '#static-1',     top:  30, left:  30 },
		{ id: '#static-1',     top:   2, left:   2 },
		{ id: '#static-1',     top:  -2, left:  -2 },
		{ id: '#static-1',     top:   7, left:   7 }
	];
	Simples.each( tests, function() {
		Simples( this.id ).offset({ top: this.top, left: this.left });
		equals( Simples( this.id ).offset().top,  this.top,  "Simples('" + this.id + "').offset({ top: "  + this.top  + " })" );
		equals( Simples( this.id ).offset().left, this.left, "Simples('" + this.id + "').offset({ left: " + this.left + " })" );
		
		Simples( this.id ).offset({ top: this.top, left: this.left, using: function( props ) {
			Simples( this ).css({
				top:  props.top  + 1,
				left: props.left + 1
			});
		}});
		equals( Simples( this.id ).offset().top,  this.top  + 1, "Simples('" + this.id + "').offset({ top: "  + (this.top  + 1) + ", using: fn })" );
		equals( Simples( this.id ).offset().left, this.left + 1, "Simples('" + this.id + "').offset({ left: " + (this.left + 1) + ", using: fn })" );
	});
});

testoffset("fixed", function( Simples ) {
	expect(28);
	
	Simples.offset.initialize();
	
	var tests = [
		{ id: '#fixed-1', top: 1001, left: 1001 },
		{ id: '#fixed-2', top: 1021, left: 1021 }
	];

	Simples.each( tests, function() {
		if ( !supportsScroll ) {
			ok( true, "Browser doesn't support scroll position." );
			ok( true, "Browser doesn't support scroll position." );

		} else if ( Simples.offset.supportsFixedPosition ) {
			equals( Simples( this.id ).offset().top,  this.top,  "Simples('" + this.id + "').offset().top" );
			equals( Simples( this.id ).offset().left, this.left, "Simples('" + this.id + "').offset().left" );
		} else {
			// need to have same number of assertions
			ok( true, 'Fixed position is not supported' );
			ok( true, 'Fixed position is not supported' );
		}
	});
	
	tests = [
		{ id: '#fixed-1', top: 100, left: 100 },
		{ id: '#fixed-1', top:   0, left:   0 },
		{ id: '#fixed-1', top:  -4, left:  -4 },
		{ id: '#fixed-2', top: 200, left: 200 },
		{ id: '#fixed-2', top:   0, left:   0 },
		{ id: '#fixed-2', top:  -5, left:  -5 }
	];
	
	Simples.each( tests, function() {
		if ( Simples.offset.supportsFixedPosition ) {
			Simples( this.id ).offset({ top: this.top, left: this.left });
			equals( Simples( this.id ).offset().top,  this.top,  "Simples('" + this.id + "').offset({ top: "  + this.top  + " })" );
			equals( Simples( this.id ).offset().left, this.left, "Simples('" + this.id + "').offset({ left: " + this.left + " })" );
		
			Simples( this.id ).offset({ top: this.top, left: this.left, using: function( props ) {
				Simples( this ).css({
					top:  props.top  + 1,
					left: props.left + 1
				});
			}});
			equals( Simples( this.id ).offset().top,  this.top  + 1, "Simples('" + this.id + "').offset({ top: "  + (this.top  + 1) + ", using: fn })" );
			equals( Simples( this.id ).offset().left, this.left + 1, "Simples('" + this.id + "').offset({ left: " + (this.left + 1) + ", using: fn })" );
		} else {
			// need to have same number of assertions
			ok( true, 'Fixed position is not supported' );
			ok( true, 'Fixed position is not supported' );
			ok( true, 'Fixed position is not supported' );
			ok( true, 'Fixed position is not supported' );
		}
	});
});

testoffset("table", function( Simples ) {
	expect(4);
	
	equals( Simples('#table-1').offset().top, 6, "Simples('#table-1').offset().top" );
	equals( Simples('#table-1').offset().left, 6, "Simples('#table-1').offset().left" );
	
	equals( Simples('#th-1').offset().top, 10, "Simples('#th-1').offset().top" );
	equals( Simples('#th-1').offset().left, 10, "Simples('#th-1').offset().left" );
});

testoffset("scroll", function( Simples, win ) {
	expect(16);
	
	var ie = Simples.browser.msie && parseInt( Simples.browser.version, 10 ) < 8;
	
	// IE is collapsing the top margin of 1px
	equals( Simples('#scroll-1').offset().top, ie ? 6 : 7, "Simples('#scroll-1').offset().top" );
	equals( Simples('#scroll-1').offset().left, 7, "Simples('#scroll-1').offset().left" );
	
	// IE is collapsing the top margin of 1px
	equals( Simples('#scroll-1-1').offset().top, ie ? 9 : 11, "Simples('#scroll-1-1').offset().top" );
	equals( Simples('#scroll-1-1').offset().left, 11, "Simples('#scroll-1-1').offset().left" );
	
	
	// scroll offset tests .scrollTop/Left
	equals( Simples('#scroll-1').scrollTop(), 5, "Simples('#scroll-1').scrollTop()" );
	equals( Simples('#scroll-1').scrollLeft(), 5, "Simples('#scroll-1').scrollLeft()" );
	
	equals( Simples('#scroll-1-1').scrollTop(), 0, "Simples('#scroll-1-1').scrollTop()" );
	equals( Simples('#scroll-1-1').scrollLeft(), 0, "Simples('#scroll-1-1').scrollLeft()" );
	
	// equals( Simples('body').scrollTop(), 0, "Simples('body').scrollTop()" );
	// equals( Simples('body').scrollLeft(), 0, "Simples('body').scrollTop()" );
	
	win.name = "test";

	if ( !supportsScroll ) {
		ok( true, "Browser doesn't support scroll position." );
		ok( true, "Browser doesn't support scroll position." );

		ok( true, "Browser doesn't support scroll position." );
		ok( true, "Browser doesn't support scroll position." );
	} else {
		equals( Simples(win).scrollTop(), 1000, "Simples(window).scrollTop()" );
		equals( Simples(win).scrollLeft(), 1000, "Simples(window).scrollLeft()" );
	
		equals( Simples(win.document).scrollTop(), 1000, "Simples(document).scrollTop()" );
		equals( Simples(win.document).scrollLeft(), 1000, "Simples(document).scrollLeft()" );
	}
	
	// test Simples using parent window/document
	// Simples reference here is in the iframe
	window.scrollTo(0,0);
	equals( Simples(window).scrollTop(), 0, "Simples(window).scrollTop() other window" );
	equals( Simples(window).scrollLeft(), 0, "Simples(window).scrollLeft() other window" );
	equals( Simples(document).scrollTop(), 0, "Simples(window).scrollTop() other document" );
	equals( Simples(document).scrollLeft(), 0, "Simples(window).scrollLeft() other document" );
});

testoffset("body", function( Simples ) {
	expect(2);
	
	equals( Simples('body').offset().top, 1, "Simples('#body').offset().top" );
	equals( Simples('body').offset().left, 1, "Simples('#body').offset().left" );
});

test("Chaining offset(coords) returns Simples object", function() {
	expect(2);
	var coords = { top:  1, left:  1 };
	equals( Simples("#absolute-1").offset(coords).selector, "#absolute-1", "offset(coords) returns Simples object" );
	equals( Simples("#non-existent").offset(coords).selector, "#non-existent", "offset(coords) with empty Simples set returns Simples object" );
});

test("offsetParent", function(){
	expect(11);

	var body = Simples("body").offsetParent();
	equals( body.length, 1, "Only one offsetParent found." );
	equals( body[0], document.body, "The body is its own offsetParent." );

	var header = Simples("#qunit-header").offsetParent();
	equals( header.length, 1, "Only one offsetParent found." );
	equals( header[0], document.body, "The body is the offsetParent." );

	var div = Simples("#nothiddendivchild").offsetParent();
	equals( div.length, 1, "Only one offsetParent found." );
	equals( div[0], document.body, "The body is the offsetParent." );

	Simples("#nothiddendiv").css("position", "relative");

	div = Simples("#nothiddendivchild").offsetParent();
	equals( div.length, 1, "Only one offsetParent found." );
	equals( div[0], Simples("#nothiddendiv")[0], "The div is the offsetParent." );

	div = Simples("body, #nothiddendivchild").offsetParent();
	equals( div.length, 2, "Two offsetParent found." );
	equals( div[0], document.body, "The body is the offsetParent." );
	equals( div[1], Simples("#nothiddendiv")[0], "The div is the offsetParent." );
});
