var protoParser = require('./protoParser');
var encoder = require('./encoder');
var constant = require('./constant');
var util = require('./util');

var MsgEncoder = module.exports;

MsgEncoder.setProtos = function(protos){
	if(!!protos){
		this.protos = protos;
	}
}

MsgEncoder.encode = function(route, msg){	
	if(!this.protos){
		this.protos = {};
	}
	
	//Get protos from protos map use the route as key
	var proto = this.protos[route];
	
	//Check msg
	if(!checkMsg(msg, proto)){
		console.warn('check msg failed! msg : %j, proto : %j', msg, proto);
		return msg;
	}
	
	var length = Buffer.byteLength(JSON.stringify(msg), 'ucs2')*2;
	
	//Init buffer and offset
	var buffer = new Buffer(length);
	var offset = 0;
	
	if(!!proto){
		offset = encodeMsg(buffer, offset, proto, msg);
		if(offset > 0){
			var code = 'base64';
			var str = buffer.toString(code, 0, offset);
			console.log('encode code : %j, length : %j, result : %j', code, Buffer.byteLength(str), str);
			
			code  = 'utf16le'
			var str = buffer.toString(code, 0, offset);
			console.log('encode code : %j, length : %j, result : %j', code, Buffer.byteLength(str), str);
			
			console.log(buffer);
			console.log(new Buffer(str, code));
			
			code = 'utf8'
			var str = buffer.toString(code, 0, offset);
			console.log('encode code : %j, length : %j, result : %j', code, Buffer.byteLength(str), str);
			console.log(new Buffer(str));
			
			return buffer.toString('base64', 0, offset);
		}
	}
	
	return msg;
}

function checkMsg(msg, protos){
	if(!protos){
		return false;
	}
	
	for(var name in protos){
		var proto = protos[name];
		
		//All required element must exist
		switch(proto.option){
			case 'required' : 
				if(typeof(msg[name]) === 'undefined'){
					//console.log('no property msg : %j, name : %j', msg[name], name);
					return false;
				}
			case 'option' :
				if(!!protos.__protos[proto.type]){
					if(!!protos.__protos[proto.type]){
						checkMsg(msg[name], protos.__protos[proto.type]);
					}
				}
			break;
			case 'repeated' :
				//Check nest message in repeated elements
				if(!!msg[name] && !!protos.__protos[proto.type]){
					for(var i = 0; i < msg[name].length; i++){
						if(!checkMsg(msg[name][i], protos.__protos[proto.type])){
							return false;
						}
					}
				}
			break;
		}
	}
	
	return true;
}

function encodeMsg(buffer, offset, protos, msg){
	for(var name in msg){
		if(!!protos[name]){
			var proto = protos[name];
			
			//console.error('encode proto : %j', proto);
			switch(proto.option){
				case 'required' :
				case 'option' :
					//console.log('encode tag');
					offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
					offset = encodeProp(msg[name], proto.type, offset, buffer, protos);
					//console.log('encode tag finish, value : %j', msg[name]);
				break;
				case 'repeated' :
					if(msg[name].length > 0){
						offset = encodeArray(msg[name], proto, offset, buffer, protos);
					}
				break;
			}
		}
	}
	
	return offset;
}

function encodeProp(value, type, offset, buffer, protos){
	switch(type){
		case 'uInt32':
			offset = writeBytes(buffer, offset, encoder.encodeUInt32(value));
		break;
		case 'int32' :
		case 'sInt32':
			offset = writeBytes(buffer, offset, encoder.encodeSInt32(value));
		break;
		case 'float':
			buffer.wirteFloatLE(value, offset);
			offset += 4;
		break;
		case 'double':
			buffer.writeDoubleLE(value, offset);
			offset += 8;
		break;
		case 'string':
			var length = Buffer.byteLength(value);
			
			//Encode length
			offset = writeBytes(buffer, offset, encoder.encodeUInt32(length));
			//write string
			buffer.write(value, offset, length);
			offset += length;
			//console.log('encode string length : %j, str : %j', length, value);
		break;
		default :
			if(!!protos.__protos[type]){
				//console.log('msg encode start, type :%j, value : %j, start : %j', type, value, offset);
				//Use a tmp buffer to build an internal msg
				var tmpBuffer = new Buffer(Buffer.byteLength(JSON.stringify(value)));
				var length = 0;
				
				length = encodeMsg(tmpBuffer, length, protos.__protos[type], value);
				//Encode length
				offset = writeBytes(buffer, offset, encoder.encodeUInt32(length));
				//contact the object
				tmpBuffer.copy(buffer, offset, 0, length);
				
				offset += length;
				//console.log('msg encode finish, offset : %j', offset);
			}
		break;
	}
	
	return offset;
}

/**
 * Encode reapeated properties, simple msg and object are decode differented
 */
function encodeArray(array, proto, offset, buffer, protos){
	if(util.isSimpleType(proto.type)){
		offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
		offset = writeBytes(buffer, offset, encoder.encodeUInt32(array.length));
		for(var i = 0; i < array.length; i++){
			offset = encodeProp(array[i], proto.type, offset, buffer);
		}
	}else{
		//console.log('encode array : %j', array);
		for(var i = 0; i < array.length; i++){
			offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
			//console.log('encode array value : %j', array[i]);
			offset = encodeProp(array[i], proto.type, offset, buffer, protos);
		}
	}
	
	return offset;
}

function writeBytes(buffer, offset, bytes){
	//console.log('wirte bytes : %j', bytes);
	
	for(var i = 0; i < bytes.length; i++){
		buffer.writeUInt8(bytes[i], offset);
		offset++;
	}
	
	return offset;
}

function encodeTag(type, tag){
	if(typeof(constant.TYPES[type]) === 'undefined'){
		type = 2;
	}
	
	//console.log('encode tag : %j', encoder.encodeUInt32(tag<<3|constant.TYPES[type]));
	
	return encoder.encodeUInt32(tag<<3|constant.TYPES[type]);
}