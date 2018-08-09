var dragging = false; // Is the object being dragged?
var deleting = false;//Are we deleting tiles?
var notile = false;//Are we blocking placement of tiles?

var MapN = 0;//Which map peice are we messing with
var Timg = 46;//Total Images
var RSlider, GSlider, BSlider;//RGB Sliders
var RInput, GInput, BInput;//RGB number Inputs
var CCheckBox, CClear;//Clear Checkbox
var SaveButton, LoadButton, DeleteButton, ClearButton, FileSaveButton, FileLoadButton;
var NextButton, PrevButton;//Next and Previous row buttons
var RowLength = 16;//How many tiles per row?
var TileRow = 0;//Which row of tiles are we looking at?
var TileN = 1;//Which tile is the cursor over?

var offsetX = 0, offsetY = 0;    // Mouseclick offset

var scl = 32;//Square Scale

var cols = 100;//Columns
var rows = 100;//Rows


var SX = SY = 0;//Screen XY
var mX, mY, pX, pY;//Mouse XY, Page Offset XY
var fV = 1;//Fudge Value
var scrollamount = 5;

var img = [];
var mapTiles = [];


function preload() {
	img[img.length] = loadImage('assets/Border.png');//Border for Color
	
	for(var i = 0; i <= Timg; i++){
		img[i+1] = loadImage('assets/' + i + '.png');
	}
	
	//img[img.length] = loadImage('assets/TrashCan.png');//Trashcan Icon
	//img[img.length] = loadImage('assets/Border.png');//Border for Color
}

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
	
	LoadButton = createButton('Load');
	LoadButton.mousePressed(LoadCanvas);
	
	DeleteButton = createButton('Delete');
	DeleteButton.mousePressed(DeleteCanvas);
	
	ClearButton = createButton('Clear');
	ClearButton.mousePressed(ClearCanvas);
	
	FileSaveButton = createButton('Save File');
	FileSaveButton.mousePressed(FileSaveCanvas);
	
	//FileLoadButton = createFileInput(FileLoadCanvas);
	
	NextButton = createButton('Next');
	NextButton.mousePressed(NextButtonC);
	
	PrevButton = createButton('Prev');
	PrevButton.mousePressed(PrevButtonC);
	
}

function NextButtonC() {
		TileRow++;
		if(TileRow > Timg/RowLength){
			TileRow = 0;
		}
		TileN += RowLength;
		if(TileN > Timg + 1){
			TileN = TileN - (Timg + 2);
		}
	}

function PrevButtonC() {
		TileRow--;
		if(TileRow < 0){
			TileRow = Math.floor(Timg/RowLength);
		}
		TileN -= RowLength;
		if(TileN < 0){
			TileN = (Timg + 2) - (0 - TileN);
		}
	}


function SaveCanvas(){
	//save('MapCanvas.png');
	var MapJSON = JSON.stringify(mapTiles);
	//save(MapJSON, 'Map.json');
	localStorage.setItem("MapJSON", MapJSON);
	//localStorage.removeItem("MapJSON");
}

function FileSaveCanvas(){
	save('MapCanvas.png');
	//var MapJSON = JSON.stringify(mapTiles);
	//saveJSON(mapTiles, 'Map2.json');
	//localStorage.setItem("MapJSON", MapJSON);
	//localStorage.removeItem("MapJSON");
}

function LoadCanvas(){
	mapTiles = JSON.parse(localStorage.getItem("MapJSON"));
	if(mapTiles == null){
		mapTiles = [];
	}
}

function FileLoadCanvas(file){
	mapTiles = JSON.parse(file);
	if(mapTiles == null){
		mapTiles = [];
	}
}

function DeleteCanvas(){
	localStorage.removeItem("MapJSON");
	//mapTiles = [];
}

function ClearCanvas(){
	//localStorage.removeItem("MapJSON");
	//TilesJSON = [];
	mapTiles = [];
}


