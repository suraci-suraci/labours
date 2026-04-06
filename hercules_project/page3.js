let fakeX, fakeY, prevMouseX, prevMouseY;
let showCursor = true, hideStartTime = 0, hideDuration = 1000;
let offsetIndex = 0, lastRotateTime = 0;
let flipX = 1, flipY = 1, lastFlipTime = 0, nextFlipInterval = 0;
let trail = [], maxTrailLength = 25;
let splitActive = false, splitStartTime = 0, splitDuration = 500, splitCopies = [], splitTrails = [];
let trailVisible = true, trailToggleTime = 0, nextTrailToggleInterval = 0;
const trailIntervals = [2000, 4000, 6000, 8000];

let popups = [];
let siteStartTime = 0;
const maxPopups = 90;
let swallowing = false;
let swallowPopup = null;
let swallowStartTime = 0;
let blackoutAlpha = 0;
let blackoutReadyForClick = false;

const adTitles = [
  'BET BIG TONIGHT', 'Protect Your Future', 'Upgrade Your Home', 'Flash Sale Ending Soon', 'Claim Your Bonus',
  'Exclusive Member Access', 'Instant Approval', 'SAVE ON YOUR NEXT TV', 'PREMIUM COVERAGE NOW', 'SMART HOME ESSENTIALS'
];
const adBodies = [
  'Sign up now for live sports betting and same-day rewards.', 'Bundle your home and auto insurance in under three minutes.',
  'Replace every device in your house with smarter ones today.', 'This limited-time electronics deal disappears at midnight.',
  'A better plan is just one click away.', 'Exclusive online offer ends soon.'
];
const adCategories = ['sports betting', 'insurance', 'home electronics', 'streaming bundle', 'credit card', 'security system', 'phone plan', 'smart home'];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Arial');
  rectMode(CORNER);
  noCursor();
  siteStartTime = millis();
  fakeX = width / 2; fakeY = height / 2;
  prevMouseX = mouseX; prevMouseY = mouseY;
  lastRotateTime = millis(); lastFlipTime = millis(); nextFlipInterval = random(2000, 5000);
  trailToggleTime = millis(); nextTrailToggleInterval = random(trailIntervals);
  for (let i = 0; i < 9; i++) spawnPopup(random(60, width - 280), random(100, height - 220));
}

function draw() {
  background(238, 232, 220);
  let elapsed = millis() - siteStartTime;
  if (!swallowing && elapsed >= 90000) startSwallowSequence();

  drawDummyWebsite();
  drawPopups();

  if (!swallowing) {
    updateCursorSystem();
    updatePopups(elapsed);
    drawCursorLayer();
    prevMouseX = mouseX; prevMouseY = mouseY;
  } else {
    drawSwallowingPopup();
    drawBlackout();
  }
}

function drawDummyWebsite() {
  fill(250, 248, 242); noStroke(); rect(0, 0, width, height);
  fill(97, 72, 43); rect(0, 0, width, 80);
  fill(255, 245, 220); textAlign(LEFT, CENTER); textStyle(BOLD); textSize(min(width, height) * 0.05); text('Labours of Hercules', 30, 40);
  textStyle(NORMAL); textSize(min(width, height) * 0.02); text('Strength. Endurance. Deliverance.', 30 + width * 0.28, 42);
  fill(227, 218, 196); rect(0, 80, width, 42);
  fill(80, 60, 35); textSize(min(width, height) * 0.018); text('Trials', 35, 101); text('Monsters', 110, 101); text('Weapons', 215, 101); text('Legacy', 330, 101);
  fill(70, 55, 35); textAlign(LEFT, TOP); textSize(min(width, height) * 0.04); text('The Hydra', width * 0.05, height * 0.22);
  textSize(min(width, height) * 0.022);
  text('Closure becomes multiplication. Close the popups if you can.', width * 0.05, height * 0.3, width * 0.55, height * 0.2);
  fill(120, 100, 70); rect(width * 0.05, height * 0.48, width * 0.27, height * 0.24, 8);
  fill(245, 240, 225); textSize(min(width, height) * 0.022);
  text('Illustration unavailable due to third-party interference.', width * 0.07, height * 0.53, width * 0.22, height * 0.2);
  fill(70, 55, 35); textSize(min(width, height) * 0.02); text('Heads remaining: ' + popups.length, width * 0.05, height * 0.8);
}

