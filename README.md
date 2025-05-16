# 🧠 Moralisches Dilemma – KI vs. Mensch

Ein interaktives Webprojekt zum Testen, ob Nutzer moralische und logische KI-Antworten erkennen können.  
Die Anwendung stellt ethische Dilemma-Fragen und vergleicht zwei Antworten:  
👉 eine **moralisch inspirierte** und eine **logisch-effiziente**.

## 🚀 Funktionen

- Lädt zufällig moralische Dilemmata
- Holt **zwei Antworten von einer lokalen LLM-API** (z. B. Ollama mit LLaMA 3)
- Nutzer muss entscheiden: Welche Antwort ist menschlicher?
- Ergebnisse werden lokal gespeichert (`results.json`)
- Erkennt automatisch, ob beide Antworten **identisch** sind

---

## 🛠️ Setup

### 1. Voraussetzungen

- [Node.js](https://nodejs.org/) installiert
- [Ollama](https://ollama.com/) installiert (`ollama run llama3`)
- Optional: `.env` mit OpenAI-Key für alternative GPT-Nutzung

### 2. Backend starten

```bash
cd server
npm install
node index.js
```

### 3. Frontend starten

Im Hauptverzeichnis:

```bash
# mit Python 3:
python3 -m http.server 8010
# oder mit Live Server in VS Code
```

Dann öffnen: [http://localhost:8010](http://localhost:8010)

---

## 📁 Projektstruktur

```
.
├── app.js              # Hauptlogik für UI und Button-Handling
├── style.css           # Einfaches CSS
├── index.html          # Oberfläche
├── data/dilemmas.json  # Fragen (nur "question"-Felder)
├── server/
│   ├── index.js        # Express-Backend + Proxy zur LLM API
│   ├── results.json    # Speicherung der Nutzerantworten (wird ignoriert)
│   └── .env            # OpenAI-Key (optional)
```

---

## ✍️ Beispiel-Dilemma

> **Frage:**  
> Ein autonomes Auto muss entscheiden: 1 Kind überfahren oder 2 Erwachsene?

Antwort A (moralisch):  
`Das Kind – es geht um die geringere Anzahl an Opfern.`

Antwort B (logisch):  
`Die Erwachsenen – Kinder haben mehr Lebenszeit vor sich.`

---

## 📊 Ergebnisse

Antworten werden gespeichert in:

```
server/results.json
```

Format:

```json
[
  {
    "log": [{ "id": 0, "chosen": "moral" }, ...],
    "timestamp": 1747279547848
  }
]
```

---

## 🧪 Ziel

**Kann ein Mensch unterscheiden, ob eine Antwort von einer Maschine oder von einem moralisch denkenden Menschen stammt?**

---

## 📄 Lizenz

MIT – Feel free to use, adapt and improve.
