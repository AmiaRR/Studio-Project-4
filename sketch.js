let colorSlider, sizeSlider, saveButton, deleteButton, uploadButton, uploadInput;
let tiles = []; 
let tileSize = 150;
let tilesPerRow = 3; 
let tileSpacing = 10; 
let tileRows = 0; 

let canvasWidth = 800;
let canvasHeight = 600;
let tileAreaHeight = 0; 

let saveBox = { x: 10, y: 10, w: 120, h: 40 };
let deleteBox = { x: 10, y: 60, w: 120, h: 40 };
let uploadBox = { x: 10, y: 110, w: 120, h: 40 };
let sliderBox = { x: 200, y: 10, w: 220, h: 50 };
let sizeBox = { x: 200, y: 70, w: 220, h: 50 };

let drawingLayer, img, brushSound;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  background(0);
  colorMode(HSB);

  drawingLayer = createGraphics(canvasWidth, canvasHeight);
  drawingLayer.colorMode(HSB);
  drawingLayer.background(0);

  saveButton = createButton('Save Drawing');
  saveButton.position(saveBox.x + 10, saveBox.y + 10);
  saveButton.mousePressed(saveTile);

  deleteButton = createButton('Clear Canvas');
  deleteButton.position(deleteBox.x + 10, deleteBox.y + 10);
  deleteButton.mousePressed(clearCanvas);

  uploadButton = createButton('Upload Tile');
  uploadButton.position(uploadBox.x + 10, uploadBox.y + 10);
  uploadButton.mousePressed(uploadTile);

  uploadInput = createFileInput(handleFile);
  uploadInput.position(uploadBox.x + 430, uploadBox.y - 80);

  colorSlider = createSlider(0, 255, 127);
  colorSlider.position(sliderBox.x + 10, sliderBox.y + 15);
  colorSlider.style('width', '200px');

  sizeSlider = createSlider(5, 30, 10);
  sizeSlider.position(sizeBox.x + 10, sizeBox.y + 15);
  sizeSlider.style('width', '200px');

  updateCanvasPosition();
}

function draw() {
  background(0);
  
  if (img) {
    image(img, 0, tileAreaHeight, canvasWidth, canvasHeight);
  }
  
  image(drawingLayer, 0, tileAreaHeight);
  drawTiles();
  drawUI();
  drawBrush();
}

function preload() {
  brushSound = loadSound('paintbrush1.wav');
}

function mousePressed() {
  if (mouseY > tileAreaHeight && brushSound) {
    brushSound.loop();
  }
}

function mouseReleased() {
  if (brushSound) {
    brushSound.stop();
  }
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      drawingLayer.image(img, 0, 0, canvasWidth, canvasHeight);
    });
  }
}

function drawBrush() {
  if (mouseIsPressed && mouseY > tileAreaHeight) {
    let hueValue = colorSlider.value();
    let brushSize = sizeSlider.value();
    let ctx = drawingLayer.drawingContext;

    ctx.shadowBlur = 15;
    ctx.shadowColor = color(hueValue, 100, 100);

    drawingLayer.fill(hueValue, 100, 100);
    drawingLayer.noStroke();
    drawingLayer.ellipse(mouseX, mouseY - tileAreaHeight, brushSize);

    ctx.shadowBlur = 0;
  }
}

function saveTile() {
  let tile = createGraphics(tileSize, tileSize);
  tile.colorMode(HSB);
  tile.background(0);
  if (img) {
    tile.image(img, 0, 0, tileSize, tileSize);
  }
  tile.image(drawingLayer, 0, 0, tileSize, tileSize);
  
  tiles.push(tile);
  tileRows = ceil(tiles.length / tilesPerRow);
  tileAreaHeight = (tileSize + tileSpacing) * tileRows + 20;
  updateCanvasPosition();
}

function uploadTile() {
  if (tiles.length === 0) {
    console.log("No tiles to upload!");
    return;
  }
  let tile = tiles[tiles.length - 1];
  tile.elt.toBlob(blob => {
    let formData = new FormData();
    formData.append("image", blob, "tile.png");

    fetch("https://script.google.com/macros/s/AKfycbzAqpwlc2vWv1u4wqYiHcxqxmB_lLMBJPNdoatps8R0sck9JwhWrUsVVzJtdfZJktpf/exec", {
      method: "POST",
      body: formData
    }).then(response => response.text())
      .then(data => console.log("Upload Success:", data))
      .catch(error => console.error("Upload Failed:", error));
  }, "image/png");
}

function updateCanvasPosition() {
  let newHeight = tileAreaHeight + canvasHeight;
  resizeCanvas(canvasWidth, newHeight);
}

function drawTiles() {
  let xOffset = 10;
  let yOffset = 150;
  for (let i = 0; i < tiles.length; i++) {
    let row = floor(i / tilesPerRow);
    let col = i % tilesPerRow;
    let x = xOffset + col * (tileSize + tileSpacing);
    let y = yOffset + row * (tileSize + tileSpacing);
    fill(0);
    rect(x, y, tileSize, tileSize);
    image(tiles[i], x, y, tileSize, tileSize);
  }
}

function drawUI() {
  drawBox(saveBox, "Save");
  drawBox(deleteBox, "Delete");
  drawBox(uploadBox, "Upload");
  drawSliderBox();
  drawSizeBox();
  drawColorSlider();
  drawSizeSlider();
}

function drawBox(box, label) {
  fill(50);
  stroke(255);
  rect(box.x, box.y, box.w, box.h);
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text(label, box.x + box.w / 2, box.y + box.h / 2);
}

function drawSliderBox() {
  for (let i = 0; i < sliderBox.w; i++) {
    let hueValue = map(i, 0, sliderBox.w, 0, 360);
    stroke(hueValue, 100, 100);
    line(sliderBox.x + i, sliderBox.y, sliderBox.x + i, sliderBox.y + sliderBox.h);
  }
  noFill();
  stroke(255);
  rect(sliderBox.x, sliderBox.y, sliderBox.w, sliderBox.h);
}

function drawSizeBox() {
  fill(50);
  stroke(255);
  rect(sizeBox.x, sizeBox.y, sizeBox.w, sizeBox.h);
}

function drawColorSlider() {
  fill(50);
  stroke(255);
  rect(sliderBox.x, sliderBox.y, sliderBox.w, sliderBox.h);
  for (let i = 0; i < sliderBox.w; i++) {
    let hueValue = map(i, 0, sliderBox.w, 0, 360);
    stroke(hueValue, 100, 100);
    line(sliderBox.x + i, sliderBox.y, sliderBox.x + i, sliderBox.y + sliderBox.h);
  }
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text('', sliderBox.x + sliderBox.w / 2, sliderBox.y + sliderBox.h / 2);
}

function drawSizeSlider() {
  fill(50);
  stroke(255);
  rect(sizeBox.x, sizeBox.y, sizeBox.w, sizeBox.h);
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text('', sizeBox.x + sizeBox.w / 2, sizeBox.y + sizeBox.h / 2);
}

function clearCanvas() {
  drawingLayer.clear();
  drawingLayer.background(0);
} 

