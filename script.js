const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const clearLogBtn = document.getElementById("clearLogBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const taskInput = document.getElementById("taskInput");

const sessionStatus = document.getElementById("sessionStatus");
const elapsedTimeEl = document.getElementById("elapsedTime");
const distractionCountEl = document.getElementById("distractionCount");
const focusScoreEl = document.getElementById("focusScore");
const mirror = document.getElementById("mirror");
const mirrorText = document.getElementById("mirrorText");
const mirrorMood = document.getElementById("mirrorMood");
const currentTask = document.getElementById("currentTask");
const logList = document.getElementById("logList");

let sessionActive = false;
let sessionPaused = false;
let sessionStart = 0;
let elapsedMs = 0;
let timerId = null;
let distractionCount = 0;
let lastHiddenAt = null;
let currentTaskText = localStorage.getItem("distractionMirrorTask") || "";
let logEntries = JSON.parse(localStorage.getItem("distractionMirrorLog") || "[]");

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function getFocusScore() {
  const minutes = Math.max(elapsedMs / 60000, 0.5);
  const penalties = distractionCount * 12;
  const base = 100 - penalties - Math.max(0, Math.floor(minutes - 0.5) * 2);
  return Math.max(0, Math.min(100, Math.round(base)));
}

function updateMirror() {
  const score = getFocusScore();
  focusScoreEl.textContent = score;
  distractionCountEl.textContent = distractionCount;
  elapsedTimeEl.textContent = formatTime(elapsedMs);

  mirror.classList.remove("calm", "focused", "drifting", "panicked");

  if (!sessionActive && elapsedMs === 0) {
    mirror.classList.add("calm");
    mirrorText.textContent = "Start a session to begin tracking your focus.";
    mirrorMood.textContent = "Calm";
    sessionStatus.textContent = "Not started";
    return;
  }

  if (sessionPaused) {
    mirror.classList.add("calm");
    mirrorText.textContent = "Session paused. The mirror is waiting for you to continue.";
    mirrorMood.textContent = "Paused";
    sessionStatus.textContent = "Paused";
    return;
  }

  sessionStatus.textContent = "Active";

  if (score >= 80) {
    mirror.classList.add("focused");
    mirrorText.textContent = "Nice. Your attention looks steady right now.";
    mirrorMood.textContent = "Focused";
  } else if (score >= 55) {
    mirror.classList.add("drifting");
    mirrorText.textContent = "You are still going, but the mirror notices some drifting.";
    mirrorMood.textContent = "Drifting";
  } else {
    mirror.classList.add("panicked");
    mirrorText.textContent = "Your focus is slipping. Pull back in and finish this block.";
    mirrorMood.textContent = "Off track";
  }
}

function renderLog() {
  logList.innerHTML = "";

  if (logEntries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "log-entry";
    empty.textContent = "No saved sessions yet.";
    logList.appendChild(empty);
    return;
  }

  logEntries.slice().reverse().forEach((entry) => {
    const item = document.createElement("div");
    item.className = "log-entry";
    item.innerHTML = `<small>${entry.date}</small>${entry.text}`;
    logList.appendChild(item);
  });
}

function saveState() {
  localStorage.setItem("distractionMirrorTask", currentTaskText);
  localStorage.setItem("distractionMirrorLog", JSON.stringify(logEntries));
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (!sessionActive || sessionPaused) return;
    elapsedMs = Date.now() - sessionStart;
    updateMirror();
  }, 250);
}

function startSession() {
  if (!sessionActive) {
    sessionActive = true;
    sessionPaused = false;
    sessionStart = Date.now() - elapsedMs;
    startTimer();
    logEntries.push({
      date: new Date().toLocaleString(),
      text: "Session started."
    });
    saveState();
    renderLog();
  } else if (sessionPaused) {
    sessionPaused = false;
    sessionStart = Date.now() - elapsedMs;
    startTimer();
  }

  pauseBtn.disabled = false;
  pauseBtn.textContent = "Pause";
  updateMirror();
}

function pauseSession() {
  if (!sessionActive) return;

  sessionPaused = !sessionPaused;

  if (sessionPaused) {
    pauseBtn.textContent = "Resume";
    logEntries.push({
      date: new Date().toLocaleString(),
      text: "Session paused."
    });
  } else {
    sessionStart = Date.now() - elapsedMs;
    pauseBtn.textContent = "Pause";
    logEntries.push({
      date: new Date().toLocaleString(),
      text: "Session resumed."
    });
  }

  saveState();
  renderLog();
  updateMirror();
}