function draw() {
	mX = mouseX;
	my = mouseY;
	pX = window.pageXOffset;
	pY = window.pageYOffset;
	
	background(255);
	
	window.scrollTo(Math.floor((SX)/scl) * scl, Math.floor((SY)/scl) * scl)//window.pageXOffset, Math.floor(window.pageYOffset/scl) * scl);
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	CCheckBox.position((scl*3)+(scl/2) + pX, scl+(scl/2.2) + pY);
	SaveButton.position((scl*8.5)+(scl/2) + pX, scl+(scl/2.5) + pY);
	LoadButton.position((scl*10)+(scl/2) + pX, scl+(scl/2.5) + pY);
	DeleteButton.position((scl*11.5)+(scl/2) + pX, scl+(scl/2.5) + pY);
	ClearButton.position((scl*13)+(scl/2) + pX, scl+(scl/2.5) + pY);
	FileSaveButton.position((scl*14.5)+(scl/2) + pX, scl+(scl/2.5) + pY);
	//FileLoadButton.position((scl*19.5)+(scl/2) + pX, scl+(scl/2) + pY);
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	for(var i = 0; i < cols + 1; i++){
		line(scl * i, 0, scl * i, rows*scl);
	}
	for(var i = 0; i < rows + 1; i++){
		line(0, scl * i, cols*scl, scl * i);
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Adjust location if being dragged
	if (dragging) {
		mapTiles[mapN].x = mX + offsetX;
		mapTiles[mapN].y = my + offsetY;
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	for(var i = 0; i < mapTiles.length; i++){//Display Map Tiles
		if(!mapTiles[i].clear){
			fill(mapTiles[i].r,mapTiles[i].g,mapTiles[i].b);
			rect(mapTiles[i].x,mapTiles[i].y,scl,scl);
		}
		image(img[mapTiles[i].image], mapTiles[i].x, mapTiles[i].y);
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	RSlider.position(0 + pX, scl+((scl/6)*1) + pY);
	GSlider.position(0 + pX, scl+((scl/6)*3) + pY);
	BSlider.position(0 + pX, scl+((scl/6)*5) + pY);
	RInput.position((scl*5)+(scl/2) + pX, scl+(scl/2.5) + pY);
	GInput.position((scl*6)+(scl/2) + pX, scl+(scl/2.5) + pY);
	BInput.position((scl*7)+(scl/2) + pX, scl+(scl/2.5) + pY);
	
	fill(RSlider.value(),GSlider.value(),BSlider.value());
	//rect(scl*2 + window.pageXOffset, scl + window.pageYOffset, scl*4, scl);
	rect(0 + pX, scl + pY, scl*3, scl);
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/*for(var i = 0; i < mapTiles.length; i++){//Color Tiles
		if(!dragging){
			if(mapTiles[i].x == scl*2 + window.pageXOffset && mapTiles[i].y == scl + window.pageYOffset){
				RSlider.value(red(mapTiles[i].color));
				GSlider.value(green(mapTiles[i].color));
				BSlider.value(blue(mapTiles[i].color));
				RInput.value(red(mapTiles[i].color));
				GInput.value(green(mapTiles[i].color));
				BInput.value(blue(mapTiles[i].color));
				mapTiles[i].x = 0 + window.pageXOffset;
				mapTiles[i].y = scl + window.pageYOffset;
			}
		}
	}
	
	image(img[img.length-1], scl*2 + window.pageXOffset, scl + window.pageYOffset);//Color Picker*/
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	fill(255);
	rect(pX, pY, scl*RowLength, scl);
	for(var i = 0; i < RowLength; i++){//Pickable Tiles
		if(RowLength*TileRow+i <= Timg+1){
			if(RowLength*TileRow+i == TileN){
				fill(RSlider.value(),GSlider.value(),BSlider.value());
				rect(scl*i + pX, pY, scl, scl);
			}
			image(img[RowLength*TileRow+i], scl*i + pX, pY);
		}
	}
	
	NextButton.position(scl*(RowLength+1.7) + pX, (scl/2.5) + pY);
	PrevButton.position(scl*(RowLength+.35) + pX, (scl/2.5) + pY);
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/*for(var i = 0; i < mapTiles.length; i++){//Trash
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
	}*/
	
	//image(img[img.length-2], scl, scl + window.pageYOffset);//Trash Can
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	
	
	
	/*push();
	noFill();
	translate(scl*4.5, scl*4.53);
	//rotate(frameCount / -100.0);
	polygon(0, 0, scl/1.7, 6); 
	pop();*/
}

function mousePressed() {
	mX = mouseX;
	my = mouseY;
	pX = window.pageXOffset;
	pY = window.pageYOffset;
	
	if(mX > 0 + pX && mX < scl*(RowLength+3) + pX && my > scl + pY && my < scl*2 + pY){
		notile = true;
		return;
	}

	for(var i = 0; i < RowLength; i++){
		if(mX > scl*i + pX + fV && mX < scl*(i+1) + pX - fV && my > 0 + pY + fV && my < scl + pY - fV){
			mapTiles[mapTiles.length] = new mTile(scl*i + pX,0 + pY,i,RSlider.value(),GSlider.value(),BSlider.value(), CClear);
			notile = true;
			TileN = RowLength*TileRow+i;
		}
	}
	/*if(mouseX > scl*2 + window.pageXOffset && mouseX < scl*3 + window.pageXOffset && mouseY > scl + window.pageYOffset && mouseY < scl*2 + window.pageYOffset){
		mapTiles[mapTiles.length] = new mTile(scl*2 + window.pageXOffset,scl + window.pageYOffset,img.length-1,color(RSlider.value(),GSlider.value(),BSlider.value()), false);
	}*/
	// Did I click on the rectangle?
	for(var i = mapTiles.length-1; i >= 0; i--){
		if(mX > mapTiles[i].x - fV && mX < mapTiles[i].x + scl + fV && my > mapTiles[i].y - fV && my < mapTiles[i].y + scl + fV){
			if(mouseButton == CENTER){
				if(mapTiles.length > 1){
					for(var j = i; j < mapTiles.length - 1; j++){
						mapTiles[j] = mapTiles[j + 1];
					}
				}
				mapTiles = shorten(mapTiles);
				deleting = true;
				return false;
			}else if(mouseButton == LEFT){
				mapN = i;
				dragging = true;
				// If so, keep track of relative location of click to corner of rectangle
				offsetX = mapTiles[i].x-mX;
				offsetY = mapTiles[i].y-my;
				RSlider.value(mapTiles[i].r);
				GSlider.value(mapTiles[i].g);
				BSlider.value(mapTiles[i].b);
				RInput.value(mapTiles[i].r);
				GInput.value(mapTiles[i].g);
				BInput.value(mapTiles[i].b);
				return false;
			}/*else if(mouseButton == RIGHT){
				return false;
			}*/
		}
	}
	if(!(my < scl*2 + pY) && my < (windowHeight - (scl*1.5)) + pY && mX < (windowWidth - (scl)) + pX){
		if(mouseButton == CENTER){
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(my/scl)*scl,0/*img.length-1*/,RSlider.value(),GSlider.value(),BSlider.value(), false);
			//console.log(mapTiles[mapTiles.length-1].color);
			deleting = false;
		}
		if(mouseButton == LEFT){
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(my/scl)*scl,TileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);
			//console.log(mapTiles[mapTiles.length-1].color);
		}
	}
	if(mouseButton == CENTER){return false;}
	//if(mouseButton == RIGHT){return false;}
}

function mouseDragged(){
	mX = mouseX;
	my = mouseY;
	pX = window.pageXOffset;
	pY = window.pageYOffset;
	
	if(mouseButton == CENTER && deleting){
		for(var i = mapTiles.length-1; i >= 0; i--){
			if(mX > mapTiles[i].x - fV && mX < mapTiles[i].x + scl + fV && my > mapTiles[i].y - fV && my < mapTiles[i].y + scl + fV){
				if(mapTiles.length > 1){
					for(var j = i; j < mapTiles.length - 1; j++){
						mapTiles[j] = mapTiles[j + 1];
					}
				}
				mapTiles = shorten(mapTiles);
				//return false;
			}
		}
	}

	if(notile){
		return;
	}
	if(dragging){
		return false;
	}
	for(var i = mapTiles.length-1; i >= 0; i--){
		if(mX > mapTiles[i].x - fV && mX < mapTiles[i].x + scl + fV && my > mapTiles[i].y - fV && my < mapTiles[i].y + scl + fV){// && !CClear){
			return false;
		}
	}

	if(!(my < scl*2 + pY + fV) && my < (windowHeight - (scl*1.5)) + pY + fV && mX < (windowWidth - (scl)) + pX + fV){
		if(mouseButton == CENTER && !deleting){
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(my/scl)*scl,0/*img.length-1*/,RSlider.value(),GSlider.value(),BSlider.value(), false);
			//console.log(mapTiles[mapTiles.length-1].color);
		}else if(mouseButton == LEFT){
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(my/scl)*scl,TileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);
			//console.log(mapTiles[mapTiles.length-1].color);
		}
	}
	//return false;
}

