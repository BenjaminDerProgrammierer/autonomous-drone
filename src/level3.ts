import { solveLevel } from './helpers.js';

function doDrohne(targetHeight: number, timeLimit: number): number[] {
  const GRAVITY = 10;
  const MAX_ACCELERATION = 20;
  const MIN_ACCELERATION = 0;
  const accelerations: number[] = [];

  let velocity = 0;
  let height = 0;

  console.log("Phase 1: Reach target height, then decelerate to zero velocity");

  while (height < Math.max(targetHeight, 10) && timeLimit > 0) {
    const heightAfterOneTickWhenFullAcceleration = height + velocity + MAX_ACCELERATION - GRAVITY;

    let acceleration: number;

    if (height < heightAfterOneTickWhenFullAcceleration) {
      acceleration = MAX_ACCELERATION;
    } else {
      acceleration = 0;
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
    console.log(`Time left: ${timeLimit}, Height: ${height}, Velocity: ${velocity}, Acceleration: ${acceleration}`);
  }

  // Do not accelerate, so we come to a stop at another height.
  while (velocity > 0 && timeLimit > 0) {
    const acceleration = 0;

    velocity += acceleration - GRAVITY;
    height += velocity;
    timeLimit--;
    accelerations.push(acceleration);
    console.log(`Time left: ${timeLimit}, Height: ${height}, Velocity: ${velocity}, Acceleration: ${acceleration}`);
  }

  console.log(`--- Height: ${height}, Target Height: ${targetHeight}, Velocity: ${velocity}/0 ---`);
  console.log();
  console.log("Phase 2: Land gently");

  let breaking = false;
  while (height > 0 && timeLimit > 0) {
    let acceleration: number;

    // Keep velocity at -10
    if (velocity <= -10) {
      acceleration = 10;
    } else {
      acceleration = 0;
    }

    // If we are close to the ground, start breaking
    if (height <= 30 && !breaking) {
      breaking = true;
      console.log('Starting breaking maneuver');
    }

    if (breaking) {
      acceleration = calculateTargetBreakingVelocity(height, velocity) - velocity + GRAVITY;
      // if height is 1, and velocity is 0, we need to set the acceleration to 9 to finally land.
      if (height === 1 && velocity === 0) {
        acceleration = 9;
      }
    }

    if (acceleration > MAX_ACCELERATION) {
      console.error('Acceleration exceeds maximum limit', acceleration);
      console.log(`Current height: ${height}, velocity: ${velocity}`);
      process.exit(1);
    } else if (acceleration < MIN_ACCELERATION) {
      console.error('Acceleration below minimum limit: ', acceleration);
      console.log(`Current height: ${height}, velocity: ${velocity}`);
      process.exit(1);
    }

    velocity += acceleration - GRAVITY;
    height += velocity;
    timeLimit--;
    accelerations.push(acceleration);

    console.log(`Time left: ${timeLimit}, Height: ${height}, Velocity: ${velocity}, Acceleration: ${acceleration}, Net Force: ${acceleration - GRAVITY}`);
  }

  console.log(`--- Final Height: ${height}, Target Height: ${targetHeight}, Final Velocity: ${velocity} ---`);
  if (height <= 0) {
    console.log('Landed!');
    if (velocity < -1) {
      console.log('Crash landing!');
      process.exit(1);
    }
  } else {
    console.log('Out of time!');
    process.exit(1);
  }
  return accelerations;
}

function calculateTargetBreakingVelocity(height: number, velocity: number): number {
  // Use linear interpolation to determine target breaking velocity

  const x0 = 0;    // Height at ground level
  const x1 = 30;   // Height at which we start breaking
  const y0 = 0;    // Target velocity at ground level
  const y1 = -10;  // Target velocity at breaking start height

  const x = height;
  
  // Linear interpolation formula rearranged to solve for y
  const y = (y0 * (x1 - x) + y1 * (x - x0)) / (x1 - x0);

  return Math.round(y);
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
