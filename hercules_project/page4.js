// ---------------- CURSOR SYSTEM ----------------
let fakeX, fakeY;
let prevMouseX, prevMouseY;

let showCursor = true;
let hideStartTime = 0;
let hideDuration = 1000;

let offsetIndex = 0;
let lastRotateTime = 0;

let flipX = 1;
let flipY = 1;
let lastFlipTime = 0;
let nextFlipInterval = 0;

let trail = [];
let maxTrailLength = 25;

let splitActive = false;
let splitStartTime = 0;
let splitDuration = 500;
let splitCopies = [];
let splitTrails = [];

let trailVisible = true;
let trailToggleTime = 0;
let nextTrailToggleInterval = 0;
let trailIntervals = [2000, 4000, 6000, 8000];

// ---------------- LINKS ----------------
let links = [];
let rickrollURL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

let sections = [
  { title: "Account", items: ["Profile", "Settings", "Security", "Billing", "Notifications"] },
  { title: "Support", items: ["Help Center", "Contact Us", "Documentation", "FAQ", "Report Issue"] },
  { title: "System", items: ["Logs", "Diagnostics", "Recovery", "Backup", "Reset"] },
  { title: "Actions", items: ["Continue", "Finish", "Exit", "Proceed", "Confirm"] }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");
  noCursor();

  fakeX = width / 2;
  fakeY = height / 2;
  prevMouseX = mouseX;
  prevMouseY = mouseY;

  lastRotateTime = millis();
  lastFlipTime = millis();
  nextFlipInterval = random(2000, 5000);

  trailToggleTime = millis();
  nextTrailToggleInterval = random(trailIntervals);

  createLinks();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createLinks();
}

