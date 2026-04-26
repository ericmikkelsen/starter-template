#!/usr/bin/env node
// Validates a PR body Markdown file against visual-pr-communication SMART goals.
// Usage: node scripts/check-pr-body.js <file>
// Exits 0 if valid, 1 if any limit is exceeded.

const MAX_LINES = 30;
const MAX_NODES = 10;

function extractMermaidBlock(body) {
	const match = body.match(/```mermaid\n([\s\S]*?)```/);
	return match ? match[1] : null;
}

function countNodes(mermaidSource) {
	// Match node declarations like A[label], B(label), C{label}, or bare identifiers
	// at the start of a line or after a connector.
	const ids = new Set();
	const tokenRe = /(?:^|[\s>|])([A-Za-z_][A-Za-z0-9_]*)(?=[\s\[({])/g;
	let m;
	while ((m = tokenRe.exec(mermaidSource)) !== null) {
		const id = m[1];
		if (id === 'graph' || id === 'LR' || id === 'TD' || id === 'TB' || id === 'RL' || id === 'BT') {
			continue;
		}
		ids.add(id);
	}
	return ids.size;
}

function validatePrBody(body) {
	const violations = [];
	const lines = body.split('\n');
	if (lines.length > MAX_LINES) {
		violations.push(
			`PR body has ${lines.length} lines; must be ≤ ${MAX_LINES} lines.`,
		);
	}
	const mermaid = extractMermaidBlock(body);
	if (!mermaid) {
		violations.push('PR body must contain a ```mermaid``` change map.');
	} else {
		const nodes = countNodes(mermaid);
		if (nodes > MAX_NODES) {
			violations.push(
				`Change map has ${nodes} nodes; must be ≤ ${MAX_NODES} nodes.`,
			);
		}
	}
	return { ok: violations.length === 0, violations };
}

module.exports = { validatePrBody };

if (require.main === module) {
	const fs = require('node:fs');
	const path = process.argv[2];
	if (!path) {
		console.error('Usage: node scripts/check-pr-body.js <file>');
		process.exit(2);
	}
	const body = fs.readFileSync(path, 'utf8');
	const result = validatePrBody(body);
	if (result.ok) {
		console.log('PR body validates against visual-pr-communication SMART goals.');
		process.exit(0);
	}
	console.error('PR body violations:');
	for (const v of result.violations) {
		console.error(`  - ${v}`);
	}
	process.exit(1);
}
