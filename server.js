import express from 'express';
import { marked } from 'marked';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 8080;
const BASE = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-3-27b-it:free';

const page = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dependency Necromancer</title>
  <style>
    :root { color-scheme: dark; }
    body { margin:0; font-family: Inter, system-ui, sans-serif; background: linear-gradient(180deg,#12071f,#020617 72%); color:#e2e8f0; }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 28px 18px 60px; }
    h1 { margin: 0 0 10px; font-size: clamp(2.3rem, 6vw, 4rem); }
    .lead { color:#cbd5e1; max-width: 760px; }
    .chips { display:flex; gap:8px; flex-wrap:wrap; margin: 0 0 12px; }
    .chip { background:#0f172a; border:1px solid #334155; color:#f0abfc; padding:6px 10px; border-radius:999px; font-size:.85rem; }
    .grid { display:grid; grid-template-columns: 1.2fr .8fr; gap:18px; }
    .card { background: rgba(15,23,42,.88); border:1px solid rgba(148,163,184,.22); border-radius:18px; padding:18px; box-shadow:0 18px 40px rgba(0,0,0,.25); }
    textarea,input { width:100%; box-sizing:border-box; border-radius:14px; border:1px solid #334155; background:#020617; color:#e2e8f0; padding:14px; }
    textarea { min-height: 170px; resize: vertical; }
    input { margin-top:10px; }
    button { margin-top:12px; border:0; border-radius:12px; padding:12px 16px; font-weight:800; background:#f472b6; color:#500724; cursor:pointer; }
    #status { min-height:24px; color:#f9a8d4; }
    #output { line-height:1.6; }
    #output h1,#output h2,#output h3 { color:#f5d0fe; }
    #output code { background:#0f172a; padding:2px 6px; border-radius:6px; }
    #output pre { background:#020617; padding:14px; border-radius:12px; overflow:auto; }
    @media (max-width: 820px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="chips">
      <span class="chip">Install log diagnosis</span>
      <span class="chip">Copy-paste fix commands</span>
      <span class="chip">OpenRouter free model</span>
    </div>
    <h1>Dependency Necromancer</h1>
    <p class="lead">Paste a failed install or build log. Get the likely root cause, the fastest safe recovery commands, and what to try next if the first fix doesn't work.</p>
    <section class="grid">
      <div class="card">
        <label>Failed command</label>
        <input id="command" placeholder="Example: cargo build --release -p fabro-cli" />
        <label style="display:block; margin-top:10px;">Error log</label>
        <textarea id="log" placeholder="Paste the terminal output here..."></textarea>
        <label>Environment hints</label>
        <input id="envhint" placeholder="Example: Debian 12, Node 20, no sudo, x86_64 Linux" />
        <button onclick="raiseTheDead()">Diagnose failure</button>
        <p id="status"></p>
      </div>
      <div class="card">
        <h3>What you get</h3>
        <ul>
          <li>root-cause hypothesis</li>
          <li>copy-paste recovery commands</li>
          <li>what not to do</li>
          <li>fallback plan if the first fix fails</li>
        </ul>
        <p>Useful for broken npm, cargo, Python, system package, and CI installs.</p>
      </div>
    </section>
    <section class="card" style="margin-top:18px;">
      <h3>Recovery plan</h3>
      <div id="output">Your AI-generated recovery plan will appear here.</div>
    </section>
  </div>
  <script>
    async function raiseTheDead() {
      const command = document.getElementById('command').value.trim();
      const log = document.getElementById('log').value.trim();
      const envhint = document.getElementById('envhint').value.trim();
      if (!log) return;
      document.getElementById('status').textContent = 'Reading the graveyard...';
      document.getElementById('output').innerHTML = '<p>Working...</p>';
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, log, envhint })
      });
      const data = await res.json();
      if (!res.ok) {
        document.getElementById('status').textContent = 'Request failed';
        document.getElementById('output').textContent = data.error || 'Unknown error';
        return;
      }
      document.getElementById('status').textContent = 'Done with ' + data.model;
      document.getElementById('output').innerHTML = data.html;
    }
  </script>
</body>
</html>`;

app.get('/', (_req, res) => res.type('html').send(page));
app.get('/healthz', (_req, res) => res.json({ ok: true, model: MODEL }));

app.post('/api/diagnose', async (req, res) => {
  try {
    const command = (req.body?.command || '').slice(0, 800);
    const log = (req.body?.log || '').slice(0, 12000);
    const envhint = (req.body?.envhint || '').slice(0, 800);
    if (!log) return res.status(400).json({ error: 'log required' });
    if (!process.env.OPENROUTER_API_KEY) return res.status(500).json({ error: 'OPENROUTER_API_KEY missing' });

    const prompt = `You are Dependency Necromancer, a brutally practical install/build failure diagnostician.

Failed command: ${command || 'not provided'}
Environment hints: ${envhint || 'not provided'}

Error log:
${log}

Return markdown with these exact sections:
# Root Cause
# Fastest Fix
# Copy-Paste Commands
# What Not To Do
# If That Still Fails

Rules:
- Be specific to the log, not generic.
- Prefer minimal safe fixes over full reinstalls.
- Commands must be copy-paste ready.
- If the user lacks sudo/root, say so explicitly and offer a non-root fallback when possible.
- No filler intro.
`;

    const r = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dependency-necromancer.local',
        'X-Title': 'Dependency Necromancer'
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.25,
        messages: [
          { role: 'system', content: 'You diagnose dependency and build failures crisply in markdown.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data?.error?.message || 'LLM request failed', raw: data });
    const markdown = data?.choices?.[0]?.message?.content || 'No response';
    res.json({ markdown, html: marked.parse(markdown), model: MODEL });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