function resetSession() {
  sessionActive = false;
  sessionPaused = false;
  sessionStart = 0;
  elapsedMs = 0;
  distractionCount = 0;
  lastHiddenAt = null;
  clearInterval(timerId);
  timerId = null;
  pauseBtn.disabled = true;
  pauseBtn.textContent = "Pause";
  logEntries.push({
    date: new Date().toLocaleString(),
    text: "Session reset."
  });
  saveState();
  renderLog();
  updateMirror();
}

function addDistraction(reason) {
  if (!sessionActive || sessionPaused) return;
  distractionCount += 1;
  logEntries.push({
    date: new Date().toLocaleString(),
    text: `Distraction detected: ${reason}.`
  });
  saveState();
  renderLog();
  updateMirror();
}

function saveTask() {
  currentTaskText = taskInput.value.trim();
  if (!currentTaskText) return;
  currentTask.textContent = currentTaskText;
  logEntries.push({
    date: new Date().toLocaleString(),
    text: `Saved task: ${currentTaskText}.`
  });
  saveState();
  renderLog();
  taskInput.value = "";
}

startBtn.addEventListener("click", startSession);
pauseBtn.addEventListener("click", pauseSession);
resetBtn.addEventListener("click", resetSession);
clearLogBtn.addEventListener("click", () => {
  logEntries = [];
  saveState();
  renderLog();
});
saveTaskBtn.addEventListener("click", saveTask);
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveTask();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    lastHiddenAt = Date.now();
    addDistraction("you switched tabs or minimized the window");
  } else if (lastHiddenAt) {
    const awayFor = Date.now() - lastHiddenAt;
    if (awayFor > 1500) {
      addDistraction("you returned after being away");
    }
    lastHiddenAt = null;
  }
});

window.addEventListener("blur", () => addDistraction("the window lost focus"));
window.addEventListener("focus", () => updateMirror());

function restoreState() {
  if (currentTaskText) {
    currentTask.textContent = currentTaskText;
    taskInput.value = currentTaskText;
  }

  if (logEntries.length === 0) {
    renderLog();
  } else {
    renderLog();
  }

  updateMirror();
}

restoreState();
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function splitLines(text) {
  return (text || "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
}

function previewText(text, emptyText, maxLines = 2) {
  const lines = splitLines(text);
  if (!lines.length) return `<p class="muted">${emptyText}</p>`;
  const shown = lines.slice(0, maxLines).map(line => `<div>${line}</div>`).join("");
  const more = lines.length > maxLines ? `<div class="more">+${lines.length - maxLines} more</div>` : "";
  return `<div class="preview-box">${shown}${more}</div>`;
}

function fullText(text, emptyText) {
  const lines = splitLines(text);
  if (!lines.length) return `<p class="muted">${emptyText}</p>`;
  return `<div class="full-box">${lines.map(line => `<div>${line}</div>`).join("")}</div>`;
}

function openSetup(data) {
  nameInput.value = data?.name || "";
  subjectsInput.value = data?.subjects || "";
  deadlinesInput.value = data?.deadlines || "";
  todoInput.value = data?.todos || "";
  notesInput.value = data?.notes || "";
  pomodoroInput.value = data?.pomodoro || 25;
  setupDialog.showModal();
}

function editField(field) {
  openSetup(currentData || loadData() || {});
  setTimeout(() => {
    if (field === "deadlines") deadlinesInput.focus();
    if (field === "todos") todoInput.focus();
    if (field === "notes") notesInput.focus();
    if (field === "pomodoro") pomodoroInput.focus();
  }, 0);
}

function renderDashboard(data) {
  currentData = data;
  greeting.textContent = `Welcome back, ${data.name}`;
  subtitle.textContent = data.subjects ? `Today’s focus: ${data.subjects}` : "Your all-in-one study dashboard.";

  deadlinesPreview.innerHTML = previewText(data.deadlines, "No deadlines saved yet.");
  todoPreview.innerHTML = previewText(data.todos, "No to-do items saved yet.");
  notesPreview.innerHTML = previewText(data.notes, "No notes saved yet.");
  pomodoroPreview.innerHTML = `<p class="muted">Pomodoro focus length: <strong>${data.pomodoro}</strong> minutes.</p>`;

  deadlinesFull.innerHTML = fullText(data.deadlines, "No deadlines saved yet.");
  todoFull.innerHTML = fullText(data.todos, "No to-do items saved yet.");
  notesFull.innerHTML = fullText(data.notes, "No notes saved yet.");
  pomodoroFull.innerHTML = `<p class="muted">Current setting: <strong>${data.pomodoro}</strong> minutes.</p>`;
}

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    name: nameInput.value.trim(),
    subjects: subjectsInput.value.trim(),
    deadlines: deadlinesInput.value.trim(),
    todos: todoInput.value.trim(),
    notes: notesInput.value.trim(),
    pomodoro: Number(pomodoroInput.value) || 25
  };

  saveData(data);
  setupDialog.close();
  renderDashboard(data);
});

