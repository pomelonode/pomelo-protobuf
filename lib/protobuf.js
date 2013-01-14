var encoder = require('./msgEncoder');
var decoder = require('./msgDecoder');
var parser = require('./protoParser');

var Protobuf = module.exports;
Protobuf.encode = function(key, msg){
	return encoder.encode(key, msg);
}

Protobuf.encodeStr = function(key, msg, code){
	code = code || 'base64';
	var buffer = Protobuf.encode(key, msg);
	return !!buffer?buffer.toString(code):buffer;
}

Protobuf.decode = function(key, msg){
	return decoder.decode(key, msg);
}

Protobuf.decodeStr = function(key, str, code){
	code = code || 'base64';
	var buffer = new Buffer(str, code);
	
	return !!buffer?Protobuf.decode(key, buffer):buffer;
}

Protobuf.init = function(opts){
	var encoderProtos = parser.parse(opts.encoderProtos);
	var decoderProtos = parser.parse(opts.decoderProtos);
	
	console.log(encoderProtos['onMove']);
	
	//On the serverside, use serverProtos to encode messages send to client
	encoder.init(encoderProtos);
	
	//On the serverside, user clientProtos to decode messages receive from clients
	decoder.init(decoderProtos);
	
}