// Minimal vscode mock — provides only the symbols used by the command files
// so that Jest can import the system prompts without a running VS Code instance.
const vscode = {
  chat: { createChatParticipant: jest.fn() },
  lm: { selectChatModels: jest.fn() },
  LanguageModelChatMessage: {
    User: (text: string) => ({ role: 'user', content: text }),
  },
  LanguageModelError: class LanguageModelError extends Error {
    code = '';
  },
  Uri: { joinPath: jest.fn() },
};

module.exports = vscode;
