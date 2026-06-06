import { spawn, spawnSync } from 'node:child_process';
import { access, mkdir, readFile, rm, symlink } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(fileURLToPath(new URL('..', import.meta.url)));
const n8nUserFolder = join(homedir(), '.n8n-node-cli');
const runnerDir = join(n8nUserFolder, 'runner');
const n8nBin = join(runnerDir, 'node_modules', 'n8n', 'bin', 'n8n');
const communityNodeModules = join(n8nUserFolder, '.n8n', 'nodes', 'node_modules');
const legacyCustomLink = join(n8nUserFolder, '.n8n', 'custom', 'node_modules');

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor !== 22) {
	console.error(
		`n8n 2.23 requires Node 22 LTS. Current: ${process.versions.node}.`,
	);
	console.error('Use nvm/fnm: nvm install 22 && nvm use 22');
	process.exit(1);
}

try {
	await access(n8nBin);
} catch {
	console.error('n8n dev runner is not installed yet.');
	console.error('Run once: pnpm run setup:n8n');
	process.exit(1);
}

const pkg = JSON.parse(await readFile(join(projectRoot, 'package.json'), 'utf8'));
const packageName = pkg.name;
const linkPath = join(communityNodeModules, packageName);

await mkdir(communityNodeModules, { recursive: true });
await rm(linkPath, { recursive: true, force: true });
await rm(join(legacyCustomLink, packageName), { recursive: true, force: true });
await symlink(projectRoot, linkPath);

console.log('Building dist + copying icons...');
const build = spawnSync('pnpm', ['exec', 'n8n-node', 'build'], {
	cwd: projectRoot,
	stdio: 'inherit',
	env: process.env,
	shell: process.platform === 'win32',
});
if (build.status !== 0) {
	process.exit(build.status ?? 1);
}

const env = {
	...process.env,
	N8N_DEV_RELOAD: 'true',
	DB_SQLITE_POOL_SIZE: '10',
	N8N_USER_FOLDER: n8nUserFolder,
};

const children = [];

function run(label, command, args, options = {}) {
	const child = spawn(command, args, {
		cwd: options.cwd ?? projectRoot,
		env,
		stdio: 'inherit',
		shell: process.platform === 'win32',
	});
	children.push(child);
	child.on('exit', (code, signal) => {
		if (!shuttingDown && code !== 0 && code !== null) {
			console.error(`[${label}] exited with code ${code}`);
			shutdown(code ?? 1);
			return;
		}
		if (shuttingDown && children.every((c) => c.killed || c.exitCode !== null)) {
			process.exit(exitCode);
		}
	});
	return child;
}

let shuttingDown = false;
let exitCode = 0;
let forceKillTimer;

function shutdown(code = 0, force = false) {
	if (shuttingDown && !force) {
		shutdown(code, true);
		return;
	}
	shuttingDown = true;
	exitCode = code;

	for (const child of children) {
		if (child.killed || child.exitCode !== null) {
			continue;
		}
		child.kill(force ? 'SIGKILL' : 'SIGINT');
	}

	if (force) {
		process.exit(code);
		return;
	}

	if (children.every((c) => c.killed || c.exitCode !== null)) {
		process.exit(code);
		return;
	}

	forceKillTimer = setTimeout(() => {
		console.error('n8n shutdown is taking too long; force-quitting.');
		shutdown(code, true);
	}, 15_000);
	forceKillTimer.unref();
}

process.on('SIGINT', () => shutdown(130));
process.on('SIGTERM', () => shutdown(0));

console.log(`Linked ${packageName} -> ${linkPath}`);
console.log('Starting TypeScript watch + n8n.');
console.log('In the node panel, search for "Unabyss" (not the npm package name).');
console.log('After icon-only edits, run: pnpm run build');
console.log('Wait for: "Editor is now accessible via: http://localhost:5678"\n');

run('tsc', 'pnpm', ['exec', 'tsc', '--watch', '--pretty']);
run('n8n', 'node', [n8nBin], { cwd: runnerDir });
