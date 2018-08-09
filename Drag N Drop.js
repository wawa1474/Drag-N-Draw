var dragging = false; // Is the object being dragged?
var deleting = false;//Are we deleting tiles?
var noTile = false;//Are we blocking placement of tiles?

var mapN = 0;//Which map peice are we messing with
var totalImages = 46;//Total Images
var RSlider, GSlider, BSlider;//RGB Sliders
var RInput, GInput, BInput;//RGB number Inputs
var CCheckBox, CClear;//Clear Checkbox
var SaveButton, LoadButton, DeleteButton, ClearButton, FileSaveButton, FileLoadButton;//Button Variables
var NextButton, PrevButton;//Next and Previous row buttons
var rowLength = 16;//How many tiles per row?
var tileRow = 0;//Which row of tiles are we looking at?
var tileN = 1;//Which tile is the cursor over?

var tileBorderNumber = 0;//What number in img[] is the border

var offsetX = 0, offsetY = 0;//Mouseclick offset

var scl = 32;//Square Scale

var cols = 100;//Columns
var rows = 100;//Rows


var SX = SY = 0;//Screen XY
var mX, mY, pX, pY;//Mouse XY, Page Offset XY
var fV = 1;//Fudge Value
var scrollAmount = 5;//How many squares to scroll when pressing WASD

var img = [];//Tile Image Array
var mapTiles = [];//Map Tiles Array


function preload(){
	img[tileBorderNumber] = loadImage('assets/Border.png');//Border for Color
	
	for(var i = 0; i <= totalImages; i++){
		img[i+1] = loadImage('assets/' + i + '.png');
	}
}//preload() END

function setup(){
	createCanvas(cols*scl,rows*scl);//(Width, Height)
	
	RSlider = createSlider(0,255,127);//(Min, Max, Start)
	RSlider.changed(function RSliderC() {RInput.value(this.value());});//The function to run when changed
	RSlider.style('width', scl*2.8+'px');//Width of slider
	
	GSlider = createSlider(0,255,127);//(Min, Max, Start)
	GSlider.changed(function GSliderC() {GInput.value(this.value());});//The function to run when changed
	GSlider.style('width', scl*2.8+'px');//Width of slider
	
	BSlider = createSlider(0,255,127);//(Min, Max, Start)
	BSlider.changed(function BSliderC() {BInput.value(this.value());});//The function to run when changed
	BSlider.style('width', scl*2.8+'px');//Width of slider
	
	RInput = createInput(255);//(Start)
	RInput.input(function RInputC() {RSlider.value(this.value());});//The function to run when changed
	RInput.style('width', scl+'px');//Width of input box
	
	GInput = createInput(255);//(Start)
	GInput.input(function GInputC() {GSlider.value(this.value());});//The function to run when changed
	GInput.style('width', scl+'px');//Width of input box
	
	BInput = createInput(255);//(Start)
	BInput.input(function BInputC() {BSlider.value(this.value());});//The function to run when changed
	BInput.style('width', scl+'px');//Width of input box
	
	CCheckBox = createCheckbox('Clear', false);//(Start Unchecked)
	CCheckBox.changed(function CCheckBoxF() {if(this.checked()){CClear = true;}else{CClear = false;}});//The function to run when changed
	
	SaveButton = createButton('Save');//Text of button
	SaveButton.mousePressed(SaveCanvas);//The function to run when pressed
	
	LoadButton = createButton('Load');//Text of button
	LoadButton.mousePressed(LoadCanvas);//The function to run when pressed
	
	DeleteButton = createButton('Delete');//Text of button
	DeleteButton.mousePressed(DeleteCanvas);//The function to run when pressed
	
	ClearButton = createButton('Clear');//Text of button
	ClearButton.mousePressed(ClearCanvas);//The function to run when pressed
	
	FileSaveButton = createButton('Save File');//Text of button
	FileSaveButton.mousePressed(FileSaveCanvas);//The function to run when pressed
	
	//FileLoadButton = createFileInput(FileLoadCanvas);
	
	NextButton = createButton('Next');//Text of button
	NextButton.mousePressed(NextButtonC);//The function to run when pressed
	
	PrevButton = createButton('Prev');//Text of button
	PrevButton.mousePressed(PrevButtonC);//The function to run when pressed
	
}//setup() END

function NextButtonC(){
	tileRow++;
	if(tileRow > totalImages/rowLength){
		tileRow = 0;
	}
	tileN += rowLength;
	if(tileN > totalImages + 1){
		tileN = tileN - (totalImages + 2);
	}
}//NextButtonC() END

