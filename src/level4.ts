import { solveLevel } from './helpers.js';

type FlightVector = [number, number];

function doDrohne(targetX: number, minHeight: number, timeLimit: number): FlightVector[] {
  const GRAVITY = 10;
  const MAX_ACCELERATION = 20;
  const MIN_ACCELERATION = 0;

  const accelerations: FlightVector[] = [];

  let velocityY = 0;
  let velocityX = 0;
  let posY = 0;
  let posX = 0;
  let phase = 0;

  let maxHeightReached = 0;

  while (timeLimit > 0 && (posY > 0 || phase < 4)) {

    // Calculate acceleration, depending on phase
    let accelerationY: number;
    let accelerationX: number;
    switch (phase) {
      case 0:
        // Make sure comment is only printed once with phase change + continue
        console.log("Phase 1: Reach target height");
        phase = 1;
        continue;
      case 1:
        accelerationY = MAX_ACCELERATION;
        accelerationX = 0;
        if (posY >= minHeight) {
          console.log(`--- Height: ${posY}/${minHeight}, Velocity: ${velocityY} ---`);
          console.log("Phase 2: Decelerate to zero velocity");
          phase = 2;
          continue;
        }
        break;
      case 2:
        accelerationY = 0;
        accelerationX = 0;
        if (velocityY <= 0) {
          console.log(`--- Height: ${posY}/${minHeight}, Velocity: ${velocityY}/0 ---`);
          console.log("Phase 3: Move near target X position");
          phase = 3;
          continue;
        }
        break;
      case 3:
        accelerationY = GRAVITY; // hover

        // Move horizontally towards targetX at 10 velocity
        if (posX < targetX) {
          accelerationX = 10 - velocityX;
        } else {
          accelerationX = -10 - velocityX;
        }

        // if in target area (10 units), use precise control to reach targetX with 0 velocity
        if (Math.abs(posX - targetX) <= 10) {
          console.log(`--- X Position: ${posX}/${targetX}, X Velocity: ${velocityX}/0 ---`);
          console.log("Phase 4: Decelerate to target X position");
          phase = 4;
          continue;
        }
        break;
      case 4: {
        accelerationY = GRAVITY; // hover
        // Use linear interpolation to determine target velocity
        // x0, x1: position range (targetX-10/+10 to targetX)
        // y0, y1: target velocity range (velocity at starting postion of deceleration (-10/10) to 0 at targetX)
        // x: current position
        // y: target velocity at current position
        // Round to nearest integer

        // find out if near target at left or right
        const isLeft = posX < targetX;

        let x0: number, x1: number, y0: number, y1: number;
        if (isLeft) {
          x0 = targetX - 10;
          x1 = targetX;
          y0 = 10;
          y1 = 0;
        } else {
          x0 = targetX + 10;
          x1 = targetX;
          y0 = -10;
          y1 = 0;
        }
        const y = Math.round(calculateLinearInterpolation(posX, x0, x1, y0, y1));
        accelerationX = y - velocityX;

        if (velocityX === 0 && posX === targetX) {
          console.log(`--- X Position: ${posX}/${targetX}, X Velocity: ${velocityX}/0 ---`);
          console.log("Phase 5: Descend to height 30 at -10 velocity");
          phase = 5;
          continue;
        }
        break;
      }
      case 5:
        accelerationX = 0; // no horizontal movement
        if (velocityY <= -10) {
          accelerationY = 10;
        } else {
          accelerationY = 0;
        }
        if (posY <= 30) {
          console.log(`--- Height: ${posY}, Velocity: ${velocityY}/-10 ---`);
          console.log("Phase 6: Land softly");
          phase = 6;
          continue;
        }
        break;
      case 6: {
        accelerationX = 0; // no horizontal movement
        // Use linear interpolation to determine target breaking velocity
        // x0, x1: height range (ground level (0) to breaking start height (30))
        // y0, y1: target velocity range (velocity at ground level (0) to velocity at breaking start height (-10))
        // x: current height
        // y: target velocity at current height
        // Round to nearest integer
        const y = Math.round(calculateLinearInterpolation(posY, 0, 30, 0, -10));

        accelerationY = y - velocityY + GRAVITY;

        // Print ALL possible values for debugging
        console.log(`${timeLimit.toString().padStart(2)} | Position: (${posX}|${posY}), Velocity: (${velocityX}|${velocityY}), Acceleration: (${accelerationX}|${accelerationY})`);
        console.log(`--- Final Height: ${posY}, Height reached/Target Height: ${maxHeightReached}/${minHeight}, Final Velocity: (${velocityX}|${velocityY}), X Position/Target X: ${posX}/${targetX} ---`);



        if (posY === 1 && velocityY === 0) {
          console.log(`--- Height: ${posY}, Velocity: ${velocityY}/0 ---`);
          console.log("Phase 7: Last tick");
          phase = 7;
          continue;
        }
        break;
      }
      case 7:
        // Final tick, set acceleration to 9 to not hover above ground due to rounding
        accelerationY = 9;
        accelerationX = 0;
        break;
      default:
        throw new Error('Unknown phase: ' + phase);
    }

    if (accelerationX === undefined || accelerationY === undefined) {
      throw new Error('Acceleration not set in phase ' + phase);
    }

    accelerations.push([accelerationX, accelerationY]);

    // Make sure acceleration is within bounds
    if (accelerationY + accelerationX > MAX_ACCELERATION) {
      throw new Error('The drone\'s total acceleration (absolute x + y) must be below 20: ' + accelerationY + ', ' + accelerationX);
    } else if (accelerationY + accelerationX < MIN_ACCELERATION) {
      throw new Error('The drone\'s total acceleration (absolute x + y) must be above 0: ' + accelerationY + ', ' + accelerationX);
    } else if (accelerationY < 0) {
      throw new Error('y acceleration must not be negative: ' + accelerationY);
    }

    // Update velocity and height
    velocityY += accelerationY - GRAVITY;
    posY += velocityY;

    velocityX += accelerationX;
    posX += velocityX;

    // Decrease time limit
    timeLimit--;
    maxHeightReached = Math.max(maxHeightReached, posY);

    console.log(`${timeLimit.toString().padStart(2)} | Position: (${posX}|${posY}), Velocity: (${velocityX}|${velocityY}), Acceleration: (${accelerationX}|${accelerationY})`);
  }

  console.log(`--- Final Height: ${posY}, Height reached/Target Height: ${maxHeightReached}/${minHeight}, Final Velocity: (${velocityX}|${velocityY}), X Position/Target X: ${posX}/${targetX} ---`);
  if (posY <= 0) {
    if (velocityY < -1) {
      throw new Error('Crash landing due to vertical velocity!');
    }
    if (velocityX !== 0) {
      throw new Error('Crash landing due to horizontal velocity!');
    }
    if (maxHeightReached < minHeight) {
      throw new Error('Did not reach target height!');
    }
    if (posX != targetX) {
      throw new Error('Missed landing pad!');
    }
  } else {
    throw new Error('Out of time!');
  }
  console.log('Successful landing!');
  return accelerations;
}

function calculateLinearInterpolation(x: number, x0: number, x1: number, y0: number, y1: number): number {
  return (y0 * (x1 - x) + y1 * (x - x0)) / (x1 - x0);
}

function solveLevel4(inputLines: string[]): string[] {
  const n = Number.parseInt(inputLines[0]);
  const results: string[] = [];

  for (let i = 1; i < 1 + n; i++) {
    const parts = inputLines[i].split(' ').map(Number);
    const targetX = parts[0];
    const minHeight = parts[1];
    const timeLimit = parts[2];

    const accelerations = doDrohne(targetX, minHeight, timeLimit);
    results.push(accelerations.map(([ax, ay]) => `${ax},${ay}`).join(' '));
  }

  return results;
}

solveLevel(4, (inputLines: string[]) => solveLevel4(inputLines));
