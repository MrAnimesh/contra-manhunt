export const world = { width: 3200, height: 1000 };

// Edit these rectangles to rearrange the level; art never changes collision.
export const platforms = [
  { x: 0, y: 950, width: 3200, height: 50, type: 'solid', color: '#53605f' },
  // Outpost: climb the exterior ledges to reach the concrete tower roof.
  { x: 40, y: 330, width: 125, height: 620, type: 'solid', color: '#65716c' },
  { x: 165, y: 840, width: 135, height: 12, type: 'one-way', color: '#90a56c' },
  { x: 240, y: 730, width: 150, height: 12, type: 'one-way', color: '#90a56c' },
  { x: 165, y: 620, width: 125, height: 12, type: 'one-way', color: '#90a56c' },
  { x: 260, y: 510, width: 145, height: 12, type: 'one-way', color: '#90a56c' },
  { x: 165, y: 410, width: 125, height: 12, type: 'one-way', color: '#90a56c' },
  { x: 450, y: 820, width: 170, height: 12, type: 'one-way', color: '#90a56c' },
  { x: 520, y: 700, width: 180, height: 12, type: 'one-way', color: '#90a56c' },
  { x: 470, y: 580, width: 140, height: 12, type: 'one-way', color: '#90a56c' },
  { x: 650, y: 570, width: 175, height: 12, type: 'one-way', color: '#90a56c' },
  // Bridge: one continuous solid deck separates the upper route and tunnel.
  { x: 800, y: 570, width: 1600, height: 42, type: 'solid', color: '#bb5245' },
  { x: 850, y: 810, width: 180, height: 12, type: 'one-way', color: '#ac9069' },
  { x: 1100, y: 720, width: 190, height: 12, type: 'one-way', color: '#ac9069' },
  { x: 1430, y: 825, width: 210, height: 12, type: 'one-way', color: '#ac9069' },
  { x: 1780, y: 735, width: 210, height: 12, type: 'one-way', color: '#ac9069' },
  { x: 2110, y: 835, width: 180, height: 12, type: 'one-way', color: '#ac9069' },
  { x: 910, y: 450, width: 190, height: 12, type: 'one-way', color: '#ac9069' },
  { x: 1190, y: 340, width: 200, height: 12, type: 'one-way', color: '#ac9069' },
  { x: 1510, y: 260, width: 180, height: 12, type: 'one-way', color: '#ac9069' },
  { x: 1790, y: 350, width: 200, height: 12, type: 'one-way', color: '#ac9069' },
  { x: 2110, y: 450, width: 190, height: 12, type: 'one-way', color: '#ac9069' },
  // Warehouse: offset solid floors leave vertical passages at their ends.
  { x: 2460, y: 830, width: 290, height: 24, type: 'solid', color: '#76868c' },
  { x: 2820, y: 710, width: 300, height: 24, type: 'solid', color: '#76868c' },
  { x: 2440, y: 590, width: 330, height: 24, type: 'solid', color: '#76868c' },
  { x: 2800, y: 470, width: 320, height: 24, type: 'solid', color: '#76868c' },
  { x: 2450, y: 350, width: 330, height: 24, type: 'solid', color: '#76868c' },
  { x: 2800, y: 230, width: 320, height: 24, type: 'solid', color: '#76868c' },
  { x: 2730, y: 770, width: 125, height: 10, type: 'one-way', color: '#a9bcc0' },
  { x: 2710, y: 650, width: 140, height: 10, type: 'one-way', color: '#a9bcc0' },
  { x: 2740, y: 530, width: 120, height: 10, type: 'one-way', color: '#a9bcc0' },
  { x: 2710, y: 410, width: 150, height: 10, type: 'one-way', color: '#a9bcc0' },
  { x: 2730, y: 290, width: 130, height: 10, type: 'one-way', color: '#a9bcc0' },
  { x: 3170, y: 150, width: 30, height: 800, type: 'solid', color: '#657780' }
];

// Jump pads launch automatically when the player lands on their top face.
export const jumpPads = [
  { x: 680, y: 938, width: 60, height: 12, color: '#65e5de', launchForce: 1200 },
  { x: 1640, y: 558, width: 60, height: 12, color: '#65e5de', launchForce: 1000 },
  { x: 3040, y: 938, width: 60, height: 12, color: '#65e5de', launchForce: 1050 }
];

// Two stomps explode a barrel; one stomp breaks a crate.
export const explosiveBarrels = [
  { x: 560, y: 914, width: 28, height: 36, health: 2, isExploded: false },
  { x: 1340, y: 534, width: 28, height: 36, health: 2, isExploded: false },
  { x: 2890, y: 674, width: 28, height: 36, health: 2, isExploded: false }
];
export const supplyCrates = [
  { x: 390, y: 918, width: 32, height: 32, isBroken: false },
  { x: 1860, y: 538, width: 32, height: 32, isBroken: false },
  { x: 2570, y: 798, width: 32, height: 32, isBroken: false }
];