function updatePopups(elapsed) {
  if (elapsed >= 20000) {
    for (let p of popups) {
      if (p.vx === 0 && p.vy === 0) { p.vx = random([-1, 1]) * random(0.15, 0.45); p.vy = random([-1, 1]) * random(0.15, 0.45); }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 20 || p.x + p.w > width - 20) { p.x = constrain(p.x, 20, width - 20 - p.w); p.vx *= -1; }
      if (p.y < 90 || p.y + p.h > height - 20) { p.y = constrain(p.y, 90, height - 20 - p.h); p.vy *= -1; }
    }
  }
  if (elapsed >= 30000 && frameCount % 50 === 0 && random() < 0.5 && popups.length < maxPopups) {
    spawnPopup(random(20, width - 280), random(90, height - 220));
  }
}

function drawPopups() {
  for (let i = 0; i < popups.length; i++) {
    const p = popups[i];
    const jitterX = sin(frameCount * 0.05 + i * 9) * 0.8;
    const jitterY = cos(frameCount * 0.04 + i * 11) * 0.8;
    const px = p.x + jitterX, py = p.y + jitterY;
    fill(0, 25); noStroke(); rect(px + 5, py + 5, p.w, p.h, 8);
    fill(255); stroke(110); strokeWeight(1); rect(px, py, p.w, p.h, 8);
    fill(230,230,235); noStroke(); rect(px, py, p.w, 30, 8, 8, 0, 0);
    fill(50); textAlign(LEFT, CENTER); textStyle(BOLD); textSize(min(width, height) * 0.016); text(p.category.toUpperCase(), px + 10, py + 15);
    fill(210,70,70); rect(px + p.w - 28, py + 6, 18, 18, 3); fill(255); textAlign(CENTER, CENTER); text('×', px + p.w - 19, py + 15);
    fill(25); textAlign(LEFT, TOP); textSize(min(width, height) * 0.024); text(p.title, px + 14, py + 46, p.w - 28, 45);
    textStyle(NORMAL); textSize(min(width, height) * 0.016); text(p.body, px + 14, py + 90, p.w - 28, 55);
    fill(70, 125, 255); rect(px + 14, py + p.h - 40, 92, 24, 5); fill(255); textAlign(CENTER, CENTER); textSize(min(width, height) * 0.014); text('LEARN MORE', px + 60, py + p.h - 28);
  }
  textStyle(NORMAL);
}

function mousePressed() {
  if (blackoutReadyForClick) { window.location.href = 'page4.html'; return; }
  if (swallowing) return;
  showCursor = false; hideStartTime = millis();
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    const closeX = p.x + p.w - 28, closeY = p.y + 6;
    if (fakeX > closeX && fakeX < closeX + 18 && fakeY > closeY && fakeY < closeY + 18) {
      const ox = p.x, oy = p.y;
      popups.splice(i, 1);
      if (popups.length < maxPopups) spawnPopup(constrain(ox + random(-120, 120), 20, width - 280), constrain(oy + random(-100, 100), 90, height - 220));
      if (popups.length < maxPopups) spawnPopup(constrain(ox + random(-160, 160), 20, width - 280), constrain(oy + random(-130, 130), 90, height - 220));
      break;
    }
  }
}

function spawnPopup(x, y) {
  let w = random(220, 270), h = random(150, 190);
  popups.push({ x: constrain(x, 20, width - w - 20), y: constrain(y, 90, height - h - 20), w, h, category: random(adCategories), title: random(adTitles), body: random(adBodies), vx: 0, vy: 0 });
}

function startSwallowSequence() {
  swallowing = true; showCursor = false; trail = []; splitTrails = []; splitCopies = []; splitActive = false;
  swallowPopup = popups.length > 0 ? random(popups) : { x: width/2 - 120, y: height/2 - 80, w: 240, h: 170, category: 'system ad', title: "YOU CAN'T CLOSE THIS", body: 'The labour now closes around you.' };
  swallowStartTime = millis();
}

