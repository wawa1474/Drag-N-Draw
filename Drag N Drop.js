//Started April 9th, 2018 at 11:13:08am

var dragging = false; // Is the object being dragged?
var deleting = false;//Are we deleting tiles?
var noTile = false;//Are we blocking placement of tiles?

var mapN = 0;//Which map peice are we messing with
var totalImages = 54;//Total Images
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
var UIRight = 22;//How many tiles long is the UI?
var UIBottom = 2;//How many tiles tall is the UI?


var scrollAmount = 5;//How many squares to scroll when pressing WASD
var scrollSlider;

var img = [];//Tile Image Array
var mapTiles = [];//Map Tiles Array

var mapTable;//Map Table

var player = new player();//Player

var UI = new tileUI();//Create a UI
var BG = new BGFunc();//Create a background

function preload(){//Preload all of the images
	img[tileBorderNumber] = loadImage('assets/Border.png');//Border for Color
	
	for(var i = 0; i <= totalImages; i++){//Go through all the images
		img[i+1] = loadImage('assets/' + i + '.png');//And load them
	}//Went through all the images
	
	player.image = loadImage('assets/Player.png');//Player Image
	
	mapTable = loadTable('MAP.csv', 'csv', 'header');//Load the csv
}//preload() END

function setup(){//Setup everything
	createCanvas(cols*scl,rows*scl);//(Width, Height)
	UI.setup();//Setup all of the UI stuff
}//setup() END

function NextButtonC(){//Next Row
	if(tileN < rowLength*tileRow || tileN > rowLength*tileRow+rowLength){//Is tileN outside of our current row
		//Do Nothing
	}else{
		tileN += rowLength;//Keep the selected tile number in the same relative position
		if(tileN > totalImages + 1){//If the tile number is greater than our total number of tiles
			tileN = tileN - (totalImages + 2);//Loop the tile number back to first row in the same relative position
		}
	}
	tileRow++;//Increment the row number
	if(tileRow > totalImages/rowLength){//If the row number is greater than our total number of rows
		tileRow = 0;//Loop the row number back to the first
	}
}//NextButtonC() END

function PrevButtonC(){//Previous Row
	if(tileN < rowLength*tileRow || tileN > rowLength*tileRow+rowLength){//Is tileN outside of our current row
		//Do Nothing
	}else{
		tileN -= rowLength;//Keep the selected tile number in the same relative position
		if(tileN < 0){//If the tile number is less than zero
			tileN = (totalImages + 2) - (0 - tileN);//Loop the tile number back to last row in the same relative position
		}
	}
	tileRow--;//Decrement the row number
	if(tileRow < 0){//If the row number is less than our zero
		tileRow = Math.floor(totalImages/rowLength);//Loop the row number back to the last
	}
}//PrevButtonC() END


function SaveCanvas(){//Save the canvas to local storage
	var MapJSON = JSON.stringify(mapTiles);//Ready the map for storage
	localStorage.setItem("MapJSON", MapJSON);//Save the canvas to local storage
}//SaveCanvas() END

function LoadCanvas(){//Load the canvas from local storage
	mapTiles = JSON.parse(localStorage.getItem("MapJSON"));//Set the map array
	if(mapTiles == null){//Is the array null
		mapTiles = [];//Reset the map array
	}
}//LoadCanvas() END

function FileSaveCanvas(){//Save the Canvas to a file
	BG.draw();//Draw the background and grid
	//Display Map Tiles
	for(var i = 0; i < mapTiles.length; i++){//Go through all the tiles
		if(!mapTiles[i].clear){//Is the tile colored
			fill(mapTiles[i].r,mapTiles[i].g,mapTiles[i].b);//Set Tile background color
			rect(mapTiles[i].x,mapTiles[i].y,scl,scl);//Draw colored square behind tile
		}
		image(img[mapTiles[i].image], mapTiles[i].x, mapTiles[i].y);//Draw tile
	}//Went through all the tiles
	save('MapCanvas.png');//Save the map to a PNG file
	FileSaveMap();
}//FileSaveCanvas() END

