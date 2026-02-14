// Mobile-first single page quiz
const screens = Array.from(document.querySelectorAll(".screen"));
const progressBar = document.getElementById("progressBar");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const shareBtn = document.getElementById("shareBtn");

const statusText = document.getElementById("statusText");
const subtitleText = document.getElementById("subtitleText");
const confettiBox = document.getElementById("confetti");

// Correct answers (your "logic")
const correct = [
  "C", // Q1
  "D", // Q2 (Найправильніша)
  "D"  // Q3 (Бо база)
];

let idx = 0; // 0:welcome 1:q1 2:q2 3:q3 4:result
let answers = ["", "", ""];

function showScreen(nextIdx){
  idx = Math.max(0, Math.min(4, nextIdx));

  screens.forEach((s, i) => s.classList.toggle("active", i === idx));

  const progress = Math.round((Math.max(0, idx - 0) / 4) * 100);
  // welcome = 0%, result = 100%
  progressBar.style.width = `${progress}%`;

  // prevent going next if question unanswered
  if (idx >= 1 && idx <= 3) {
    highlightSelected(idx - 1);
  }

  if (idx === 4) {
    renderResult();
  }
}

function highlightSelected(qIndex){
  document.querySelectorAll(`.answer[data-q="${qIndex}"]`).forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.a === answers[qIndex]);
  });
}

function canGoNext(){
  if (idx >= 1 && idx <= 3) {
    const qIndex = idx - 1;
    return answers[qIndex] !== "";
  }
  return true;
}

function renderResult(){
  // scoring
  let score = 0;
  for (let i=0;i<3;i++){
    if (answers[i] === correct[i]) score++;
  }

  // final text (you can tweak)
  statusText.textContent = "ТВІЙ СТАТУС: ТИ МОЯ УЛЮБЛЕНА ГОСПОЖА! 👑";

  const lines = [
    "Тест пройдено на 100%. Кісель уже гріється, мівіна заварюється. Чекаю на тебе!",
    "Майже ідеально. Я все одно чекаю. Кісель — по графіку 😼",
    "Окей… це було сміливо. Але нічого — перездати можна завжди."
  ];

  if (score === 3) subtitleText.textContent = lines[0];
  else if (score === 2) subtitleText.textContent = lines[1];
  else subtitleText.textContent = lines[2];

  fireConfetti(42);
}

function fireConfetti(count){
  confettiBox.innerHTML = "";
  const hearts = ["💗","💖","💘","💝","💞","💓","💟"];

  for (let i=0;i<count;i++){
    const el = document.createElement("span");
    el.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    el.style.left = Math.random()*100 + "vw";
    el.style.animationDuration = (2.2 + Math.random()*1.6) + "s";
    el.style.animationDelay = (Math.random()*0.25) + "s";
    el.style.transform = `translateY(0) rotate(${Math.random()*120}deg)`;
    confettiBox.appendChild(el);
  }
}

// Answer click
document.addEventListener("click", (e) => {
  const a = e.target.closest(".answer");
  if (a){
    const q = Number(a.dataset.q);
    answers[q] = a.dataset.a;
    highlightSelected(q);
  }

  const nav = e.target.closest("[data-nav]");
  if (nav){
    const dir = nav.dataset.nav;
    if (dir === "back") showScreen(idx - 1);
    if (dir === "next"){
      if (!canGoNext()) {
        // tiny vibration on mobile
        if (navigator.vibrate) navigator.vibrate(35);
        return;
      }
      showScreen(idx + 1);
    }
  }
});

startBtn?.addEventListener("click", () => showScreen(1));

restartBtn?.addEventListener("click", () => {
  answers = ["","",""];
  // clear selections
  document.querySelectorAll(".answer").forEach(btn => btn.classList.remove("selected"));
  showScreen(0);
});

shareBtn?.addEventListener("click", async () => {
  const text = `${statusText.textContent}\n${subtitleText.textContent}`;
  const url = window.location.href;

  try{
    if (navigator.share){
      await navigator.share({ title: "Valentine's Survival Test", text, url });
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("Скопійовано в буфер ✨");
    }
  } catch(err){
    // user cancelled share — ignore
  }
});

// Swipe navigation (simple)
let startX = null;
window.addEventListener("touchstart", (e) => {
  startX = e.changedTouches[0].clientX;
}, {passive:true});

window.addEventListener("touchend", (e) => {
  if (startX === null) return;
  const endX = e.changedTouches[0].clientX;
  const dx = endX - startX;

  // threshold
  if (Math.abs(dx) > 70) {
    if (dx < 0) { // swipe left = next
      if (idx < 4 && canGoNext()) showScreen(idx + 1);
    } else { // swipe right = back
      if (idx > 0) showScreen(idx - 1);
    }
  }
  startX = null;
}, {passive:true});

// Start on welcome
showScreen(0);
