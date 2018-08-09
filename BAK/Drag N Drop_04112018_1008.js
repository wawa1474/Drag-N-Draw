// Click and Drag an object
// Daniel Shiffman <http://www.shiffman.net>

var dragging = false; // Is the object being dragged?
var rollover = false; // Is the mouse over the ellipse?

var MapN = 0;//Which map peice are we messing with
var RSlider, GSlider, BSlider;
var RInput, GInput, BInput;
var CCheckBox, CClear;

var x, y, w, h;          // Location and size
var offsetX = 0, offsetY = 0;    // Mouseclick offset

var scl = 32;//Square Scale
var UISpace = 3;//3 rows
var Swidth = window.innerWidth - 30;//Screen Width
var cols = 100;//Math.floor(Swidth / scl);//Columns
var Sheight = window.innerHeight - 30;//Screen Height
var rows = 100;//Math.floor(Sheight / scl);//Rows

var img = [];
function preload() {
	img[0] = loadImage('assets/RoadVertical.png');//0
	img[img.length] = loadImage('assets/RoadHorizontal.png');//1
	img[img.length] = loadImage('assets/RoadBLTR.png');//2
	img[img.length] = loadImage('assets/RoadTLBR.png');//3
	img[img.length] = loadImage('assets/RoadCross.png');//4
	img[img.length] = loadImage('assets/RoadCross45.png');//5
	img[img.length] = loadImage('assets/RoadCross8.png');//6
	img[img.length] = loadImage('assets/RoadCornerLU.png');//7
	img[img.length] = loadImage('assets/RoadCornerLD.png');//8
	img[img.length] = loadImage('assets/RoadCornerRU.png');//9
	img[img.length] = loadImage('assets/RoadCornerRD.png');//10
	img[img.length] = loadImage('assets/RoadCornerDLDR.png');//11
	img[img.length] = loadImage('assets/RoadCornerULUR.png');//12
	img[img.length] = loadImage('assets/RoadCornerULDL.png');//13
	img[img.length] = loadImage('assets/RoadCornerURDR.png');//14
	img[img.length] = loadImage('assets/RoadTeeDLR.png');//15
	img[img.length] = loadImage('assets/RoadTeeULD.png');//16
	img[img.length] = loadImage('assets/RoadTeeULR.png');//17
	img[img.length] = loadImage('assets/RoadTeeURD.png');//18
	img[img.length] = loadImage('assets/RoadTeeULDLDR.png');//19
	img[img.length] = loadImage('assets/RoadTeeURDLDR.png');//20
	img[img.length] = loadImage('assets/RoadTeeURULDR.png');//21
	img[img.length] = loadImage('assets/RoadTeeURULDL.png');//22
	img[img.length] = loadImage('assets/SettlementHamlet.png');//23
	img[img.length] = loadImage('assets/SettlementVillage.png');//24
	img[img.length] = loadImage('assets/SettlementTown.png');//25
	img[img.length] = loadImage('assets/SettlementCity.png');//26
	img[img.length] = loadImage('assets/SettlementPort.png');//26
	img[img.length] = loadImage('assets/TrashCan.png');//27
	img[img.length] = loadImage('assets/Test/TestColor.png');//28
}
var mapTiles = [];
//mapTiles[0] = new Tile(scl * 2, scl *2, 0);
//mapTiles[1] = new Tile(scl * 2, scl *3, 1);

function setup() {
	createCanvas(cols*scl,rows*scl);//Swidth, Sheight);//640, 360
  
	// Starting location
	//x = 100;
	//y = 100;
	// Dimensions
	w = scl;
	h = scl;
	
	//console.log(rows);
	//console.log(cols);
	
	RSlider = createSlider(0,255,127);
	RSlider.changed(function RSliderC() {RInput.value(this.value());});
	RSlider.position(scl*3, scl+((scl/6)*1));
	RSlider.style('width', scl*2.8+'px');
	GSlider = createSlider(0,255,127);
	GSlider.changed(function GSliderC() {GInput.value(this.value());});
	GSlider.position(scl*3, scl+((scl/6)*3));
	GSlider.style('width', scl*2.8+'px');
	BSlider = createSlider(0,255,127);
	BSlider.changed(function BSliderC() {BInput.value(this.value());});
	BSlider.position(scl*3, scl+((scl/6)*5));
	BSlider.style('width', scl*2.8+'px');
	RInput = createInput(255);
	RInput.input(function RInputC() {RSlider.value(this.value());});
	RInput.position((scl*8)+(scl/2), scl+(scl/2));
	RInput.style('width', scl+'px');
	GInput = createInput(255);
	GInput.input(function GInputC() {GSlider.value(this.value());});
	GInput.position((scl*9)+(scl/2), scl+(scl/2));
	GInput.style('width', scl+'px');
	BInput = createInput(255);
	BInput.input(function BInputC() {BSlider.value(this.value());});
	BInput.position((scl*10)+(scl/2), scl+(scl/2));
	BInput.style('width', scl+'px');
	CCheckBox = createCheckbox('Clear', false);
	CCheckBox.position((scl*6)+(scl/2), scl+(scl/2));
	CCheckBox.changed(function CCheckBoxF() {if(this.checked()){CClear = true;}else{CClear = false;}});
	
}


