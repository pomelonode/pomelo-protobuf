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

