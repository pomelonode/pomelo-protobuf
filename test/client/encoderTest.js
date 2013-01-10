var should = require('should');
var encoder = require('../../lib/client/encoder');

describe('client encoder test', function(){
	describe('float test for 10000 times', function(){
		for(var i = 0; i < 10000; i++){
			var float = Math.random();
			
			var bytes = encoder.encodeFloat(float);
			var result = encoder.decodeFloat(bytes);
			
			var diff = Math.abs(float-result);
			//console.log('float : %j, result : %j, diff : %j', float, result, diff);
			diff.should.below(0.0000001);
			
		}
	})
	
	describe('double test for 10000 times', function(){
		for(var i = 0; i < 10000; i++){
			var double = Math.random();
			
			var bytes = encoder.encodeDouble(double);
			var result = encoder.decodeDouble(bytes);
			
			double.should.equal(result);
		}
	})
	
	describe('string decode speed test', function(){
		var array = [];
		var length = 10000;
		for(var i = 0; i < length; i++,arr.push(0));
		var start = Date.now();
		var str = String.fromCharCode.apply(null, array);
		var end = Date.now();
		
		console.log('cost time : %j, length : %j', end-start, str.length);
	})
})