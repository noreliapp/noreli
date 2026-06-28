const STORAGE_KEY = "noreli-study-data";

const setupDialog = document.getElementById("setupDialog");
const setupForm = document.getElementById("setupForm");

const greeting = document.getElementById("greeting");
const subtitle = document.getElementById("subtitle");

const deadlinesPreview = document.getElementById("deadlinesPreview");
const todoPreview = document.getElementById("todoPreview");
const notesPreview = document.getElementById("notesPreview");
const pomodoroPreview = document.getElementById("pomodoroPreview");

const deadlinesFull = document.getElementById("deadlinesFull");
const todoFull = document.getElementById("todoFull");
const notesFull = document.getElementById("notesFull");
const pomodoroFull = document.getElementById("pomodoroFull");

const editDeadlinesBtn = document.getElementById("editDeadlinesBtn");
const editTodoBtn = document.getElementById("editTodoBtn");
const editNotesBtn = document.getElementById("editNotesBtn");
const editPomodoroBtn = document.getElementById("editPomodoroBtn");

const nameInput = document.getElementById("nameInput");
const subjectsInput = document.getElementById("subjectsInput");
const deadlinesInput = document.getElementById("deadlinesInput");
const todoInput = document.getElementById("todoInput");
const notesInput = document.getElementById("notesInput");
const pomodoroInput = document.getElementById("pomodoroInput");

let currentData = null;

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

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
