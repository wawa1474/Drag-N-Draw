var dragging = false; // Is the object being dragged?
var deleting = false;//Are we deleting tiles?
var notile = false;//Are we blocking placement of tiles?

var MapN = 0;//Which map peice are we messing with
var TileN = 0;//Which tile is the cursor over
var Timg = 46;//Total Images
var RSlider, GSlider, BSlider;
var RInput, GInput, BInput;
var CCheckBox, CClear;
var SaveButton, LoadButton, DeleteButton, ClearButton;
var kludge = 0;

var offsetX = 0, offsetY = 0;    // Mouseclick offset

var scl = 32;//Square Scale

var cols = 100;//Columns
var rows = 100;//Rows


var SX = SY = 0;
var mX, mY, pX, pY;
var fV = 1;
var scrollamount = 5;

var img = [];
var mapTiles = [];

var tileT = 0;


function preload() {
	for(var i = 0; i <= Timg; i++){
		img[i] = loadImage('assets/' + i + '.png');
	}
	
	img[img.length] = loadImage('assets/TrashCan.png');//Trashcan Icon
	img[img.length] = loadImage('assets/Border.png');//Border for Color
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
	//LoadButton = createFileInput(LoadCanvas);
	
}


function SaveCanvas(){
	//save('MapCanvas.png');
	var MapJSON = JSON.stringify(mapTiles);
	//save(MapJSON, 'Map.json');
	localStorage.setItem("MapJSON", MapJSON);
	//localStorage.removeItem("MapJSON");
}

function LoadCanvas(){
	mapTiles = JSON.parse(localStorage.getItem("MapJSON"));
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
	CCheckBox.position((scl*6)+(scl/2) + pX, scl+(scl/2) + pY);
	SaveButton.position((scl*11.5)+(scl/2) + pX, scl+(scl/2) + pY);
	LoadButton.position((scl*13)+(scl/2) + pX, scl+(scl/2) + pY);
	DeleteButton.position((scl*14.5)+(scl/2) + pX, scl+(scl/2) + pY);
	ClearButton.position((scl*16)+(scl/2) + pX, scl+(scl/2) + pY);
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
	}/*else{
		if(mouseButton == LEFT){
			for(var i = mapTiles.length-1; i >= 0; i--){
				if(mouseX > mapTiles[i].x && mouseX < mapTiles[i].x + scl && mouseY > mapTiles[i].y && mouseY < mapTiles[i].y + scl){
					//Hold left mouse or middle mouse and drag to place tiles
				}
			}
		}
	}*/
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
	RSlider.position(scl*3 + pX, scl+((scl/6)*1) + pY);
	GSlider.position(scl*3 + pX, scl+((scl/6)*3) + pY);
	BSlider.position(scl*3 + pX, scl+((scl/6)*5) + pY);
	RInput.position((scl*8)+(scl/2) + pX, scl+(scl/2) + pY);
	GInput.position((scl*9)+(scl/2) + pX, scl+(scl/2) + pY);
	BInput.position((scl*10)+(scl/2) + pX, scl+(scl/2) + pY);
	
	fill(RSlider.value(),GSlider.value(),BSlider.value());
	//rect(scl*2 + window.pageXOffset, scl + window.pageYOffset, scl*4, scl);
	rect(scl*3 + pX, scl + pY, scl*3, scl);
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
	for(var i = 0; i < img.length - 2; i++){//Pickable Tiles
		if(i == TileN){
			fill(RSlider.value(),GSlider.value(),BSlider.value());
			rect(scl*i + pX, pY, scl, scl);
		}
		image(img[i], scl*i + pX, pY);
	}
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
	if(tileT != mapTiles.length){
		tileT = mapTiles.length;
		console.log(tileT);
	}
}

function mousePressed() {
	mX = mouseX;
	my = mouseY;
	pX = window.pageXOffset;
	pY = window.pageYOffset;
	
	if(mX > scl*3 + pX && mX < scl*6 + pX && my > scl + pY && my < scl*2 + pY){
		notile = true;
		return;
	}

	for(var i = 0; i < img.length; i++){
		if(mX > scl*i + pX + fV && mX < scl*(i+1) + pX - fV && my > 0 + pY + fV && my < scl + pY - fV){
			mapTiles[mapTiles.length] = new mTile(scl*i + pX,0 + pY,i,RSlider.value(),GSlider.value(),BSlider.value(), CClear);
			TileN = i;
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
			}else{
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
			}
		}
	}
	if(!(my < scl*2 + pY) && my < (windowHeight - (scl*1.5)) + pY && mX < (windowWidth - (scl)) + pX){
		if(mouseButton == CENTER){
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(my/scl)*scl,img.length-1,RSlider.value(),GSlider.value(),BSlider.value(), false);
			//console.log(mapTiles[mapTiles.length-1].color);
			deleting = false;
		}
		if(mouseButton == LEFT){
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(my/scl)*scl,TileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);
			//console.log(mapTiles[mapTiles.length-1].color);
		}
	}
	if(mouseButton == CENTER){return false;}
}

function mouseDragged(){
	mX = mouseX;
	my = mouseY;
	pX = window.pageXOffset;
	pY = window.pageYOffset;

	if(notile){
		return;
	}
	if(dragging){
		return false;
	}
	for(var i = mapTiles.length-1; i >= 0; i--){
		if(mX > mapTiles[i].x - fV && mX < mapTiles[i].x + scl + fV && my > mapTiles[i].y - fV && my < mapTiles[i].y + scl + fV){
			return false;
		}
	}

	if(!(my < scl*2 + pY + fV) && my < (windowHeight - (scl*1.5)) + pY + fV && mX < (windowWidth - (scl)) + pX + fV){
		if(mouseButton == CENTER && !deleting){
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(my/scl)*scl,img.length-1,RSlider.value(),GSlider.value(),BSlider.value(), false);
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
}

function keyTyped() {
	if(key == 'q'){
		if(TileN == 0){
			TileN = Timg;
		}else{
			TileN--;
		}
	}else if(key == 'e'){
		if(TileN == Timg){
			TileN = 0;
		}else{
			TileN++;
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