import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type FileIdentifier = {
    level: number;
    fileId: number | string;
}

/**
 * Read an input file and return its contents as an array of strings
 * @param level - The level number (e.g., 1, 2, 3)
 * @param fileId - The file id (e.g., 1, 2, 3) or 'example'
 * @returns Array of strings, one per line
 */
export function readInputFile(file: FileIdentifier): string[] {
    const dataDir = path.join(__dirname, '..', 'data');
    const filename = `level${file.level}_${file.fileId}.in`;
    const filePath = path.join(dataDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').filter(line => line.length > 0);
}

/**
 * Write an array of strings to an output file
 * @param level - The level number (e.g., 1, 2, 3)
 * @param fileId - The file id (e.g., 1, 2, 3) or 'example'
 * @param lines - Array of strings to write, one per line
 */
export function writeOutputFile(file: FileIdentifier, lines: string[]): void {
    const outDir = path.join(__dirname, '..', 'data-out');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    const filename = `level${file.level}_${file.fileId}.out`;
    const filePath = path.join(outDir, filename);
    const content = lines.join('\n') + '\n';
    fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Get all input files for a given level
 * @param level - The level number (e.g., 1, 2, 3)
 * @returns Array of FileIdentifier objects for all input files matching the level pattern
 */
export function getInputFilesForLevel(level: number): FileIdentifier[] {
    const dataDir = path.join(__dirname, '..', 'data');
    const pattern = `level${level}_`;

    const files = fs.readdirSync(dataDir);

    return files
        .filter(file => file.startsWith(pattern) && file.endsWith('.in'))
        .map(file => {
            const match = new RegExp(/level(\d+)_(.+)\.in/).exec(file);
            if (!match) return null;
            const fileId = Number.isNaN(Number(match[2])) ? match[2] : Number(match[2]);
            return { level, fileId };
        })
        .filter((file): file is FileIdentifier => file !== null)
        .sort((a, b) => {
            const aId = typeof a.fileId === 'number' ? a.fileId : Infinity;
            const bId = typeof b.fileId === 'number' ? b.fileId : Infinity;
            return aId - bId;
        });
}

/**
 * Solve a specific level of the challenge
 * @param level The level number (e.g., 1, 2, 3)
 * @param processor A function to process the input lines and produce output lines
 */
export function solveLevel(level: number, processor: (inputLines: string[]) => string[]): void {
    const files = getInputFilesForLevel(level);

    for (const file of files) {
        const inputLines = readInputFile(file);
        const outputLines = processor(inputLines);
        writeOutputFile(file, outputLines);
    }

    console.log(`All files for level ${level} processed.`);
}