function FileSaveMap(){//Save the Map to file
	mapTable = new p5.Table();
	mapTable.addColumn('x');//Tile X position
	mapTable.addColumn('y');//Tile Y position
	mapTable.addColumn('image');//Tile Image
	mapTable.addColumn('r');//Tile Red amount
	mapTable.addColumn('g');//Tile Green amount
	mapTable.addColumn('b');//Tile Blue amount
	mapTable.addColumn('clear');//Is Tile Clear
	var newRow;
	for(var i = 0; i < mapTiles.length - 1; i++){
		newRow = mapTable.addRow();//Add a row to table
		newRow.set('x',mapTiles[i].x);//Tile X position
		newRow.set('y',mapTiles[i].y);//Tile Y position
		newRow.set('image',mapTiles[i].image);//Tile Image
		newRow.set('r',mapTiles[i].r);//Tile Red amount
		newRow.set('g',mapTiles[i].g);//Tile Green amount
		newRow.set('b',mapTiles[i].b);//Tile Blue amount
		var CLEAR = 1;
		if(!mapTiles[i].clear){//Is Tile Clear
			CLEAR = 0;
		}
		newRow.set('clear',CLEAR);//Is Tile Clear
	}
	saveTable(mapTable, 'MAP.csv');//Save the Map to a CSV file
	mapTable = null;//Clear the Table
}

function FileLoadMap(){//Load the Map from file
	mapTiles = [];//Clear the array
	for(var i = 0; i < mapTable.getRowCount(); i++){//Loop through all the rows
		var CLEAR = true;
		if(mapTable.get(i,'clear') == 0){//Is Tile Clear
			CLEAR = false;
		}
		mapTiles[i] = new mTile(int(mapTable.get(i,'x')),//Tile X position
												  int(mapTable.get(i,'y')),//Tile Y position
												  int(mapTable.get(i,'image')),//Tile Image
												  int(mapTable.get(i,'r')),//Tile Red amount
												  int(mapTable.get(i,'g')),//Tile Green amount
												  int(mapTable.get(i,'b')),//Tile Blue amount
												  CLEAR);//Is Tile Clear
	}
	if(mapTiles == null){//Is the array null
		mapTiles = [];//Reset the map array
	}
}//FileLoadCanvas() END

function DeleteCanvas(){//Delete the canvas from local storage
	localStorage.removeItem("MapJSON");//Delete the canvas from local storage
}//DeleteCanvas() END

function ClearCanvas(){//Clear the canvas of tile
	mapTiles = [];//Reset the map array
}//ClearCanvas() END

function updateXY(){//Update the XY position of the mouse and the page XY offset
	mX = mouseX;//Update the X position of the mouse
	mY = mouseY;//Update the Y position of the mouse
	pX = window.pageXOffset;//Update the page X offset
	pY = window.pageYOffset;//Update the page Y offset
}//updateXY() END

function draw(){//Draw the canvas
	updateXY();//Update the XY position of the mouse and the page XY offset
	
	BG.draw();//Draw the background and grid
	
	window.scrollTo(Math.floor((SX)/scl) * scl, Math.floor((SY)/scl) * scl)//Make sure the screen stays locked to the grid


	//If dragging a tile: update location
	if (dragging){//Are we dragging a tile
		if(mapTiles[mapN] != null){//If tile exists
			updateTileLocation(mapN);//Adjust XY location of tile
		}
	}


	//Display Map Tiles
	for(var i = 0; i < mapTiles.length; i++){//Go through all the tiles
		if(!mapTiles[i].clear){//Is the tile colored
			fill(mapTiles[i].r,mapTiles[i].g,mapTiles[i].b);//Set Tile background color
			rect(mapTiles[i].x,mapTiles[i].y,scl,scl);//Draw colored square behind tile
		}
		image(img[mapTiles[i].image], mapTiles[i].x, mapTiles[i].y);//Draw tile
	}//Went through all the tiles

	BG.border();//Draw the RED border
	
	//Update and Draw the UI
	UI.update();//Update the UI position
	UI.draw();//Draw the UI
	
	//BG.border();//Draw the RED border
	
	//player.update();
	player.draw();
}//Draw() END