editDeadlinesBtn.addEventListener("click", () => editField("deadlines"));
editTodoBtn.addEventListener("click", () => editField("todos"));
editNotesBtn.addEventListener("click", () => editField("notes"));
editPomodoroBtn.addEventListener("click", () => editField("pomodoro"));

const existingData = loadData();

if (existingData) {
  renderDashboard(existingData);
} else {
  openSetup();
}}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function splitLines(text) {
  return (text || "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
}

function renderListHTML(items, emptyText) {
  if (!items.length) return `<p class="muted">${emptyText}</p>`;
  return `<ul>${items.map(item => `<li>${item}</li>`).join("")}</ul>`;
}

function previewText(text, emptyText, maxLines = 2) {
  const lines = splitLines(text);
  if (!lines.length) return `<p class="muted">${emptyText}</p>`;
  const shown = lines.slice(0, maxLines).map(line => `<div>${line}</div>`).join("");
  const more = lines.length > maxLines ? `<div class="more">+${lines.length - maxLines} more</div>` : "";
  return `<div class="preview-box">${shown}${more}</div>`;
}

function fullText(text, emptyText) {
  const lines = splitLines(text);
  if (!lines.length) return `<p class="muted">${emptyText}</p>`;
  return `<div class="full-box">${lines.map(line => `<div>${line}</div>`).join("")}</div>`;
}

function openSetup(data) {
  nameInput.value = data?.name || "";
  subjectsInput.value = data?.subjects || "";
  deadlinesInput.value = data?.deadlines || "";
  todoInput.value = data?.todos || "";
  notesInput.value = data?.notes || "";
  pomodoroInput.value = data?.pomodoro || 25;
  setupDialog.showModal();
}

function editField(field) {
  editingField = field;
  openSetup(currentData || loadData() || {});
  setTimeout(() => {
    if (field === "deadlines") deadlinesInput.focus();
    if (field === "todos") todoInput.focus();
    if (field === "notes") notesInput.focus();
    if (field === "pomodoro") pomodoroInput.focus();
  }, 0);
}

function renderDashboard(data) {
  currentData = data;
  greeting.textContent = `Welcome back, ${data.name}`;
  subtitle.textContent = data.subjects ? `Today’s focus: ${data.subjects}` : "Your all-in-one study dashboard.";

  deadlinesPreview.innerHTML = previewText(data.deadlines, "No deadlines saved yet.");
  todoPreview.innerHTML = previewText(data.todos, "No to-do items saved yet.");
  notesPreview.innerHTML = previewText(data.notes, "No notes saved yet.");
  pomodoroPreview.innerHTML = `<p class="muted">Pomodoro focus length: <strong>${data.pomodoro}</strong> minutes.</p>`;

  deadlinesFull.innerHTML = fullText(data.deadlines, "No deadlines saved yet.");
  todoFull.innerHTML = fullText(data.todos, "No to-do items saved yet.");
  notesFull.innerHTML = fullText(data.notes, "No notes saved yet.");
  pomodoroFull.innerHTML = `<p class="muted">Set your focus length to match your study style. Current setting: <strong>${data.pomodoro}</strong> minutes.</p>`;
}

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    name: nameInput.value.trim(),
    subjects: subjectsInput.value.trim(),
    deadlines: deadlinesInput.value.trim(),
    todos: todoInput.value.trim(),
    notes: notesInput.value.trim(),
    pomodoro: Number(pomodoroInput.value) || 25
  };

  saveData(data);
  setupDialog.close();
  renderDashboard(data);
  editingField = null;
});

editDeadlinesBtn.addEventListener("click", () => editField("deadlines"));
editTodoBtn.addEventListener("click", () => editField("todos"));
editNotesBtn.addEventListener("click", () => editField("notes"));
editPomodoroBtn.addEventListener("click", () => editField("pomodoro"));

const existingData = loadData();
if (existingData) renderDashboard(existingData);
else openSetup();function renderList(container, items, emptyText) {
  if (!items.length) {
    container.innerHTML = `<p class="muted">${emptyText}</p>`;
    return;
  }

  container.innerHTML = `<ul>${items.map(item => `<li>${item}</li>`).join("")}</ul>`;
}

