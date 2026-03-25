# Dependency Necromancer

AI diagnoses failed installs/builds and outputs concrete recovery commands.

## What it does

Dependency Necromancer lets you paste a failed command plus its terminal log and get:
- likely root cause
- fastest safe fix
- copy-paste recovery commands
- fallback plan if the first fix fails

It uses an OpenRouter free model and renders the answer as readable markdown in the UI.

## How to Run (from zero)

1. Prerequisites
   - Node.js 20+
   - npm
   - OpenRouter API key
2. `git clone https://github.com/sundaiclaw/dependency-necromancer.git`
3. `cd dependency-necromancer`
4. `npm install`
5. Run:
   - `OPENROUTER_API_KEY=your_key OPENROUTER_BASE_URL=https://openrouter.ai/api/v1 OPENROUTER_MODEL=google/gemma-3-27b-it:free npm start`
6. Open `http://localhost:8080`

## Limitations / known gaps

- No saved diagnosis history yet
- No file upload yet; logs are pasted manually
- Advice quality depends on the pasted log and env hints


Build on Sundai Club on March 25, 2026  
Sundai Project: https://www.sundai.club/projects/508e1851-018c-48aa-a384-657ab05e85f6
