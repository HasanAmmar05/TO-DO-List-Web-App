const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const dueDateInput = document.getElementById('due-date');
const taskList = document.getElementById('tasks');
const userStats = document.getElementById('user-stats');
const userForm = document.getElementById('user-form');
const userInput = document.getElementById('user-input');
const userList = document.getElementById('user-list');
const userSwitcher = document.getElementById('user-switcher');

let currentUser = localStorage.getItem('currentUser') || 'Unknown User';
let users = JSON.parse(localStorage.getItem('users')) || {};
let userTasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || {};

document.addEventListener('DOMContentLoaded', function() {
    if (currentUser === 'Unknown User') {
        window.location.href = 'StartingPage.html';
    }
    document.getElementById('todo-list').querySelector('h1').textContent = `${currentUser}'s TO-DO List`;
    loadTasks();
    renderUserStats();
    renderUserList();
    renderUserSwitcher();
});

form.addEventListener('submit', function(event) {
    event.preventDefault();
    const taskText = input.value.trim();
    const dueDate = dueDateInput.value;
    if (taskText !== "" && dueDate !== "") {
        addTask(taskText, dueDate);
        input.value = "";
        dueDateInput.value = "";
    }
});

userForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const userName = userInput.value.trim();
    if (userName !== "" && !users[userName]) {
        users[userName] = { total: 0, completed: 0 };
        localStorage.setItem('users', JSON.stringify(users));
        userInput.value = "";
        renderUserList();
        renderUserStats();
        renderUserSwitcher();
    }
});

userSwitcher.addEventListener('change', function(event) {
    switchUser(event.target.value);
});

function addTask(taskText, dueDate) {
    const taskId = Date.now();
    const li = document.createElement('li');
    li.dataset.id = taskId;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';

    const taskTextSpan = document.createElement('span');
    taskTextSpan.textContent = `${taskText}`;
    taskTextSpan.className = 'task-text';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'time-limit';
    if (dueDate) {
        timeSpan.textContent = `Due Date: ${dueDate}`;
        startCountdown(timeSpan, dueDate);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';

    li.appendChild(checkbox);
    li.appendChild(taskTextSpan);
    li.appendChild(timeSpan);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);

    deleteBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        li.remove();
        deleteTask(taskId);
        updateUserStats();
    });

    checkbox.addEventListener('change', function() {
        taskTextSpan.classList.toggle('completed');
        updateTaskStatus(taskId, checkbox.checked);
        updateUserStats();
    });

    if (!users[currentUser]) {
        users[currentUser] = { total: 0, completed: 0 };
    }
    users[currentUser].total += 1;
    updateUserStats();
    saveTask(taskId, taskText, dueDate);
}

function startCountdown(timeSpan, dueDate) {
    const endTime = new Date(dueDate);

    function updateCountdown() {
        const now = new Date();
        const remainingTime = endTime - now;
        if (remainingTime <= 0) {
            timeSpan.textContent = 'Time\'s up!';
            clearInterval(countdownInterval);
        } else {
            const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % 1000) / 1000);
            timeSpan.textContent = `Time Remaining: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    }

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}

function updateUserStats() {
    const stats = users[currentUser] || { total: 0, completed: 0 };
    stats.completed = Array.from(taskList.querySelectorAll('li'))
        .filter(li => li.querySelector('.task-checkbox').checked)
        .length;
    stats.total = Array.from(taskList.querySelectorAll('li')).length;
    users[currentUser] = stats;
    localStorage.setItem('users', JSON.stringify(users));
    renderUserStats();
}

function renderUserStats() {
    userStats.innerHTML = '';
    for (const [userName, stats] of Object.entries(users)) {
        const li = document.createElement('li');
        li.textContent = `${userName}: ${stats.completed}/${stats.total} completed`;
        userStats.appendChild(li);
    }
}

function renderUserList() {
    userList.innerHTML = '';
    for (const userName of Object.keys(users)) {
        const li = document.createElement('li');
        li.textContent = userName;

        const deleteUserBtn = document.createElement('button');
        deleteUserBtn.textContent = 'Delete';
        deleteUserBtn.className = 'delete-btn';

        deleteUserBtn.addEventListener('click', function() {
            deleteUser(userName);
        });

        li.appendChild(deleteUserBtn);
        userList.appendChild(li);
    }
}

function renderUserSwitcher() {
    userSwitcher.innerHTML = '';
    for (const userName of Object.keys(users)) {
        const option = document.createElement('option');
        option.value = userName;
        option.textContent = userName;
        if (userName === currentUser) {
            option.selected = true;
        }
        userSwitcher.appendChild(option);
    }
}

function saveTask(id, text, dueDate) {
    userTasks[id] = { text, dueDate, completed: false };
    localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(userTasks));
}

function deleteTask(id) {
    delete userTasks[id];
    localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(userTasks));
}

function updateTaskStatus(id, completed) {
    if (userTasks[id]) {
        userTasks[id].completed = completed;
        localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(userTasks));
    }
}

function loadTasks() {
    taskList.innerHTML = '';
    for (const [id, task] of Object.entries(userTasks)) {
        addTaskToUI(id, task.text, task.dueDate, task.completed);
    }
}

function addTaskToUI(id, text, dueDate, completed) {
    const li = document.createElement('li');
    li.dataset.id = id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = completed;

    const taskTextSpan = document.createElement('span');
    taskTextSpan.textContent = `${text}`;
    taskTextSpan.className = 'task-text';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'time-limit';
    if (dueDate) {
        timeSpan.textContent = `Due Date: ${dueDate}`;
        startCountdown(timeSpan, dueDate);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';

    li.appendChild(checkbox);
    li.appendChild(taskTextSpan);
    li.appendChild(timeSpan);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);

    deleteBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        li.remove();
        deleteTask(id);
        updateUserStats();
    });

    checkbox.addEventListener('change', function() {
        taskTextSpan.classList.toggle('completed');
        updateTaskStatus(id, checkbox.checked);
        updateUserStats();
    });
}

function switchUser(newUserName) {
    currentUser = newUserName;
    localStorage.setItem('currentUser', currentUser);
    userTasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || {};
    document.getElementById('todo-list').querySelector('h1').textContent = `${currentUser}'s TO-DO List`;
    loadTasks();
    updateUserStats();
}

function deleteUser(userName) {
    delete users[userName];
    localStorage.removeItem(`tasks_${userName}`);
    localStorage.setItem('users', JSON.stringify(users));
    renderUserList();
    renderUserStats();
    renderUserSwitcher();
    if (userName === currentUser) {
        switchUser(Object.keys(users)[0] || 'Unknown User');
    }
}
