/* ----------------------------------------------------
   Supabase Client
---------------------------------------------------- */
const supabase = window.supabase.createClient(
  "https://ifrpcqqkyoidyfhjglhk.supabase.co,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcnBjcXFreW9pZHlmaGpnbGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzI5MzYsImV4cCI6MjA5MTkwODkzNn0.x0D5118W2nJh_vfSHgfdf3wjL8Pr4L2aNmV5QrRMRms"
);

/* ----------------------------------------------------
   Hilfsfunktionen
---------------------------------------------------- */
function formatDateDE(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("de-DE");
}

/* ----------------------------------------------------
   Tabs
---------------------------------------------------- */
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab + "Panel").classList.add("active");
  });
});

/* ====================================================
   MITGLIEDER
==================================================== */

/* Modal öffnen */
document.getElementById("openMemberModalBtn").addEventListener("click", () => {
  document.getElementById("memberModal").removeAttribute("aria-hidden");
});

/* Modal schließen */
document.querySelectorAll("[data-close='memberModal']").forEach((btn) => {
  btn.addEventListener("click", () =>
    document.getElementById("memberModal").setAttribute("aria-hidden", "true")
  );
});

/* Mitglieder laden */
async function loadMembers() {
  const body = document.getElementById("membersTableBody");
  body.innerHTML = "<tr><td colspan='6'>Laden...</td></tr>";

  const { data, error } = await supabase.from("members").select("*").order("name");

  if (error) {
    body.innerHTML = "<tr><td colspan='6'>Fehler beim Laden</td></tr>";
    return;
  }

  body.innerHTML = "";
  data.forEach((m) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${m.name}</td>
      <td>${m.email}</td>
      <td>${m.voice}</td>
      <td>${m.role}</td>
      <td>${m.status}</td>
      <td>
        <button class="btn btn-small" onclick="deleteMember('${m.id}')">Löschen</button>
      </td>
    `;
    body.appendChild(row);
  });
}

/* Mitglied speichern */
document.getElementById("saveMemberBtn").addEventListener("click", async () => {
  const name = document.getElementById("memberName").value;
  const email = document.getElementById("memberEmail").value;
  const voice = document.getElementById("memberVoice").value;
  const role = document.getElementById("memberRole").value;
  const status = document.getElementById("memberStatus").value;
  const sepa = document.getElementById("memberSepa").value === "true";

  await supabase.from("members").insert([
    { name, email, voice, role, status, sepa_approval: sepa },
  ]);

  document.getElementById("memberModal").setAttribute("aria-hidden", "true");
  loadMembers();
});

/* Mitglied löschen */
async function deleteMember(id) {
  await supabase.from("members").delete().eq("id", id);
  loadMembers();
}

/* ====================================================
   EVENTS
==================================================== */

document.getElementById("openEventModalBtn").addEventListener("click", () => {
  document.getElementById("eventModal").removeAttribute("aria-hidden");
});

document.querySelectorAll("[data-close='eventModal']").forEach((btn) => {
  btn.addEventListener("click", () =>
    document.getElementById("eventModal").setAttribute("aria-hidden", "true")
  );
});

/* Events laden */
async function loadEvents() {
  const body = document.getElementById("eventsTableBody");
  body.innerHTML = "<tr><td colspan='6'>Laden...</td></tr>";

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start", { ascending: true });

  if (error) {
    body.innerHTML = "<tr><td colspan='6'>Fehler beim Laden</td></tr>";
    return;
  }

  body.innerHTML = "";
  data.forEach((ev) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ev.title}</td>
      <td>${ev.type}</td>
      <td>${formatDateDE(ev.start)}</td>
      <td>${formatDateDE(ev.end)}</td>
      <td>${ev.location}</td>
      <td>
        <button class="btn btn-small" onclick="deleteEvent('${ev.id}')">Löschen</button>
      </td>
    `;
    body.appendChild(tr);
  });
}

