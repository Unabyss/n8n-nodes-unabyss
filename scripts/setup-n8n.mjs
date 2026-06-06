import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

const n8nVersion = '2.23.1';
const runnerDir = join(homedir(), '.n8n-node-cli', 'runner');

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor !== 22) {
	console.error(
		`n8n 2.23 requires Node 22 LTS. Current: ${process.versions.node}.`,
	);
	console.error('Install: brew install node@22');
	console.error('Then: export PATH="/opt/homebrew/opt/node@22/bin:$PATH"');
	console.error('Or use nvm: nvm install 22 && nvm use 22');
	process.exit(1);
}

await mkdir(runnerDir, { recursive: true });

const packageJson = {
	name: 'n8n-dev-runner',
	private: true,
	version: '1.0.0',
	dependencies: {
		n8n: n8nVersion,
	},
};

await writeFile(join(runnerDir, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);

console.log(`Installing n8n@${n8nVersion} in ${runnerDir}`);
console.log('One-time download. npm zod peer warnings are harmless.\n');

const result = spawnSync('npm', ['install'], {
	cwd: runnerDir,
	stdio: 'inherit',
	env: process.env,
});

if (result.status !== 0) {
	process.exit(result.status ?? 1);
}

console.log('\nn8n dev runner is ready. Run: pnpm run dev');