function mousePressed(){//We pressed a mouse button
	//updateXY();

	for(var i = 0; i < rowLength; i++){//Go through all the tiles in the row
		if(mX > scl*i + pX + fV && mX < scl*(i+1) + pX - fV && mY > 0 + pY + fV && mY < scl + pY - fV){//Are we clicking on the tile UI
			noTile = true;//Dont allow tile placement
			if(img[rowLength*tileRow+i] == null){return;}
			tileN = rowLength*tileRow+i;//Set the tile cursor to the tile we clicked on
			mapTiles[mapTiles.length] = new mTile(scl*i + pX,0 + pY,tileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);//Create a tile
		}
	}//Went through all the tiles in the row
	
	if(mX > 0 + pX && mX < scl*UIRight + pX && mY > 0 /* scl */ + pY && mY < scl*UIBottom + pY){//Did we click on the UI
		noTile = true;//Dont allow tile placement
		//return;//Don't do anything else
	}

	// Did I click on the rectangle?
	for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
		if(isCursorOnTile(i)){//Are we clicking on the tile
			if(mouseButton == CENTER){//We clicked with the middle button
				deleteTile(i);//Delete a tile and update the array
				mapN = null;//We're not holding a tile
				deleting = true;//We're deleting
				return false;//Block normal action
			}else if(mouseButton == LEFT){//We clicked with the left button
				mapN = i;//Keep track of what tile we clicked on
				dragging = true;//We dragging
				updateOffset(i);//Update the mouse offset of the tile
				loadColors(i);//Load the color inputs and sliders with the color from the tile
				return false;//Block normal action
			}/*else if(mouseButton == RIGHT){
				//loadTile(i);
				//updateTileRow();//Get the row to whatever tile were on
				//return false;
			}*/
		}
	}//Went through all the tiles
	
	placeTile();//Place a tile at current mouse position
	
	if(mouseButton == CENTER){return false;}//Block normal action
}//mousePressed() END

function mouseDragged(){//We dragged the mouse while holding a button
	//updateXY();
	
	if(mouseButton == CENTER && deleting){//We dragging and deleting with the middle button
		for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
			if(isCursorOnTile(i)){//Are we clicking on the tile
				deleteTile(i);//Delete a tile and update the array
				mapN = null;//We're not holding a tile
			}
		}//Went through all the tiles
	}

	if(noTile){//We're not allowed to place tiles
		return;//Don't do anything else
	}

	if(dragging){//We're dragging
		return false;//Block normal action
	}
	
	for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
		if(isCursorOnTile(i)){//Are we clicking on the tile
			return false;//Block normal action
		}
	}//Went through all the tiles

	placeTile();//Place a tile at current mouse position
	
	//return false;
}//mouseDragged() END

function mouseReleased(){//We released the mouse button
	if(dragging){//Are we dragging a tile
		if(mapTiles[mapN] != null){//If tile exists
			snapTileLocation(mapN);//Snap XY location of tile to grid
		}
	}
	
	deleting = false;//Quit deleting
	dragging = false;//Quit dragging
	noTile = false;//Allow tile placement

	if(mapTiles[mapN] != null){//If tile exists
		if(mapTiles[mapN].x >= pX && mapTiles[mapN].x < scl*rowLength + pX && mapTiles[mapN].y == pY){//Is the tile we just dropped on the UI
			deleteTile(mapN);//Delete a tile and update the array
			//return false;
		}
	}
}//mouseReleased() END

