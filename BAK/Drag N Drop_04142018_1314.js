var dragging = false; // Is the object being dragged?

var MapN = 0;//Which map peice are we messing with
var RSlider, GSlider, BSlider;
var RInput, GInput, BInput;
var CCheckBox, CClear;
var SaveButton;
var kludge = 0;

var offsetX = 0, offsetY = 0;    // Mouseclick offset

var scl = 32;//Square Scale

var cols = 100;//Columns
var rows = 100;//Rows

var img = [];
function preload() {
	
	var Timg = 46;//Total Images
	for(var i = 0; i <= Timg; i++){
		img[i] = loadImage('assets/' + i + '.png');
	}
	
	img[img.length] = loadImage('assets/TrashCan.png');//Trashcan Icon
	img[img.length] = loadImage('assets/Border.png');//Border for Color
}
var mapTiles = [];

function setup() {
	createCanvas(cols*scl,rows*scl);
	
	RSlider = createSlider(0,255,127);
	RSlider.changed(function RSliderC() {RInput.value(this.value());});
	RSlider.style('width', scl*2.8+'px');
	GSlider = createSlider(0,255,127);
	GSlider.changed(function GSliderC() {GInput.value(this.value());});
	GSlider.style('width', scl*2.8+'px');
	BSlider = createSlider(0,255,127);
	BSlider.changed(function BSliderC() {BInput.value(this.value());});
	BSlider.style('width', scl*2.8+'px');
	RInput = createInput(255);
	RInput.input(function RInputC() {RSlider.value(this.value());});
	RInput.style('width', scl+'px');
	GInput = createInput(255);
	GInput.input(function GInputC() {GSlider.value(this.value());});
	GInput.style('width', scl+'px');
	BInput = createInput(255);
	BInput.input(function BInputC() {BSlider.value(this.value());});
	BInput.style('width', scl+'px');
	CCheckBox = createCheckbox('Clear', false);
	CCheckBox.changed(function CCheckBoxF() {if(this.checked()){CClear = true;}else{CClear = false;}});
	SaveButton = createButton('Save');
	SaveButton.mousePressed(SaveCanvas);
	
}


function SaveCanvas(){
	save('MapCanvas.png');
}


function draw() {
	background(255);
	
	kludge++;
	if(kludge > 30){
		window.scrollTo(window.pageXOffset, Math.floor(window.pageYOffset/scl) * scl);
		kludge = 0;
	}
	
	fill(RSlider.value(),GSlider.value(),BSlider.value());
	rect(scl*2, scl + window.pageYOffset, scl*4, scl);
	
	image(img[img.length-1], scl*2, scl + window.pageYOffset);//Color Test
	
	for(var i = 0; i < mapTiles.length; i++){
		if(!dragging){
			if(mapTiles[i].x == scl && mapTiles[i].y == scl + window.pageYOffset){
				if(mapTiles.length > 1){
					for(var j = i; j < mapTiles.length - 1; j++){
						mapTiles[j] = mapTiles[j + 1];
					}
				}
				mapTiles = shorten(mapTiles);
			}
		}
	}
	for(var i = 0; i < mapTiles.length; i++){
		if(!dragging){
			if(mapTiles[i].x == scl*2 && mapTiles[i].y == scl + window.pageYOffset){
				RSlider.value(red(mapTiles[i].color));
				GSlider.value(green(mapTiles[i].color));
				BSlider.value(blue(mapTiles[i].color));
				RInput.value(red(mapTiles[i].color));
				GInput.value(green(mapTiles[i].color));
				BInput.value(blue(mapTiles[i].color));
				mapTiles[i].x = 0;
				mapTiles[i].y = scl + window.pageYOffset;
			}
		}
	}
	
	RSlider.position(scl*3, scl+((scl/6)*1) + window.pageYOffset);
	GSlider.position(scl*3, scl+((scl/6)*3) + window.pageYOffset);
	BSlider.position(scl*3, scl+((scl/6)*5) + window.pageYOffset);
	RInput.position((scl*8)+(scl/2), scl+(scl/2) + window.pageYOffset);
	GInput.position((scl*9)+(scl/2), scl+(scl/2) + window.pageYOffset);
	BInput.position((scl*10)+(scl/2), scl+(scl/2) + window.pageYOffset);
	CCheckBox.position((scl*6)+(scl/2), scl+(scl/2) + window.pageYOffset);
	SaveButton.position((scl*11.5)+(scl/2), scl+(scl/2) + window.pageYOffset);
	
	for(var i = 0; i < img.length - 2; i++){
		image(img[i], scl*i, window.pageYOffset);//Tiles
	}
	image(img[img.length-2], scl, scl + window.pageYOffset);//Trash Can
  
	for(var i = 0; i < cols + 1; i++){
		line(scl * i, 0, scl * i, rows*scl);
	}
	for(var i = 0; i < rows + 1; i++){
		line(0, scl * i, cols*scl, scl * i);
	}
  
	// Adjust location if being dragged
	if (dragging) {
		mapTiles[mapN].x = mouseX + offsetX;
		mapTiles[mapN].y = mouseY + offsetY;
	}
	
	for(var i = 0; i < mapTiles.length; i++){
		if(!mapTiles[i].clear){
			fill(mapTiles[i].color);
			rect(mapTiles[i].x,mapTiles[i].y,scl,scl);
		}
		image(img[mapTiles[i].image], mapTiles[i].x, mapTiles[i].y);
	}
}

