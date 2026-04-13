import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const EXPECTED_REPORT_PATH = path.join(ROOT, 'legacy', 'expected', 'report.txt');

function runScript(scriptPath: string): string {
  try {
    return execSync(`npx ts-node ${scriptPath}`, {
      cwd: ROOT,
      encoding: 'utf-8',
      timeout: 30_000,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stderr = error && typeof error === 'object' && 'stderr' in error
      ? String((error as Record<string, unknown>).stderr)
      : 'N/A';

    throw new Error(`Script failed: ${scriptPath}\nStderr: ${stderr}\n${message}`);
  }
}

describe('Golden Master Test', () => {
  let legacyOutput: string;
  let refactoredOutput: string;

  beforeAll(() => {

    if (fs.existsSync(EXPECTED_REPORT_PATH))
      legacyOutput = fs.readFileSync(EXPECTED_REPORT_PATH, 'utf-8');
    else {

      legacyOutput = runScript(path.join(ROOT, 'legacy', 'orderReportLegacy.ts'));
      fs.mkdirSync(path.dirname(EXPECTED_REPORT_PATH), { recursive: true });
      fs.writeFileSync(EXPECTED_REPORT_PATH, legacyOutput, 'utf-8');
    }

    refactoredOutput = runScript(path.join(ROOT, 'src', 'orderReport.ts'));
  });

  it('should produce output strictly identical to the legacy script', () => {

    expect(refactoredOutput).toBe(legacyOutput);
  });

});
