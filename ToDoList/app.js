// Simple Todo MVP with localStorage persistence

(() => {
  const STORAGE_KEY = 'todos';

  /** @typedef {{ id:number, title:string, done:boolean }} Todo */

  /** @type {Todo[]} */
  let todos = [];
  let history = [];

  const elements = {
    form: document.getElementById('todo-form'),
    input: document.getElementById('new-todo-input'),
    list: document.getElementById('todo-list'),
    empty: document.getElementById('empty-state')
  };

  function pushHistory() {
    history.push(JSON.parse(JSON.stringify(todos))); // deep clone
    if (history.length > 50) history.shift(); // limit history biar gak bengkak
  }
  
  function undo() {
    if (history.length === 0) return;
    todos = history.pop() || [];
    saveTodos();
    render();
  }

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isValidTodo);
    } catch (_) {
      return [];
    }
  }

  /** @param {any} x */
  function isValidTodo(x) {
    return x && typeof x.id === 'number' && typeof x.title === 'string' && typeof x.done === 'boolean';
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function nextId() {
    const max = todos.reduce((m, t) => Math.max(m, t.id), 0);
    return max + 1;
  }

  /** @param {string} title */
  function addTodo(title) {
    const trimmed = title.trim();
    if (!trimmed) return;
    pushHistory();
    todos.push({ id: nextId(), title: trimmed, done: false });
    saveTodos();
    render();
  }

  /** @param {number} id */
  function toggleTodo(id) {
    pushHistory();
    todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    saveTodos();
    render();

    // 🎊 SURPRISE CELEBRATION
    const justDone = todos.find(t => t.id === id && t.done);
    if (justDone) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  /** @param {number} id */
  function deleteTodo(id) {
    pushHistory();
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    render();
  }

  function render() {
    elements.list.innerHTML = '';

    if (todos.length === 0) {
      elements.empty.hidden = false;
      return;
    }

    elements.empty.hidden = true;

    for (const todo of todos) {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.id = String(todo.id);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.done;
      checkbox.addEventListener('change', () => toggleTodo(todo.id));

      const title = document.createElement('span');
      title.className = 'todo-title' + (todo.done ? ' done' : '');
      title.textContent = todo.title;

      const del = document.createElement('button');
      del.className = 'delete-btn';
      del.setAttribute('aria-label', `Delete ${todo.title}`);
      del.textContent = '✕';
      del.addEventListener('click', () => deleteTodo(todo.id));

      li.appendChild(checkbox);
      li.appendChild(title);
      li.appendChild(del);

      elements.list.appendChild(li);
    }
  }

  function init() {
    todos = loadTodos();
    render();

    elements.form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      addTodo(elements.input.value);
      elements.input.value = '';
      elements.input.focus();
    });

    elements.input.addEventListener('input', () => {
      // enable/disable button based on input content
      const btn = /** @type {HTMLButtonElement} */ (document.getElementById('add-todo-btn'));
      if (btn) btn.disabled = elements.input.value.trim().length === 0;
    });

    document.getElementById('undo-btn')
      .addEventListener('click', undo);

    // initialize button state
    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('add-todo-btn'));
    if (btn) btn.disabled = elements.input.value.trim().length === 0;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
