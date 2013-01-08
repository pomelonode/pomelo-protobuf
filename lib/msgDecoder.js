var protoParser = require('./protoParser');
var encoder = require('./encoder');
var util = require('./util');

var MsgDecoder = module.exports;

var buffer;
var offset = 0;

MsgDecoder.decode = function(route, str){
	if(typeof(str) != 'string'){
		return str;
	}
	
	if(!this.protos){
		this.protos = {};
	}
	
	var proto = this.protos[route];
	buffer = new Buffer(str, 'base64');
	offset = 0;
	var msg = {};
	var length = buffer.length;
	
	if(!!proto){
		return decodeMsg(msg, proto, length);
	}
	
	return msg;
}

MsgDecoder.setProtos = function(protos){
	if(!!protos){
		this.protos = protos;
	}
}

function decodeMsg(msg, protos, length){
	while(offset<length){
		//console.log('offset : %j, length : %j, head bytes : %j', offset, length, peekBytes());
		var head = getHead();
		var type = head.type;
		var tag = head.tag;
	
		var name = protos.__tags[tag];
		
//		console.log('decode bytes : %j', peekBytes());
//		console.log('tag : %j, tags : %j', tag, protos.__tags);
	
		switch(protos[name].option){
			case 'option' :
			case 'required' :
				msg[name] = decodeProp(protos[name].type, protos);
			break;
			case 'repeated' :
				//console.log('decode array');
				if(!msg[name]){
					msg[name] = [];
				}
				decodeArray(msg[name], protos[name].type, protos);
			break;
		}
	}
	
	return msg;
}

/**
 * Test if the given msg is finished
 */
function isFinish(msg, protos){
	//console.log('head : %j, tags : %j, result : %j', peekHead(), protos.__tags, !!protos.__tags[peekHead().tag]);
	return (!protos.__tags[peekHead().tag]);
}
/**
 * Get property head from protobuf
 */
function getHead(){
	var tag = encoder.decodeUInt32(getBytes());
	
	return {
		type : tag&0x7,
		tag	: tag>>3
	};
}

/**
 * Get tag head without move the offset
 */
function peekHead(){
	var tag = encoder.decodeUInt32(peekBytes());
	
	return {
		type : tag&0x7,
		tag	: tag>>3
	};
}

function decodeProp(type, protos){
	//console.log('type : %j, protos : %j', type, protos);
	switch(type){
		case 'uInt32':
			return encoder.decodeUInt32(getBytes());
		break;
		case 'int32' :
		case 'sInt32' :
			return encoder.decodeSInt32(getBytes());
		break;
		case 'float' :
			var float = buffer.readFloatLE(offset);
			offset += 4;
			return float;
		break;
		case 'double' :
			console.log('offset : %j, length : %j', offset, buffer.length);
			var double = buffer.readDoubleLE(offset)
			offset += 8;
			return double;
		break;
		case 'string' :
			var length = encoder.decodeUInt32(getBytes());
			
			var str =  buffer.toString('utf8', offset, offset+length);
			offset += length;
			
			return str;
			
		break;
		default :
			//console.log('object type : %j, protos: %j', type, protos);
			if(!!protos && !!protos.__protos[type]){
				var length = encoder.decodeUInt32(getBytes());
				var msg = {};
				decodeMsg(msg, protos.__protos[type], offset+length);
				return msg;
			}
		break;
	}
}

function decodeArray(array, type, protos){
	if(util.isSimpleType(type)){
		var length = encoder.decodeUInt32(getBytes());
		
		for(var i = 0; i < length; i++){
			array.push(decodeProp(type));
		}
	}else{
		array.push(decodeProp(type, protos));
	}	
}

function getBytes(flag){
	var bytes = [];
	var pos = offset;
	flag = flag || false;
	
	do{
		var b = buffer.readUInt8(pos);
		bytes.push(b);
		pos++;
	}while(b > 128);
	
	if(!flag){
		offset = pos;
	}
	return bytes;
}

function peekBytes(){
	return getBytes(true);
}