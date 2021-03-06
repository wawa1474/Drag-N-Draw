//Started April 9th, 2018 at 11:13:08am

//p5.disableFriendlyErrors = true;

var _DEBUG_ = 0;//what are we debugging
var _DEBUGAMOUNT_ = 50000;//how many are we debugging

var _FILEVERSION_ = 0;//File Version is 0

var dragging = false; // Is the object being dragged?
var deleting = false;//Are we deleting tiles?
var noTile = false;//Are we blocking placement of tiles?

var noKeyboard = false;//Are We Blocking keyTyped() and keyPressed()?

var mapN = 0;//Which map peice are we messing with
var totalImages = 39;//Total Images
var RSlider, GSlider, BSlider;//RGB Sliders
var RInput, GInput, BInput;//RGB number Inputs
var CCheckBox, CClear = 0;//Clear Checkbox and variable
var SaveButton, LoadButton, DeleteButton, ClearButton, FileSaveButton, FileLoadButton;//Buttons
var NextButton, PrevButton;//Next and Previous row buttons
var rowLength = 16;//How many tiles per row?
var tileRow = 0;//Which row of tiles are we looking at?
var tileN = 1;//Which tile is the cursor over?

var fullTotalImages = (Math.ceil(totalImages / rowLength) * rowLength) - 1;//make sure all tile rows are full

var drawnTiles = 0;//how many tiles are on the screen
var drawAll = false;//draw all tiles even if not on screen?
var FPSCutOff = 2;//how many digits of fps to show
var operationTime = 0;//how long to complete an action?

var tileGroupStep = 0;//what step are we in setting tile group
var tileGroupDeleting = false;//are we deleting the tile group
var sx1, sy1, sx2, sy2;//tileGroup XY corners
var tileGroupXLines = 0;//how many X lines of copied tiles
var tileGroupYLines = 0;//how many Y lines of copied tiles

var tileBorderNumber = 0;//What number in img[] is the border (its just a null tile)

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
var scrollSlider;//scroll slider

var img = [];//Tile Images Array
var mapTiles = [];//Map Tiles Array
var Background;//background image

var mapTilesCopy = [];//copied tiles

var missingTexture;//missingTexture Image

var mapTable;//Map Table
var fileNameInput;//File Name Input
var fileName = 'Map1';//File Name

//var loreInputArea;

//var player = new player();//Player

var UI = new tileUI();//Create a UI
var BG = new BGFunc();//Create a background
var borderThickness = 4;//how thick is the canvas border

function preload(){//Preload all of the images
	missingTexture = loadImage('assets/' + 'missingTexture' + '.png');//And load them

	for(var i = 0; i <= totalImages; i++){//Go through all the images
		img[i] = loadImage('assets/' + i + '.png');//And load them
	}//Went through all the images
	
	for(var i = totalImages + 1; i <= fullTotalImages; i++){
		img[i] = missingTexture;
	}
	
	player.image = loadImage('assets/Player.png');//Player Image
	Background = loadImage('assets/Background.png');//Player Image
	
	//mapTable = loadTable('MAP.csv', 'csv', 'header');//Load the csv
}//preload() END

function setup(){//Setup everything
	createCanvas(cols*scl,rows*scl);//(Width, Height)
	UI.setup();//Setup all of the UI stuff
	
	if(_DEBUG_ == 1){
		mapTiles = [];
		for(var i = 0; i < _DEBUGAMOUNT_; i++){
			mapTiles[mapTiles.length] = new mTile(scl*90,scl*90,tileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);//Create a tile
		}
	}
}//setup() END

function nextRowC(){//Next Row
	if(tileN < rowLength * tileRow || tileN > rowLength * tileRow + rowLength){//Is tileN outside of our current row
		//Do Nothing
	}else{
		tileN += rowLength;//Keep the selected tile number in the same relative position
		if(tileN > fullTotalImages){//If the tile number is greater than our total number of tiles
			tileN = tileN - (fullTotalImages + 1);//Loop the tile number back to first row in the same relative position
		}
	}
	tileRow++;//Increment the row number
	if(tileRow > fullTotalImages / rowLength){//If the row number is greater than our total number of rows
		tileRow = 0;//Loop the row number back to the first
	}
}//nextRowC() END

function prevRowC(){//Previous Row
	if(tileN < rowLength * tileRow || tileN > rowLength * tileRow + rowLength){//Is tileN outside of our current row
		//Do Nothing
	}else{
		tileN -= rowLength;//Keep the selected tile number in the same relative position
		if(tileN < 0){//If the tile number is less than zero
			tileN = (fullTotalImages + 1) - (0 - tileN);//Loop the tile number back to last row in the same relative position
		}
	}
	tileRow--;//Decrement the row number
	if(tileRow < 0){//If the row number is less than our zero
		tileRow = Math.floor(fullTotalImages / rowLength);//Loop the row number back to the last
	}
}//prevRowC() END

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
	for(var i = 1; i < mapTiles.length; i++){//Go through all the tiles
		if(!mapTiles[i].clear){//Is the tile colored
			fill(mapTiles[i].r,mapTiles[i].g,mapTiles[i].b);//Set Tile background color
			rect(mapTiles[i].x,mapTiles[i].y,scl,scl);//Draw colored square behind tile
		}
		image(img[mapTiles[i].image], mapTiles[i].x, mapTiles[i].y);//Draw tile
	}//Went through all the tiles
	save('MapCanvas.png');//Save the map to a PNG file
	FileSaveMap();//save map to file
}//FileSaveCanvas() END

