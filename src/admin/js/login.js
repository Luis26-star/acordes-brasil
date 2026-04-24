const supabase = window.supabase.createClient(
  "### SUPABASE_URL ###",
  "### SUPABASE_ANON_KEY ###"
);

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const errorBox = document.getElementById("loginError");
  errorBox.textContent = "";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorBox.textContent = "Login fehlgeschlagen: " + error.message;
    return;
  }

  // Weiterleitung zum Admin-Dashboard
  window.location.href = "./admin.html";
});
