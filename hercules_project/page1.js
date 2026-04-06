let fakeX, fakeY, prevMouseX, prevMouseY;
let showCursor = true, hideStartTime = 0, hideDuration = 1000;
let offsetIndex = 0, lastRotateTime = 0;
let flipX = 1, flipY = 1, lastFlipTime = 0, nextFlipInterval = 0;
let trail = [], maxTrailLength = 25;
let splitActive = false, splitStartTime = 0, splitDuration = 500, splitCopies = [], splitTrails = [];
let trailVisible = true, trailToggleTime = 0, nextTrailToggleInterval = 0;
const trailIntervals = [2000, 4000, 6000, 8000];
let wrongLabel = "";
const fakeLabels = ["synced", "stable", "manual mode", "calibrated", "tracking normal", "aligned", "safe mode", "verified"];
let glyphs = [];
let pageStartTime = 0;
let frozen = false;
let freezeFrame;
const FREEZE_AT = 15000;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  textFont('Courier New');
  rectMode(CORNER);

  fakeX = width / 2;
  fakeY = height / 2;
  prevMouseX = mouseX;
  prevMouseY = mouseY;
  lastRotateTime = millis();
  lastFlipTime = millis();
  nextFlipInterval = random(2000, 5000);
  trailToggleTime = millis();
  nextTrailToggleInterval = random(trailIntervals);
  wrongLabel = random(fakeLabels);
  pageStartTime = millis();

  for (let i = 0; i < 160; i++) {
    glyphs.push(makeGlyph());
  }
}

function draw() {
  if (!frozen && millis() - pageStartTime >= FREEZE_AT) {
    frozen = true;
    freezeFrame = get();
  }

  if (frozen) {
    image(freezeFrame, 0, 0, width, height);
    return;
  }

  background(242, 239, 232);
  updateCursorSystem();
  updateGlyphs();
  drawInterface();
  drawGlyphs();
  drawCursorLayer();
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function drawInterface() {
  noStroke();
  fill(200, 250);
  rect(width * 0.08, height * 0.08, width * 0.84, height * 0.82, 12);
  fill(25);
  textAlign(LEFT, TOP);
  textSize(min(width, height) * 0.04);
  textStyle(BOLD);
  text('Pointer Calibration Utility', width * 0.12, height * 0.14);
  textStyle(NORMAL);
  textSize(min(width, height) * 0.018);
  text('Move the cursor to stabilize the interface. Click to confirm. Do not trust the status text.', width * 0.12, height * 0.22);
  fill(80);
  text('Status: ' + wrongLabel, width * 0.12, height * 0.28);
  text('All systems nominal.', width * 0.12, height * 0.32);
  text('Calibration running…', width * 0.12, height * 0.36);

  const barX = width * 0.12;
  const barY = height * 0.44;
  const barW = width * 0.56;
  const barH = 20;
  fill(220);
  rect(barX, barY, barW, barH, 10);
  fill(90, 150, 255);
  let fakeProgress = map((millis() - pageStartTime) % 10000, 0, 10000, 0, barW);
  rect(barX, barY, fakeProgress, barH, 10);
}

function makeGlyph() {
  return {
    x: random(width),
    y: random(height),
    dx: random(-0.8, 0.8),
    dy: random(-0.8, 0.8),
    size: random(14, 36),
    code: int(random(33, 126)),
    alpha: random(60, 150)
  };
}

function updateGlyphs() {
  if (frameCount % 20 === 0) wrongLabel = random(fakeLabels);
  for (let g of glyphs) {
    g.x += g.dx;
    g.y += g.dy;
    if (g.x < 0 || g.x > width) g.dx *= -1;
    if (g.y < 0 || g.y > height) g.dy *= -1;
    if (random() < 0.02) g.code = int(random(33, 126));
  }
}

function drawGlyphs() {
  textAlign(LEFT, BASELINE);
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    fill(30, 50, 90, g.alpha);
    textSize(g.size);
    text(String.fromCharCode(g.code), g.x, g.y);
  }
}

function mousePressed() {
  if (frozen) {
    window.location.href = 'page2.html';
    return;
  }
  showCursor = false;
  hideStartTime = millis();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (frozen) freezeFrame = get();
}

