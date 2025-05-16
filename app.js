/* app.js – Moral vs Logic (+ Identisch)  -------------------------------- */

let data,
  current = 0,
  log = [];

// 1) Dilemmas laden
fetch("data/dilemmas.json")
  .then((r) => r.json())
  .then((json) => {
    data = json;
    render();
  });

// 2) KI-Antwort vom Backend holen
async function getGptAnswer(question, mode) {
  const res = await fetch("http://localhost:3001/api/dilemmas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, mode }),
  });
  const json = await res.json();
  return json.answer;
}

async function render() {
  const q = data[current].question;

  // 3) Moral- und Logic-Antwort holen
  const moral = await getGptAnswer(q, "moral");
  const logic = await getGptAnswer(q, "logic");
  const equal = moral.trim() === logic.trim();

  // 4) Option-Map aufbauen
  const options = equal
    ? { moral, logic, same: "Beide Antworten sind identisch." }
    : { moral, logic, none: "Unklar / keine Entscheidung" };

  // 5) Frage anzeigen
  document.getElementById("question").textContent = q;

  // 6) Reihenfolge mischen
  const order = Object.keys(options).sort(() => Math.random() - 0.5);

  // 7) Buttons befüllen
  const btnA = document.getElementById("optA");
  const btnB = document.getElementById("optB");
  const btnC = document.getElementById("optC"); // dritter Button

  btnA.textContent = options[order[0]];
  btnB.textContent = options[order[1]];

  btnC.hidden = order.length < 3;
  if (!btnC.hidden) {
    const txt = options[order[2]] ?? "Unklar / keine Entscheidung";
    btnC.textContent = txt;
  }
  // 8) Klick-Handler
  const buttons = [btnA, btnB, btnC].filter((b) => !b.hidden);
  buttons.forEach((btn, idx) => {
    btn.onclick = () => {
      let chosen = order[idx]; 
      if (equal && (chosen === "moral" || chosen === "logic")) {
        chosen = "same"; 
      }
      log.push({ id: current, chosen });

      document.getElementById("feedback").textContent =
        chosen === "same"
          ? "⚖️  Antworten identisch"
          : chosen === "moral"
          ? "✅ Moralische Antwort"
          : chosen === "logic"
          ? "🤖 Logische Antwort"
          : "❔ Unklare Auswahl";

      document.getElementById("nextBtn").hidden = false;
      buttons.forEach((b) => (b.disabled = true));
    };
  });

  // 9) Weiter-Button
  document.getElementById("nextBtn").onclick = () => {
    current++;
    if (current < data.length) {
      resetUI();
      render();
    } else {
      finish();
    }
  };
}

function resetUI() {
  document.getElementById("feedback").textContent = "";
  document.getElementById("nextBtn").hidden = true;

  ["optA", "optB", "optC"].forEach((id) => {
    const btn = document.getElementById(id);
    btn.disabled = false; // wieder klickbar
    btn.hidden = true; // wird erst im nächsten render ggf. eingeblendet
  });
}

async function finish() {
  // 10) Ergebnis an Server schicken
  await fetch("http://localhost:3001/api/save-result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ log, timestamp: Date.now() }),
  }).catch(console.error);

  // 11) Auswertung
  const moralCnt = log.filter(r => r.chosen === 'moral').length;
  const sameCnt  = log.filter(r => r.chosen === 'same').length;
  const noneCnt  = log.filter(r => r.chosen === 'none').length;
  const total    = log.length;

  const rows = log.map(r => {
    const txt = data[r.id].question.slice(0,60) + '…';
    const lbl =
      r.chosen === 'moral' ? 'Moralisch'
      : r.chosen === 'logic' ? 'Logisch'
      : r.chosen === 'same'  ? 'Identisch'
      : 'Unklar';
    return `<tr><td>${r.id+1}</td><td>${txt}</td><td>${lbl}</td></tr>`;
  }).join('');

  document.getElementById('app').innerHTML = `
    <h2>Danke fürs Mitmachen!</h2>
    <p>
      <strong>${moralCnt}</strong>× moralisch |
      <strong>${sameCnt}</strong>× identisch |
      <strong>${noneCnt}</strong>× unklar |
      <strong>${total}</strong> Fragen insgesamt
    </p>
    <table>
      <thead><tr><th>#</th><th>Frage</th><th>Gewählt</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <button onclick="location.reload()">Nochmal starten</button>
  `;
}