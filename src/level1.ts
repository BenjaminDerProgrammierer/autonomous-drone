import { solveLevel } from './helpers.js';

function calculateFinalHeight(velocities: number[]): number {
  let height = 0;
  for (const velocity of velocities) {
    height += velocity;
  }
  return height;
}

function solveLevel1(inputLines: string[]): string[] {
  const n = Number.parseInt(inputLines[0]);
  const results: string[] = [];
  
  for (let i = 1; i <= n; i++) {
    const velocities = inputLines[i].split(' ').map(Number);
    const finalHeight = calculateFinalHeight(velocities);
    results.push(finalHeight.toString());
  }
  
  return results;
}

solveLevel(1, (inputLines: string[]) => solveLevel1(inputLines));
