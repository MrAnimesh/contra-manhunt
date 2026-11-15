export const world = { width: 8000, height: 1200 };
export const platforms = [];
export const jumpPads = [];
export const explosiveBarrels = [];
export const supplyCrates = [];

export const zones = [
  { x: 0, width: 1600, name: '01 / MILITARY AIRBASE', color: '#202e35' },
  { x: 1600, width: 1600, name: '02 / SCRAP JUNKYARD', color: '#302d2a' },
  { x: 3200, width: 1600, name: '03 / CENTRAL MEGA BRIDGE', color: '#1b2932' },
  { x: 4800, width: 1600, name: '04 / INDUSTRIAL FACTORY', color: '#282d32' },
  { x: 6400, width: 1600, name: '05 / FORGOTTEN FOREST TOWER', color: '#1d3029' }
];

function addPlatform(x, y, width, height, type, color) {
  platforms.push({ x, y, width, height, type, color });
}

// One continuous floor leaves a deep but traversable valley below the bridge.
addPlatform(0, 1150, world.width, world.height - 1150, 'solid', '#353c41');

// Airbase: low landing decks separated by broad, open runway sections.
for (let i = 0; i < 4; i++) {
  addPlatform(440 + i * 320, 1050, 200, 20, 'solid', '#7c8d96');
}
for (let i = 0; i < 10; i++) {
  let x = 100 + i * 145;
  let floorY = 1150;
  // Rest crates on a deck when their full footprint fits above it.
  for (const platform of platforms) {
    if (platform.y === 1050 && x >= platform.x && x + 32 <= platform.x + platform.width) {
      floorY = platform.y;
    }
  }
  supplyCrates.push({ x, y: floorY - 32, width: 32, height: 32, isBroken: false });
}

// Junkyard: offset shelves leave narrow passages and climbable 120px steps.
for (let row = 0; row < 4; row++) {
  for (let column = 0; column < 7; column++) {
    const x = 1640 + column * 205 + (row % 2) * 65;
    const y = 1030 - row * 120;
    addPlatform(x, y, 125, 28, 'solid', '#717b80');
    // Two overlapping rows hold six barrels each.
    if ((row === 0 || row === 2) && column < 6) {
      explosiveBarrels.push({
        x: x + 45, y: y - 36, width: 28, height: 36,
        health: 2, isExploded: false
      });
    }
  }
}
// The last shelf brings the junkyard route within jumping distance of the deck.
addPlatform(3090, 790, 110, 22, 'solid', '#717b80');

// Mega bridge: an uninterrupted elevated deck with no pillars in the underpass.
addPlatform(3200, 750, 1600, 44, 'solid', '#ba5145');
for (let row = 0; row < 4; row++) {
  for (let column = 0; column < 5; column++) {
    const x = 3260 + column * 300 + (row % 2) * 65;
    addPlatform(x, 630 - row * 120, 190, 12, 'one-way', '#bd9770');
  }
}

// Factory: seven tiers of short grates lead up into the rafters.
for (let row = 0; row < 7; row++) {
  for (let column = 0; column < 7; column++) {
    addPlatform(4860 + column * 220, 1030 - row * 120, 140, 12, 'one-way', '#a0adb1');
  }
}
for (let i = 0; i < 3; i++) {
  // Ground pads reach the middle tiers; shelf pads reach the upper rafters.
  jumpPads.push({
    x: 5010 + i * 440, y: 1138, width: 60, height: 12,
    color: '#f4d35e', launchForce: 1250
  });
  jumpPads.push({
    x: 4900 + i * 440, y: 658, width: 60, height: 12,
    color: '#f4d35e', launchForce: 1120
  });
}

// Forest: three stone towers, exterior climbing ledges, and roof-height ropes.
for (let i = 0; i < 3; i++) {
  const x = 6640 + i * 520;
  addPlatform(x, 200, 180, 950, 'solid', '#526f52');
  for (let step = 0; step < 7; step++) {
    addPlatform(x - 220 + (step % 2) * 60, 1030 - step * 120,
      150, 10, 'one-way', '#89a975');
  }
  if (i < 2) {
    addPlatform(x + 180, 200, 340, 10, 'one-way', '#b8a67a');
  }
}

// Reset object state in place so physics keeps the same array references.
export function resetMap() {
  for (const barrel of explosiveBarrels) {
    barrel.health = 2;
    barrel.isExploded = false;
  }
  for (const crate of supplyCrates) crate.isBroken = false;
}

