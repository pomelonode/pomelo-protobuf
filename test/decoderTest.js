var encoder = require('../lib/encoder');
var should = require('should');

describe('encoder test', function(){
	describe('uInt32 and uInt64 test, for encode and decode 10000 random number', function(){
		var limit = 0x7fffffffffffffff;
		
		for(var i = 0; i < 10000; i++){
			var number = Math.ceil(Math.random()*limit);
			
			var result = encoder.decodeUInt32(encoder.encodeUInt32(number));
			
			should.equal(number, result);
		}
	})
	
	describe('sInt32 test, for encode and decode 10000 random number', function(){
		var limit = 0xfffffffffffff;
		
		for(var i = 0; i < 10000; i++){
			var flag = Math.random>0.5?1:-1;
			var number = Math.ceil(Math.random()*limit)*flag;
			
			var result = encoder.decodeSInt32(encoder.encodeSInt32(number));
			
			should.equal(number, result);
		}
	})
	
	describe('buffer speed test', function(){
		var n = 100000;
		var a = '';
		var start = Date.now();
		
		for(var i = 0; i < n; i++){
			var b = new Buffer(4);
			
			b.writeUInt8(0, 0);
			b.writeUInt8(1, 1);
			b.writeUInt8(2, 2);
			b.writeUInt8(3, 3);
		}
		
		var end = Date.now();
		var time1 = end-start;
		
		start = Date.now();
		for(var i = 0; i < n; i++){
			var a = [];
			a.push(0);
			a.push(1);
			a.push(2);
			a.push(3);
		}
		
		end = Date.now();
		
		var time2 = end -start;
		console.log('time1 : %j, time2 : %j', time1, time2);
	})
});