function mousePressed() {
	for(var i = 0; i < img.length; i++){
		if(mouseX > scl*i && mouseX < scl*(i+1) && mouseY > 0 + window.pageYOffset && mouseY < scl + window.pageYOffset){
			//TileN = 0;
			mapTiles[mapTiles.length] = new mTile(scl*i,0 + window.pageYOffset,i,color(RSlider.value(),GSlider.value(),BSlider.value()), CClear);
		}
	}
	if(mouseX > scl*2 && mouseX < scl*3 && mouseY > scl + window.pageYOffset && mouseY < scl*2 + window.pageYOffset){
		mapTiles[mapTiles.length] = new mTile(scl*2,scl + window.pageYOffset,img.length-1,color(RSlider.value(),GSlider.value(),BSlider.value()), false);
	}
	// Did I click on the rectangle?
	for(var i = mapTiles.length-1; i >= 0; i--){
		if(mouseX > mapTiles[i].x && mouseX < mapTiles[i].x + scl && mouseY > mapTiles[i].y && mouseY < mapTiles[i].y + scl){
			if(mouseButton == CENTER){
				if(mapTiles.length > 1){
					for(var j = i; j < mapTiles.length - 1; j++){
						mapTiles[j] = mapTiles[j + 1];
					}
				}
				mapTiles = shorten(mapTiles);
				return false;
			}else{
				mapN = i;
				dragging = true;
				// If so, keep track of relative location of click to corner of rectangle
				offsetX = mapTiles[i].x-mouseX;
				offsetY = mapTiles[i].y-mouseY;
				return false;
			}
		}
	}
	if(!(mouseY < scl*2 + window.pageYOffset) && mouseY < (windowHeight - (scl*1.5)) + window.pageYOffset && mouseX < (windowWidth - (scl)) + window.pageXOffset){
		if(mouseButton == CENTER){
			mapTiles[mapTiles.length] = new mTile(Math.floor(mouseX/scl)*scl,Math.floor(mouseY/scl)*scl,img.length-1,color(RSlider.value(),GSlider.value(),BSlider.value()), false);
		}
	}
	if(mouseButton == CENTER){return false;}
}

function mouseReleased() {
	// Quit dragging
	if(dragging){
		mapTiles[mapN].x = Math.floor(mouseX / scl) * scl;
		mapTiles[mapN].y = Math.floor(mouseY / scl) * scl;
	}
	dragging = false;
}

function mTile(x, y, image, color, clear) {
	this.x = x;
	this.y = y;
	this.image = image;
	this.color = color;
	this.clear = clear;
}