function isVisible(object, camera) {
  return object.x < camera.x + camera.width && object.x + object.width > camera.x &&
    object.y < camera.y + camera.height && object.y + object.height > camera.y;
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawBackground(ctx, camera) {
  for (const zone of zones) {
    if (zone.x > camera.x + camera.width || zone.x + zone.width < camera.x) continue;
    ctx.fillStyle = zone.color;
    ctx.fillRect(zone.x, 0, zone.width, 1150);
    ctx.fillStyle = '#ffffff24';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(zone.name, zone.x + 60, 140);
  }

  // Runway markings leave the airspace visually open.
  for (let x = 40; x < 1600; x += 160) {
    ctx.fillStyle = '#d0d4ae66';
    ctx.fillRect(x, 1135, 70, 4);
  }

  // Bridge cables are decorative; the red deck defines solid collision.
  for (let x = 3260; x <= 4740; x += 1480) {
    ctx.fillStyle = '#653c39';
    ctx.fillRect(x, 200, 18, 550);
  }
  for (let x = 3260; x < 4740; x += 74) {
    // A parabola gives the suspension cable a gentle central sag.
    const y = 210 + 230 * (1 - Math.pow((x - 4000) / 740, 2));
    const nextY = 210 + 230 * (1 - Math.pow((x + 74 - 4000) / 740, 2));
    line(ctx, x, y, x + 74, nextY, '#ac6957', 3);
    line(ctx, x, y, x, 750, '#674c45', 2);
  }
  ctx.fillStyle = '#0f1b24';
  ctx.fillRect(3200, 794, 1600, 356);
  ctx.fillStyle = '#9aa8a0';
  ctx.font = '14px monospace';
  ctx.fillText('DEEP UNDERPASS', 3850, 1100);
  // This marks the intended final-circle location; it does not run match logic.
  ctx.fillStyle = '#ead27f';
  ctx.fillText('FINAL CIRCLE / 4000', 3900, 725);

  // Factory beams and forest silhouettes sit behind playable platforms.
  for (let x = 4820; x < 6400; x += 220) {
    ctx.fillStyle = '#394149';
    ctx.fillRect(x, 180, 12, 970);
    for (let y = 260; y < 1100; y += 240) {
      line(ctx, x, y, x + 200, y + 180, '#343d43', 5);
    }
  }
  for (let x = 6440; x < 8000; x += 200) {
    ctx.fillStyle = '#304b38';
    ctx.fillRect(x, 450, 18, 700);
    ctx.beginPath();
    ctx.moveTo(x + 9, 280);
    ctx.lineTo(x - 90, 670);
    ctx.lineTo(x + 110, 670);
    ctx.fill();
  }
}

export function drawMap(ctx, camera) {
  ctx.save();
  // All assets use world coordinates; translate once for the camera.
  ctx.translate(-camera.x, -camera.y);
  drawBackground(ctx, camera);
  for (const platform of platforms) {
    if (!isVisible(platform, camera)) continue;
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = '#ffffff30';
    ctx.fillRect(platform.x, platform.y, platform.width, 3);
    if (platform.type === 'one-way') {
      for (let x = platform.x + 6; x < platform.x + platform.width - 6; x += 18) {
        ctx.fillStyle = '#172329';
        ctx.fillRect(x, platform.y + 6, 9, 3);
      }
    } else if (platform.height > 100) {
      for (let y = platform.y + 50; y < platform.y + platform.height; y += 65) {
        line(ctx, platform.x, y, platform.x + platform.width, y, '#304832', 2);
      }
    }
  }
  for (const pad of jumpPads) {
    if (!isVisible(pad, camera)) continue;
    ctx.fillStyle = pad.color;
    ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
    ctx.fillStyle = '#40371d';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('↑ ↑ ↑', pad.x + 9, pad.y + 10);
  }
  for (const barrel of explosiveBarrels) {
    if (barrel.isExploded || !isVisible(barrel, camera)) continue;
    ctx.fillStyle = '#ce654c';
    if (barrel.health === 1) ctx.fillStyle = '#f5a65c';
    ctx.fillRect(barrel.x, barrel.y, barrel.width, barrel.height);
    ctx.fillStyle = '#633b35';
    ctx.fillRect(barrel.x, barrel.y + 5, barrel.width, 4);
    ctx.fillRect(barrel.x, barrel.y + 27, barrel.width, 4);
    ctx.fillStyle = '#fff1b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('!', barrel.x + 9, barrel.y + 24);
  }
  for (const crate of supplyCrates) {
    if (crate.isBroken || !isVisible(crate, camera)) continue;
    ctx.fillStyle = '#b59662';
    ctx.fillRect(crate.x, crate.y, crate.width, crate.height);
    ctx.strokeStyle = '#655239';
    ctx.strokeRect(crate.x + 3, crate.y + 3, crate.width - 6, crate.height - 6);
    line(ctx, crate.x + 3, crate.y + 3, crate.x + 29, crate.y + 29, '#655239', 3);
    line(ctx, crate.x + 29, crate.y + 3, crate.x + 3, crate.y + 29, '#655239', 3);
  }
  ctx.restore();
}
