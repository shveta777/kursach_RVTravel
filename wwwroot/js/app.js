// API URL
const API_URL = '/api';

// Текущая страница
let currentPage = 'home';

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Навигация
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateTo(page);
        });
    });

    // Загрузить главную
    loadHome();
});

// Навигация
function navigateTo(page) {
    currentPage = page;

    // Обновить активную ссылку
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    // Загрузить страницу
    switch(page) {
        case 'home': loadHome(); break;
        case 'users': loadUsers(); break;
        case 'routes': loadRoutes(); break;
        case 'rv': loadRV(); break;
    }
}

// Главная страница
function loadHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="welcome card">
            <h1>Добро пожаловать в RV Travel! 🚐</h1>
            <p>Планируйте свои путешествия на автодоме, создавайте маршруты и делитесь впечатлениями.</p>
            <button class="btn btn-primary" onclick="navigateTo('routes')">Смотреть маршруты</button>
            <button class="btn btn-primary" onclick="navigateTo('users')">Пользователи</button>
        </div>
        <div class="stats-grid" id="stats">
            <div class="stat-card">
                <h3 id="user-count" class="loading">0</h3>
                <p>Пользователей</p>
            </div>
            <div class="stat-card">
                <h3 id="route-count" class="loading">0</h3>
                <p>Маршрутов</p>
            </div>
            <div class="stat-card">
                <h3 id="rv-count">-</h3>
                <p>Автодомов</p>
            </div>
        </div>
    `;

    loadStats();
}

// Загрузка статистики
async function loadStats() {
    try {
        const [users, routes] = await Promise.all([
            fetch(`${API_URL}/users`).then(r => r.json()),
            fetch(`${API_URL}/routes`).then(r => r.json())
        ]);

        document.getElementById('user-count').textContent = users.length;
        document.getElementById('user-count').classList.remove('loading');

        document.getElementById('route-count').textContent = routes.length;
        document.getElementById('route-count').classList.remove('loading');
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        document.getElementById('user-count').textContent = '?';
        document.getElementById('route-count').textContent = '?';
    }
}

// Страница пользователей
async function loadUsers() {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="loading">Загрузка пользователей...</div>';

    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();

        app.innerHTML = `
            <h2>Пользователи</h2>
            <div class="grid" id="users-list">
                ${users.map(user => `
                    <div class="card">
                        <h3>${user.firstName} ${user.lastName || ''}</h3>
                        <p>📧 ${user.email}</p>
                        <p>📱 ${user.phone || 'Телефон не указан'}</p>
                        <p>📅 Регистрация: ${new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
                        <button class="btn btn-danger" onclick="deleteUser(${user.userId})">Удалить</button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        app.innerHTML = `<div class="card">Ошибка загрузки: ${error.message}</div>`;
    }
}

// Удаление пользователя
async function deleteUser(id) {
    if (!confirm('Удалить пользователя?')) return;

    try {
        await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
        loadUsers();
    } catch (error) {
        alert('Ошибка удаления: ' + error.message);
    }
}

// Страница маршрутов
async function loadRoutes() {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="loading">Загрузка маршрутов...</div>';

    try {
        const response = await fetch(`${API_URL}/routes/public`);
        const routes = await response.json();

        app.innerHTML = `
            <h2>Публичные маршруты</h2>
            <div class="grid">
                ${routes.map(route => `
                    <div class="card">
                        <h3>${route.title}</h3>
                        <p>${route.description || 'Описание отсутствует'}</p>
                        <p>👤 Создатель: ${route.user?.firstName || 'Неизвестно'}</p>
                        <span class="badge ${route.isPublic ? 'badge-public' : 'badge-private'}">
                            ${route.isPublic ? 'Публичный' : 'Приватный'}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        app.innerHTML = `<div class="card">Ошибка загрузки: ${error.message}</div>`;
    }
}

// Страница RV
function loadRV() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="card welcome">
            <h2>🚐 Мой автодом</h2>
            <p>Раздел в разработке. Здесь будет управление вашим RV.</p>
            <button class="btn btn-primary" onclick="alert('Скоро!')">Добавить RV</button>
        </div>
    `;
}