function FileSaveMap(){//Save the Map to file
	mapTable = new p5.Table();//create new p5 table
	mapTable.addColumn('x');//Tile X position
	mapTable.addColumn('y');//Tile Y position
	mapTable.addColumn('image');//Tile Image
	mapTable.addColumn('r');//Tile Red amount
	mapTable.addColumn('g');//Tile Green amount
	mapTable.addColumn('b');//Tile Blue amount
	mapTable.addColumn('clear');//Is Tile Clear
	//mapTable.addColumn('lore');//Tile LORE?
	var newRow;
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////FILE METADATA
	newRow = mapTable.addRow();//Add a row to table
	newRow.set('x',_FILEVERSION_);//File Version
	newRow.set('y',0);//blank
	newRow.set('image',0);//blank
	newRow.set('r',0);//blank
	newRow.set('g',0);//blank
	newRow.set('b',0);//blank
	newRow.set('clear',0);//blank
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////FILE METADATA
	
	for(var i = 0; i <= mapTiles.length - 1; i++){//loop through all tiles
		newRow = mapTable.addRow();//Add a row to table
		newRow.set('x',Math.floor(mapTiles[i].x / scl));//Tile X position
		newRow.set('y',Math.floor(mapTiles[i].y / scl));//Tile Y position
		newRow.set('image',mapTiles[i].image);//Tile Image
		newRow.set('r',Math.floor(mapTiles[i].r / scl));//Tile Red amount
		newRow.set('g',Math.floor(mapTiles[i].g / scl));//Tile Green amount
		newRow.set('b',Math.floor(mapTiles[i].b / scl));//Tile Blue amount
		var CLEAR = 1;//tile is clear
		if(!mapTiles[i].clear){//Is Tile Clear
			CLEAR = 0;//tile is not clear
		}
		newRow.set('clear',CLEAR);//Is Tile Clear
		//newRow.set('lore',mapTiles[i].lore);//Tile LORE?
	}
	saveTable(mapTable, fileName + '.csv');//Save the Map to a CSV file
	mapTable = null;//Clear the Table
}//FileSaveMap() END

function FileLoadMap(){//load map from file
	loadTable(fileName + '.csv', 'csv', 'header', FileLoadMap2);//Load the csv
}//FileLoadMap() END

