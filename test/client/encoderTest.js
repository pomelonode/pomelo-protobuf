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
			var float = Math.random();
			
			var bytes = encoder.encodeDouble(float);
			var result = encoder.decodeDouble(bytes);
			
			float.should.equal(result);
		}
	})
})