export function resetMap() {
  for (const barrel of explosiveBarrels) {
    barrel.health = 2;
    barrel.isExploded = false;
  }
  for (const crate of supplyCrates) crate.isBroken = false;
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawEnvironment(ctx) {
  // A faint coordinate grid makes the world dimensions readable during traversal.
  for (let x = 0; x <= world.width; x += 100) line(ctx, x, 0, x, 950, '#213239', 1);
  for (let y = 0; y < 950; y += 100) line(ctx, 0, y, world.width, y, '#213239', 1);

  // Decorative trees sit behind the outpost's collision rectangles.
  for (let x = 350; x < 800; x += 170) {
    ctx.fillStyle = '#293f3c';
    ctx.fillRect(x, 540, 18, 410);
    for (let y = 400; y < 710; y += 95) {
      ctx.beginPath();
      ctx.moveTo(x + 9, y);
      ctx.lineTo(x - 75, y + 160);
      ctx.lineTo(x + 90, y + 160);
      ctx.fill();
    }
  }

  // Suspension cables and trusses are background art; only the red deck is solid.
  for (let x = 930; x <= 2250; x += 1320) {
    ctx.fillStyle = '#663c38';
    ctx.fillRect(x, 180, 22, 390);
  }
  for (let x = 940; x < 2260; x += 55) {
    // A parabola makes the suspension cable sag toward the bridge center.
    const cableY = 200 + 230 * (1 - Math.pow((x - 1600) / 660, 2));
    const nextY = 200 + 230 * (1 - Math.pow((x + 55 - 1600) / 660, 2));
    line(ctx, x, cableY, x + 55, nextY, '#b06554', 3);
    line(ctx, x, cableY, x, 570, '#694a43', 2);
  }
  for (let x = 800; x < 2400; x += 100) {
    line(ctx, x, 614, x + 50, 660, '#743e37', 3);
    line(ctx, x + 50, 660, x + 100, 614, '#743e37', 3);
    line(ctx, x, 660, x + 100, 660, '#743e37', 3);
  }

  // Warehouse panels and columns suggest an interior without invisible walls.
  ctx.fillStyle = '#202e36';
  ctx.fillRect(2400, 150, 800, 800);
  for (let x = 2410; x < 3200; x += 160) {
    ctx.fillStyle = '#2e414b';
    ctx.fillRect(x, 150, 9, 800);
    for (let y = 180; y < 900; y += 120) {
      ctx.fillStyle = '#3b4c50';
      ctx.fillRect(x + 35, y, 80, 35);
    }
  }
  ctx.font = 'bold 32px monospace';
  ctx.fillStyle = '#425651';
  ctx.fillText('01 / OUTPOST', 300, 250);
  ctx.fillText('02—03 / IRON CROSSING', 1180, 150);
  ctx.fillText('04 / WAREHOUSE', 2470, 120);
  ctx.font = '14px monospace';
  ctx.fillStyle = '#697c79';
  ctx.fillText('UNDERPASS →', 1500, 910);
}

function drawPlatform(ctx, camera, platform) {
  // Cull rectangles outside the camera AABB.
  if (platform.x + platform.width < camera.x || platform.x > camera.x + camera.width ||
      platform.y + platform.height < camera.y || platform.y > camera.y + camera.height) return;
  ctx.fillStyle = platform.color;
  ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  ctx.fillStyle = '#ffffff30';
  ctx.fillRect(platform.x, platform.y, platform.width, 3);
  if (platform.type === 'one-way') {
    // Dashed undersides identify floors that allow jumps and drops through them.
    for (let x = platform.x + 6; x < platform.x + platform.width - 6; x += 18) {
      ctx.fillStyle = '#172329';
      ctx.fillRect(x, platform.y + 6, 9, 3);
    }
  } else {
    // Concrete seams and bolts make solid platforms visually distinct.
    for (let x = platform.x + 14; x < platform.x + platform.width; x += 70) {
      ctx.fillStyle = '#17232955';
      ctx.fillRect(x, platform.y + 10, 4, 4);
    }
    if (platform.height > 100) {
      for (let y = platform.y + 50; y < platform.y + platform.height; y += 65) {
        line(ctx, platform.x, y, platform.x + platform.width, y, '#34443f', 1);
      }
    }
  }
}

// Each renderer owns its camera transform so callers cannot translate twice.
export function drawMap(ctx, camera) {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  drawEnvironment(ctx);
  for (const platform of platforms) drawPlatform(ctx, camera, platform);
  for (const pad of jumpPads) {
    ctx.fillStyle = pad.color;
    ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
    ctx.fillStyle = '#142d32';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('↑ ↑ ↑', pad.x + 9, pad.y + 10);
  }
  for (const barrel of explosiveBarrels) {
    if (barrel.isExploded) continue;
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
    if (crate.isBroken) continue;
    ctx.fillStyle = '#b59662';
    ctx.fillRect(crate.x, crate.y, crate.width, crate.height);
    ctx.strokeStyle = '#655239';
    ctx.strokeRect(crate.x + 3, crate.y + 3, crate.width - 6, crate.height - 6);
    line(ctx, crate.x + 3, crate.y + 3, crate.x + 29, crate.y + 29, '#655239', 3);
    line(ctx, crate.x + 29, crate.y + 3, crate.x + 3, crate.y + 29, '#655239', 3);
  }
  ctx.restore();
}
