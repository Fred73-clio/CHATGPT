const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const addButton = document.querySelector("#add-task-button");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const counter = document.querySelector("#task-counter");
const template = document.querySelector("#task-template");
const filterButtons = document.querySelectorAll("[data-filter]");

const storageKey = "first-app-tasks";

let tasks = loadTasks();
let currentFilter = "all";

function createTaskId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  } catch {
    // Certains navigateurs d'entreprise bloquent localStorage en file://.
  }
}

function visibleTasks() {
  if (currentFilter === "open") {
    return tasks.filter((task) => !task.done);
  }

  if (currentFilter === "done") {
    return tasks.filter((task) => task.done);
  }

  return tasks;
}

function updateCounter() {
  const remaining = tasks.filter((task) => !task.done).length;
  counter.textContent = `${remaining} restante${remaining > 1 ? "s" : ""}`;
}

function showAllTasks() {
  currentFilter = "all";

  for (const filterButton of filterButtons) {
    filterButton.classList.toggle("active", filterButton.dataset.filter === "all");
  }
}

function addTask() {
  const title = input.value.trim();

  if (!title) {
    input.focus();
    return;
  }

  tasks.unshift({
    id: createTaskId(),
    title,
    done: false,
  });

  input.value = "";
  showAllTasks();
  saveTasks();
  renderTasks();
  input.focus();
}

function renderTasks() {
  list.innerHTML = "";

  for (const task of visibleTasks()) {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("input");
    const label = item.querySelector("span");
    const deleteButton = item.querySelector("button");

    item.classList.toggle("done", task.done);
    checkbox.checked = task.done;
    label.textContent = task.title;

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((savedTask) => savedTask.id !== task.id);
      saveTasks();
      renderTasks();
    });

    list.append(item);
  }

  emptyState.classList.toggle("visible", visibleTasks().length === 0);
  updateCounter();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask();
});

addButton.addEventListener("click", addTask);

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    for (const filterButton of filterButtons) {
      filterButton.classList.toggle("active", filterButton === button);
    }

    renderTasks();
  });
}

renderTasks();