/* Event speichern */
document.getElementById("saveEventBtn").addEventListener("click", async () => {
  const title = document.getElementById("eventTitle").value;
  const type = document.getElementById("eventType").value;
  const start = document.getElementById("eventStart").value;
  const end = document.getElementById("eventEnd").value;
  const location = document.getElementById("eventLocation").value;
  const description = document.getElementById("eventDescription").value;

  await supabase
    .from("events")
    .insert([{ title, type, start, end, location, description }]);

  document.getElementById("eventModal").setAttribute("aria-hidden", "true");
  loadEvents();
});

/* Event löschen */
async function deleteEvent(id) {
  await supabase.from("events").delete().eq("id", id);
  loadEvents();
}

/* ====================================================
   FINANZEN
==================================================== */

document.getElementById("openFinanceModalBtn").addEventListener("click", () => {
  document.getElementById("financeModal").removeAttribute("aria-hidden");
});

document.querySelectorAll("[data-close='financeModal']").forEach((btn) => {
  btn.addEventListener("click", () =>
    document.getElementById("financeModal").setAttribute("aria-hidden", "true")
  );
});

/* Finanzen laden */
async function loadFinances() {
  const body = document.getElementById("financeTableBody");
  body.innerHTML = "<tr><td colspan='8'>Laden...</td></tr>";

  const { data, error } = await supabase
    .from("finances")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    body.innerHTML = "<tr><td colspan='8'>Fehler beim Laden</td></tr>";
    return;
  }

  body.innerHTML = "";
  data.forEach((f) => {
    const sepa = f.sepa_approval ? "✓" : "–";
    const paid = f.paid ? "✓" : "–";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDateDE(f.date)}</td>
      <td>${f.person}</td>
      <td>${f.amount.toFixed(2)} €</td>
      <td>${f.type}</td>
      <td>${f.comment || ""}</td>
      <td>${sepa}</td>
      <td>${paid}</td>
      <td>
        <button class="btn btn-small" onclick="deleteFinance('${f.id}')">Löschen</button>
      </td>
    `;
    body.appendChild(tr);
  });

  updateFinanceChart(data);
}

/* Finanzeintrag speichern */
document.getElementById("saveFinanceBtn").addEventListener("click", async () => {
  const date = document.getElementById("financeDate").value;
  const person = document.getElementById("financePerson").value;
  const amount = parseFloat(document.getElementById("financeAmount").value);
  const type = document.getElementById("financeType").value;
  const comment = document.getElementById("financeComment").value;

  // Automatische paid-Logik
  const paid = type === "fee";

  // SEPA lässt sich NICHT eindeutig aus members ziehen → bleibt null oder false
  const sepa_approval = null;

  await supabase.from("finances").insert([
    { date, person, amount, type, comment, paid, sepa_approval },
  ]);

  document.getElementById("financeModal").setAttribute("aria-hidden", "true");
  loadFinances();
});

/* Finanzen löschen */
async function deleteFinance(id) {
  await supabase.from("finances").delete().eq("id", id);
  loadFinances();
}

/* Chart */
let financeChart = null;

function updateFinanceChart(entries) {
  const ctx = document.getElementById("financeChart");

  const months = {};
  entries.forEach((f) => {
    const month = f.date?.slice(0, 7);
    if (!month) return;

    if (!months[month]) months[month] = { income: 0, expense: 0, fee: 0 };

    if (f.type === "income") months[month].income += f.amount;
    if (f.type === "expense") months[month].expense += f.amount;
    if (f.type === "fee") months[month].fee += f.amount;
  });

  const labels = Object.keys(months).sort();
  const incomeData = labels.map((m) => months[m].income);
  const expenseData = labels.map((m) => months[m].expense);
  const feeData = labels.map((m) => months[m].fee);

  if (financeChart) financeChart.destroy();

  financeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Einnahmen", data: incomeData, backgroundColor: "#4caf50" },
        { label: "Ausgaben", data: expenseData, backgroundColor: "#f44336" },
        { label: "Mitgliedsbeiträge", data: feeData, backgroundColor: "#2196f3" },
      ],
    },
  });
}

/* ====================================================
   Logout
==================================================== */
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/"; 
});

/* ====================================================
   Init
==================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadMembers();
  loadEvents();
  loadFinances();
});