function renderDashboard(data) {
  greeting.textContent = `Welcome back, ${data.name}`;
  subtitle.textContent = data.subjects
    ? `Today’s focus: ${data.subjects}`
    : "Your all-in-one study dashboard.";

  renderList(deadlinesList, splitLines(data.deadlines), "No deadlines saved yet.");
  renderList(todoList, splitLines(data.todos), "No to-do items saved yet.");
  renderList(notesList, splitLines(data.notes), "No notes saved yet.");

  pomodoroInfo.innerHTML = `<p class="muted">Pomodoro focus length: <strong>${data.pomodoro}</strong> minutes.</p>`;
}

function openSetup(data) {
  nameInput.value = data?.name || "";
  subjectsInput.value = data?.subjects || "";
  deadlinesInput.value = data?.deadlines || "";
  todoInput.value = data?.todos || "";
  notesInput.value = data?.notes || "";
  pomodoroInput.value = data?.pomodoro || 25;
  setupDialog.showModal();
}

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    name: nameInput.value.trim(),
    subjects: subjectsInput.value.trim(),
    deadlines: deadlinesInput.value.trim(),
    todos: todoInput.value.trim(),
    notes: notesInput.value.trim(),
    pomodoro: Number(pomodoroInput.value) || 25
  };

  saveData(data);
  setupDialog.close();
  renderDashboard(data);
});

const existingData = loadData();

if (existingData) {
  renderDashboard(existingData);
} else {
  openSetup();
}
  deadlinesInput.focus();
});

editTodoBtn.addEventListener("click", () => {
  if (!currentData) return;
  openSetup(currentData);
  todoInput.focus();
});

editNotesBtn.addEventListener("click", () => {
  if (!currentData) return;
  openSetup(currentData);
  notesInput.focus();
});

editPomodoroBtn.addEventListener("click", () => {
  if (!currentData) return;
  openSetup(currentData);
  pomodoroInput.focus();
});

const existingData = loadData();

if (existingData) {
  renderDashboard(existingData);
} else {
  openSetup();
}
setupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    name: nameInput.value.trim(),
    subjects: subjectsInput.value.trim(),
    deadlines: deadlinesInput.value.trim(),
    todos: todoInput.value.trim(),
    notes: notesInput.value.trim(),
    pomodoro: Number(pomodoroInput.value) || 25
  };

  saveData(data);
  setupDialog.close();
  renderDashboard(data);
});

editDeadlinesBtn.addEventListener("click", () => {
  if (!currentData) return;
  openSetup(currentData);
  deadlinesInput.focus();
});

editTodoBtn.addEventListener("click", () => {
  if (!currentData) return;
  openSetup(currentData);
  todoInput.focus();
});

editNotesBtn.addEventListener("click", () => {
  if (!currentData) return;
  openSetup(currentData);
  notesInput.focus();
});

editPomodoroBtn.addEventListener("click", () => {
  if (!currentData) return;
  openSetup(currentData);
  pomodoroInput.focus();
});

const existingData = loadData();

if (existingData) {
  renderDashboard(existingData);
} else {
  openSetup();
}function renderList(container, items, emptyText) {
  if (!items.length) {
    container.innerHTML = `<p class="muted">${emptyText}</p>`;
    return;
  }

  container.innerHTML = `<ul>${items.map(item => `<li>${item}</li>`).join("")}</ul>`;
}

function renderDashboard(data) {
  greeting.textContent = `Welcome back, ${data.name}`;
  subtitle.textContent = data.subjects
    ? `Today’s focus: ${data.subjects}`
    : "Your all-in-one study dashboard.";

  renderList(deadlinesList, splitLines(data.deadlines), "No deadlines saved yet.");
  renderList(todoList, splitLines(data.todos), "No to-do items saved yet.");
  renderList(notesList, splitLines(data.notes), "No notes saved yet.");

  pomodoroInfo.innerHTML = `<p class="muted">Pomodoro focus length: <strong>${data.pomodoro}</strong> minutes.</p>`;
}

function openSetup(data) {
  nameInput.value = data?.name || "";
  subjectsInput.value = data?.subjects || "";
  deadlinesInput.value = data?.deadlines || "";
  todoInput.value = data?.todos || "";
  notesInput.value = data?.notes || "";
  pomodoroInput.value = data?.pomodoro || 25;
  setupDialog.showModal();
}

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    name: nameInput.value.trim(),
    subjects: subjectsInput.value.trim(),
    deadlines: deadlinesInput.value.trim(),
    todos: todoInput.value.trim(),
    notes: notesInput.value.trim(),
    pomodoro: Number(pomodoroInput.value) || 25
  };

  saveData(data);
  setupDialog.close();
  renderDashboard(data);
});

const existingData = loadData();

if (existingData) {
  renderDashboard(existingData);
} else {
  openSetup();
}
