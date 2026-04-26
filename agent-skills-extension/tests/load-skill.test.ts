import { loadSkill, SUPPORTED_SKILLS } from '../scripts/load-skill';

describe('loadSkill', () => {
	it('exposes the three skills supported by the SDK harness', () => {
		expect(SUPPORTED_SKILLS).toEqual(['story', 'visualize', 'rescue']);
	});

	it('returns the SYSTEM_PROMPT for /story', async () => {
		const prompt = await loadSkill('story');
		expect(prompt).toContain('narrative branching mode');
		expect(prompt).toContain('STORY.md');
	});

	it('returns the SYSTEM_PROMPT for /visualize', async () => {
		const prompt = await loadSkill('visualize');
		expect(prompt.toLowerCase()).toContain('mermaid');
		expect(prompt.toLowerCase()).toContain('before');
	});

	it('returns the SYSTEM_PROMPT for /rescue', async () => {
		const prompt = await loadSkill('rescue');
		expect(prompt).toContain('prototype decomposition');
	});

	it('throws for unsupported skill names', async () => {
		await expect(loadSkill('nope')).rejects.toThrow(/unsupported/i);
	});
});
