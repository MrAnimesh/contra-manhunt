// Particles use world coordinates, just like the player and platforms.
export const particles = [];

export function spawnExplosion(x, y, color) {
  for (let i = 0; i < 20; i++) {
    // Spread particles around a circle with varied speeds and lifetimes.
    const angle = Math.random() * Math.PI * 2;
    const speed = 70 + Math.random() * 180;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 100,
      life: 0.5 + Math.random() * 0.5,
      color: color
    });
  }
}

// The optional delta uses seconds; two-argument calls default to a 60 FPS step.
export function updateAndDrawParticles(ctx, camera, dt = 1 / 60) {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  // Iterate backward so removing expired particles does not skip their neighbors.
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.life -= dt;
    if (particle.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    // Gravity pulls debris downward while its remaining lifetime controls fading.
    particle.vy += 700 * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    ctx.globalAlpha = Math.min(1, particle.life * 2);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
  }
  ctx.restore();
}
