import test from 'node:test';
import assert from 'node:assert/strict';
import { platforms, watchTowers } from '../src/map.js';
import { updatePlayer } from '../src/physics.js';

function playerOn(platform) {
  return {
    x: platform.x, y: platform.y - 40, width: 24, height: 40,
    vx: 0, vy: 0, standingOn: platform, ignoredPlatform: null
  };
}

// Every flight must support walking in both directions, including reversals.
for (const tower of watchTowers) {
  for (let floor = 0; floor < 3; floor++) {
    for (const dt of [1 / 120, 1 / 60]) {
      test(`${tower.name}, floor ${floor + 1}, ${1 / dt} Hz: no falling between treads`, () => {
        const bottom = tower.y + tower.height - floor * 300;
        const tread = platforms.find(platform => platform.isStair &&
          platform.x >= tower.x && platform.x < tower.x + tower.width &&
          platform.y === bottom - 165);
        const player = playerOn(tread);
        const uphillRight = floor % 2 === 0;
        for (const uphill of [true, false, true]) {
          const right = uphill === uphillRight;
          for (let time = 0; time < 0.22; time += dt) {
            updatePlayer(player, { KeyD: right, KeyA: !right }, dt);
            assert.ok(player.standingOn, 'Player must remain supported while walking');
            assert.equal(player.vy, 0);
          }
        }
      });
    }
  }

  test(`${tower.name}: reach all three floors without jumping`, () => {
    const player = playerOn(platforms[0]);
    player.x = tower.x - 25;
    for (let floor = 0; floor < 3; floor++) {
      const right = floor % 2 === 0;
      for (let tick = 0; tick < 400; tick++) {
        updatePlayer(player, { KeyD: right, KeyA: !right }, 1 / 120);
        assert.ok(player.standingOn);
        if (right && player.x >= tower.x + 380) break;
        if (!right && player.x <= tower.x + 20) break;
      }
      const floorY = tower.y + tower.height - (floor + 1) * 300;
      assert.ok(player.y + player.height <= floorY);
      player.vx = 0;
    }
    assert.equal(player.y + player.height, tower.y);
  });
}

const tread = platforms.find(platform => platform.isStair && platform.y === 2185);
test('Jumping leaves the stairs instead of snapping back', () => {
  const player = playerOn(tread);
  updatePlayer(player, { jumpRequested: true }, 1 / 120);
  assert.ok(player.vy < 0);
  assert.equal(player.standingOn, null);
});
test('Intentional drop-through bypasses stair attachment', () => {
  const player = playerOn(tread);
  updatePlayer(player, { dropRequested: true }, 1 / 120);
  assert.ok(player.vy > 0);
  assert.equal(player.standingOn, null);
  assert.equal(player.ignoredPlatform, tread);
});
test('Walking beyond a tower edge still falls normally', () => {
  const tower = watchTowers[0];
  const floor = platforms.find(platform => platform.x === tower.x && platform.y === tower.y);
  const player = playerOn(floor);
  player.x = tower.x + tower.width - 2;
  for (let i = 0; i < 40; i++) updatePlayer(player, { KeyD: true }, 1 / 120);
  assert.equal(player.standingOn, null);
  assert.ok(player.vy > 0);
});
