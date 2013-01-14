var buffer = new ArrayBuffer(8);
var float32Array = new Float32Array(buffer);
var float64Array = new Float64Array(buffer);
var uInt8Array = new Uint8Array(buffer);

var Encoder = module.exports;

Encoder.encodeUInt32 = function(n){
	var n = parseInt(n);
	if(isNaN(n) || n < 0){
		console.log(n);
		return null;
	}
	
	var result = [];
	while(n != 0){
		var tmp = n % 128;
		var next = Math.floor(n/128);
		
		if(next != 0)
			tmp = tmp + 128;
		result.push(tmp);
		n = next;
	}
	
	return result;
}

Encoder.encodeSInt32 = function(n){
	var n = parseInt(n);
	if(isNaN(n)){
		return null;
	}
	//console.log('n : %j, n<0 : %j, -n*2 : %j, -1 : %j',n, n<0, (-n)*2-1);
	n = n<0?(Math.abs(n)*2-1):n*2;
	
	//console.log(n);
	return Encoder.encodeUInt32(n);
}

Encoder.decodeUInt32 = function(bytes){
	var n = 0;
	
	for(var i = 0; i < bytes.length; i++){
		var m = parseInt(bytes[i]);
		n = n + ((m & 0x7f) * Math.pow(2,(7*i)));
		if(m < 128)
			return n;
	}
	
	return n;
}


Encoder.decodeSInt32 = function(bytes){
	var n = this.decodeUInt32(bytes);
	var flag = ((n%2) === 1)?-1:1;
	
	n = ((n%2 + n)/2)*flag;
	
	return n;
}

Encoder.encodeFloat = function(float){
	float32Array[0] = float;
	return uInt8Array;
}

Encoder.decodeFloat = function(bytes, offset){
	if(!bytes || bytes.length < (offset +4)){
		return null;
	}
	
	for(var i = 0; i < 4; i++){
		uInt8Array[i] = bytes[offet + i];
	}
	
	return float32Array[0];
}

Encoder.encodeDouble = function(double){
	float64Array[0] = double;
	return uInt8Array.subarray(0, 8);
}

Encoder.decodeDouble = function(bytes, offset){
	if(!bytes || bytes.length < (8 + offset)){
		return null;
	}
	
	for(var i = 0; i < 8; i++){
		uInt8Array[i] = bytes[offset + i];
	}
	
	return float64Array[0];	
}

Encoder.encodeStr = function(bytes, offset, str){
	for(var i = 0; i < str.length; i++){
		var code = str.charCodeAt(i);
		var codes = encode2UTF8(code);

		for(var j = 0; j < codes.length; j++){
			bytes[offset] = codes[j];
			offset++;
		}
	}
	
	return offset;
}

/**
 * Decode string from utf8 bytes
 */
Encoder.decodeStr = function(bytes, offset, length){
	var array = [];
	var end = offset + length;
	
	while(offset < end){
		var code = 0;
	
		if(bytes[offset] < 128){
			code = bytes[offset];
			
			//console.log('decode bytes : [%j]', bytes[offset]);
			offset += 1;
		}else if(bytes[offset] < 224){
			code = ((bytes[offset] & 0x3f)<<6) + (bytes[offset+1] & 0x3f);
			
			//console.log('decode bytes : [%j, %j]', bytes[offset], bytes[offset+1]);
			offset += 2;
		}else{
			code = ((bytes[offset] & 0x0f)<<12) + ((bytes[offset+1] & 0x3f)<<6) + (bytes[offset+2] & 0x3f);
			 
			//console.log('decode bytes : [%j, %j, %j]', bytes[offset], bytes[offset+1], bytes[offset + 2]);
			offset += 3;
		}

		array.push(code);

	}
	
	//console.log('array : %j, length : %j', array, array.length);
	var str = '';
	for(var i = 0; i < array.length;){
		str += String.fromCharCode.apply(null, array.slice(i, i + 10000));
		i += 10000;
	}
	
	return str;
}

/**
 * Return the byte length of the str use utf8
 */
Encoder.byteLength = function(str){
	if(typeof(str) !== 'string'){
		return -1;
	}
	
	var length = 0;
	
	for(var i = 0; i < str.length; i++){
		var code = str.charCodeAt(i);
		length += codeLength(code);
	}
	
	return length;
}

/**
 * Encode a unicode16 char code to utf8 bytes
 */
function encode2UTF8(charCode){
	if(charCode <= 0x7f){
		//console.log('code :%j, length : %j', charCode, 1);
		return [charCode];
	}else if(charCode <= 0x7ff){
		//console.log('code :%j, length : %j', charCode, 2);
		return [0xc0|(charCode>>6), 0x80|(charCode & 0x3f)];
	}else{
		//console.log('code :%j, length : %j', charCode, 3);
		return [0xe0|(charCode>>12), 0x80|((charCode & 0xfc0)>>6), 0x80|(charCode & 0x3f)];
	}
}

function codeLength(code){
	if(code <= 0x7f){
		return 1;
	}else if(code <= 0x7ff){
		return 2;
	}else{
		return 3;
	}
}