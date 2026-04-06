let fakeX, fakeY, prevMouseX, prevMouseY;
let showCursor = true, hideStartTime = 0, hideDuration = 1000;
let offsetIndex = 0, lastRotateTime = 0;
let flipX = 1, flipY = 1, lastFlipTime = 0, nextFlipInterval = 0;
let trail = [], maxTrailLength = 25;
let splitActive = false, splitStartTime = 0, splitDuration = 500, splitCopies = [], splitTrails = [];
let trailVisible = true, trailToggleTime = 0, nextTrailToggleInterval = 0;
const trailIntervals = [2000, 4000, 6000, 8000];

let captchaBoxes = [];
let pageStartTime = 0;
let frozen = false;
let freezeStartTime = 0;
const FREEZE_AT = 90000;
const SPIN_FOR = 10000;
let freezeFrame;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  textFont('Arial');
  rectMode(CORNER);
  fakeX = width / 2; fakeY = height / 2;
  prevMouseX = mouseX; prevMouseY = mouseY;
  lastRotateTime = millis(); lastFlipTime = millis(); nextFlipInterval = random(2000, 5000);
  trailToggleTime = millis(); nextTrailToggleInterval = random(trailIntervals);
  pageStartTime = millis();
  captchaBoxes.push(makeBox(width / 2 - 120, height / 2 - 18));
}

function draw() {
  if (!frozen && millis() - pageStartTime >= FREEZE_AT) {
    frozen = true;
    freezeStartTime = millis();
    freezeFrame = get();
  }
  if (frozen && millis() - freezeStartTime >= SPIN_FOR) {
    window.location.href = 'page3.html';
    return;
  }

  background(245, 245, 240);
  drawWindow();

  if (!frozen) {
    updateCursorSystem();
    updateBoxes();
    drawBoxes();
    drawCursorLayer();
    prevMouseX = mouseX; prevMouseY = mouseY;
  } else {
    image(freezeFrame, 0, 0, width, height);
    drawLoadingCursor(fakeX, fakeY);
  }
}

function drawWindow() {
  fill(255); stroke(180); strokeWeight(1);
  rect(width * 0.1, height * 0.1, width * 0.8, height * 0.8, 10);
  fill(232); noStroke();
  rect(width * 0.1, height * 0.1, width * 0.8, 40, 10, 10, 0, 0);
  fill(255, 90, 90); ellipse(width * 0.12, height * 0.1 + 20, 10, 10);
  fill(255, 200, 70); ellipse(width * 0.12 + 18, height * 0.1 + 20, 10, 10);
  fill(90, 200, 110); ellipse(width * 0.12 + 36, height * 0.1 + 20, 10, 10);

  fill(30); textAlign(CENTER, CENTER);
  textSize(min(width, height) * 0.04); textStyle(BOLD);
  text('Security Checkpoint', width / 2, height * 0.24);
  textStyle(NORMAL); textSize(min(width, height) * 0.02);
  text('Please confirm your humanity to continue', width / 2, height * 0.29);
}

function makeBox(x, y) {
  return { x, y, w: 22, h: 22, checked: false, label: "I'm not a robot", vx: 0, vy: 0 };
}

function updateBoxes() {
  const elapsed = millis() - pageStartTime;
  if (elapsed >= 15000) {
    for (let b of captchaBoxes) {
      if (b.vx === 0 && b.vy === 0) {
        b.vx = random([-1, 1]) * random(0.3, 0.8);
        b.vy = random([-1, 1]) * random(0.3, 0.8);
      }
      b.x += b.vx; b.y += b.vy;
      let left = width * 0.13, right = width * 0.83 - b.w, top = height * 0.18, bottom = height * 0.82 - b.h;
      if (b.x < left || b.x > right) { b.x = constrain(b.x, left, right); b.vx *= -1; }
      if (b.y < top || b.y > bottom) { b.y = constrain(b.y, top, bottom); b.vy *= -1; }
    }
  }
  if (elapsed >= 30000 && frameCount % 45 === 0 && random() < 0.35 && captchaBoxes.length < 60) {
    let parent = random(captchaBoxes);
    multiplyBoxes(parent.x, parent.y, true);
  }
}

function drawBoxes() {
  textAlign(LEFT, CENTER);
  for (let b of captchaBoxes) {
    fill(255); stroke(120); rect(b.x, b.y, b.w, b.h, 3);
    if (b.checked) {
      stroke(20, 120, 40); strokeWeight(2);
      line(b.x + 4, b.y + 12, b.x + 9, b.y + 17);
      line(b.x + 9, b.y + 17, b.x + 18, b.y + 5);
      strokeWeight(1);
    }
    noStroke(); fill(40); textSize(min(width, height) * 0.022);
    text(b.label, b.x + 36, b.y + 11);
  }
}

function mousePressed() {
  if (frozen) return;
  showCursor = false; hideStartTime = millis();
  for (let i = captchaBoxes.length - 1; i >= 0; i--) {
    let b = captchaBoxes[i];
    if (fakeX > b.x && fakeX < b.x + b.w && fakeY > b.y && fakeY < b.y + b.h) {
      b.checked = !b.checked;
      multiplyBoxes(b.x, b.y, false);
      break;
    }
  }
}

