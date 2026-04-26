// Loads a skill's SYSTEM_PROMPT from the extension source.
// Used by the Copilot SDK harness in scripts/run-skill.mjs and by tests.
//
// Only the three "narrative" skills are exposed today because they export
// SYSTEM_PROMPT. Other commands keep theirs module-private.

export const SUPPORTED_SKILLS = ['story', 'visualize', 'rescue'] as const;
export type SupportedSkill = (typeof SUPPORTED_SKILLS)[number];

export async function loadSkill(name: string): Promise<string> {
	if (!(SUPPORTED_SKILLS as readonly string[]).includes(name)) {
		throw new Error(
			`Unsupported skill "${name}". Supported: ${SUPPORTED_SKILLS.join(', ')}`,
		);
	}
	const mod = await import(`../src/commands/${name}.js`);
	if (typeof mod.SYSTEM_PROMPT !== 'string') {
		throw new Error(`Skill "${name}" does not export SYSTEM_PROMPT`);
	}
	return mod.SYSTEM_PROMPT;
}