function drawSwallowingPopup() {
  const t = constrain((millis() - swallowStartTime) / 8000, 0, 1);
  const grow = lerp(1, 12, t);
  const cx = swallowPopup.x + swallowPopup.w / 2, cy = swallowPopup.y + swallowPopup.h / 2;
  const w = swallowPopup.w * grow, h = swallowPopup.h * grow;
  const x = cx - w / 2, y = cy - h / 2;
  fill(0,30); noStroke(); rect(x + 10, y + 10, w, h, 12);
  fill(255); stroke(90); strokeWeight(1); rect(x, y, w, h, 12);
  fill(230,230,235); noStroke(); rect(x, y, w, max(30, h * 0.12), 12, 12, 0, 0);
  fill(40); textAlign(LEFT, CENTER); textStyle(BOLD); textSize(max(14, w * 0.03)); text(swallowPopup.category.toUpperCase(), x + 18, y + max(15, h * 0.06));
  fill(210,70,70); rect(x + w - 40, y + 8, 24, 24, 4); fill(255); textAlign(CENTER, CENTER); text('×', x + w - 28, y + 20);
  fill(20); textAlign(LEFT, TOP); textSize(max(18, w * 0.06)); text(swallowPopup.title, x + 24, y + h * 0.18, w - 48, h * 0.2);
  textStyle(NORMAL); textSize(max(14, w * 0.028)); text(swallowPopup.body, x + 24, y + h * 0.4, w - 48, h * 0.2);
  fill(70,125,255); rect(x + 24, y + h - h * 0.18, w * 0.22, h * 0.08, 6); fill(255); textAlign(CENTER, CENTER); textSize(max(12, w * 0.024)); text('LEARN MORE', x + 24 + w * 0.11, y + h - h * 0.14);
  blackoutAlpha = map(t, 0, 1, 0, 255);
}

function drawBlackout() {
  fill(0, blackoutAlpha); noStroke(); rect(0, 0, width, height);
  if (blackoutAlpha >= 250) blackoutReadyForClick = true;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

function updateCursorSystem() {
  if (millis() - lastRotateTime > 5000) { offsetIndex = (offsetIndex + 1) % 4; lastRotateTime = millis(); }
  if (!showCursor && millis() - hideStartTime > hideDuration) showCursor = true;
  if (millis() - lastFlipTime > nextFlipInterval) {
    const choice = int(random(3)); if (choice === 0) flipX *= -1; else if (choice === 1) flipY *= -1; else { flipX *= -1; flipY *= -1; }
    lastFlipTime = millis(); nextFlipInterval = random(2000, 5000);
  }
  if (millis() - trailToggleTime > nextTrailToggleInterval) {
    trailVisible = !trailVisible; trailToggleTime = millis(); nextTrailToggleInterval = random(trailIntervals);
    if (!trailVisible) { trail = []; for (let i = 0; i < splitTrails.length; i++) splitTrails[i] = []; }
  }
  let dx = mouseX - prevMouseX, dy = mouseY - prevMouseY;
  let movedX = dx, movedY = dy;
  if (offsetIndex === 0) { movedX = dy; movedY = -dx; } else if (offsetIndex === 1) { movedX = -dx; movedY = -dy; } else if (offsetIndex === 2) { movedX = -dy; movedY = dx; }
  fakeX = constrain(fakeX + movedX, 0, width); fakeY = constrain(fakeY + movedY, 0, height);
  if (!splitActive && random() < 0.01) startSplit();
  if (splitActive && millis() - splitStartTime > splitDuration) { splitActive = false; splitCopies = []; splitTrails = []; }
  if (trailVisible) { trail.push({ x: fakeX, y: fakeY, flipX, flipY }); if (trail.length > maxTrailLength) trail.shift(); }
  if (trailVisible && splitActive) {
    for (let i = 0; i < splitCopies.length; i++) {
      let c = splitCopies[i]; splitTrails[i].push({ x: fakeX + c.offsetX, y: fakeY + c.offsetY, flipX: c.flipX, flipY: c.flipY, alpha: c.alpha });
      if (splitTrails[i].length > maxTrailLength) splitTrails[i].shift();
    }
  }
}

function drawCursorLayer() {
  if (trailVisible) {
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i], a = map(i, 0, max(1, trail.length - 1), 20, 140); drawWindowsCursor(t.x, t.y, t.flipX, t.flipY, a);
    }
    for (let i = 0; i < splitTrails.length; i++) {
      for (let j = 0; j < splitTrails[i].length; j++) {
        const t = splitTrails[i][j], a = map(j, 0, max(1, splitTrails[i].length - 1), 15, t.alpha * 0.6); drawWindowsCursor(t.x, t.y, t.flipX, t.flipY, a);
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