function multiplyBoxes(originX, originY, autoSpawn) {
  let count = autoSpawn ? int(random(1, 3)) : int(random(2, 5));
  for (let i = 0; i < count; i++) {
    let nx = constrain(originX + random(-180, 180), width * 0.13, width * 0.83);
    let ny = constrain(originY + random(-120, 120), height * 0.18, height * 0.82);
    let b = makeBox(nx, ny);
    if (millis() - pageStartTime >= 15000) {
      b.vx = random([-1, 1]) * random(0.3, 0.8);
      b.vy = random([-1, 1]) * random(0.3, 0.8);
    }
    b.checked = random() < 0.35;
    captchaBoxes.push(b);
  }
  if (captchaBoxes.length > 60) captchaBoxes.splice(0, captchaBoxes.length - 60);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function updateCursorSystem() {
  if (millis() - lastRotateTime > 5000) { offsetIndex = (offsetIndex + 1) % 4; lastRotateTime = millis(); }
  if (!showCursor && millis() - hideStartTime > hideDuration) showCursor = true;
  if (millis() - lastFlipTime > nextFlipInterval) {
    const choice = int(random(3));
    if (choice === 0) flipX *= -1; else if (choice === 1) flipY *= -1; else { flipX *= -1; flipY *= -1; }
    lastFlipTime = millis(); nextFlipInterval = random(2000, 5000);
  }
  if (millis() - trailToggleTime > nextTrailToggleInterval) {
    trailVisible = !trailVisible; trailToggleTime = millis(); nextTrailToggleInterval = random(trailIntervals);
    if (!trailVisible) { trail = []; for (let i = 0; i < splitTrails.length; i++) splitTrails[i] = []; }
  }
  let dx = mouseX - prevMouseX, dy = mouseY - prevMouseY;
  let movedX = dx, movedY = dy;
  if (offsetIndex === 0) { movedX = dy; movedY = -dx; }
  else if (offsetIndex === 1) { movedX = -dx; movedY = -dy; }
  else if (offsetIndex === 2) { movedX = -dy; movedY = dx; }
  fakeX = constrain(fakeX + movedX, 0, width); fakeY = constrain(fakeY + movedY, 0, height);
  if (!splitActive && random() < 0.01) startSplit();
  if (splitActive && millis() - splitStartTime > splitDuration) { splitActive = false; splitCopies = []; splitTrails = []; }
  if (trailVisible) {
    trail.push({ x: fakeX, y: fakeY, flipX, flipY });
    if (trail.length > maxTrailLength) trail.shift();
  }
  if (trailVisible && splitActive) {
    for (let i = 0; i < splitCopies.length; i++) {
      let c = splitCopies[i];
      splitTrails[i].push({ x: fakeX + c.offsetX, y: fakeY + c.offsetY, flipX: c.flipX, flipY: c.flipY, alpha: c.alpha });
      if (splitTrails[i].length > maxTrailLength) splitTrails[i].shift();
    }
  }
}

function drawCursorLayer() {
  if (trailVisible) {
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i]; const a = map(i, 0, max(1, trail.length - 1), 20, 140);
      drawWindowsCursor(t.x, t.y, t.flipX, t.flipY, a);
    }
    for (let i = 0; i < splitTrails.length; i++) {
      for (let j = 0; j < splitTrails[i].length; j++) {
        const t = splitTrails[i][j]; const a = map(j, 0, max(1, splitTrails[i].length - 1), 15, t.alpha * 0.6);
        drawWindowsCursor(t.x, t.y, t.flipX, t.flipY, a);
      }
    }
  }
  if (showCursor && splitActive) for (let c of splitCopies) drawWindowsCursor(fakeX + c.offsetX, fakeY + c.offsetY, c.flipX, c.flipY, c.alpha);
  if (showCursor) drawWindowsCursor(fakeX, fakeY, flipX, flipY, 255);
}

function startSplit() {
  splitActive = true; splitStartTime = millis(); splitCopies = []; splitTrails = [];
  let n = int(random(2, 5));
  for (let i = 0; i < n; i++) {
    splitCopies.push({ offsetX: random(-35, 35), offsetY: random(-35, 35), flipX: random() < 0.5 ? 1 : -1, flipY: random() < 0.5 ? 1 : -1, alpha: random(120, 220) });
    splitTrails.push([]);
  }
}

function drawWindowsCursor(x, y, sx, sy, alphaValue) {
  push(); translate(x, y); scale(sx, sy); stroke(0, alphaValue); fill(255, alphaValue);
  beginShape(); vertex(0,0); vertex(0,24); vertex(6,18); vertex(10,29); vertex(15,27); vertex(10,16); vertex(18,16); endShape(CLOSE);
  pop();
}

function drawLoadingCursor(x, y) {
  push(); translate(x, y); rotate(frameCount * 0.1); noStroke();
  for (let i = 0; i < 12; i++) {
    push(); rotate((TWO_PI / 12) * i); fill(70, 150, 255, map(i, 0, 11, 30, 255)); ellipse(0, -10, 4, 4); pop();
  }
  pop();
}
