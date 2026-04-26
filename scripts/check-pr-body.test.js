// Tests for check-pr-body validator.
// Run with: node --test scripts/check-pr-body.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePrBody } = require('./check-pr-body.js');

const passingBody = `## Chapter 1: Add email column

\`\`\`mermaid
graph LR
  A[schema.ts] -->|defines| B[users.ts]
  T[users.test.ts] -->|tests| B
\`\`\`

**Before this PR:**
- Users had no email.

**After this PR:**
- Users require email.

**User-visible change:** Yes — email required.
`;

test('accepts a well-formed PR body', () => {
	const result = validatePrBody(passingBody);
	assert.equal(result.ok, true);
	assert.deepEqual(result.violations, []);
});

test('rejects a PR body exceeding 30 lines', () => {
	const longBody =
		'```mermaid\ngraph LR\n  A-->B\n```\n' + 'line\n'.repeat(40);
	const result = validatePrBody(longBody);
	assert.equal(result.ok, false);
	assert.ok(result.violations.some((v) => v.includes('30 lines')));
});

test('rejects a change map exceeding 10 nodes', () => {
	const nodes = Array.from({ length: 12 }, (_, i) => `N${i}[file${i}.ts]`).join(
		'\n  ',
	);
	const body = `## title\n\n\`\`\`mermaid\ngraph LR\n  ${nodes}\n\`\`\`\n`;
	const result = validatePrBody(body);
	assert.equal(result.ok, false);
	assert.ok(result.violations.some((v) => v.includes('10 nodes')));
});

test('rejects a PR body without a mermaid diagram', () => {
	const body = '## title\n\nSome text but no diagram.\n';
	const result = validatePrBody(body);
	assert.equal(result.ok, false);
	assert.ok(result.violations.some((v) => v.toLowerCase().includes('mermaid')));
});
