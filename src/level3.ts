import { solveLevel } from './helpers.js';

function doDrohne(targetHeight: number, timeLimit: number): number[] {
  const GRAVITY = 10;
  const MAX_ACCELERATION = 20;
  const MIN_ACCELERATION = 0;

  const accelerations: number[] = [];

  let velocity = 0;
  let height = 0;
  let phase = 0;

  let maxHeightReached = 0;

  while (timeLimit > 0 && (height > 0 || phase < 4)) {

    // Calculate acceleration
    let acceleration: number;
    switch (phase) {
      case 0:
        // Make sure comment is only printed once with phase change + continue
        console.log("Phase 1: Reach target height");
        phase = 1;
        continue;
      case 1:
        acceleration = MAX_ACCELERATION;
        if (height >= targetHeight) {
          console.log(`--- Height: ${height}/${targetHeight}, Velocity: ${velocity} ---`);
          console.log("Phase 2: Decelerate to zero velocity");
          phase = 2;
          continue;
        }
        break;
      case 2:
        acceleration = 0;
        if (velocity <= 0) {
          console.log(`--- Height: ${height}/${targetHeight}, Velocity: ${velocity}/0 ---`);
          console.log("Phase 3: Descend to height 30 at -10 velocity");
          phase = 3;
          continue;
        }
        break;
      case 3:
        if (velocity <= -10) {
          acceleration = 10;
        } else {
          acceleration = 0;
        }
        if (height <= 30) {
          console.log(`--- Height: ${height}, Velocity: ${velocity}/-10 ---`);
          console.log("Phase 4: Land softly");
          phase = 4;
          continue;
        }
        break;
      case 4: {
        // Use linear interpolation to determine target breaking velocity
        // x0, x1: height range (ground level (0) to breaking start height (30))
        // y0, y1: target velocity range (velocity at ground level (0) to velocity at breaking start height (-10))
        // x: current height
        // y: target velocity at current height
        // Round to nearest integer
        const y = Math.round(calculateLinearInterpolation(height, 0, 30, 0, -10));

        acceleration = y - velocity + GRAVITY;

        if (height === 1 && velocity === 0) {
          console.log(`--- Height: ${height}, Velocity: ${velocity}/0 ---`);
          console.log("Phase 5: Last tick");
          phase = 5;
          continue;
        }
        break;
      }
      case 5:
        // Final tick, set acceleration to 9 to not hover above ground due to rounding
        acceleration = 9;
        break;
      default:
        console.error('Unknown phase: ', phase);
        process.exit(1);
    }

    accelerations.push(acceleration);

    // Make sure acceleration is within bounds
    if (acceleration > MAX_ACCELERATION) {
      console.error('Acceleration exceeds maximum limit', acceleration);
      process.exit(1);
    } else if (acceleration < MIN_ACCELERATION) {
      console.error('Acceleration below minimum limit: ', acceleration);
      process.exit(1);
    }

    // Update velocity and height
    velocity += acceleration - GRAVITY;
    height += velocity;

    // Decrease time limit
    timeLimit--;
    maxHeightReached = Math.max(maxHeightReached, height);

    console.log(`Time left: ${timeLimit}, Height: ${height}, Velocity: ${velocity}, Acceleration: ${acceleration}`);
  }

  console.log(`--- Final Height: ${height}, Height reached/Target Height: ${maxHeightReached}/${targetHeight}, Final Velocity: ${velocity} ---`);
  if (height <= 0) {
    if (velocity < -1) {
      console.log('Crash landing!');
      process.exit(1);
    }
    if (maxHeightReached < targetHeight) {
      console.log('Did not reach target height!');
      process.exit(1);
    }
  } else {
    console.log('Out of time!');
    process.exit(1);
  }
  console.log('Successful landing!');
  return accelerations;
}

function calculateLinearInterpolation(x: number, x0: number, x1: number, y0: number, y1: number): number {
  return (y0 * (x1 - x) + y1 * (x - x0)) / (x1 - x0);
}

function solveLevel2(inputLines: string[]): string[] {
  const n = Number.parseInt(inputLines[0]);
  const timeLimit = Number.parseInt(inputLines[1]);
  const results: string[] = [];

  for (let i = 2; i < 2 + n; i++) {
    const height = Number.parseInt(inputLines[i]);
    results.push(doDrohne(height, timeLimit).join(' '));
  }

  return results;
}

solveLevel(3, (inputLines: string[]) => solveLevel2(inputLines));
