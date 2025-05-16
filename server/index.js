import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors    from "cors";
import fetch   from "node-fetch";
import fs      from "fs/promises";

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Dateien & Konstanten ----------
const DILEMMAS_FILE = '../data/dilemmas.json'; // Pfad anpassen, falls nötig
const RESULTS_FILE  = './results.json';        // wird automatisch angelegt
const OLLAMA_URL    = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL  = 'llama3';                // ggf. llama3:8b o. ä.

// ---------- Dilemmas einmalig laden ----------
const dilemmas = JSON.parse(await fs.readFile(DILEMMAS_FILE, 'utf-8'));

// ---------- GET: alle Dilemmas an Frontend ----------
app.get('/api/dilemmas', (req, res) => res.json(dilemmas));

// ---------- POST: KI-Antwort (moral vs. logic) ----------
app.post('/api/dilemmas', async (req, res) => {
  const { question, mode } = req.body;

  const prompt = mode === 'logic'
    ? `Beantworte die folgende Frage wie eine rationale Maschine: Gib eine klare, kurze Entscheidung in einem Satz. Keine Einleitung, keine Erklärung. Wähle immer eine Seite, auch wenn beide Optionen schwierig sind.\n\nFrage: ${question}`
    : `Beantworte die folgende moralische Frage mit einer klaren, kurzen Entscheidung in einem Satz. Gib keine Erklärungen oder Einleitungen. Wähle immer eine Seite, auch wenn beide Optionen schwierig sind.\n\nFrage: ${question}`;

  const llamaRes = await fetch(OLLAMA_URL, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      max_tokens : 100,
      temperature: 0.9,
      stream     : false
    })
  });

  const data = await llamaRes.json();
  res.json({ answer: data.response.trim() });
});

// ---------- POST: Ergebnis speichern ----------
app.post('/api/save-result', async (req, res) => {
  try {
    const existing = JSON.parse(
      await fs.readFile(RESULTS_FILE, 'utf-8').catch(() => '[]')
    );
    existing.push(req.body);                         // { log, timestamp }
    await fs.writeFile(RESULTS_FILE, JSON.stringify(existing, null, 2));
    res.json({ ok: true });
  } catch (e) {
    console.error('Fehler beim Speichern:', e);
    res.status(500).json({ ok: false });
  }
});

// ---------- Server starten ----------
app.listen(3001, () => console.log('LLM-Proxy läuft auf http://localhost:3001'));