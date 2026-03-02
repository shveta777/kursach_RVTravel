// API URL
const API_URL = 'http://localhost:5000/api';

// Хранение токена
let authToken = localStorage.getItem('token');

// Функция для получения актуальных заголовков 
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
    };
}

// API методы
const api = {
    // Auth
    async login(email, password) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка входа');
        }

        const data = await response.json();
        if (data.token) {
            authToken = data.token;
            localStorage.setItem('token', authToken);
        }
        return data;
    },

    async register(userData) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка регистрации');
        }

        return response.json();
    },

    // Users
    async getUsers() {
        const response = await fetch(`${API_URL}/users`, {
            headers: getHeaders() 
        });
        if (!response.ok) throw new Error('Failed to load users');
        return response.json();
    },

    async getUser(id) {
        const response = await fetch(`${API_URL}/users/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to load user');
        return response.json();
    },

    async deleteUser(id) {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response;
    },

    // Routes
    async getRoutes() {
        const response = await fetch(`${API_URL}/routes`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to load routes');
        return response.json();
    },

    async getPublicRoutes() {
        const response = await fetch(`${API_URL}/routes/public`);
        if (!response.ok) throw new Error('Failed to load public routes');
        return response.json();
    },
    async getRoute(id) {
        const response = await fetch(`${API_URL}/routes/${id}`);
        if (!response.ok) throw new Error('Failed to load route');
        return response.json();
    },
    async createRoute(routeData) {
        const response = await fetch(`${API_URL}/routes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(routeData)
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to create route');
        }
        return response.json();
    },
    async getRoute(id) {
        const response = await fetch(`${API_URL}/routes/${id}`);
        if (!response.ok) throw new Error('Failed to load route');
        return response.json();
    },
    async deleteRoute(id) {
        const response = await fetch(`${API_URL}/routes/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete route');
        return response;
    },

    // POI
    async getPOIs() {
        const response = await fetch(`${API_URL}/pois`);
        if (!response.ok) throw new Error('Failed to load POIs');
        return response.json();
    },

    async createPOI(poiData) {
        const response = await fetch(`${API_URL}/pois`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(poiData)
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to create POI');
        }
        return response.json();
    },

    // RV
    async getRVs() {
        const response = await fetch(`${API_URL}/rvs`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to load RVs');
        return response.json();
    },

    async createRV(rvData) {
        const response = await fetch(`${API_URL}/rvs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(rvData)
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to create RV');
        }
        return response.json();
    },

    // Дополнительно: получить текущего пользователя
    async getCurrentUser() {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Not authenticated');
        return response.json();
    }
};

// Проверка авторизации
function isAuthenticated() {
    return !!authToken;
}

// Выход
function logout() {
    authToken = null;
    localStorage.removeItem('token');
    window.location.reload();
}


// Инициализация при загрузке (проверка токена)
document.addEventListener('DOMContentLoaded', () => {
    // Проверим, валиден ли токен
    if (authToken) {
        api.getCurrentUser().catch(() => {
            // Если токен невалиден - чистим
            logout();
        });
    }
});