function keyPressed(){//We pressed a key
	//console.log(keyCode);//What key did we press?
	if (keyCode == 16){//We pressed shift
		PrevButtonC();//Previous Tile row
	}else if (keyCode == 32){//We pressed space
		NextButtonC();//Next Tile Row
		return false;//Block normal action
	}else if (keyCode == 40){//We pressed down
		player.move('DOWN');//Move Player Down
		return false;//Block normal action
	}else if (keyCode == 38){//We pressed up
		player.move('UP');//Move Player Up
		return false;//Block normal action
	}else if (keyCode == 37){//We pressed left
		player.move('LEFT');//Move Player Left
		return false;//Block normal action
	}else if (keyCode == 39){//We pressed right
		player.move('RIGHT');//Move Player Right
		return false;//Block normal action
	}
}

function keyTyped(){//We typed a key
	if(key == 'q'){//We pressed 'Q'
		updateTileRow();//Get the row to whatever tile were on
		tileN--;//Decrement the tile number
		if(tileN < 0){//Is the tile number less than zero?
			tileN = totalImages + 1;//Loop the tile number back to the last tile
			tileRow = Math.floor(totalImages/rowLength);//Loop the tile row back to the last row
		}
		if(tileN < rowLength*tileRow){//Is the tile number less than the lower end of the current row?
			tileRow--;//Decrement the tile row
			if(tileRow < 0){//Is the tile number less than zero?
				tileRow = Math.floor(totalImages/rowLength);//Loop the tile row back to the last row
			}
		}
	}else if(key == 'e'){//We pressed 'E'
		updateTileRow();//Get the row to whatever tile were on
		tileN++;//Increment the tile number
		if(tileN > totalImages + 1){//Is the tile number greater than our total number of images?
			tileN = 0;//Loop the tile number back to the first tile
			tileRow = 0;//Loop the tile row back to the first row
		}
		if(tileN == rowLength*(tileRow+1)){//If the tile number is the last tile
			tileRow++;//Increment the tile row
			if(tileRow > totalImages/rowLength){//Is the tile row greater than our total number of rows?
				tileRow = 0;//Loop the tile row back to the first row
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
		if(CClear){//Is it currently clear?
			CClear = false;//Set if not clear
			CCheckBox.checked(false);//Uncheck the checkbox
		}else{//Its not clear
			CClear = true;//Set it clear
			CCheckBox.checked(true);//Check the checkbox
		}
	}else if(key == 'z'){//We pressed 'Z'
		PrevButtonC();//Previous Tile row
	}else if(key == 'x'){//We pressed 'X'
		NextButtonC();//Next Tile Row
	}else if(key == 'f'){//We pressed 'F'
		for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
			if(isCursorOnTile(i)){//Are we clicking on the tile
				loadTile(i);//Load tileN with whatever tile we just checked
				updateTileRow();//Get the row to whatever tile we're on
			}
		}
	}else if(key == 'i'){//We pressed 'I'
		for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
			mapTiles[i].y -= scl * scrollAmount;//Move tile up 1 space
		}
	}else if(key == 'j'){//We pressed 'J'
		for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
			mapTiles[i].x -= scl * scrollAmount;//Move tile left 1 space
		}
	}else if(key == 'k'){//We pressed 'K'
		for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
			mapTiles[i].y += scl * scrollAmount;//Move tile down 1 space
		}
	}else if(key == 'l'){//We pressed 'L'
		for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
			mapTiles[i].x += scl * scrollAmount;//Move tile right 1 space
		}
	}
}//keyTyped() END

function updateTileRow(){//Get the row to whatever tile were on
	while(Math.floor(tileN/rowLength)*rowLength < rowLength*tileRow){//Is tileN lower than the row were on?
			tileRow--;//Decrement tileRow
			if(tileRow < 0){//Is the tile number less than zero?
				tileRow = Math.floor(totalImages/rowLength);//Loop the tile row back to the last row
			}
		}
		while(Math.floor(tileN/rowLength)*rowLength > rowLength*tileRow){//Is tileN higher than the row were on?
			tileRow++;//Increment tileRow
			if(tileRow > totalImages/rowLength){//Is the tile row greater than our total number of rows?
				tileRow = 0;//Loop the tile row back to the first row
			}
		}
}//updateTileRow() END

