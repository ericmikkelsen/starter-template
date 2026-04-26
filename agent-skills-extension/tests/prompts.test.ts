/**
 * Structural validation tests for the three Narrative Git skill system prompts.
 *
 * These tests do NOT call an LLM. They verify that each system prompt:
 *   1. Contains its required workflow sections
 *   2. Includes the human-gate instructions that prevent unsafe automated action
 *   3. References the reviewability budget so the limits stay visible
 *   4. Includes its verification checklist
 *
 * If a prompt is edited and a critical instruction is lost, one of these tests
 * will fail — making the regression visible before it ships.
 */

import { SYSTEM_PROMPT as storyPrompt } from '../src/commands/story';
import { SYSTEM_PROMPT as visualizePrompt } from '../src/commands/visualize';
import { SYSTEM_PROMPT as rescuePrompt } from '../src/commands/rescue';

// ---------------------------------------------------------------------------
// /story — narrative-branching
// ---------------------------------------------------------------------------

describe('/story system prompt', () => {
  it('opens in narrative branching mode', () => {
    expect(storyPrompt).toMatch(/narrative branching mode/i);
  });

  it('describes the STORY.md template', () => {
    expect(storyPrompt).toContain('STORY.md');
    expect(storyPrompt).toContain('Motivation');
    expect(storyPrompt).toContain('Acceptance Criteria');
  });

  it('enforces human approval gate before creating branches', () => {
    // The skill must require human sign-off before any branch is created.
    expect(storyPrompt).toMatch(/human approval|wait for.*approval|present.*human/i);
  });

  it('explains the branch naming convention', () => {
    expect(storyPrompt).toContain('story/<');
    expect(storyPrompt).toContain('chapter/<');
  });

  it('references the reviewability budget', () => {
    expect(storyPrompt).toMatch(/reviewabilit|review.config/i);
    expect(storyPrompt).toContain('300');
  });

  it('instructs horizontal slicing by concern not layer', () => {
    expect(storyPrompt).toMatch(/concern|horizontal/i);
  });

  it('contains a verification checklist', () => {
    expect(storyPrompt).toMatch(/- \[ \]/);
  });

  it('is not empty and has reasonable length for an LLM system prompt', () => {
    expect(storyPrompt.length).toBeGreaterThan(500);
    expect(storyPrompt.length).toBeLessThan(8000);
  });
});

// ---------------------------------------------------------------------------
// /visualize — visual-pr-communication
// ---------------------------------------------------------------------------

describe('/visualize system prompt', () => {
  it('opens in visual PR communication mode', () => {
    expect(visualizePrompt).toMatch(/visual PR communication mode/i);
  });

  it('describes the three-part artifact', () => {
    expect(visualizePrompt).toMatch(/change map|mermaid/i);
    expect(visualizePrompt).toMatch(/before.*after|after.*before/i);
    expect(visualizePrompt).toMatch(/user.visible/i);
  });

  it('specifies a node cap for the change map', () => {
    // Must cap at 10 nodes to prevent runaway diagrams.
    expect(visualizePrompt).toContain('10');
  });

  it('requires behavioral language in before/after narrative', () => {
    expect(visualizePrompt).toMatch(/behavioral|behavior|no file names|no function names/i);
  });

  it('outputs a complete PR description template', () => {
    expect(visualizePrompt).toMatch(/PR description/i);
    expect(visualizePrompt).toMatch(/mermaid/i);
  });

  it('includes complexity signals that flag oversized PRs', () => {
    expect(visualizePrompt).toMatch(/too large|oversized|split/i);
  });

  it('contains a verification checklist', () => {
    expect(visualizePrompt).toMatch(/- \[ \]/);
  });

  it('has reasonable length for an LLM system prompt', () => {
    expect(visualizePrompt.length).toBeGreaterThan(500);
    expect(visualizePrompt.length).toBeLessThan(8000);
  });
});

// ---------------------------------------------------------------------------
// /rescue — prototype-decomposition
// ---------------------------------------------------------------------------

describe('/rescue system prompt', () => {
  it('opens in prototype decomposition mode', () => {
    expect(rescuePrompt).toMatch(/prototype decomposition mode/i);
  });

  it('frames rescue positively — not as a failure', () => {
    expect(rescuePrompt).toMatch(/rescue|valid for discovery/i);
  });

  it('describes two phases with an explicit human gate between them', () => {
    expect(rescuePrompt).toMatch(/phase 1.*analyz|analyz.*phase 1/is);
    expect(rescuePrompt).toMatch(/phase 2.*restructur|restructur.*phase 2/is);
    // The gate must be explicit — "STOP" or "human approval" between phases.
    expect(rescuePrompt).toMatch(/STOP|human approval|DO NOT proceed/);
  });

  it('requires measuring the prototype before clustering', () => {
    expect(rescuePrompt).toMatch(/lines|files touched/i);
  });

  it('references the reviewability budget numbers', () => {
    expect(rescuePrompt).toContain('300');
    expect(rescuePrompt).toContain('5 files');
  });

  it('describes the clustering signals', () => {
    expect(rescuePrompt).toMatch(/semantic|coupling/i);
  });

  it('requires preserving the prototype branch as a fallback', () => {
    expect(rescuePrompt).toMatch(/fallback|prototype.*intact|preserve/i);
  });

  it('contains a verification checklist', () => {
    expect(rescuePrompt).toMatch(/- \[ \]/);
  });

  it('has reasonable length for an LLM system prompt', () => {
    expect(rescuePrompt.length).toBeGreaterThan(500);
    expect(rescuePrompt.length).toBeLessThan(10000);
  });
});