function FileLoadMap2(table){//Load the Map from file
	mapTable = table;//loadTable(fileName + '.csv', 'csv', 'header');//Load the csv
	mapTiles = [];//Clear the array
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////FILE METADATA
	var fileVersion = int(mapTable.get(0,'x'));//File Version
	//int(mapTable.get(0,'y'));//blank
	//int(mapTable.get(0,'image'));//blank
	//int(mapTable.get(0,'r'));//blank
	//int(mapTable.get(0,'g'));//blank
	//int(mapTable.get(0,'b'));//blank
	//int(mapTable.get(0,'clear'));//blank
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////FILE METADATA
	
	if(fileVersion == 0){//whats the file version
		for(var i = 1; i < mapTable.getRowCount(); i++){//Loop through all the rows
			var CLEAR = true;//tile is clear
			if(mapTable.get(i,'clear') == 0){//Is Tile Clear
				CLEAR = false;//tile is not clear
			}
			mapTiles[i - 1] = new mTile(int(mapTable.get(i,'x')) * scl,//Tile X position
															int(mapTable.get(i,'y')) * scl,//Tile Y position
															int(mapTable.get(i,'image')),//Tile Image
															int(mapTable.get(i,'r')) * scl,//Tile Red amount
															int(mapTable.get(i,'g')) * scl,//Tile Green amount
															int(mapTable.get(i,'b')) * scl,//Tile Blue amount
															CLEAR);//,//Is Tile Clear
															//mapTable.get(i,'lore'));//Tile LORE?
		}
	}else{//we don't know that file version
		console.log("File Version Error.");//throw error
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
	if(_DEBUG_ != 0){
		operationTime = Date.now();
	}
	
	drawnTiles = 0;//reset number of drawn tiles

	updateXY();//Update the XY position of the mouse and the page XY offset
	
	BG.draw();//Draw the background and grid
	
	if(window.scrollX != SX || window.scrollY != SY){//if screen is not scrolled to correct place
		window.scrollTo(Math.floor((SX)/scl) * scl, Math.floor((SY)/scl) * scl)//Make sure the screen stays locked to the grid
	}

	//If dragging a tile: update location
	if (dragging){//Are we dragging a tile
		if(mapTiles[mapN] != null){//If tile exists
			updateTileLocation(mapN);//Adjust XY location of tile
		}
	}


	//Display Map Tiles
	for(var i = 0; i < mapTiles.length; i++){//Go through all the tiles
		if(mapTiles[i].x > pX - scl && mapTiles[i].x  < windowWidth + pX && mapTiles[i].y > pY - 1 && mapTiles[i].y < windowHeight + pY || drawAll == true){//if tile is within screen bounds or drawAll is set
			if(!mapTiles[i].clear || mapTiles[i].image == 0){//Is the tile colored
				fill(mapTiles[i].r,mapTiles[i].g,mapTiles[i].b);//Set Tile background color
				rect(mapTiles[i].x,mapTiles[i].y,scl,scl);//Draw colored square behind tile
			}
			if(mapTiles[i].image != 0 && mapTiles[i].image <= totalImages){//if tile image is not 0 and tile image exists
				image(img[mapTiles[i].image], mapTiles[i].x, mapTiles[i].y);//Draw tile
			}else if(mapTiles[i].image != 0){//image is not blank
				image(missingTexture, mapTiles[i].x, mapTiles[i].y);//Draw tile
			}
			drawnTiles++;//how many tiles are being drawn?
		}
	}//Went through all the tiles

	BG.border();//Draw the RED border
	
	//Update and Draw the UI
	UI.update();//Update the UI position
	UI.draw();//Draw the UI
	
	//BG.border();//Draw the RED border
	
	if(tileGroupStep > 0 && tileGroupStep != 3){//selecting group and not pasteing
		drawTileGroupOutline();//draw the red outline
	}
	
	if(tileGroupStep == 3){//pasteing group
		drawGroupPasteOutline();//draw the red outline
	}
	
	//player.update();
	//player.draw();
	
	if(_DEBUG_ != 0){
		operationDisplay();
	}
}//Draw() END

function operationDisplay(){//Display Time It Took Too Do That Operation
	fill(255,0,0);//red text
	stroke(0);//no outline
	textSize(24);//larger text size
	operationTime = Date.now() - operationTime;//how long it took
	text("oT: " + operationTime, ((scl * 22) + scl / 2.25) + pX, (scl * 1.75) + pY);//oT: (oT)
	textSize(12);//Default text size
}//operationDisplay() END

function mousePressed(){//We pressed a mouse button
	//updateXY();
	
	if(tileGroupStep == 3){//pasteing group of tiles
		if(mouseButton == LEFT){//We clicked with the left button
			tileGroupPaste();//paste group selection
			tileGroupStep = 0;//reset group selection step
			return false;//Block normal action
		}
	}
	
	if(tileGroupStep == 2){//placing group of tiles
		if(mouseButton == LEFT){//We clicked with the left button
			tileGroup('left');//placing image tiles
			return false;//Block normal action
		}else if(mouseButton == CENTER){//We clicked with the middle button
			for(var i = mapTiles.length-1; i >= 0; i--){//Loop through all tiles
				if(isCursorOnTile(i)){//Are we clicking on the tile
					tileGroupDeleting = true;//deleting group of tiles
					//break;
				}
			}//Went through all the tiles
			tileGroup('center');//placing colored tile
			return false;//Block normal action
		}
	}
	
	if(mouseButton == RIGHT){//We clicked with the right button
		if(tileGroupStep == 2){//placing group of tiles
			tileGroup('right');//coloring group of tiles
		}else{//otherwise
			for(var i = 0; i <= mapTiles.length-1; i++){//Loop through all tiles
				if(isCursorOnTile(i)){//Are we clicking on the tile
					mapTiles[i].r = RSlider.value();//set tile red value
					mapTiles[i].g = GSlider.value();//set tile green value
					mapTiles[i].b = BSlider.value();//set tile blue value
				}
			}//Went through all the tiles
		}
		return false;//Block normal action
	}

	for(var i = 0; i < rowLength; i++){//Go through all the tiles in the row
		if(mX > scl*i + pX + fV && mX < scl*(i+1) + pX - fV && mY > 0 + pY + fV && mY < scl + pY - fV){//Are we clicking on the tile UI
			noTile = true;//Dont allow tile placement
			if(img[rowLength*tileRow+i] == null){return;}//if image doesn't exist return
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
			}else if(mouseButton == LEFT && !CClear){//We clicked with the left button
				mapN = i;//Keep track of what tile we clicked on
				dragging = true;//We dragging
				updateOffset(i);//Update the mouse offset of the tile
				loadColors(i);//Load the color inputs and sliders with the color from the tile
				return false;//Block normal action
			}/*else if(mouseButton == RIGHT){//We clicked with the right button
				mylog.log("Right");
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
	
	if(mouseButton == RIGHT){//We clicked with the right button
		for(var i = 0; i <= mapTiles.length-1; i++){//loop through all the tiles
			if(isCursorOnTile(i)){//Are we clicking on the tile
				mapTiles[i].r = RSlider.value();//set tile red value
				mapTiles[i].g = GSlider.value();//set tile green value
				mapTiles[i].b = BSlider.value();//set tile blue value
			}
		}//Went through all the tiles
	}
	
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
		/*Pad*/if(isCursorOnTile(i) && !checkImage(tileN)){//Are we clicking on the tile
			return false;//Block normal action
		}else if(isCursorOnTile(i) && mouseButton == CENTER){//Are we clicking on the tile with the middle button
			return false;//Block normal action
		}else if(isCursorOnTile(i) && !CClear){//Are we clicking on a clear tile
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

function mouseWheel(event){//We Scrolled The Mouse Wheel
	if(event.delta < 0){//If Scrolling Up
		nextTileC();//Move To Next Tile
	}else{
		prevTileC();//Move To Previous Tile
	}
  return false;//Block Scrolling
}//mouseWheel(event) END

function keyPressed(){//We pressed a key
	if(noKeyboard == false){//are we blocking keyboard functions?
		//console.log(keyCode);//What key did we press?
		if (keyCode == /*SHIFT*/16){//We pressed shift
			prevRowC();//Previous Tile row
		}else if (keyCode == /*SPACE*/32){//We pressed space
			nextRowC();//Next Tile Row
			return false;//Block normal action
		}/*else if (keyCode == 40){//We pressed down
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
		}*/
	}
}

function keyTyped(){//We typed a key
	if(noKeyboard == false){//are we blocking keyboard functions?
		if(key == 'q'){//We pressed 'Q'
			prevTileC();
		}else if(key == 'e'){//We pressed 'E'
			nextTileC();
		}else if(key == 'w'){//We pressed 'W'
			SY = window.pageYOffset - (scl * scrollAmount);//Scroll Screen UP
		}else if(key == 'a'){//We pressed 'A'
			SX = window.pageXOffset - (scl * scrollAmount);//Scroll Screen LEFT
		}else if(key == 's'){//We pressed 'S'
			SY = window.pageYOffset + (scl * scrollAmount);//Scroll Screen RIGHT
		}else if(key == 'd'){//We pressed 'D'
			SX = window.pageXOffset + (scl * scrollAmount);//Scroll Screen DOWN
		}else if(key == 'f'){//We pressed 'F'
			if(CClear){//Is it currently clear?
				CClear = false;//Set if not clear
				CCheckBox.checked(false);//Uncheck the checkbox
			}else{//Its not clear
				CClear = true;//Set it clear
				CCheckBox.checked(true);//Check the checkbox
			}
		}else if(key == 'x'){//We pressed 'X'
			if(tileGroupStep == 2){//we're on step two of group selection
				tileGroupCutCopy('x');//cut group selection
			}
		}else if(key == 'c'){//We pressed 'C'
			if(tileGroupStep == 2){//we're on step two of group selection
				tileGroupCutCopy('c');//copy group selection
			}
		}else if(key == 'v'){//We pressed 'V'
			tileGroupStep = 3;//paste step is 3
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
		}else if(key == 'r'){//We pressed 'R'
			for(var i = mapTiles.length-1; i >= 0; i--){//Go through all the tiles
				if(isCursorOnTile(i)){//Are we clicking on the tile
					console.log('Tile #: ' + i + ', X Position: ' + mapTiles[i].x + ', Y Position: ' + mapTiles[i].y + ', Red Amount: ' + mapTiles[i].r + ', Green Amount: ' + mapTiles[i].g + ', Blue Amount: ' + mapTiles[i].b + ', Tile Image #: ' + mapTiles[i].image + ', Is Tile Clear: ' + mapTiles[i].clear + ', Tile Lore: ' + mapTiles[i].lore);
					//console.log('Tile #: ' + i + ', X Position: ' + mapTiles[i].x + ', Y Position: ' + mapTiles[i].y);
					//console.log('Red Amount: ' + mapTiles[i].r + ', Green Amount: ' + mapTiles[i].g + ', Blue Amount: ' + mapTiles[i].b);
					//console.log('Tile Image #: ' + mapTiles[i].image + ', Is Tile Clear: ' + mapTiles[i].clear);
					//console.log('Tile Lore: ' + mapTiles[i].lore);
				}
			}
		}else if(key == 'p'){//We pressed 'P'
			//tileGroup(scl * 10, scl * 3, scl * 5, scl * 10)
			if(tileGroupStep == 0){//set XY1
				tileGroupStep = 1;//ready for next step
				sx1 = mouseX;//set x1 to mouse x position
				sy1 = mouseY;//set y1 to mouse y position
			}else if (tileGroupStep == 1){//set XY2
				tileGroupStep = 2;//ready to do group tiles stuff
				sx2 = mouseX;//set x1 to mouse x position
				sy2 = mouseY;//set y2 to mouse y position
			}
		}
	}
}//keyTyped() END

function nextTileC(){//Move To Next Tile
	updateTileRow();//Get the row to whatever tile were on
	tileN++;//Increment the tile number
	if(tileN > fullTotalImages/*totalImages + 1*/){//Is the tile number greater than our total number of images?
		tileN = 0;//Loop the tile number back to the first tile
		tileRow = 0;//Loop the tile row back to the first row
	}
	if(tileN == rowLength*(tileRow+1)){//If the tile number is the last tile
		tileRow++;//Increment the tile row
		if(tileRow > fullTotalImages/*totalImages*//rowLength){//Is the tile row greater than our total number of rows?
			tileRow = 0;//Loop the tile row back to the first row
		}
	}
}//nextTileC() END

function prevTileC(){//Move To Previous Tile
	updateTileRow();//Get the row to whatever tile were on
	tileN--;//Decrement the tile number
	if(tileN < 0){//Is the tile number less than zero?
		tileN = fullTotalImages/*totalImages + 1*/;//Loop the tile number back to the last tile
		tileRow = Math.floor(fullTotalImages/*totalImages*//rowLength);//Loop the tile row back to the last row
	}
	if(tileN < rowLength*tileRow){//Is the tile number less than the lower end of the current row?
		tileRow--;//Decrement the tile row
		if(tileRow < 0){//Is the tile number less than zero?
			tileRow = Math.floor(fullTotalImages/*totalImages*//rowLength);//Loop the tile row back to the last row
		}
	}
}//prevTileC() END

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

function isCursorOnTileXY(tile, tX, tY){//Is the mouse cursor on the tile we're checking?
	return(tX > mapTiles[tile].x - fV && tX < mapTiles[tile].x + scl + fV && tY > mapTiles[tile].y - fV && tY < mapTiles[tile].y + scl + fV);//Are we clicking on the tile
}//isCursorOnTile() END

function isCursorOnTileNoFV(tile){//Is the mouse cursor on the tile we're checking?
	return(mX > mapTiles[tile].x && mX < mapTiles[tile].x + scl && mY > mapTiles[tile].y && mY < mapTiles[tile].y + scl);//Are we clicking on the tile
}//isCursorOnTileNoFV() END

function isCursorOnTileNoFVXY(tile, tX, tY){//Is the mouse cursor on the tile we're checking?
	return(tX > mapTiles[tile].x && tX < mapTiles[tile].x + scl && tY > mapTiles[tile].y && tY < mapTiles[tile].y + scl);//Are we clicking on the tile
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

function loadColors(tile){//Load RGB Sliders and RGB Inputs with value from tile
	RSlider.value(mapTiles[tile].r);//Set Red Slider value to Red value of the tile
	GSlider.value(mapTiles[tile].g);//Set Green Slider value to Green value of the tile
	BSlider.value(mapTiles[tile].b);//Set Blue Slider value to Blue value of the tile
	RInput.value(mapTiles[tile].r);//Set Red Number Input value to Red value of the tile
	GInput.value(mapTiles[tile].g);//Set Green Number Input value to Green value of the tile
	BInput.value(mapTiles[tile].b);//Set Blue Number Input value to Blue value of the tile
}//loadColors() END

function loadTile(tile){//Set current image to tile image
	tileN = mapTiles[tile].image;//Set current image to tile image
}//loadTile() END

function checkImage(tile){//check if tile about to place has same image as tile mouse is on
	for(var i = mapTiles.length - 1; i >= 0; i--){//Go through all tiles
		if(isCursorOnTile(i)){//Is the mouse cursor on the tile we're checking?
			if(tile == mapTiles[i].image){//Is the tile image we're on the same as the one we're trying to place?
				//mylog.log("False", "Image", i, ", ", mapTiles[i].image, ", ", tile);
				return false;//Don't place tile
			}
		}
	}
	//console.log("True");
	return true;//Place tile
}//checkImage() END

function checkImageXY(tile, x, y){//check if tile about to place has same image as tile mouse is on
	for(var i = mapTiles.length - 1; i >= 0; i--){//Go through all tiles
		if(isCursorOnTileXY(i, x, y)){//Is XY on the tile we're checking?
			if(tile == mapTiles[i].image){//Is the tile image we're on the same as the one we're trying to place?
				//mylog.log("False", "Image", i, ", ", mapTiles[i].image, ", ", tile);
				return false;//Don't place tile
			}
		}
	}
	//console.log("True");
	return true;//Place tile
}//checkImageXY() END

function placeTile(){//Place a tile at the mouses location
	//console.log(mouseButton);
	if(mY > scl*UIBottom + pY + fV && mY < (windowHeight - (scl*1.5)) + pY + fV && mX < (windowWidth - (scl)) + pX + fV){//We're not on the UI and we're within the screen bounds
		if(mouseButton == CENTER && !deleting){//We're dragging with the middle button and not deleting
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(mY/scl)*scl,tileBorderNumber,RSlider.value(),GSlider.value(),BSlider.value(), false);//Place a colored tile with no image
		}else if(mouseButton == LEFT){//We're dragging with the left button
			mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(mY/scl)*scl,tileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);//Place a tile
		}else if(mouseButton == RIGHT){//We clicked with the right button
			//mapTiles[mapTiles.length] = new mTile(Math.floor(mX/scl)*scl,Math.floor(mY/scl)*scl,tileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);//Place a tile
		}
	}
}//placeTile() END

function drawTileGroupOutline(){//Draw Red Outline Showing Selected Area
	var X1,X2,Y1,Y2,asx2,asy2;//Setup Variables
		
	if(tileGroupStep == 1){//Are We On Step One
		asx2 = mouseX;//Corner is tied to mouse
		asy2 = mouseY;//Corner is tied to mouse
	}else if(tileGroupStep == 2){//Are We On Step Two
		asx2 = sx2;//Corner is tied to set XY
		asy2 = sy2;//Corner is tied to set XY
	}
		
	if(sx1 < asx2){//if x1 is less than x2
		X1 = Math.floor(sx1 / scl) * scl;//Adjust XY To Be On Tile Border
		X2 = Math.ceil(asx2 / scl) * scl;//Adjust XY To Be On Tile Border
	}else{//otherwise
		X2 = Math.ceil(sx1 / scl) * scl;//Adjust XY To Be On Tile Border
		X1 = Math.floor(asx2 / scl) * scl;//Adjust XY To Be On Tile Border
	}
	
	if(sy1 < asy2){//if y1 is less than y2
		Y1 = Math.floor(sy1 / scl) * scl;//Adjust XY To Be On Tile Border
		Y2 = Math.ceil(asy2 / scl) * scl;//Adjust XY To Be On Tile Border
	}else{//otherwise
		Y2 = Math.ceil(sy1 / scl) * scl;//Adjust XY To Be On Tile Border
		Y1 = Math.floor(asy2 / scl) * scl;//Adjust XY To Be On Tile Border
	}
		
	strokeWeight(borderThickness); // Thicker
	stroke(255,0,0);//RED
	line(X1, Y1, X1, Y2);//Draw Left
	line(X2, Y1, X2, Y2);//Draw Right
	line(X1, Y1, X2, Y1);//Draw Top
	line(X1, Y2, X2, Y2);//Draw Bottom
	strokeWeight(1); // Default
	stroke(0);//BLACK
}//drawTileGroupOutline() END

function tileGroup(button){//mess with tiles in square group
	var X1, X2, Y1, Y2;//define XY positions
	var XLines, YLines;//define number of XY lines
	
	if(sx1 < sx2){//if x1 is less than x2
		X1 = Math.floor(sx1 / scl) * scl;//Adjust XY To Be On Tile Border
		X2 = Math.ceil(sx2 / scl) * scl;//Adjust XY To Be On Tile Border
	}else{//otherwise
		X2 = Math.ceil(sx1 / scl) * scl;//Adjust XY To Be On Tile Border
		X1 = Math.floor(sx2 / scl) * scl;//Adjust XY To Be On Tile Border
	}
	
	if(sy1 < sy2){//if y1 is less than y2
		Y1 = Math.floor(sy1 / scl) * scl;//Adjust XY To Be On Tile Border
		Y2 = Math.ceil(sy2 / scl) * scl;//Adjust XY To Be On Tile Border
	}else{//otherwise
		Y2 = Math.ceil(sy1 / scl) * scl;//Adjust XY To Be On Tile Border
		Y1 = Math.floor(sy2 / scl) * scl;//Adjust XY To Be On Tile Border
	}
	
	XLines = (X2 - X1) / scl;//how many x lines
	YLines = (Y2 - Y1) / scl;//how many y lines
	
	for(var i = 0; i < YLines; i++){//loop through all y lines
		for(var j = 0; j < XLines; j++){//loop through all x lines
			if(button == 'left'){//we clicked left button
				mapTiles[mapTiles.length] = new mTile(X1 + (scl * j),Y1 + (scl * i),tileN,RSlider.value(),GSlider.value(),BSlider.value(), CClear);//Place a tile
			}else if(button == 'center' && tileGroupDeleting == true){//we clicked middle button on a tile
				for(var k = 0; k <= mapTiles.length-1; k++){//loop through all tiles
					if(isCursorOnTileXY(k, (X1 + (scl * j)) + 4, (Y1 + (scl * i)) + 4)){//Are we clicking on the tile
						deleteTile(k);//delete the tile
						k--;//We need to recheck that tile
					}
				}
			}else if(button == 'center'){//we clicked middle button
				mapTiles[mapTiles.length] = new mTile(X1 + (scl * j),Y1 + (scl * i),tileBorderNumber,RSlider.value(),GSlider.value(),BSlider.value(), CClear);//Place a tile
			}else if(button == 'right'){//we clicked right button
				for(var k = 0; k <= mapTiles.length-1; k++){//loop through all tiles
					if(isCursorOnTileXY(k, (X1 + (scl * j)) + 4, (Y1 + (scl * i)) + 4)){//Are we clicking on the tile
						mapTiles[k].r = RSlider.value();//set tile red value to red slider value
						mapTiles[k].g = GSlider.value();//set tile green value to green slider value
						mapTiles[k].b = BSlider.value();//set tile blue value to blue slider value
					}
				}
			}
		}
	}
	tileGroupStep = 0;//reset step count
	tileGroupDeleting = false;//no longer deleting
}//placeTile() END

function tileGroupCutCopy(button){//mess with tiles in square group
	var X1, X2, Y1, Y2;//define XY positions
	var tileCount = 0;//how many tiles are selected
	var hadTile = false;//did that square have a tile?
	
	if(sx1 < sx2){//if x1 is less than x2
		X1 = Math.floor(sx1 / scl) * scl;//Adjust XY To Be On Tile Border
		X2 = Math.ceil(sx2 / scl) * scl;//Adjust XY To Be On Tile Border
	}else{//otherwise
		X2 = Math.ceil(sx1 / scl) * scl;//Adjust XY To Be On Tile Border
		X1 = Math.floor(sx2 / scl) * scl;//Adjust XY To Be On Tile Border
	}
	
	if(sy1 < sy2){//if y1 is less than y2
		Y1 = Math.floor(sy1 / scl) * scl;//Adjust XY To Be On Tile Border
		Y2 = Math.ceil(sy2 / scl) * scl;//Adjust XY To Be On Tile Border
	}else{//otherwise
		Y2 = Math.ceil(sy1 / scl) * scl;//Adjust XY To Be On Tile Border
		Y1 = Math.floor(sy2 / scl) * scl;//Adjust XY To Be On Tile Border
	}
	
	tileGroupXLines = (X2 - X1) / scl;//how many x lines
	tileGroupYLines = (Y2 - Y1) / scl;//how many y lines
	
	for(var i = 0; i < tileGroupYLines; i++){//loop through all y lines
		for(var j = 0; j < tileGroupXLines; j++){//loop through all x lines
			hadTile = false;//square does not have tile
			if(button == 'x'){//we clicked middle button on a tile
				for(var k = 0; k <= mapTiles.length-1; k++){//loop through all tiles
					if(isCursorOnTileXY(k, (X1 + (scl * j)) + 4, (Y1 + (scl * i)) + 4)){//Are we clicking on the tile
						mapTilesCopy[tileCount] = mapTiles[k];//copy the tile
						tileCount++;//next tile
						deleteTile(k);//delete the tile
						k--;//We need to recheck that tile
						hadTile = true;//square has tile
					}
				}
			}else if(button == 'c'){//we clicked right button
				for(var k = 0; k <= mapTiles.length-1; k++){//loop through all tiles
					if(isCursorOnTileXY(k, (X1 + (scl * j)) + 4, (Y1 + (scl * i)) + 4)){//Are we clicking on the tile
						mapTilesCopy[tileCount] = mapTiles[k];//copy the tile
						tileCount++;//next tile
						hadTile = true;//square has tile
					}
				}
			}
			if(hadTile == false){//if square did not have tile
				mapTilesCopy[tileCount] = null;//insert null tile
				tileCount++;//next tile
			}
		}
	}
	tileGroupStep = 0;//reset step count
}//tileGroupCutCopy() END

function drawGroupPasteOutline(){//Draw Red Outline Showing Amount Of Tiles To Be Placed
	var X1,X2,Y1,Y2;//Setup Variables
	
	X1 = Math.floor((mouseX - (Math.floor(tileGroupXLines / 2) * scl)) / scl) * scl;//Adjust XY To Be On Tile Border
	X2 = Math.floor((mouseX + (Math.ceil(tileGroupXLines / 2) * scl)) / scl) * scl;//Adjust XY To Be On Tile Border
	Y1 = Math.floor((mouseY - (Math.floor(tileGroupYLines / 2) * scl)) / scl) * scl;//Adjust XY To Be On Tile Border
	Y2 = Math.floor((mouseY + (Math.ceil(tileGroupYLines / 2) * scl)) / scl) * scl;//Adjust XY To Be On Tile Border
	
	strokeWeight(borderThickness); // Thicker
	stroke(255,0,0);//RED
	line(X1, Y1, X1, Y2);//Draw Left
	line(X2, Y1, X2, Y2);//Draw Right
	line(X1, Y1, X2, Y1);//Draw Top
	line(X1, Y2, X2, Y2);//Draw Bottom
	strokeWeight(1); // Default
	stroke(0);//BLACK
}//drawGroupPasteOutline() END

function tileGroupPaste(){//Paste The Copied Tiles
	var X1,Y1;//Setup Variables
	var tileCount = 0;//how many tiles are there
	
	X1 = Math.floor((mouseX - (Math.floor(tileGroupXLines / 2) * scl)) / scl) * scl;//Adjust XY To Be On Tile Border
	Y1 = Math.floor((mouseY - (Math.floor(tileGroupYLines / 2) * scl)) / scl) * scl;//Adjust XY To Be On Tile Border
	
	for(var i = 0; i < tileGroupYLines; i++){//loop through all y lines
		for(var j = 0; j < tileGroupXLines; j++){//loop through all x lines
			if(tileCount < mapTilesCopy.length){//are there more tiles
				if(mapTilesCopy[tileCount] != null){//if tile is not null
					mapTiles[mapTiles.length] = new mTile(0, 0, mapTilesCopy[tileCount].image, mapTilesCopy[tileCount].r, mapTilesCopy[tileCount].g, mapTilesCopy[tileCount].b, mapTilesCopy[tileCount].clear);//paste tile
					mapTiles[mapTiles.length - 1].x = X1 + (scl * j);//Adjust XY To Be On Tile Border
					mapTiles[mapTiles.length - 1].y = Y1 + (scl * i);//Adjust XY To Be On Tile Border
				}
				if(tileCount++ == mapTilesCopy.length){//are we done
					return;//yes, return
				}
			}
		}
	}
}//tileGroupPaste() END

function deleteTile(tile){//Delete a tile and update the array
	if(mapTiles.length > 1){//If there is more than 1 tile
		for(var j = tile; j < mapTiles.length - 1; j++){//Go through all tiles after the one we're deleting
			mapTiles[j] = mapTiles[j + 1];//Shift the tile down 1
		}//Went through all tiles after the one we're deleting
	}
	mapTiles = shorten(mapTiles);//Shorten the Map Tiles Array by 1
	//console.log(mapTiles.length);//How many tiles are there?
}//deleteTile() END

function mTile(x, y, image, r, g, b, clear, lore){//Tile Object
	this.x = x;//Store X Position
	this.y = y;//Store Y Position
	this.image = image;//Store Image Number
	this.r = r;//Store Red Value
	this.g = g;//Store Green Value
	this.b = b;//Store Blue Value
	this.clear = clear;//Is the tile clear
	//this.lore = lore || 0;//The LORE? of the tile
}//mTile() END

function BGFunc(){//The background function
	this.draw = function(){//Draw the background
		background(255);//Draw the white background

		//Draw Grid on Screen
		/*for(var i = 1; i < cols + 0; i++){//Draw all the column lines
			line(scl * i, 0, scl * i, rows*scl);//Draw Verticle lines
		}//Drew all the column lines

		for(var i = 1; i < rows + 0; i++){//Draw all the row lines
			line(0, scl * i, cols*scl, scl * i);//Draw Horizontal Lines
		}//Drew all the row lines*/
		
		image(Background, 0, 0);//Draw background
	}//BGFunc.draw = function() END
	
	this.border = function(){
		strokeWeight(borderThickness); // Thicker
		stroke(255,0,0);//RED
		line(1, 0, 1, rows*scl);//Draw Verticle lines
		line((scl * cols) - 1, 0, (scl * cols) - 1, rows*scl);//Draw Verticle lines
		line(0, 1, cols*scl, 1);//Draw Horizontal Lines
		line(0, (scl * rows) - 1, cols*scl, (scl * rows) - 1);//Draw Horizontal Lines
		strokeWeight(1); // Default
		stroke(0);//BLACK
	}//BGFunc.border = function() END
}//BGFunc() END

function tileUI(){//The tile UI
	
	this.draw = function(){//Draw the UI
		fill(RSlider.value(),GSlider.value(),BSlider.value());//Set background color to the RGB value set by user
		rect(0 + pX, scl + pY, scl*3, scl);//Display color behind RGB Sliders
		
		fill(255);//Set background color to white
		rect(pX, pY, scl*rowLength, scl);//Create rectangle behind tiles UI
		for(var i = 0; i < rowLength; i++){//Go through all the tiles
			if(rowLength*tileRow+i <= fullTotalImages/*totalImages*/){//If tile exists
				if(rowLength*tileRow+i == tileN){//If displaying selected tile
					fill(RSlider.value(),GSlider.value(),BSlider.value());//Set background color to the RGB value set by user
					rect(scl*i + pX, pY, scl, scl);//Display color behind the tile
				}
				image(img[rowLength*tileRow+i], scl*i + pX, pY);//Draw tile
			}
		}//Went through all the tiles
		
		fill(255,0,0);//red text
		stroke(0);//no outline
		textSize(24);//larger text size
		text("FPS: " + frameRate().toFixed(FPSCutOff), ((scl * 22) + scl / 2.25) + pX, (scl / 1.25) + pY);//FPS: (fps.fp)
		
		text("Tiles: " + mapTiles.length, ((scl * 27) + scl / 2.25) + pX, (scl / 1.25) + pY);//Tiles: (tiles)
	
		text("Drawn: " + drawnTiles, ((scl * 27) + scl / 2.25) + pX, (scl * 1.75) + pY);//Drawn: (drawn)
		textSize(12);//Default text size
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
		FileLoadButton.position((scl*16.75)+(scl/2) + pX, scl+(scl/2.5) + pY);//Update File Load button location
		NextButton.position(scl*(rowLength+1.7) + pX, (scl/2.5) + pY);//Update Next Button position
		PrevButton.position(scl*(rowLength+.35) + pX, (scl/2.5) + pY);//Update Previous Button position
		
		fileNameInput.position((scl*18.1)+(scl/2) + pX, scl+(scl/2.5) + pY);//File Name Input Position
	}//tileUI.update() END
	
	this.setup = function(){//Setup the UI
		//Color Slider Inputs
		RSlider = createSlider(0,256,128, 16);//(Min, Max, Start)
		RSlider.changed(function RSliderC() {RInput.value(this.value());});//The function to run when changed
		RSlider.style('width', scl*2.8+'px');//Width of slider
		GSlider = createSlider(0,256,128, 16);//(Min, Max, Start)
		GSlider.changed(function GSliderC() {GInput.value(this.value());});//The function to run when changed
		GSlider.style('width', scl*2.8+'px');//Width of slider
		BSlider = createSlider(0,256,128, 16);//(Min, Max, Start)
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
		FileLoadButton = createButton('File');//createFileInput 'Load File'
		FileLoadButton.mousePressed(FileLoadMap);//The function to run when pressed
		NextButton = createButton('Next');//Text of button
		NextButton.mousePressed(nextRowC);//The function to run when pressed
		PrevButton = createButton('Prev');//Text of button
		PrevButton.mousePressed(prevRowC);//The function to run when pressed
		
		fileNameInput = createInput(fileName);//create the file name input
		fileNameInput.mouseOver(function fileNameInputMOver(){noKeyboard = true;});//we're mousing over the file name input, block keyboard functions
		fileNameInput.mouseOut(function fileNameInputMOut(){noKeyboard = false;});//we're not mousing over the file name input, allow keyboard functions
		fileNameInput.style('width', scl*3.5+'px');//Width of input box
		fileNameInput.input(function fileNameInputF(){fileName = this.value(); /* console.log(this.value()); */});
		
		//loreInputArea = createElememt('textarea', 'Some text to start initially.');
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