function updateCursorSystem() {
  if (millis() - lastRotateTime > 5000) {
    offsetIndex = (offsetIndex + 1) % 4;
    lastRotateTime = millis();
  }
  if (!showCursor && millis() - hideStartTime > hideDuration) showCursor = true;
  if (millis() - lastFlipTime > nextFlipInterval) {
    const choice = int(random(3));
    if (choice === 0) flipX *= -1;
    else if (choice === 1) flipY *= -1;
    else { flipX *= -1; flipY *= -1; }
    lastFlipTime = millis();
    nextFlipInterval = random(2000, 5000);
  }
  if (millis() - trailToggleTime > nextTrailToggleInterval) {
    trailVisible = !trailVisible;
    trailToggleTime = millis();
    nextTrailToggleInterval = random(trailIntervals);
    if (!trailVisible) {
      trail = [];
      for (let i = 0; i < splitTrails.length; i++) splitTrails[i] = [];
    }
  }
  let dx = mouseX - prevMouseX;
  let dy = mouseY - prevMouseY;
  let movedX = dx, movedY = dy;
  if (offsetIndex === 0) { movedX = dy; movedY = -dx; }
  else if (offsetIndex === 1) { movedX = -dx; movedY = -dy; }
  else if (offsetIndex === 2) { movedX = -dy; movedY = dx; }
  fakeX = constrain(fakeX + movedX, 0, width);
  fakeY = constrain(fakeY + movedY, 0, height);

  if (!splitActive && random() < 0.01) startSplit();
  if (splitActive && millis() - splitStartTime > splitDuration) {
    splitActive = false; splitCopies = []; splitTrails = [];
  }
  if (trailVisible) {
    trail.push({ x: fakeX, y: fakeY, flipX, flipY });
    if (trail.length > maxTrailLength) trail.shift();
  }
  if (trailVisible && splitActive) {
    for (let i = 0; i < splitCopies.length; i++) {
      const c = splitCopies[i];
      splitTrails[i].push({ x: fakeX + c.offsetX, y: fakeY + c.offsetY, flipX: c.flipX, flipY: c.flipY, alpha: c.alpha });
      if (splitTrails[i].length > maxTrailLength) splitTrails[i].shift();
    }
  }
}

function drawCursorLayer() {
  if (trailVisible) {
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      const a = map(i, 0, max(1, trail.length - 1), 20, 140);
      drawWindowsCursor(t.x, t.y, t.flipX, t.flipY, a);
    }
    for (let i = 0; i < splitTrails.length; i++) {
      for (let j = 0; j < splitTrails[i].length; j++) {
        const t = splitTrails[i][j];
        const a = map(j, 0, max(1, splitTrails[i].length - 1), 15, t.alpha * 0.6);
        drawWindowsCursor(t.x, t.y, t.flipX, t.flipY, a);
      }
    }
  }
  if (showCursor && splitActive) {
    for (let c of splitCopies) drawWindowsCursor(fakeX + c.offsetX, fakeY + c.offsetY, c.flipX, c.flipY, c.alpha);
  }
  if (showCursor) drawWindowsCursor(fakeX, fakeY, flipX, flipY, 255);
}

function startSplit() {
  splitActive = true;
  splitStartTime = millis();
  splitCopies = [];
  splitTrails = [];
  let n = int(random(2, 5));
  for (let i = 0; i < n; i++) {
    splitCopies.push({ offsetX: random(-35, 35), offsetY: random(-35, 35), flipX: random() < 0.5 ? 1 : -1, flipY: random() < 0.5 ? 1 : -1, alpha: random(120, 220) });
    splitTrails.push([]);
  }
}

function drawWindowsCursor(x, y, sx, sy, alphaValue) {
  push();
  translate(x, y);
  scale(sx, sy);
  stroke(0, alphaValue);
  fill(255, alphaValue);
  beginShape();
  vertex(0, 0); vertex(0, 24); vertex(6, 18); vertex(10, 29); vertex(15, 27); vertex(10, 16); vertex(18, 16);
  endShape(CLOSE);
  pop();
}
