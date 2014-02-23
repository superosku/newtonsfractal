// Input data
var depth = 0;
var posx = 0;
var posy = 0;
var boxSize = 512;
var cache = {};
var inputData = [
	{'real': 1, 'imaginary': 0, 'r':255, 'g':0, 'b':0, },
	{'real': -0.5, 'imaginary':0.86603, 'r':0, 'g':255, 'b':0, },
	{'real': -0.5, 'imaginary':-0.86603, 'r':0, 'g':0, 'b':255, },
];

function moveRight() {
	posx += 0.5;
	drawImage();
}
function moveLeft() {
	posx -= 0.5;
	drawImage();
}
function moveUp() {
	posy -= 0.5;
	drawImage();
}
function moveDown() {
	posy += 0.5;
	drawImage();
}
function zoomOut() {
	depth -= 1;
	drawImage();
}
function zoomIn() {
	depth += 1;
	drawImage();
}

function drawImage() {
	var element = document.getElementById("my-canvas");
	iters = document.getElementById("iters").value;
	element.width = window.innerWidth-5;
	element.height = window.innerHeight-5;
	var ctx = element.getContext("2d");
	
	var zoom = Math.pow(2, depth);
	for (	var x = Math.floor(posx-element.width/boxSize/2);
			x < Math.ceil(posx+element.width/boxSize/2); x++) {
		for (	var y = Math.floor(posy-element.height/boxSize/2);
				y < Math.ceil(posy+element.height/boxSize/2); y++) {
			var key = String(depth) + ";" + String(x) + ";" + String(y);
			if (!(key in cache)) {
				var tempImg = ctx.createImageData(boxSize, boxSize);
				cache[key] = tempImg;
				var worker = new Worker("worker_script.js");
				worker.onmessage = function(event) {
					console.log("Worker ready");
					//element = document.getElementById("my-canvas");
					//ctx.putImageData(event.data.imageData, 200, 200);
					cache[event.data.key] = event.data.imageData;
				}
				console.log("Worker started");
				worker.postMessage({
					'inputData':inputData,
					'width':boxSize,
					'height':boxSize,
					'iters':iters, 
					'x':x/zoom, 
					'y':y/zoom, 
					'r':1/zoom, 
					'key':key,
					'imageData':ctx.createImageData(boxSize, boxSize)});
			}
			if (cache[key] != undefined) {
				ctx.putImageData(cache[key], (x-posx)*boxSize + element.width/2, (y-posy)*boxSize + element.height/2);
			}
		}
	}
}

// Dom manipulation
function addRoot() {
	inputData.push( {'real': 0, 'imaginary': 0, 'r': 255, 'g':255, 'b':255, } );
	generateForm();
	applyChanges();
}
function removeRoot(id) {
	inputData.splice(id, 1);
	generateForm();
	applyChanges();
}
function generateForm() {
	var table = document.getElementById("inputs");
	table.innerHTML = "";

	var tr = document.createElement("tr");
	['real', 'imaginary', 'R', 'G', 'B', 'delete'].forEach( function(item) {
		var th = document.createElement("th")
		th.appendChild(document.createTextNode(item));
		tr.appendChild(th);
	});
	table.appendChild(tr);

	var counter = 0;
	inputData.forEach(function(item) {
		var counterValue = counter;
		var tr = document.createElement("tr");
		['real', 'imaginary', 'r', 'g', 'b'].forEach( function(name) {
			var nameValue = name;
			var th = document.createElement("th")
			var input = document.createElement("input");
			input.value = item[name];
			input.onchange = function(e) {
				//console.log( input.value, counterValue, nameValue );
				inputData[counterValue][nameValue] = input.value;
			}
			input.id = name + '-' + counter;
			th.appendChild(input);
			tr.appendChild(th);
		});
		var th = document.createElement("th")
		var button = document.createElement("input");
		button.type = "button";
		button.value = "Delete";
		button.onclick = function(e) {
			removeRoot(counterValue);
		}
		th.appendChild(button);
		tr.appendChild(th);
		table.appendChild(tr);
		counter += 1;
	});
}
function toggleSettings() {
	var element = document.getElementById("settings");
	if (element.style.display == "block")
		element.style.display = "none";
	else
		element.style.display = "block";
}
function applyChanges() {
	cache = {};
	drawImage();
}

generateForm();
window.setInterval(drawImage,500);
window.onresize = drawImage;