function mouseReleased() {
	// Quit dragging
	if(dragging){
		mapTiles[mapN].x = Math.floor(mouseX / scl) * scl;
		mapTiles[mapN].y = Math.floor(mouseY / scl) * scl;
	}
	dragging = false;
	notile = false;

	for(var i = mapTiles.length-1; i >= 0; i--){
		if(mapTiles[i].x >= pX && mapTiles[i].x < scl*RowLength + pX && mapTiles[i].y == pY){
			if(mapTiles.length > 1){
				for(var j = i; j < mapTiles.length - 1; j++){
					mapTiles[j] = mapTiles[j + 1];
				}
			}
			mapTiles = shorten(mapTiles);
			//return false;
		}
	}
	//console.log(mapTiles.length);
}

function keyTyped() {
	if(key == 'q'){
		TileN--;
		if(TileN < 0){
			TileN = Timg + 1;
			TileRow = Math.floor(Timg/RowLength);
		}
		if(TileN < RowLength*TileRow){
			TileRow--;
			if(TileRow < 0){
				TileRow = Math.floor(Timg/RowLength);
			}
		}
	}else if(key == 'e'){
		TileN++;
		if(TileN > Timg + 1){
			TileN = 0;
			TileRow = 0;
		}
		if(TileN == RowLength*(TileRow+1)){
			TileRow++;
			if(TileRow > Timg/RowLength){
				TileRow = 0;
			}
		}
	}else if(key == 'w'){
		SY = window.pageYOffset - (scl * scrollamount);
	}else if(key == 'a'){
		SX = window.pageXOffset - (scl * scrollamount);
	}else if(key == 's'){
		SY = window.pageYOffset + (scl * scrollamount);
	}else if(key == 'd'){
		SX = window.pageXOffset + (scl * scrollamount);
	}else if(key == 'c'){
		if(CClear){
			CClear = false;
			CCheckBox.checked(false);
		}else{
			CClear = true;
			CCheckBox.checked(true);
		}
	}else if(key == 'z'){
		PrevButtonC();
	}else if(key == 'x'){
		NextButtonC();
	}
	//console.log(TileN);
}

function mTile(x, y, image, r, g, b, clear) {
	this.x = x;
	this.y = y;
	this.image = image;
	this.r = r;
	this.g = g;
	this.b = b;
	this.clear = clear;
}

function polygon(x, y, radius, npoints) {
  var angle = TWO_PI / npoints;
  beginShape();
  for (var a = 0; a < TWO_PI; a += angle) {
    var sx = x + cos(a) * radius;
    var sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}