# Dependency Necromancer

## What it does
Paste a failed install/build command plus the terminal log. The app uses an OpenRouter free model to diagnose the likely root cause, explain what broke, produce copy-paste recovery commands, and say what to try next if the first fix fails.

## Tech stack
- Node.js
- Express
- OpenRouter free model
- Deployed on Cloud Run

## AI integration requirements
- Real user-facing LLM call via OpenRouter
- Markdown output rendered nicely in the UI
- No mocked diagnosis path

## Demo flow
1. User pastes a failed command and log
2. User optionally describes OS/runtime
3. AI returns diagnosis + recovery commands + escalation path
