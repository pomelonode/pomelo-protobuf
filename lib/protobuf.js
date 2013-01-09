var encoder = require('./msgEncoder');
var decoder = require('./msgDecoder');
var parser = require('./protoParser');

var Protobuf = module.exports;
Protobuf.encode = function(route, msg){
	return encoder.encode(route, msg);
}

Protobuf.encodeStr = function(route, msg, code){
	code = code || 'base64';
	var buffer = Protobuf.encode(route, msg);
	
	return !!buffer?buffer.toString(code):buffer;
}

Protobuf.decode = function(route, msg){
	return decoder.decode(route, msg);
}

Protobuf.decodeStr = function(route, str, code){
	code = code || 'base64';
	var buffer = new Buffer(str, code);
	
	return !!buffer?Protobuf.decode(route, buffer):buffer;
}

Protobuf.init = function(opts){
	var serverProtos = parser.parse(opts.serverProtos);
	var clientProtos = parser.parse(opts.clientProtos);
	
	//On the serverside, use serverProtos to encode messages send to client
	encoder.init(serverProtos);
	
	//On the serverside, user clientProtos to decode messages receive from clients
	decoder.init(clientProtos);
	
}