function draw() {
  background(250);

  drawPage();

  updateCursorSystem();

  if (trailVisible) {
    drawGhostTrail();
    if (splitActive) drawSplitGhostTrails();
  }

  if (showCursor && splitActive) drawSplitCursors();
  if (showCursor) drawWindowsCursor(fakeX, fakeY, flipX, flipY, 255);

  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

// ---------------- PAGE LAYOUT ----------------

function drawPage() {
  fill(30);
  textSize(36);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text("You may now leave.", width * 0.05, height * 0.08);

  textStyle(NORMAL);
  textSize(18);
  fill(80);
  text("Select any link below to continue.", width * 0.05, height * 0.15);

  let startX = width * 0.05;
  let startY = height * 0.25;
  let colWidth = width * 0.22;

  for (let s = 0; s < sections.length; s++) {
    let sec = sections[s];
    let x = startX + s * colWidth;
    let y = startY;

    fill(40);
    textSize(18);
    textStyle(BOLD);
    text(sec.title, x, y);

    y += 30;

    for (let i = 0; i < sec.items.length; i++) {
      let link = links[s * 5 + i];

      let hovered =
        fakeX > link.x &&
        fakeX < link.x + link.w &&
        fakeY > link.y &&
        fakeY < link.y + link.h;

      textSize(16);
      textStyle(NORMAL);

      if (hovered) {
        fill(120, 40, 180);
        line(link.x, link.y + 18, link.x + link.w, link.y + 18);
      } else {
        fill(0, 0, 200);
      }

      text(link.label, link.x, link.y);
    }
  }

  fill(120);
  textSize(12);
  text("All selections are final.", width * 0.05, height * 0.95);
}

function createLinks() {
  links = [];

  let startX = width * 0.05;
  let startY = height * 0.28;
  let colWidth = width * 0.22;
  let rowGap = height * 0.045;

  for (let s = 0; s < sections.length; s++) {
    for (let i = 0; i < sections[s].items.length; i++) {
      let label = sections[s].items[i];

      let x = startX + s * colWidth;
      let y = startY + i * rowGap;

      textSize(16);
      let w = textWidth(label);

      links.push({
        x: x,
        y: y,
        w: w,
        h: 20,
        label: label
      });
    }
  }
}

// ---------------- CLICK HANDLING ----------------

function mousePressed() {
  showCursor = false;
  hideStartTime = millis();

  for (let i = links.length - 1; i >= 0; i--) {
    let l = links[i];

    if (
      fakeX > l.x &&
      fakeX < l.x + l.w &&
      fakeY > l.y &&
      fakeY < l.y + l.h
    ) {
      // DIRECT REDIRECT TO YOUTUBE (no extra page)
      location.assign(rickrollURL);
      return;
    }
  }
}

// ---------------- CURSOR SYSTEM ----------------

function updateCursorSystem() {
  if (millis() - lastRotateTime > 5000) {
    offsetIndex = (offsetIndex + 1) % 4;
    lastRotateTime = millis();
  }

  if (!showCursor && millis() - hideStartTime > hideDuration) {
    showCursor = true;
  }

  if (millis() - lastFlipTime > nextFlipInterval) {
    let choice = int(random(3));
    if (choice === 0) flipX *= -1;
    else if (choice === 1) flipY *= -1;
    else {
      flipX *= -1;
      flipY *= -1;
    }

    lastFlipTime = millis();
    nextFlipInterval = random(2000, 5000);
  }

  if (millis() - trailToggleTime > nextTrailToggleInterval) {
    trailVisible = !trailVisible;
    trailToggleTime = millis();
    nextTrailToggleInterval = random(trailIntervals);

    if (!trailVisible) {
      trail = [];
      splitTrails = [];
    }
  }

  let dx = mouseX - prevMouseX;
  let dy = mouseY - prevMouseY;

  let movedX = 0;
  let movedY = 0;

  if (offsetIndex === 0) {
    movedX = dy;
    movedY = -dx;
  } else if (offsetIndex === 1) {
    movedX = -dx;
    movedY = -dy;
  } else if (offsetIndex === 2) {
    movedX = -dy;
    movedY = dx;
  } else {
    movedX = dx;
    movedY = dy;
  }

  fakeX += movedX;
  fakeY += movedY;

  fakeX = constrain(fakeX, 0, width);
  fakeY = constrain(fakeY, 0, height);

  if (!splitActive && random() < 0.01) startSplit();

  if (splitActive && millis() - splitStartTime > splitDuration) {
    splitActive = false;
    splitCopies = [];
    splitTrails = [];
  }

  if (trailVisible) {
    trail.push({ x: fakeX, y: fakeY, flipX, flipY });
    if (trail.length > maxTrailLength) trail.shift();
  }

  if (trailVisible && splitActive) {
    for (let i = 0; i < splitCopies.length; i++) {
      let c = splitCopies[i];
      splitTrails[i].push({
        x: fakeX + c.offsetX,
        y: fakeY + c.offsetY,
        flipX: c.flipX,
        flipY: c.flipY,
        alpha: c.alpha
      });
      if (splitTrails[i].length > maxTrailLength) splitTrails[i].shift();
    }
  }
}

function drawWindowsCursor(x, y, sx, sy, alphaValue) {
  push();
  translate(x, y);
  scale(sx, sy);

  stroke(0, alphaValue);
  fill(255, alphaValue);

  beginShape();
  vertex(0, 0);
  vertex(0, 24);
  vertex(6, 18);
  vertex(10, 29);
  vertex(15, 27);
  vertex(10, 16);
  vertex(18, 16);
  endShape(CLOSE);

  pop();
}

function drawGhostTrail() {
  for (let i = 0; i < trail.length; i++) {
    let t = trail[i];
    let a = map(i, 0, trail.length - 1, 20, 140);
    drawWindowsCursor(t.x, t.y, t.flipX, t.flipY, a);
  }
}

function startSplit() {
  splitActive = true;
  splitStartTime = millis();
  splitCopies = [];
  splitTrails = [];

  let numCopies = int(random(2, 5));

  for (let i = 0; i < numCopies; i++) {
    splitCopies.push({
      offsetX: random(-35, 35),
      offsetY: random(-35, 35),
      flipX: random() < 0.5 ? 1 : -1,
      flipY: random() < 0.5 ? 1 : -1,
      alpha: random(120, 220)
    });
    splitTrails.push([]);
  }
}

function drawSplitCursors() {
  for (let i = 0; i < splitCopies.length; i++) {
    let c = splitCopies[i];
    drawWindowsCursor(
      fakeX + c.offsetX,
      fakeY + c.offsetY,
      c.flipX,
      c.flipY,
      c.alpha
    );
  }
}

function drawSplitGhostTrails() {
  for (let i = 0; i < splitTrails.length; i++) {
    let st = splitTrails[i];
    for (let j = 0; j < st.length; j++) {
      let t = st[j];
      let a = map(j, 0, st.length - 1, 15, t.alpha * 0.6);
      drawWindowsCursor(t.x, t.y, t.flipX, t.flipY, a);
    }
  }
}