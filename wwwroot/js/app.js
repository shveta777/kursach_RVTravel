// ===== HELPERS =====
// Для навигации между "страницами"
let currentRouteId = null;
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const isAuth = () => !!authToken;

const icons = {
    camping: '🏕️', parking: '🅿️', hotel: '🏨', restaurant: '🍽️',
    viewpoint: '🌄', attraction: '⭐', service: '🔧', repair: '🔧',
    'RV Park': '🏕️', Campground: '⛺', 'Gas Station': '⛽',
    'Rest Area': '🛑', Repair: '🔧', 'Dump Station': '🚰'
};
const getIcon = (t) => icons[t] || '📍';

function notify(msg, type = 'info') {
    const n = document.createElement('div');
    n.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;">×</button>`;
    n.style.cssText = `position:fixed;top:20px;right:20px;padding:16px 24px;border-radius:8px;color:white;z-index:9999;display:flex;gap:12px;align-items:center;background:${type==='success'?'#10b981':type==='error'?'#ef4444':'#3b82f6'}`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}

// ===== MODALS =====
function openModal(id) {
    const el = document.getElementById('modal-' + id);
    if (el) {
        el.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const el = document.getElementById('modal-' + id);
    if (el) {
        el.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// ===== PAGES =====
async function loadHome() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="welcome card">
            <h1>🚐 Добро пожаловать в RV Travel!</h1>
            <p>Планируйте путешествия на автодоме</p>
            <div class="actions">
                <button class="btn btn-primary" onclick="go('routes')">🗺️ Маршруты</button>
                <button class="btn btn-success" onclick="go('poi')">📍 Точки интереса</button>
            </div>
        </div>
        <div class="stats-grid" id="stats"></div>
        <div id="home-map" style="height:400px;margin-top:20px;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);"></div>
    `;

    try {
        const [u, r, p] = await Promise.all([
            api.getUsers().catch(() => []),
            api.getPublicRoutes().catch(() => []),
            api.getPOIs().catch(() => [])
        ]);

        const stats = document.getElementById('stats');
        if (stats) {
            stats.innerHTML = [
                { n: u.length, t: 'Пользователей' },
                { n: r.length, t: 'Маршрутов' },
                { n: p.length, t: 'Точек интереса' }
            ].map(s => `<div class="stat-card"><h3>${s.n}</h3><p>${s.t}</p></div>`).join('');
        }

        console.log('POIs loaded:', p);
        setTimeout(() => {
            if (p.length > 0) {
                initMap('home-map', p, true);
            } else {
                initMap('home-map', []);
            }
        }, 100);

    } catch (e) {
        console.error('Home load error:', e);
    }
}

async function loadRoutes() {
    const app = document.getElementById('app');
    if (!app) return;

    try {
        const routes = await api.getPublicRoutes();
        app.innerHTML = `
            <div class="page-header">
                <h2>🗺️ Маршруты</h2>
                ${isAuth() ? `<button class="btn btn-primary" onclick="openModal('route')">➕ Создать</button>` : ''}
            </div>
            <div class="grid">
                ${routes.length ? routes.map(r => `
                    <div class="card">
                        <h3>${r.title}</h3>
                        <p>${r.description || 'Нет описания'}</p>
                        <span class="badge badge-public">${r.isPublic ? '🌐 Публичный' : '🔒 Приватный'}</span>
                        <div style="margin-top:1rem">
                           <button class="btn btn-primary" onclick="loadRouteDetail(${r.routeId})">👁️ Просмотр</button>
                        </div>
                    </div>
                `).join('') : '<div class="card">Нет маршрутов</div>'}
            </div>
        `;
    } catch (e) {
        app.innerHTML = `<div class="card">Ошибка: ${e.message}</div>`;
    }
}

async function loadPOI() {
    const app = document.getElementById('app');
    if (!app) return;

    try {
        const pois = await api.getPOIs();
        app.innerHTML = `
            <div class="page-header">
                <h2>📍 Точки интереса</h2>
                <button class="btn btn-primary" onclick="openModal('poi')">➕ Добавить</button>
            </div>
            <div class="poi-layout">
                <div class="card" style="flex:2"><div id="poi-map" style="height:500px"></div></div>
                <div class="card" style="flex:1;overflow:auto">
                    <h3>Список точек</h3>
                    <div class="poi-scrollable-list">
                        ${pois.map(p => `
                            <div class="poi-item" onclick="focusMap(${p.latitude},${p.longitude})">
                                <div class="poi-icon">${getIcon(p.type)}</div>
                                <div class="poi-info">
                                    <h4>${p.name}</h4>
                                    <p class="poi-type">${p.type}</p>
                                    <p class="poi-address">${p.address || 'Нет адреса'}</p>
                                </div>
                            </div>
                        `).join('') || '<p>Нет точек</p>'}
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => initMap('poi-map', pois, true), 100);
    } catch (e) {
        app.innerHTML = `<div class="card">Ошибка: ${e.message}</div>`;
    }
}

