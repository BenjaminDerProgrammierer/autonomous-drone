import { solveLevel } from './helpers.js';

function calculateFinalHeight(accelerations: number[]): number {
  const GRAVITY = 10;
  let height = 0;
  let velocity = 0;
  
  for (const acceleration of accelerations) {
    // Update velocity: add acceleration and subtract gravity
    velocity = velocity + acceleration - GRAVITY;
    
    // Update position based on new velocity
    height = height + velocity;
  }
  
  return height;
}

function solveLevel2(inputLines: string[]): string[] {
  const n = Number.parseInt(inputLines[0]);
  const results: string[] = [];
  
  for (let i = 1; i <= n; i++) {
    const accelerations = inputLines[i].split(' ').map(Number);
    const finalHeight = calculateFinalHeight(accelerations);
    results.push(finalHeight.toString());
  }
  
  return results;
}

solveLevel(2, (inputLines: string[]) => solveLevel2(inputLines));
