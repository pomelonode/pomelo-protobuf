var protobuf = require('../lib/protobuf');
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
	};

	var protos = require('./protos.json');

	protobuf.init({encoderProtos:protos, decoderProtos:protos});

	describe('encodeTest', function(){
		var str = protobuf.encodeStr('onMove', msg);

		var decodeMsg = protobuf.decodeStr('onMove', str);

		//msg.should.equal(decodeMsg);
		util.equal(msg, decodeMsg).should.equal(true);

		var oldStr = (JSON.stringify(msg));
		console.log('old Length : %j, new length : %j, compress rate : %j%', Buffer.byteLength(oldStr), Buffer.byteLength(str), Math.floor(str.length/oldStr.length*10000)/100);
	});
});