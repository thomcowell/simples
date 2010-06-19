module("Ajax");

test("formatData - when passing in string key and string, number or boolean value",4,function(){
	  
	equal( formatData('ham','sandwich'), "ham=sandwich", "string value should be represented" );
	equal( formatData('ham',29), "ham=29", "string value should be represented" );	
	equal( formatData('ham',true), "ham=true", "boolean true value should be represented" );
	equal( formatData('ham',false), "ham=false", "boolean false value should be represented" );
});

test("formatData - when passing in string key and function as value",4,function(){
	
	equal( formatData('ham',function(){ return "red" }), "ham=red", "function where value return should be represented" );
	equal( formatData('ham',function(){ return null }), "", "function where no value return should be represented" );
	equal( formatData('ham',function(){ return 29 }), "ham=29", "function where number value return should be represented" );
	equal( formatData('ham',function(){ return false }), "ham=false", "function where number value return should be represented" );		
});

test("formatData - when passing in string key and object as value",4,function(){
	
	equal( formatData('ham',{sandwich:'grilled',fried:function(){ return 'bacon' }}), "ham%5Bsandwich%5D=grilled&ham%5Bfried%5D=bacon", "1 level object return should be represented" );
	equal( formatData('ham',{sandwich:'grilled',fried:{green:'bacon',red:"eggs"}}), "ham%5Bsandwich%5D=grilled&ham%5Bfried%5D%5Bgreen%5D=bacon&ham%5Bfried%5D%5Bred%5D=eggs", "1 level object return should be represented" );
	equal( formatData('ham',{sandwich:'grilled',fried:{green:true,red:false,purple:12}}), "ham%5Bsandwich%5D=grilled&ham%5Bfried%5D%5Bgreen%5D=true&ham%5Bfried%5D%5Bred%5D=false&ham%5Bfried%5D%5Bpurple%5D=12", "1 level object return should be represented" );	
	equal( formatData('ham',{sandwich:'grilled',fried:['chips','sausages','salt']}), "ham%5Bsandwich%5D=grilled&ham%5Bfried%5D=chips%2Csausages%2Csalt", "1 level object return should be represented" );	
});

test("formatData - when passing in bad key",5,function(){
	  
	equal( formatData(true,'sandwich'), "", "boolean true key should be represented" );
	equal( formatData(false,'sandwich'), "", "boolean false key should be represented" );	
	equal( formatData(null,'sandwich'), "", "null key should be represented" );
	equal( formatData({here:'there'},'sandwich'), "", "null key should be represented" );
	equal( formatData([1,2,3],'sandwich'), "", "null key should be represented" );	
});