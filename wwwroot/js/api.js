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

    async getCurrentUser() {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Not authenticated');
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

    // POI
    async getPOIs() {
        const response = await fetch(`${API_URL}/pois`);
        if (!response.ok) throw new Error('Failed to load POIs');
        return response.json();
    },
    
    async getPOI(id) {
        const response = await fetch(`${API_URL}/pois/${id}`);
        if (!response.ok) throw new Error('Failed to load POI');
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
    // В объект api добавь:
    async getRV(id) {
        const response = await fetch(`${API_URL}/rvs/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to load RV');
        return response.json();
    },

    async updateRV(id, rvData) {
        const response = await fetch(`${API_URL}/rvs/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(rvData)
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to update RV');
        }
        return response.json();
    },

    async deleteRV(id) {
        const response = await fetch(`${API_URL}/rvs/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete RV');
        return true;
    },
    // Reviews
    async getReviewsForPOI(poiId) {
        const response = await fetch(`${API_URL}/reviews/poi/${poiId}`);
        if (!response.ok) throw new Error('Failed to load reviews');
        return response.json();
    },

    async createReview(poiId, rating, comment) {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ poiId, rating, comment })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create review');
        }
        return response.json();
    },

    async deleteReview(reviewId) {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete review');
        return true;
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

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        api.getCurrentUser().catch(() => {
            logout();
        });
    }
});