var encoder = require('../lib/msgEncoder.js');
var decoder = require('../lib/msgDecoder.js');
var parser = require('../lib/protoParser.js');
var util = require('../lib/util');
var should = require('should');

describe('msgEncoderTest', function(){
	var msg = {
		entityId : 1,
		paths : [{x : 1, y : 2, c : {a : 1}}, 
						 {x : 3, y : 4, c : {a : 2}, tests : [{a:1}, {a:2}]}],
		speed : 110,
		speed1 : 'ss',
		a : 111.1111
	}
	var protos = parser.parse(require('./protos.json'));
	
	console.log(protos['onMove']);
	encoder.setProtos(protos);
	decoder.setProtos(protos);
	
	describe('encodeTest', function(){
		var str = encoder.encode('onMove', msg);
		
		(typeof(str)).should.equal('string');
		str.length.should.above(0);
		
		var decodeMsg = decoder.decode('onMove', str);
		
		//msg.should.equal(decodeMsg);
		util.equal(msg, decodeMsg).should.equal(true);		
		
		var oldStr = (JSON.stringify(msg));
		console.log('old Length : %j, new length : %j, compress rate : %j%', Buffer.byteLength(oldStr), Buffer.byteLength(str), Math.floor(str.length/oldStr.length*10000)/100);
	})
})