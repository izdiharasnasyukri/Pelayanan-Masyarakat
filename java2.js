const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("konfirmasi");
const passwordHint = document.getElementById("passwordHint");
const confirmHint = document.getElementById("confirmHint");
const strengthBars = document.querySelectorAll(".strength-bars span");

// Tombol mata untuk melihat kata sandi
document.querySelectorAll(".toggle-password").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);

    input.type = input.type === "password" ? "text" : "password";
  });
});

// Indikator kekuatan kata sandi
passwordInput.addEventListener("input", () => {
  const value = passwordInput.value;
  let score = 0;

  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const labels = [
    "Minimal 8 karakter.",
    "Kata sandi lemah.",
    "Kata sandi cukup kuat.",
    "Kata sandi kuat.",
    "Kata sandi sangat kuat."
  ];

  passwordHint.textContent = labels[score];

  const colors = ["#dedede", "#dc3545", "#ffc107",
                  "#198754", "#0d6efd"];

  strengthBars.forEach((bar, index) => {
    bar.style.background =
      index < score ? colors[score] : "#dedede";
  });

  cekKonfirmasi();
});

// Memeriksa apakah kedua kata sandi sama
function cekKonfirmasi() {
  if (!confirmInput.value) {
    confirmHint.textContent = "";
    confirmHint.style.color = "#888";
    return false;
  }

  const sama = passwordInput.value === confirmInput.value;

  confirmHint.textContent = sama
    ? "Kata sandi sudah cocok."
    : "Kata sandi belum sama.";

  confirmHint.style.color = sama ? "#198754" : "#dc3545";

  return sama;
}

confirmInput.addEventListener("input", cekKonfirmasi);