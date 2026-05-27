// =============================================
//   TO-DO LIST — todo.js
//   Usa localStorage para persistir las tareas
// =============================================

// ---- Estado de la app ----
let tasks = loadTasks();       // Array de tareas
let currentFilter = 'all';     // Filtro activo

// ---- Referencias al DOM ----
const input = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const countLabel = document.getElementById('count-label');
const clearBtn = document.getElementById('clear-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

// ---- Fecha de hoy en el header ----
const dateEl = document.getElementById('today-date');
dateEl.textContent = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// =============================================
//   FUNCIONES PRINCIPALES
// =============================================

/** Carga las tareas desde localStorage */
function loadTasks() {
    try {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    } catch {
        return [];
    }
}

/** Guarda las tareas en localStorage */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/** Crea un ID único para cada tarea */
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Agrega una nueva tarea */
function addTask() {
    const text = input.value.trim();
    if (!text) {
        input.classList.add('pop');
        input.addEventListener('animationend', () => input.classList.remove('pop'), { once: true });
        input.focus();
        return;
    }

    const task = {
        id: uid(),
        text: text,
        done: false,
        createdAt: Date.now()
    };

    tasks.unshift(task); // Agrega al inicio
    saveTasks();
    input.value = '';
    input.focus();
    render();
}

/** Alterna el estado completado/pendiente */
function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    saveTasks();
    render();
}

/** Elimina una tarea */
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
}

/** Borra todas las tareas completadas */
function clearDone() {
    tasks = tasks.filter(t => !t.done);
    saveTasks();
    render();
}

// =============================================
//   RENDER
// =============================================

function getFilteredTasks() {
    if (currentFilter === 'pending') return tasks.filter(t => !t.done);
    if (currentFilter === 'done') return tasks.filter(t => t.done);
    return tasks;
}

function render() {
    const filtered = getFilteredTasks();
    taskList.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
        filtered.forEach(task => {
            taskList.appendChild(createTaskEl(task));
        });
    }

    updateCounter();
}

/** Crea el elemento HTML de una tarea */
function createTaskEl(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
    <div class="task-check" role="checkbox" aria-checked="${task.done}" tabindex="0">
    <div class="task-check-inner"></div>
    </div>
    <span class="task-text">${escapeHtml(task.text)}</span>
    <button class="task-delete" aria-label="Eliminar tarea">✕</button>`;

    // Eventos
    li.querySelector('.task-check').addEventListener('click', () => toggleTask(task.id));
    li.querySelector('.task-check').addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') toggleTask(task.id);
    });
    li.querySelector('.task-delete').addEventListener('click', () => deleteTask(task.id));

    return li;
}

/** Actualiza el contador de tareas pendientes */
function updateCounter() {
    const pending = tasks.filter(t => !t.done).length;
    countLabel.textContent = pending === 1
        ? '1 tarea pendiente'
        : `${pending} tareas pendientes`;
}

/** Escapa caracteres HTML para evitar XSS */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// =============================================
//   EVENTOS
// =============================================

// Agregar con botón
addBtn.addEventListener('click', addTask);

// Agregar con Enter
input.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
});

// Filtros
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

// Borrar completadas
clearBtn.addEventListener('click', clearDone);

// =============================================
//   INICIO
// =============================================
render();