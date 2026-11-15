export const world = { width: 8000, height: 2400 };
// Keep the original terrain layout below an extra 1200px of open airspace.
const terrainOffsetY = world.height - 1200;
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
addPlatform(0, 1150, world.width, 50, 'solid', '#353c41');

// Airbase: leave open runway between the two watchtowers.
addPlatform(620, 1050, 340, 20, 'solid', '#7c8d96');
const cratePositions = [40, 600, 680, 760, 840, 920, 1000, 1480, 1520, 1560];
for (const x of cratePositions) {
  let floorY = 1150;
  if (x >= 620 && x + 32 <= 960) floorY = 1050;
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

// Move terrain and interactable objects together so every object stays supported.
for (const assets of [platforms, jumpPads, explosiveBarrels, supplyCrates]) {
  for (const asset of assets) asset.y += terrainOffsetY;
}

// Three 300px stories use alternating stair flights, like a real steel tower.
export const watchTowers = [
  { x: 100, y: 1450, width: 420, height: 900, name: 'WATCH / 01' },
  { x: 1050, y: 1450, width: 420, height: 900, name: 'WATCH / 02' }
];
for (const tower of watchTowers) {
  for (let floor = 0; floor < 3; floor++) {
    const bottom = tower.y + tower.height - floor * 300;
    addPlatform(tower.x, bottom - 300, tower.width, 14, 'one-way', '#8b9da5');
    for (let step = 0; step < 20; step++) {
      let x = tower.x + 20 + step * 18;
      if (floor % 2 === 1) x = tower.x + 374 - step * 18;
      // Stair treads allow walking up small rises as well as jumping through.
      platforms.push({ x, y: bottom - (step + 1) * 15,
        width: 26, height: 5, type: 'one-way', color: '#a3b1b7', isStair: true });
    }
  }
  addPlatform(tower.x - 6, tower.y - 130, tower.width + 12, 12, 'solid', '#687c86');
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
    ctx.fillRect(zone.x, 0, zone.width, world.height - 50);
    ctx.fillStyle = '#ffffff24';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(zone.name, zone.x + 60, 140 + terrainOffsetY);
  }

  // Keep background structures aligned with the shifted terrain.
  ctx.save();
  ctx.translate(0, terrainOffsetY);

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
  ctx.restore();
}

