/* ============= SESSION CHECK ============= */
async function protectPage() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "./login.html";
    return;
  }

  // Rolle aus members lesen
  const email = session.user.email;

  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("email", email)
    .single();

  if (!member) {
    alert("Kein Konto gefunden.");
    await supabase.auth.signOut();
    window.location.href = "./login.html";
    return;
  }

  // Rolle anwenden
  applyRolePermissions(member.role);
}

function applyRolePermissions(role) {
  // Admin → alles
  if (role === "admin") return;

  // Vorstand → Members, Events, Finances
  if (role === "board") return;

  // Mitglieder → nur Teilnahme (gleich folgt Event-System)
  if (role === "member") {
    document.querySelector("[data-tab='finances']").style.display = "none";
    document.querySelector("[data-tab='members']").style.display = "none";
  }
}

/* Starten */
protectPage();


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
   PARTICIPAÇÃO
==================================================== */

/* Stimmen sortieren (Naipe) */
const NAIPE_ORDER = ["Soprano", "Contralto", "Tenor", "Baixo"];

/* -------------------------------
   Events laden
------------------------------- */
async function loadAttendanceEvents() {
  const sel = document.getElementById("attendanceEventSelect");
  sel.innerHTML = "<option>Wird geladen...</option>";

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("start", { ascending: true });

  sel.innerHTML = "";

  events.forEach(ev => {
    const opt = document.createElement("option");
    opt.value = ev.id;
    opt.textContent = `${formatDateDE(ev.start)} – ${ev.title}`;
    sel.appendChild(opt);
  });

  if (events.length > 0) {
    loadAttendanceMemberList(events[0].id);
    loadAttendanceMatrix(events[0].id);
  }

  sel.addEventListener("change", () => {
    loadAttendanceMemberList(sel.value);
    loadAttendanceMatrix(sel.value);
  });
}

/* -------------------------------
   Mitgliederliste laden
------------------------------- */
async function loadAttendanceMemberList(event_id) {
  const box = document.getElementById("attendanceMemberList");
  box.innerHTML = "Lade Mitglieder...";

  const { data: members } = await supabase
    .from("members")
    .select("*");

  // Nach naipe sortieren
  members.sort((a, b) => {
    return NAIPE_ORDER.indexOf(a.naipe) - NAIPE_ORDER.indexOf(b.naipe);
  });

  // Bestehende Attendance laden
  const { data: att } = await supabase
    .from("attendance")
    .select("*")
    .eq("event_id", event_id);

  box.innerHTML = "";

  members.forEach(m => {
    const record = att.find(a => a.member_id === m.id);
    const status = record ? record.status : null;

    const div = document.createElement("div");
    div.className = "attendance-member";

    const naipeClass = {
      Soprano: "naipe-soprano",
      Contralto: "naipe-contralto",
      Tenor: "naipe-tenor",
      Baixo: "naipe-baixo"
    }[m.naipe];

    div.innerHTML = `
      <div>
        <strong>${m.name}</strong>
        <span class="naipe-label ${naipeClass}">${m.naipe}</span>
      </div>

      <div class="attendance-buttons">
        <button class="btn btn-small btn-yes">Presente</button>
        <button class="btn btn-small btn-no">Ausente</button>
      </div>
    `;

    // Button Logik
    const yesBtn = div.querySelector(".btn-yes");
    const noBtn = div.querySelector(".btn-no");

    if (status === "yes") yesBtn.style.opacity = "1";
    if (status === "no") noBtn.style.opacity = "1";

    yesBtn.addEventListener("click", () =>
      saveAttendance(event_id, m.id, "yes")
    );
    noBtn.addEventListener("click", () =>
      saveAttendance(event_id, m.id, "no")
    );

    box.appendChild(div);
  });
}

/* -------------------------------
   Attendance speichern
------------------------------- */
async function saveAttendance(event_id, member_id, status) {
  // löschen & neu eintragen (upsert)
  await supabase.from("attendance")
    .delete()
    .eq("event_id", event_id)
    .eq("member_id", member_id);

  await supabase.from("attendance").insert([
    { event_id, member_id, status }
  ]);

  loadAttendanceMemberList(event_id);
  loadAttendanceMatrix(event_id);
}

/* -------------------------------
   Vorstand: Matrix
------------------------------- */
async function loadAttendanceMatrix(event_id) {
  const box = document.getElementById("attendanceMatrix");
  box.innerHTML = "Carregando...";

  const [membersRes, eventsRes, attRes] = await Promise.all([
    supabase.from("members").select("*"),
    supabase.from("events").select("*"),
    supabase.from("attendance").select("*")
  ]);

  const members = membersRes.data;
  const events = eventsRes.data;
  const att = attRes.data;

  // Sortierung
  members.sort((a, b) =>
    NAIPE_ORDER.indexOf(a.naipe) - NAIPE_ORDER.indexOf(b.naipe)
  );
  events.sort((a, b) =>
    new Date(a.start) - new Date(b.start)
  );

  const colCount = events.length + 1;
  box.style.gridTemplateColumns = `repeat(${colCount}, 150px)`;

  box.innerHTML = "";

  // Header
  box.innerHTML += `<div class="matrix-header">Mitglied</div>`;
  events.forEach(e => {
    box.innerHTML += `<div class="matrix-header">${formatDateDE(e.start)}</div>`;
  });

  // Rows
  members.forEach(m => {
    box.innerHTML += `<div class="matrix-cell"><strong>${m.name}</strong></div>`;

    events.forEach(ev => {
      const record = att.find(a => a.event_id === ev.id && a.member_id === m.id);

      let cellClass = "matrix-cell";
      let text = "-";

      if (record?.status === "yes") {
        cellClass += " matrix-yes";
        text = "✓";
      }
      if (record?.status === "no") {
        cellClass += " matrix-no";
        text = "X";
      }

      box.innerHTML += `<div class="${cellClass}">${text}</div>`;
    });
  });
}

/* ====================================================
   Init
==================================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadMembers();
  loadEvents();
  loadFinances();
  loadAttendanceEvents();

});