function isCursorOnTile(tile){//Is the mouse cursor on the tile we're checking?
	return(mX > mapTiles[tile].x - fV && mX < mapTiles[tile].x + scl + fV && mY > mapTiles[tile].y - fV && mY < mapTiles[tile].y + scl + fV);//Are we clicking on the tile
}//isCursorOnTile() END

function isCursorOnTileNoFV(tile){//Is the mouse cursor on the tile we're checking?
	return(mX > mapTiles[tile].x && mX < mapTiles[tile].x + scl && mY > mapTiles[tile].y && mY < mapTiles[tile].y + scl);//Are we clicking on the tile
}//isCursorOnTileNoFV() END

function updateTileLocation(tile){//Adjust XY location of tile
	mapTiles[tile].x = mX + offsetX;//Adjust X location of tile
	mapTiles[tile].y = mY + offsetY;//Adjust Y location of tile
}//updateTileLocation() END

function snapTileLocation(tile){//Snap XY location of tile to grid
	mapTiles[tile].x = Math.floor(mouseX / scl) * scl;//Adjust X location of tile
	mapTiles[tile].y = Math.floor(mouseY / scl) * scl;//Adjust Y location of tile
}//snapTileLocation() END

function updateOffset(tile){//Update mouse XY offset relative to upper-left corner of tile
	offsetX = mapTiles[tile].x-mX;//keep track of relative X location of click to corner of rectangle
	offsetY = mapTiles[tile].y-mY;//keep track of relative Y location of click to corner of rectangle
}//updateOffset() END

function loadColors(tile){
	RSlider.value(mapTiles[tile].r);//Set Red Slider value to Red value of the tile
	GSlider.value(mapTiles[tile].g);//Set Green Slider value to Green value of the tile
	BSlider.value(mapTiles[tile].b);//Set Blue Slider value to Blue value of the tile
	RInput.value(mapTiles[tile].r);//Set Red Number Input value to Red value of the tile
	GInput.value(mapTiles[tile].g);//Set Green Number Input value to Green value of the tile
	BInput.value(mapTiles[tile].b);//Set Blue Number Input value to Blue value of the tile
}//loadColors() END

function loadTile(tile){
	tileN = mapTiles[tile].image;//Set Red Slider value to Red value of the tile
}//loadColors() END

function checkImage(tile){
	for(var i = 0; i < mapTiles.length - 1; i++){//Go through all tiles
		if(isCursorOnTileNoFV(i)){//Is the mouse cursor on the tile we're checking?
			if(tile == mapTiles[i].image){//Is the tile image we're on the same as the one we're trying to place?
				console.log("False");
				return false;//Don't place tile
			}
		}
	}
	console.log("True");
	return true;//Place tile
}//checkImage() END

function placeTile(){//Place a tile at the mouses location
	//console.log(mouseButton);
	if(mY > scl*UIBottom + pY + fV && mY < (windowHeight - (scl*1.5)) + pY + fV && mX < (windowWidth - (scl)) + pX + fV){//We're not on the UI and we're within the screen bounds
		if(mouseButton == CENTER && !deleting){//We're dragging with the middle button and not deleting
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(mY/scl)*scl,tileBorderNumber,RSlider.value(),GSlider.value(),BSlider.value(), false);//Place a colored tile with no image
		}else if(mouseButton == LEFT){//We're dragging with the left button
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(mY/scl)*scl,tileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);//Place a tile
		}else if(mouseButton == RIGHT){//We clicked with the right button
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(mY/scl)*scl,tileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);//Place a tile
		}
	}
	//console.log(mapTiles.length);//How many tiles are there?
}//placeTile() END