function drawLamp(ctx, x, y, brightness) {
  ctx.save();
  // A soft pool of light fades below the metal lamp housing.
  const glow = ctx.createRadialGradient(x, y + 10, 2, x, y + 10, 68);
  glow.addColorStop(0, 'rgba(255, 220, 151, ' + brightness * 0.2 + ')');
  glow.addColorStop(1, 'rgba(255, 220, 151, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 68, y - 58, 136, 136);
  ctx.fillStyle = '#1a252c';
  ctx.fillRect(x - 12, y - 4, 24, 7);
  ctx.fillStyle = '#f1d8a2';
  ctx.fillRect(x - 8, y + 3, 16, 3);
  ctx.restore();
}

function drawSearchlight(ctx, x, y, time) {
  // The motor sweeps slowly across the runway; time is measured in seconds.
  const angle = Math.PI / 2 + Math.sin(time * 0.35) * 0.95;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const beam = ctx.createLinearGradient(0, 0, 1100, 0);
  beam.addColorStop(0, 'rgba(236, 239, 191, 0.22)');
  beam.addColorStop(0.45, 'rgba(236, 239, 191, 0.07)');
  beam.addColorStop(1, 'rgba(236, 239, 191, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(10, -5);
  ctx.lineTo(1100, -150);
  ctx.lineTo(1100, 150);
  ctx.lineTo(10, 5);
  ctx.closePath();
  ctx.fill();
  // Lamp head rotates with its beam; the roof mount stays fixed.
  ctx.fillStyle = '#526975';
  ctx.fillRect(-16, -10, 28, 20);
  ctx.fillStyle = '#f0edc6';
  ctx.fillRect(10, -8, 4, 16);
  ctx.restore();
  line(ctx, x, y + 4, x, y + 15, '#93a8af', 5);
}

function drawRadar(ctx, x, y, time) {
  line(ctx, x, y, x, y - 28, '#8097a2', 5);
  // Project a rotating dish into a changing ellipse for a simple sense of depth.
  const dishWidth = 5 + Math.abs(Math.cos(time * 0.8)) * 27;
  ctx.fillStyle = '#435e6a';
  ctx.strokeStyle = '#a6bec5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - 35, dishWidth, 15, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  line(ctx, x - dishWidth, y - 35, x + dishWidth, y - 35, '#809ba6', 1);
  line(ctx, x, y - 49, x, y - 20, '#809ba6', 1);
  const receiverX = x + Math.sin(time * 0.8) * 36;
  line(ctx, x, y - 35, receiverX, y - 39, '#c2d0cf', 2);
}

function drawFlag(ctx, x, y, time) {
  line(ctx, x, y - 12, x, y + 75, '#9aaeb4', 2);
  ctx.fillStyle = '#809576';
  ctx.beginPath();
  // Pin the cloth at the pole; increase the wave toward its free end.
  for (let i = 0; i <= 12; i++) {
    const wave = Math.sin(time * 3 - i * 0.5) * i * 0.45;
    const flagX = x + i * 4;
    if (i === 0) ctx.moveTo(flagX, y + wave);
    else ctx.lineTo(flagX, y + wave);
  }
  for (let i = 12; i >= 0; i--) {
    const wave = Math.sin(time * 3 - i * 0.5) * i * 0.45;
    ctx.lineTo(x + i * 4, y + 24 + wave);
  }
  ctx.closePath();
  ctx.fill();
}

function drawWatchTowers(ctx, camera, time) {
  for (const tower of watchTowers) {
    // Include the searchlight reach when skipping towers outside the camera.
    const bounds = { x: tower.x - 1100, y: tower.y - 240, width: 2620, height: 1140 };
    if (!isVisible(bounds, camera)) continue;
    const ground = tower.y + tower.height;
    const phase = time + tower.x / 300;
    drawSearchlight(ctx, tower.x + 350, tower.y - 145, phase);
    // Concrete footings and dark interior panels anchor the steel structure.
    ctx.fillStyle = '#182830';
    ctx.fillRect(tower.x + 24, tower.y - 118, tower.width - 48, 118);
    ctx.fillStyle = '#263a45';
    ctx.fillRect(tower.x + 24, tower.y - 116, tower.width - 88, 15);
    // Slim columns, footings, and cross bracing give the structure depth.
    for (const x of [tower.x + 8, tower.x + tower.width - 20]) {
      ctx.fillStyle = '#34454f';
      ctx.fillRect(x, tower.y - 130, 12, tower.height + 130);
      ctx.fillStyle = '#8b9da5';
      ctx.fillRect(x, tower.y - 130, 3, tower.height + 130);
      ctx.fillStyle = '#56636a';
      ctx.fillRect(x - 10, ground - 12, 32, 12);
    }
    for (let floor = 0; floor < 3; floor++) {
      const bottom = ground - floor * 300;
      const top = bottom - 300;
      line(ctx, tower.x + 24, bottom - 15, tower.x + 394, top + 20, '#3e515b', 3);
      line(ctx, tower.x + 394, bottom - 15, tower.x + 24, top + 20, '#3e515b', 3);
      // Side rails follow each flight; the slender treads remain collision geometry.
      let startX = tower.x + 20;
      let endX = tower.x + 400;
      if (floor % 2 === 1) { startX = tower.x + 400; endX = tower.x + 20; }
      line(ctx, startX, bottom - 8, endX, top - 8, '#647b87', 7);
      line(ctx, startX, bottom - 48, endX, top - 48, '#a8bbc3', 2);
      for (let post = 0; post <= 5; post++) {
        // Interpolate evenly spaced handrail uprights along the stairs.
        const x = startX + (endX - startX) * post / 5;
        const y = bottom - 300 * post / 5;
        line(ctx, x, y - 8, x, y - 48, '#8299a3', 2);
      }
      line(ctx, tower.x, top - 38, tower.x + tower.width, top - 38, '#9fb2ba', 2);
      for (let x = tower.x + 8; x < tower.x + tower.width; x += 56) {
        line(ctx, x, top, x, top - 38, '#647d87', 2);
      }
      ctx.fillStyle = '#d6e3de';
      ctx.font = '11px monospace';
      ctx.fillText('0' + (floor + 1), tower.x + 12, top + 32);
      // Warm utility lamps illuminate each stair landing.
      drawLamp(ctx, tower.x + 38, top + 18, 0.65 + Math.sin(phase * 0.7) * 0.04);
      ctx.fillStyle = '#d3b263';
      for (let stripe = 0; stripe < 5; stripe++) {
        ctx.fillRect(tower.x + 168 + stripe * 18, top + 17, 9, 4);
      }
      ctx.fillStyle = '#17242a';
      ctx.fillRect(tower.x + 320, top + 18, 62, 22);
      ctx.fillStyle = '#bbcec7';
      ctx.font = '9px monospace';
      ctx.fillText('LEVEL 0' + (floor + 1), tower.x + 326, top + 32);
    }
    // A tinted panoramic cabin crowns the top floor, with an open side doorway.
    ctx.fillStyle = '#73b8c32b';
    ctx.fillRect(tower.x + 24, tower.y - 116, tower.width - 88, 104);
    for (let x = tower.x + 24; x < tower.x + tower.width - 60; x += 68) {
      line(ctx, x, tower.y - 116, x, tower.y - 12, '#92aeb5', 3);
      line(ctx, x + 8, tower.y - 100, x + 40, tower.y - 72, '#bce2e133', 2);
    }
    // A lit console and sweeping screen make the lookout feel staffed and operational.
    ctx.fillStyle = '#24363e';
    ctx.fillRect(tower.x + 140, tower.y - 32, 120, 20);
    ctx.fillStyle = '#0e2827';
    ctx.fillRect(tower.x + 148, tower.y - 55, 48, 24);
    ctx.strokeStyle = '#608e83';
    ctx.strokeRect(tower.x + 148, tower.y - 55, 48, 24);
    const scanX = tower.x + 150 + (phase * 14 % 44);
    line(ctx, scanX, tower.y - 53, scanX, tower.y - 33, '#8ce3b8', 2);
    ctx.fillStyle = '#b2d5c4';
    ctx.fillRect(tower.x + 170, tower.y - 45, 3, 3);
    ctx.fillRect(tower.x + 184, tower.y - 39, 2, 2);
    ctx.fillStyle = '#87d5bc';
    ctx.fillRect(tower.x + 154, tower.y - 26, 30, 6);
    ctx.fillStyle = '#d7e1d6';
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#1a2a32';
    ctx.fillRect(tower.x + 112, tower.y - 128, 185, 26);
    ctx.fillStyle = '#d7e1d6';
    ctx.fillText(tower.name + ' / OPS', tower.x + 126, tower.y - 110);
    // Antenna and beacon add a clear silhouette against the open airspace.
    line(ctx, tower.x + 70, tower.y - 130, tower.x + 70, tower.y - 205, '#8ea4ad', 3);
    line(ctx, tower.x + 48, tower.y - 182, tower.x + 92, tower.y - 182, '#8ea4ad', 2);
    // A slow beacon pulse avoids harsh flashing.
    const beacon = 0.2 + 0.8 * Math.pow((Math.sin(phase * 2) + 1) / 2, 4);
    ctx.save();
    ctx.shadowColor = '#ff7855';
    ctx.shadowBlur = 8 + beacon * 18;
    ctx.fillStyle = 'rgba(255, 128, 85, ' + beacon + ')';
    ctx.fillRect(tower.x + 66, tower.y - 210, 8, 5);
    ctx.restore();
    drawRadar(ctx, tower.x + 220, tower.y - 146, phase);
    drawFlag(ctx, tower.x + 20, tower.y - 205, phase);
  }
}

export function drawMap(ctx, camera, time = performance.now() / 1000) {
  ctx.save();
  // All assets use world coordinates; translate once for the camera.
  ctx.translate(-camera.x, -camera.y);
  drawBackground(ctx, camera);
  drawWatchTowers(ctx, camera, time);
  for (const platform of platforms) {
    if (!isVisible(platform, camera)) continue;
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = '#ffffff30';
    ctx.fillRect(platform.x, platform.y, platform.width, 3);
    if (platform.type === 'one-way' && !platform.isStair) {
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
