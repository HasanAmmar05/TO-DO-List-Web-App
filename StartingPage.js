document.getElementById('start-button').addEventListener('click', () => {
    const username = document.getElementById('username-input').value.trim();
    if (username) {
        let users = JSON.parse(localStorage.getItem('users')) || {};
        if (!users[username]) {
            users[username] = [];
            localStorage.setItem('users', JSON.stringify(users));
        }
        localStorage.setItem('currentUser', username);
        window.location.href = 'TODO_List.html';
    } else {
        alert('Please enter a valid name.');
    }
});
