var buffer = new ArrayBuffer(8);
var float32Array = new Float32Array(buffer);
var float64Array = new Float64Array(buffer);
var uInt8Array = new Uint8Array(buffer);

var Encoder = module.exports;

Encoder.encodeFloat = function(float){
	float32Array[0] = float;
	return uInt8Array;
}

Encoder.decodeFloat = function(bytes){
	if(!bytes || bytes.length < 4){
		return null;
	}
	
	for(var i = 0; i < 4; i++){
		uInt8Array[i] = bytes[i];
	}
	
	return float32Array[0];
}

Encoder.encodeDouble = function(double){
	float64Array[0] = double;
	return uInt8Array.subarray(0, 8);
}

Encoder.decodeDouble = function(bytes){
	if(!bytes || bytes.length < 8){
		return null;
	}
	
	for(var i = 0; i < 8; i++){
		uInt8Array[i] = bytes[i];
	}
	
	return float64Array[0];	
}

Encoder.encodeStr = function(buffer, offset, str){
	for(var i = 0; i < str.length; i++){
		var code = str.charCodeAt(i);
		var bytes = encode2UTF8(code);
		for(var i = 0; i < bytes.length){
			buffer[offset] = bytes[i];
			offset++;
		}
	}
	
	return offset;
}

/**
 * Return the byte length of the str use utf8
 */
Encoder.byteLength = function(str){
	if(typeof(str) !== 'string'){
		return -1;
	}
	
	var length;
	
	for(var i = 0; i < str.length; i++){
		var code = str.charCodeAt(i);
		if(code <= 0x7f){
			length += 1;
		}else if(code <= 0x7ff){
			length += 2;
		}else{
			length += 3;
		}
	}
	
	return length;
}

/**
 * Encode a unicode16 char code to utf8 bytes
 */
function encode2UTF8 = function(charCode){
	if(charCode < 0x7f){
		return [charCode];
	}else if(charCode < 0x7ff){
		return [0xc0|(charCode>>6), 0x80|(charCode & 0x3f)];
	}else{
		return [0xe0|(charCode>>12), 0x80|(charCode & 0xfc0), 0x80|(charCode & 0x3f)];
	}
}

function decodeUTF8 = function(){
	
}