function deleteTile(tile){//Delete a tile and update the array
	if(mapTiles.length > 1){//If there is more than 1 tile
		for(var j = tile; j < mapTiles.length - 1; j++){//Go through all tiles after the one we're deleting
			mapTiles[j] = mapTiles[j + 1];//Shift the tile down 1
		}//Went through all tiles after the one we're deleting
	}
	mapTiles = shorten(mapTiles);//Shorten the Map Tiles Array by 1
	//console.log(mapTiles.length);//How many tiles are there?
}//deleteTile() END

function mTile(x, y, image, r, g, b, clear){//Tile Object
	this.x = x;//Store X Position
	this.y = y;//Store Y Position
	this.image = image;//Store Image Number
	this.r = r;//Store Red Value
	this.g = g;//Store Green Value
	this.b = b;//Store Blue Value
	this.clear = clear;//Is the tile clear
}//mTile() END

function BGFunc(){//The background function
	this.draw = function(){//Draw the background
		background(255);//Draw the white background

		//Draw Grid on Screen
		for(var i = 1; i < cols + 0; i++){//Draw all the column lines
			line(scl * i, 0, scl * i, rows*scl);//Draw Verticle lines
		}//Drew all the column lines

		for(var i = 1; i < rows + 0; i++){//Draw all the row lines
			line(0, scl * i, cols*scl, scl * i);//Draw Horizontal Lines
		}//Drew all the row lines
	}//BGFunc.draw = function() END
	
	this.border = function(){
		strokeWeight(4); // Thicker
		stroke(255,0,0);//RED
		line(1, 0, 1, rows*scl);//Draw Verticle lines
		line((scl * cols) - 1, 0, (scl * cols) - 1, rows*scl);//Draw Verticle lines
		line(0, 1, cols*scl, 1);//Draw Horizontal Lines
		line(0, (scl * rows) - 1, cols*scl, (scl * rows) - 1);//Draw Horizontal Lines
		strokeWeight(1); // Default
		stroke(0);//BLACK
	}
}//BGFunc() END