function PrevButtonC(){
	tileRow--;
	if(tileRow < 0){
		tileRow = Math.floor(totalImages/rowLength);
	}
	tileN -= rowLength;
	if(tileN < 0){
		tileN = (totalImages + 2) - (0 - tileN);
	}
}//PrevButtonC() END


function SaveCanvas(){
	var MapJSON = JSON.stringify(mapTiles);
	localStorage.setItem("MapJSON", MapJSON);
}//SaveCanvas() END

function FileSaveCanvas(){
	save('MapCanvas.png');
	//var MapJSON = JSON.stringify(mapTiles);
	//saveJSON(mapTiles, 'Map2.json');
}//FileSaveCanvas() END

function LoadCanvas(){
	mapTiles = JSON.parse(localStorage.getItem("MapJSON"));
	if(mapTiles == null){
		mapTiles = [];
	}
}//LoadCanvas() END

function FileLoadCanvas(file){
	mapTiles = JSON.parse(file);
	if(mapTiles == null){
		mapTiles = [];
	}
}//FileLoadCanvas() END

function DeleteCanvas(){
	localStorage.removeItem("MapJSON");
}//DeleteCanvas() END

function ClearCanvas(){
	mapTiles = [];
}//ClearCanvas() END


function draw(){
	mX = mouseX;
	mY = mouseY;
	pX = window.pageXOffset;
	pY = window.pageYOffset;
	
	background(255);
	
	window.scrollTo(Math.floor((SX)/scl) * scl, Math.floor((SY)/scl) * scl)
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	CCheckBox.position((scl*3)+(scl/2) + pX, scl+(scl/2.2) + pY);
	SaveButton.position((scl*8.5)+(scl/2) + pX, scl+(scl/2.5) + pY);
	LoadButton.position((scl*10)+(scl/2) + pX, scl+(scl/2.5) + pY);
	DeleteButton.position((scl*11.5)+(scl/2) + pX, scl+(scl/2.5) + pY);
	ClearButton.position((scl*13)+(scl/2) + pX, scl+(scl/2.5) + pY);
	FileSaveButton.position((scl*14.5)+(scl/2) + pX, scl+(scl/2.5) + pY);
	//FileLoadButton.position((scl*19.5)+(scl/2) + pX, scl+(scl/2) + pY);
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//Draw Grid on Screen
	for(var i = 0; i < cols + 1; i++){//Draw all the column lines
		line(scl * i, 0, scl * i, rows*scl);//Draw Verticle lines
	}
	for(var i = 0; i < rows + 1; i++){//Draw all the row lines
		line(0, scl * i, cols*scl, scl * i);//Draw Horizontal Lines
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	if (dragging){//Are we dragging a tile
		if(mapTiles[mapN] != null){
			mapTiles[mapN].updateLocation();//Adjust XY location of tile
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//Display Map Tiles
	for(var i = 0; i < mapTiles.length; i++){//Loop through all the tiles
		if(!mapTiles[i].clear){//Is the tile colored
			fill(mapTiles[i].r,mapTiles[i].g,mapTiles[i].b);//Set Tile background color
			rect(mapTiles[i].x,mapTiles[i].y,scl,scl);//Draw colored square behind tile
		}
		image(img[mapTiles[i].image], mapTiles[i].x, mapTiles[i].y);//Draw tile
		//mapTiles[i].display();
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	RSlider.position(0 + pX, scl+((scl/6)*1) + pY);//Update Red Slider position
	GSlider.position(0 + pX, scl+((scl/6)*3) + pY);//Update Green Slider position
	BSlider.position(0 + pX, scl+((scl/6)*5) + pY);//Update Blue Slider position
	RInput.position((scl*5)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update Red Number Input position
	GInput.position((scl*6)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update Green Number Input position
	BInput.position((scl*7)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update Blue Number Input position
	
	fill(RSlider.value(),GSlider.value(),BSlider.value());//Set background color to the RGB value set by user
	rect(0 + pX, scl + pY, scl*3, scl);//Display color behind RGB Sliders
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	fill(255);//Set background color to white
	rect(pX, pY, scl*rowLength, scl);//Create rectangle behind tiles UI
	for(var i = 0; i < rowLength; i++){//Loop through all the tiles
		if(rowLength*tileRow+i <= totalImages+1){//If tile exists
			if(rowLength*tileRow+i == tileN){//If displaying selected tile
				fill(RSlider.value(),GSlider.value(),BSlider.value());//Set background color to the RGB value set by user
				rect(scl*i + pX, pY, scl, scl);//Display color behind the tile
			}
			image(img[rowLength*tileRow+i], scl*i + pX, pY);//Draw tile
		}
	}
	
	NextButton.position(scl*(rowLength+1.7) + pX, (scl/2.5) + pY);//Update Next Button position
	PrevButton.position(scl*(rowLength+.35) + pX, (scl/2.5) + pY);//Update Previous Button position
}//Draw() END

function mousePressed(){
	mX = mouseX;
	mY = mouseY;
	pX = window.pageXOffset;
	pY = window.pageYOffset;
	
	if(mX > 0 + pX && mX < scl*(rowLength+3) + pX && mY > scl + pY && mY < scl*2 + pY){//Did we click on the color UI
		noTile = true;//Dont allow tile placement
		return;//Don't do anything else
	}

	for(var i = 0; i < rowLength; i++){
		if(mX > scl*i + pX + fV && mX < scl*(i+1) + pX - fV && mY > 0 + pY + fV && mY < scl + pY - fV){//Are we clicking on the tile UI
			mapTiles[mapTiles.length] = new mTile(scl*i + pX,0 + pY,i,RSlider.value(),GSlider.value(),BSlider.value(), CClear);
			noTile = true;//Dont allow tile placement
			tileN = rowLength*tileRow+i;
		}
	}

	// Did I click on the rectangle?
	for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
		if(mapTiles[i].isCursorOn()){//Are we clicking on the tile
			if(mouseButton == CENTER){//We clicked with the middle button
				if(mapTiles.length > 1){//If there is more than 1 tile
					for(var j = i; j < mapTiles.length - 1; j++){//Go through all tiles after the one we're deleting
						mapTiles[j] = mapTiles[j + 1];//Shift the tile down 1
					}
				}
				mapTiles = shorten(mapTiles);//Shorten the Map Tiles Array by 1
				mapN = null;
				deleting = true;//We're deleting
				return false;//Don't do anything else
			}else if(mouseButton == LEFT){//We clicked with the left button
				mapN = i;//Keep track of what tile we clicked on
				dragging = true;//We dragging
				offsetX = mapTiles[i].x-mX;//If so, keep track of relative X location of click to corner of rectangle
				offsetY = mapTiles[i].y-mY;//If so, keep track of relative Y location of click to corner of rectangle
				mapTiles[i].loadColors();
				return false;//Don't do anything else
			}/*else if(mouseButton == RIGHT){
				return false;
			}*/
		}
	}
	if(!(mY < scl*2 + pY) && mY < (windowHeight - (scl*1.5)) + pY && mX < (windowWidth - (scl)) + pX){
		if(mouseButton == CENTER){//We clicked the middle mouse button
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(mY/scl)*scl,tileBorderNumber,RSlider.value(),GSlider.value(),BSlider.value(), false);
			deleting = false;//We aren't deleting
		}
		if(mouseButton == LEFT){//We clicked the left mouse button
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(mY/scl)*scl,tileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);
		}
	}
	if(mouseButton == CENTER){return false;}//Don't allow normal middle mouse button action
}//mousePressed() END

function mouseDragged(){
	mX = mouseX;
	mY = mouseY;
	pX = window.pageXOffset;
	pY = window.pageYOffset;
	
	if(mouseButton == CENTER && deleting){//We dragging and deleting with the middle button
		for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
			if(mapTiles[i].isCursorOn()){//Are we clicking on the tile
				if(mapTiles.length > 1){//If there is more than 1 tile
					for(var j = i; j < mapTiles.length - 1; j++){//Go through all tiles after the one we're deleting
						mapTiles[j] = mapTiles[j + 1];//Shift the tile down 1
					}
				}
				mapTiles = shorten(mapTiles);//Shorten the Map Tiles Array by 1
				mapN = null;
			}
		}
	}

	if(noTile){return;}
	if(dragging){return false;}
	
	for(var i = mapTiles.length-1; i >= 0; i--){
		if(mapTiles[i].isCursorOn()){
			return false;
		}
	}

	if(!(mY < scl*2 + pY + fV) && mY < (windowHeight - (scl*1.5)) + pY + fV && mX < (windowWidth - (scl)) + pX + fV){
		if(mouseButton == CENTER && !deleting){
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(mY/scl)*scl,tileBorderNumber,RSlider.value(),GSlider.value(),BSlider.value(), false);
		}else if(mouseButton == LEFT){
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(mY/scl)*scl,tileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);
		}
	}
	//return false;
}//mouseDragged() END

function mouseReleased(){
	if(dragging){//Are we dragging a tile
		if(mapTiles[mapN] != null){
			mapTiles[mapN].snapLocation();//Snap XY location of tile to grid
		}
	}
	
	dragging = false;//Quit dragging
	noTile = false;//Allow tile placement

	if(mapTiles[mapN] != null){
		if(mapTiles[mapN].x >= pX && mapTiles[mapN].x < scl*rowLength + pX && mapTiles[mapN].y == pY){//Is the tile we just dropped on the UI
			if(mapTiles.length > 1){//If there is more than 1 tile
				for(var j = mapN; j < mapTiles.length - 1; j++){//Go through all tiles after the one we're deleting
					mapTiles[j] = mapTiles[j + 1];//Shift the tile down 1
				}
			}
			mapTiles = shorten(mapTiles);//Shorten the Map Tiles Array by 1
			//return false;
		}
	}
}//mouseReleased() END

function keyTyped(){
	if(key == 'q'){//We pressed 'Q'
		tileN--;
		if(tileN < 0){
			tileN = totalImages + 1;
			tileRow = Math.floor(totalImages/rowLength);
		}
		if(tileN < rowLength*tileRow){
			tileRow--;
			if(tileRow < 0){
				tileRow = Math.floor(totalImages/rowLength);
			}
		}
	}else if(key == 'e'){//We pressed 'E'
		tileN++;
		if(tileN > totalImages + 1){
			tileN = 0;
			tileRow = 0;
		}
		if(tileN == rowLength*(tileRow+1)){
			tileRow++;
			if(tileRow > totalImages/rowLength){
				tileRow = 0;
			}
		}
	}else if(key == 'w'){//We pressed 'W'
		SY = window.pageYOffset - (scl * scrollAmount);//Scroll Screen UP
	}else if(key == 'a'){//We pressed 'A'
		SX = window.pageXOffset - (scl * scrollAmount);//Scroll Screen LEFT
	}else if(key == 's'){//We pressed 'S'
		SY = window.pageYOffset + (scl * scrollAmount);//Scroll Screen RIGHT
	}else if(key == 'd'){//We pressed 'D'
		SX = window.pageXOffset + (scl * scrollAmount);//Scroll Screen DOWN
	}else if(key == 'c'){//We pressed 'C'
		if(CClear){
			CClear = false;
			CCheckBox.checked(false);
		}else{
			CClear = true;
			CCheckBox.checked(true);
		}
	}else if(key == 'z'){//We pressed 'Z'
		PrevButtonC();//Previous Tile row
	}else if(key == 'x'){//We pressed 'X'
		NextButtonC();//Next Tile Row
	}
}//keyTyped() END

function mTile(x, y, image, r, g, b, clear){//Tile Object
	this.x = x;//Store X Position
	this.y = y;//Store Y Position
	this.image = image;//Store Image Number
	this.r = r;//Store Red Value
	this.g = g;//Store Green Value
	this.b = b;//Store Blue Value
	this.clear = clear;//Is the tile clear
	
	this.isCursorOn = function(){
		return(mX > this.x - fV && mX < this.x + scl + fV && mY > this.y - fV && mY < this.y + scl + fV);
	}
	
	this.loadColors = function(){
		RSlider.value(this.r);//Set Red Slider value to Red value of the tile
		GSlider.value(this.g);//Set Green Slider value to Green value of the tile
		BSlider.value(this.b);//Set Blue Slider value to Blue value of the tile
		RInput.value(this.r);//Set Red Number Input value to Red value of the tile
		GInput.value(this.g);//Set Green Number Input value to Green value of the tile
		BInput.value(this.b);//Set Blue Number Input value to Blue value of the tile
	}
	
	this.updateLocation = function(){//Adjust XY location of tile
		this.x = mX + offsetX;//Adjust X location of tile
		this.y = mY + offsetY;//Adjust Y location of tile
	}
	
	this.snapLocation = function(){//Snap XY location of tile to grid
		this.x = Math.floor(mouseX / scl) * scl;//Snap X location of tile to grid
		this.y = Math.floor(mouseY / scl) * scl;//Snap Y location of tile to grid
	}
	
	this.display = function(){
		if(!this.clear){//Is the tile colored
			fill(this.r,this.g,this.b);//Set Tile background color
			rect(this.x,this.y,scl,scl);//Draw colored square behind tile
		}
		image(img[this.image], this.x, this.y);//Draw tile
	}
}//mTile() END