async function loadRV() {
    const app = document.getElementById('app');
    if (!app) return;

    if (!isAuth()) {
        app.innerHTML = `<div class="card"><h2>🔒 Требуется авторизация</h2></div>`;
        return;
    }

    try {
        const rvs = await api.getRVs();
        app.innerHTML = `
            <div class="page-header">
                <h2>🚐 Мой автодом</h2>
                <button class="btn btn-primary" onclick="openModal('rv')">➕ Добавить</button>
            </div>
            <div class="grid">
                ${rvs.length ? rvs.map(r => `
                    <div class="card">
                        <h3>${r.name}</h3>
                        <p>${r.brand || ''} ${r.model || ''}</p>
                        <p>📏 ${r.length || '?'}м | 📐 ${r.height || '?'}м</p>
                    </div>
                `).join('') : '<div class="card">Нет RV</div>'}
            </div>
        `;
    } catch (e) {
        app.innerHTML = `<div class="card">Ошибка: ${e.message}</div>`;
    }
}

// ===== MAP =====
function initMap(id, pois, fit) {
    const el = document.getElementById(id);
    if (!el) {
        console.error('Map element not found:', id);
        return;
    }

    // Удаляем старую карту если есть
    if (el._leaflet_id) {
        el.innerHTML = '';
    }

    const map = L.map(id).setView([55.7558, 37.6173], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    console.log('Adding POIs to map:', pois); // Отладка

    if (!pois || !pois.length) return map;

    const bounds = L.latLngBounds();
    pois.forEach(p => {
        if (p.latitude && p.longitude) {
            L.marker([p.latitude, p.longitude]).addTo(map)
                .bindPopup(`<b>${p.name}</b><br>${getIcon(p.type)} ${p.type}`);
            bounds.extend([p.latitude, p.longitude]);
        }
    });

    if (fit && pois.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    return map;
}

// ===== NAVIGATION =====
function go(page) {
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    switch(page) {
        case 'home': loadHome(); break;
        case 'routes': loadRoutes(); break;
        case 'poi': loadPOI(); break;
        case 'rv': loadRV(); break;
    }
}

// ===== FORMS =====
async function submitRoute(e) {
    e.preventDefault();
    const f = e.target;
    await api.createRoute({
        title: f.title.value,
        description: f.description.value,
        isPublic: f.isPublic.checked,
        userId: 1
    });
    closeModal('route');
    notify('Маршрут создан!', 'success');
    go('routes');
}

async function submitPOI(e) {
    e.preventDefault();
    const f = e.target;
    await api.createPOI({
        name: f.name.value,
        type: f.type.value,
        description: f.description.value,
        latitude: parseFloat(f.latitude.value),
        longitude: parseFloat(f.longitude.value),
        address: f.address.value,
        addedBy: 1
    });
    closeModal('poi');
    notify('Точка добавлена!', 'success');
    go('poi');
}

async function submitRV(e) {
    e.preventDefault();
    const f = e.target;
    await api.createRV({
        name: f.name.value,
        brand: f.brand.value,
        model: f.model.value,
        year: f.year.value ? parseInt(f.year.value) : null,
        length: f.length.value ? parseFloat(f.length.value) : null,
        width: f.width.value ? parseFloat(f.width.value) : null,
        height: f.height.value ? parseFloat(f.height.value) : null,
        weight: f.weight.value ? parseInt(f.weight.value) : null,
        fuelType: f.fuelType.value
    });
    closeModal('rv');
    notify('RV добавлен!', 'success');
    go('rv');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('nav a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            go(e.target.dataset.page);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') ['route', 'poi', 'rv'].forEach(closeModal);
    });

    go('home');
});
// ===== AUTH =====
async function handleLogin(e) {
    e.preventDefault();
    const f = e.target;

    try {
        const data = await api.login(f.email.value, f.password.value);
        console.log('Logged in:', data);
        closeModal('login');
        updateAuthUI();
        notify('Вход выполнен!', 'success');
    } catch (err) {
        notify('Ошибка входа: ' + err.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const f = e.target;

    try {
        await api.register({
            email: f.email.value,
            password: f.password.value,
            firstName: f.firstName.value,
            lastName: f.lastName.value,
            phone: f.phone.value
        });
        closeModal('register');
        notify('Регистрация успешна! Теперь войдите.', 'success');
        openModal('login');
    } catch (err) {
        notify('Ошибка регистрации: ' + err.message, 'error');
    }
}

function updateAuthUI() {
    // Обновляем UI после входа/выхода
    const isLoggedIn = isAuth();
    document.getElementById('loginBtn').classList.toggle('hidden', isLoggedIn);
    document.getElementById('registerBtn').classList.toggle('hidden', isLoggedIn);
    document.getElementById('userMenu').classList.toggle('hidden', !isLoggedIn);

    if (isLoggedIn) {
        // Можно загрузить имя пользователя
        api.getCurrentUser().then(user => {
            document.getElementById('userName').textContent = user.firstName;
        }).catch(() => logout());
    }
}

// Обновляем UI при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // ... существующий код ...

    // Привязываем кнопки
    document.getElementById('loginBtn')?.addEventListener('click', () => openModal('login'));
    document.getElementById('registerBtn')?.addEventListener('click', () => openModal('register'));

    updateAuthUI();
});