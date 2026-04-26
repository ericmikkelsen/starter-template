#!/usr/bin/env node
// Run a skill's system prompt against an input file using @github/copilot-sdk.
//
// Usage:
//   npm run skill:run -- <skill> <input-file>
//   npm run skill:run -- story tests/fixtures/story-example.md
//
// Output is written to tmp/skill-runs/<skill>-<timestamp>.md so you can
// review what the skill produces without committing it.
//
// Requires GitHub Copilot CLI auth (run `copilot auth login` once) or
// COPILOT_GITHUB_TOKEN / GH_TOKEN env vars.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

async function main() {
	const [, , skillName, inputPath] = process.argv;
	if (!skillName || !inputPath) {
		console.error('Usage: node scripts/run-skill.mjs <skill> <input-file>');
		console.error('       skill ∈ { story, visualize, rescue }');
		process.exit(2);
	}

	// Lazy-load the SDK so a missing dep does not break the test suite.
	let sdk;
	try {
		sdk = await import('@github/copilot-sdk');
	} catch (err) {
		console.error(
			'Could not load @github/copilot-sdk. Install with:\n  npm install --save-dev @github/copilot-sdk',
		);
		process.exit(1);
	}
	const { CopilotClient, approveAll } = sdk;

	const SUPPORTED = ['story', 'visualize', 'rescue'];
	if (!SUPPORTED.includes(skillName)) {
		console.error(
			`Unsupported skill "${skillName}". Supported: ${SUPPORTED.join(', ')}`,
		);
		process.exit(2);
	}
	// Load SYSTEM_PROMPT from the compiled extension code.
	const compiled = await import(`../out/commands/${skillName}.js`);
	if (typeof compiled.SYSTEM_PROMPT !== 'string') {
		throw new Error(`Compiled ${skillName} does not export SYSTEM_PROMPT`);
	}
	const systemPrompt = compiled.SYSTEM_PROMPT;

	const userMessage = await readFile(resolve(process.cwd(), inputPath), 'utf8');

	const client = new CopilotClient();
	await client.start();

	let assistantContent = '';
	try {
		const session = await client.createSession({
			model: process.env.COPILOT_MODEL ?? 'gpt-5',
			onPermissionRequest: approveAll,
			systemMessage: { mode: 'replace', content: systemPrompt },
		});

		const done = new Promise((resolveP) => {
			session.on('assistant.message', (event) => {
				assistantContent = event.data.content;
			});
			session.on('session.idle', () => resolveP());
		});

		await session.send({ prompt: userMessage });
		await done;
		await session.disconnect();
	} finally {
		await client.stop();
	}

	const outDir = resolve(repoRoot, 'tmp', 'skill-runs');
	await mkdir(outDir, { recursive: true });
	const stamp = new Date().toISOString().replace(/[:.]/g, '-');
	const outPath = resolve(outDir, `${skillName}-${stamp}.md`);

	const body = `# Skill run: /${skillName}\n\nInput: ${inputPath}\n\n## Output\n\n${assistantContent}\n`;
	await writeFile(outPath, body, 'utf8');
	console.log(outPath);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
