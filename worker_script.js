var Complex = function(real, imag) {
	this.real = Number(real);
	this.imag = Number(imag);
}
Complex.prototype.add = function(other) {
	return new Complex(
			this.real+other.real,
			this.imag+other.imag);
}
Complex.prototype.sub = function(other) {
	return new Complex(
			this.real-other.real,
			this.imag-other.imag);
}
Complex.prototype.mul = function(other) {
	return new Complex(
			this.real*other.real - this.imag*other.imag,
			this.real*other.imag + this.imag*other.real);
}
Complex.prototype.ineg = function() {
	return new Complex(
			this.real,
			-this.imag);
}
Complex.prototype.div = function(other) {
	var n = this.mul(other.ineg());
	var d = other.real*other.real + other.imag*other.imag;
	return new Complex(
			n.real / d,
			n.imag / d);
}
Complex.prototype.equ = function(other) {
	return (this.real == other.real && this.imag == other.imag);
}

function getNextIter(number, nullPoints) {		
	var one = new Complex(1, 0);
	var ret = new Complex(0, 0);
	for (var j = 0; j < nullPoints.length; j ++) {
		item = nullPoints[j];
		ret = ret.add(one.div(item.sub(number)));//.sub(item)));
	}
	return number.add(one.div(ret));
}

function getColorAt(number, inputData, nullPoints, iters) {
	var color = {'r':0, 'g':0, 'b':0};
	var running = true;
	for (var i = 0; i < iters && running; i ++) {
		for (var j = 0; j < inputData.length; j ++) {
			item = inputData[j];
			a = number.real - item.real;
			b = number.imag - item.imaginary;
			if ( a*a+b*b < 0.01 ) {
				color = {
					'r':((iters-i)*item.r)/iters,
					'g':((iters-i)*item.g)/iters,
					'b':((iters-i)*item.b)/iters, };
				running = false;
			}
		}
		number = getNextIter(number, nullPoints);
	}
	return color;
}
function setPixel(data, x, y, color) {
	index = (x + y * data.width) * 4;
	data.data[index+0] = color.r;
	data.data[index+1] = color.g;
	data.data[index+2] = color.b;
	data.data[index+3] = 255;
}

// Parameters:
// heigth			width of the returned image data
// widt				heigth of the returned iamge datah
// x, y				positions in complex space
// r				size in complex plane
// inputData		complec functions and colors
// iters			how many iters
self.addEventListener('message', function(e) {
	data = e.data;
	var nullPoints = [];	
	for (var i = 0; i < data.inputData.length; i ++) {
		nullPoints.push(
			new Complex(
				data.inputData[i].real, 
				data.inputData[i].imaginary));
	}
	for ( i = 0; i < data.width; i ++) {
		for ( j = 0; j < data.height; j ++) {
			setPixel(data.imageData, i, j, getColorAt(new Complex(
							(data.x + data.r * (i/data.width)),
							(data.y + data.r * (j/data.height))), data.inputData, nullPoints, data.iters));
		}
	}
	postMessage({'imageData':data.imageData, 'key':data.key});
});