function draw() {
	background(255);
	
	
	fill(RSlider.value(),GSlider.value(),BSlider.value());
	rect(scl*2, scl, scl*4, scl);
	
	//fill(255,0,0);
	//rect(scl*2, scl, scl, scl);
	image(img[img.length-1], scl*2, scl);//Color Test
	
	for(var i = 0; i < mapTiles.length; i++){
		if(/*mapTiles[i].x < scl * 2 ||*/ mapTiles[i].y < scl){
			mapTiles[i].x = 0;
			mapTiles[i].y = scl;
		}
	}
	for(var i = 0; i < mapTiles.length; i++){
		if(!dragging){
			if(mapTiles[i].x == scl && mapTiles[i].y == scl){
				if(mapTiles.length > 1){
					for(var j = i; j < mapTiles.length - 1; j++){
						mapTiles[j] = mapTiles[j + 1];
					}
				}
				mapTiles = shorten(mapTiles);
				//dragging = false;
			}
		}
	}
	for(var i = 0; i < mapTiles.length; i++){
		if(!dragging){
			if(mapTiles[i].x == scl*2 && mapTiles[i].y == scl){
				RSlider.value(red(mapTiles[i].color));
				GSlider.value(green(mapTiles[i].color));
				BSlider.value(blue(mapTiles[i].color));
				RInput.value(red(mapTiles[i].color));
				GInput.value(green(mapTiles[i].color));
				BInput.value(blue(mapTiles[i].color));
				mapTiles[i].x = 0;
				mapTiles[i].y = scl;
				//dragging = false;
			}
		}
	}
	
	for(var i = 0; i < img.length - 2; i++){
		image(img[i], scl*i, 0);//Tiles
		//image(img[1], scl, 0);
	}
	image(img[img.length-2], scl, scl);//Trash Can
  
	for(var i = 0; i < cols + 1; i++){
		line(scl * i, 0, scl * i, rows*scl);//Sheight);
	}
	for(var i = 0; i < rows + 1; i++){
		line(0, scl * i, cols*scl, scl * i);//Swidth
	}
  
  
	// Is mouse over object
	/*if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
		rollover = true;
	} 
	else {
		rollover = false;
	}*/
  
	// Adjust location if being dragged
	if (dragging) {
		mapTiles[mapN].x = mouseX + offsetX;
		mapTiles[mapN].y = mouseY + offsetY;
	}

	/*stroke(0);
	// Different fill based on state
	if (dragging) {
		fill (50);
	} else if (rollover) {
		fill(100);
	} else {
		fill(175, 200);
	}*/
	//rect(x, y, w+1, h+1);
	
	for(var i = 0; i < mapTiles.length; i++){
		if(!mapTiles[i].clear){
			fill(mapTiles[i].color);
			rect(mapTiles[i].x,mapTiles[i].y,scl,scl);
		}
		image(img[mapTiles[i].image], mapTiles[i].x, mapTiles[i].y);
	}
	//image(img[0], x, y);
}

function mousePressed() {
	/*if(mouseX > 0 && mouseX < scl && mouseY > 0 && mouseY < scl){
		//TileN = 0;
		mapTiles[mapTiles.length] = new Tile(0,0,0);
	}else if(mouseX > scl && mouseX < scl*2 && mouseY > 0 && mouseY < scl){
		//TileN = 1;
		mapTiles[mapTiles.length] = new Tile(scl,0,1);
	}else{
		//TileN = -1
	}*/
	for(var i = 0; i < img.length; i++){
		if(mouseX > scl*i && mouseX < scl*(i+1) && mouseY > 0 && mouseY < scl){
			//TileN = 0;
			mapTiles[mapTiles.length] = new mTile(scl*i,0,i,color(RSlider.value(),GSlider.value(),BSlider.value()), CClear);
		}
	}
	if(mouseX > scl*2 && mouseX < scl*3 && mouseY > scl && mouseY < scl*2){
		mapTiles[mapTiles.length] = new mTile(scl*2,scl,img.length-1,color(RSlider.value(),GSlider.value(),BSlider.value()), false);
	}
	// Did I click on the rectangle?
	//for(var i = 0; i < mapTiles.length; i++){
	for(var i = mapTiles.length-1; i >= 0; i--){
		if(mouseX > mapTiles[i].x && mouseX < mapTiles[i].x + scl && mouseY > mapTiles[i].y && mouseY < mapTiles[i].y + scl){
			mapN = i;
			dragging = true;
			// If so, keep track of relative location of click to corner of rectangle
			offsetX = mapTiles[i].x-mouseX;
			offsetY = mapTiles[i].y-mouseY;
			return;
		}
	}
	if(!(mouseY < scl*2)){
		mapTiles[mapTiles.length] = new mTile(Math.floor(mouseX/scl)*scl,Math.floor(mouseY/scl)*scl,img.length-1,color(RSlider.value(),GSlider.value(),BSlider.value()), false);
	}
	/*if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
		dragging = true;
		// If so, keep track of relative location of click to corner of rectangle
		offsetX = x-mouseX;
		offsetY = y-mouseY;
	}*/
	//if(TileN >= 0){console.log(TileN);}
	//console.log(mapTiles.length);
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