function tileUI(){//The tile UI
	
	this.draw = function(){//Draw the UI
		fill(RSlider.value(),GSlider.value(),BSlider.value());//Set background color to the RGB value set by user
		rect(0 + pX, scl + pY, scl*3, scl);//Display color behind RGB Sliders
		
		fill(255);//Set background color to white
		rect(pX, pY, scl*rowLength, scl);//Create rectangle behind tiles UI
		for(var i = 0; i < rowLength; i++){//Go through all the tiles
			if(rowLength*tileRow+i <= totalImages+1){//If tile exists
				if(rowLength*tileRow+i == tileN){//If displaying selected tile
					fill(RSlider.value(),GSlider.value(),BSlider.value());//Set background color to the RGB value set by user
					rect(scl*i + pX, pY, scl, scl);//Display color behind the tile
				}
				image(img[rowLength*tileRow+i], scl*i + pX, pY);//Draw tile
			}
		}//Went through all the tiles
		
		textSize(24);
		fill(255,0,0);
		text(mapTiles.length, scl*17.3, scl*1.8);
		textSize(12);//Default
	}//tileUI.draw = function() END
	
	this.update = function(){//Update the UI position
		//Update color slider locations
		RSlider.position(0 + pX, scl+((scl/6)*1) + pY);//Update Red Slider position
		GSlider.position(0 + pX, scl+((scl/6)*3) + pY);//Update Green Slider position
		BSlider.position(0 + pX, scl+((scl/6)*5) + pY);//Update Blue Slider position
		
		scrollSlider.position((scl*18.5)+(scl/2) + pX, (scl/2) + pY);//Update Scroll Slider position
		
		//Update color input box locations
		RInput.position((scl*5)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update Red Number Input position
		GInput.position((scl*6)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update Green Number Input position
		BInput.position((scl*7)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update Blue Number Input position
		
		//Update checkbox location
		CCheckBox.position((scl*3)+(scl/2) + pX, scl+(scl/2.2) + pY);//Update checkbox location
		
		//Update button locations
		SaveButton.position((scl*8.5)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update Save button location
		LoadButton.position((scl*10)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update Load button location
		DeleteButton.position((scl*11.5)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update Delete button location
		ClearButton.position((scl*13)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update Clear button location
		FileSaveButton.position((scl*14.5)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update File Save button location
		FileLoadButton.position((scl*19.5)+(scl/2) + pX, scl+(scl/2) + pY);//Update File Load button location
		NextButton.position(scl*(rowLength+1.7) + pX, (scl/2.5) + pY);//Update Next Button position
		PrevButton.position(scl*(rowLength+.35) + pX, (scl/2.5) + pY);//Update Previous Button position
	}//tileUI.update() END
	
	this.setup = function(){//Setup the UI
		//Color Slider Inputs
		RSlider = createSlider(0,255,127);//(Min, Max, Start)
		RSlider.changed(function RSliderC() {RInput.value(this.value());});//The function to run when changed
		RSlider.style('width', scl*2.8+'px');//Width of slider
		GSlider = createSlider(0,255,127);//(Min, Max, Start)
		GSlider.changed(function GSliderC() {GInput.value(this.value());});//The function to run when changed
		GSlider.style('width', scl*2.8+'px');//Width of slider
		BSlider = createSlider(0,255,127);//(Min, Max, Start)
		BSlider.changed(function BSliderC() {BInput.value(this.value());});//The function to run when changed
		BSlider.style('width', scl*2.8+'px');//Width of slider
		
		scrollSlider = createSlider(1,10,5);//(Min, Max, Start)
		scrollSlider.changed(function scrollSliderC() {scrollAmount = this.value();});//The function to run when changed
		scrollSlider.style('width', scl*2.8+'px');//Width of slider
		
		//Color Input Boxes
		RInput = createInput(255);//(Start)
		RInput.input(function RInputC() {RSlider.value(this.value());});//The function to run when changed
		RInput.style('width', scl+'px');//Width of input box
		GInput = createInput(255);//(Start)
		GInput.input(function GInputC() {GSlider.value(this.value());});//The function to run when changed
		GInput.style('width', scl+'px');//Width of input box
		BInput = createInput(255);//(Start)
		BInput.input(function BInputC() {BSlider.value(this.value());});//The function to run when changed
		BInput.style('width', scl+'px');//Width of input box
		
		//Clear Checkbox
		CCheckBox = createCheckbox('Clear', false);//(Start Unchecked)
		CCheckBox.changed(function CCheckBoxF() {if(this.checked()){CClear = true;}else{CClear = false;}});//The function to run when changed
		
		//Buttons
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
		//FileLoadButton = createFileInput(FileLoadMap);//createFileInput 'Load File'
		FileLoadButton = createButton('Load File');//createFileInput 'Load File'
		FileLoadButton.mousePressed(FileLoadMap);//The function to run when pressed
		NextButton = createButton('Next');//Text of button
		NextButton.mousePressed(NextButtonC);//The function to run when pressed
		PrevButton = createButton('Prev');//Text of button
		PrevButton.mousePressed(PrevButtonC);//The function to run when pressed
	}//tileUI.setup() END
}//tileUI() END

function player(){//Player Functions
	this.image;//Player Image
	this.x = 0;//Player X position
	this.y = 2;//Player Y position

	this.move = function(direction){
		if(direction == 'UP'){
			this.y -= scrollAmount;
		}else if(direction == 'LEFT'){
			this.x -= scrollAmount;
		}else if(direction == 'DOWN'){
			this.y += scrollAmount;
		}else if(direction == 'RIGHT'){
			this.x += scrollAmount;
		}
	}

	this.update = function(){
		
	}
	
	this.draw = function(){//Draw Player
		image(this.image, scl*this.x + pX, scl*this.y + pY);//Draw Player
	}
}//player() END