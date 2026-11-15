import { world, platforms, jumpPads, explosiveBarrels, supplyCrates } from './map.js';
import { spawnExplosion } from './particles.js';

const physics = { acceleration: 2200, friction: 2600, speed: 290, gravity: 1800, jumpSpeed: 740 };

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

// AABB overlap uses strict edges so touching a floor is not penetration.
function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
    a.y < b.y + b.height && a.y + a.height > b.y;
}

// Compare the old feet position with the new feet position to detect a landing.
function landedOn(player, object, previousBottom) {
  return player.vy > 0 && previousBottom <= object.y + 0.01 &&
    player.y + player.height >= object.y &&
    player.x < object.x + object.width && player.x + player.width > object.x;
}

function bounce(player, object) {
  // A short vertical hop and reversed momentum give a small bounce-back response.
  player.y = object.y - player.height;
  player.vy = -260;
  player.vx = -player.vx * 0.35;
  player.standingOn = null;
}

export function updatePlayer(player, input, dt) {
  let direction = 0;
  if (input.KeyA || input.ArrowLeft) direction -= 1;
  if (input.KeyD || input.ArrowRight) direction += 1;

  // Accelerate while moving; friction stops the player without reversing them.
  if (direction !== 0) {
    player.vx += direction * physics.acceleration * dt;
    player.vx = clamp(player.vx, -physics.speed, physics.speed);
  } else {
    const slowdown = physics.friction * dt;
    if (player.vx > 0) player.vx = Math.max(0, player.vx - slowdown);
    if (player.vx < 0) player.vx = Math.min(0, player.vx + slowdown);
  }

  // Ignore only the current thin platform until the player's top clears it.
  if (input.dropRequested && player.standingOn && player.standingOn.type === 'one-way') {
    player.ignoredPlatform = player.standingOn;
    player.standingOn = null;
    player.vy = 80;
  } else if (input.jumpRequested && player.standingOn) {
    player.vy = -physics.jumpSpeed;
    player.standingOn = null;
  }
  input.jumpRequested = false;
  input.dropRequested = false;

  // Resolve horizontal solid collisions before moving vertically.
  player.x += player.vx * dt;
  for (const platform of platforms) {
    if (platform.type !== 'solid' || !overlaps(player, platform)) continue;
    if (player.vx > 0) player.x = platform.x - player.width;
    if (player.vx < 0) player.x = platform.x + platform.width;
    player.vx = 0;
  }
  const boundedX = clamp(player.x, 0, world.width - player.width);
  if (boundedX !== player.x) player.vx = 0;
  player.x = boundedX;

  // Apply gravity using seconds; a small fixed step prevents thin-floor tunneling.
  const previousBottom = player.y + player.height;
  player.vy += physics.gravity * dt;
  player.y += player.vy * dt;
  player.standingOn = null;

  // Only downward top crossings trigger terrain, never side or underside touches.
  for (const pad of jumpPads) {
    if (!landedOn(player, pad, previousBottom)) continue;
    player.y = pad.y - player.height;
    player.vy = -pad.launchForce;
  }
  for (const barrel of explosiveBarrels) {
    if (barrel.isExploded || !landedOn(player, barrel, previousBottom)) continue;
    bounce(player, barrel);
    barrel.health -= 1;
    if (barrel.health <= 0) {
      barrel.isExploded = true;
      spawnExplosion(barrel.x + barrel.width / 2, barrel.y + barrel.height / 2, '#ff9562');
    }
  }
  for (const crate of supplyCrates) {
    if (crate.isBroken || !landedOn(player, crate, previousBottom)) continue;
    bounce(player, crate);
    crate.isBroken = true;
    spawnExplosion(crate.x + crate.width / 2, crate.y + crate.height / 2, '#c9aa72');
  }

  // One-way floors catch downward crossings from above, never upward jumps.
  for (const platform of platforms) {
    if (platform === player.ignoredPlatform) continue;
    if (!overlaps(player, platform)) continue;
    if (platform.type === 'one-way') {
      if (player.vy < 0 || previousBottom > platform.y + 0.01) continue;
    }
    if (player.vy > 0) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.standingOn = platform;
    } else if (player.vy < 0 && platform.type === 'solid') {
      player.y = platform.y + platform.height;
      player.vy = 0;
    }
  }

  // Keep the character inside the world and re-enable the cleared drop platform.
  if (player.y < 0) { player.y = 0; player.vy = 0; }
  player.y = Math.min(player.y, world.height - player.height);
  if (player.ignoredPlatform && player.y >= player.ignoredPlatform.y + player.ignoredPlatform.height) {
    player.ignoredPlatform = null;
  }
}

export function updateCamera(camera, player, dt) {
  // Center on the player's AABB, then constrain the camera AABB to the world.
  const targetX = clamp(player.x + player.width / 2 - camera.width / 2, 0, world.width - camera.width);
  const targetY = clamp(player.y + player.height / 2 - camera.height / 2, 0, world.height - camera.height);
  // Exponential smoothing gives the same tracking feel at any display frame rate.
  const smoothing = 1 - Math.exp(-8 * dt);
  camera.x = clamp(camera.x + (targetX - camera.x) * smoothing, 0, world.width - camera.width);
  camera.y = clamp(camera.y + (targetY - camera.y) * smoothing, 0, world.height - camera.height);
}

