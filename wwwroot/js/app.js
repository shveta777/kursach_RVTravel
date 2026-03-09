// ===== HELPERS =====
let currentRouteId = null;
let currentPOIId = null;
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
    console.log('Opening modal:', id);
    const el = document.getElementById('modal-' + id);
    if (el) {
        el.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal not found:', 'modal-' + id);
    }
}

function closeModal(id) {
    console.log('Closing modal:', id);
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
            </div>
            <div class="grid">
                ${routes.length ? routes.map(r => `
                    <div class="card">
                        <h3>${r.title}</h3>
                        <p>${r.description || 'Нет описания'}</p>
                       
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
                ${isAuth() ? `<button class="btn btn-primary" onclick="openModal('poi')">➕ Добавить</button>` : ''}
            </div>
            <div class="poi-layout">
                <div class="card" style="flex:2"><div id="poi-map" style="height:500px"></div></div>
                <div class="card" style="flex:1;overflow:auto">
                    <h3>Список точек</h3>
                    <div class="poi-scrollable-list">
                        ${pois.map(p => `
                            <div class="poi-item" onclick="focusMap(${p.latitude},${p.longitude})">
<div class="poi-item" onclick="openPOIDetail(${p.poiId})">
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
// Открыть детали POI с отзывами
// Открыть детали POI с отзывами
async function openPOIDetail(poiId) {
    try {
        const [poi, reviews] = await Promise.all([
            api.getPOI ? api.getPOI(poiId) : Promise.resolve({ poiId }),
            api.getReviewsForPOI(poiId)
        ]);

        currentPOIId = poiId;

        // Рассчитываем средний рейтинг
        const avgRating = reviews.length
            ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        // Стили отзывов внутри (inline)
        const reviewsHTML = reviews.length
            ? reviews.map(r => `
                <div style="padding: 20px; background: #f9fafb; border-radius: 12px; margin-bottom: 16px; border-left: 4px solid var(--primary);">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
                        <span style="font-weight: 600; color: var(--dark); font-size: 1.1rem;">👤 ${r.userName}</span>
                        <span style="color: #f59e0b; font-size: 1.3rem; letter-spacing: 2px;">${'⭐'.repeat(r.rating)}</span>
                        <span style="color: var(--gray); font-size: 0.95rem; margin-left: auto;">${new Date(r.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <p style="color: #4b5563; line-height: 1.6; font-size: 1.05rem; margin: 0;">${r.comment || 'Без комментария'}</p>
                </div>
            `).join('')
            : '<p style="text-align: center; color: var(--gray); padding: 24px; font-style: italic;">Пока нет отзывов. Будьте первым!</p>';

        // Основной контент модалки
        const modalContent = `
            <div class="modal-overlay" onclick="closeModal('poi-detail')"></div>
            <div class="modal-container" style="max-width: 900px; width: 95%;">
                <div class="modal-header">
                    <h3>${getIcon(poi.type || 'camping')} ${poi.name || 'Точка интереса'}</h3>
                    <button class="modal-close" onclick="closeModal('poi-detail')">&times;</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 28px;">
                    <!-- Левая колонка: Информация -->
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div>
                            <p style="margin: 0; font-size: 1.05rem; line-height: 1.7;"><strong style="color: var(--dark); min-width: 100px; display: inline-block;">Тип:</strong> ${poi.type || 'Не указан'}</p>
                            <p style="margin: 0; font-size: 1.05rem; line-height: 1.7;"><strong style="color: var(--dark); min-width: 100px; display: inline-block;">Адрес:</strong> ${poi.address || 'Не указан'}</p>
                            <p style="margin: 8px 0 0 0; font-size: 1.05rem;"><strong style="color: var(--dark); display: block; margin-bottom: 8px;">Описание:</strong></p>
                            <p style="color: #4b5563; margin: 0; line-height: 1.6;">${poi.description || 'Нет описания'}</p>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; text-align: center;">
                            <span style="font-size: 2.5rem; font-weight: bold; color: #f59e0b; display: block; margin-bottom: 4px;">⭐ ${avgRating}</span>
                            <span style="color: #92400e; font-size: 1.1rem; font-weight: 500;">(${reviews.length} отзывов)</span>
                        </div>
                    </div>
                    
                    <!-- Правая колонка: Отзывы -->
                    <div style="display: flex; flex-direction: column;">
                        ${isAuth() ? `
                            <button onclick="openReviewForm()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 24px; border-radius: 10px; font-size: 1.05rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; width: fit-content;">
                                <span>➕</span>
                                <span>Написать отзыв</span>
                            </button>
                        ` : '<p style="color: #718096; margin-bottom: 16px;">🔒 <a href="#" onclick="openModal(\'login\'); return false;" style="color: #667eea;">Войдите</a>, чтобы оставить отзыв</p>'}
                        
                        <h4 style="font-size: 1.4rem; margin-bottom: 20px; color: #2d3748;">Отзывы пользователей</h4>
                        <div style="overflow-y: auto; max-height: 400px; padding-right: 12px;">
                            ${reviewsHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Создаём или обновляем модалку
        let modal = document.getElementById('modal-poi-detail');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-poi-detail';
            modal.className = 'modal hidden';
            document.body.appendChild(modal);
        }
        modal.innerHTML = modalContent;
        openModal('poi-detail');

    } catch (err) {
        notify('Ошибка загрузки: ' + err.message, 'error');
    }
}
// Форма отзыва
function openReviewForm() {
    // Ищем контейнер отзывов по структуре модалки
    const reviewsSection = document.querySelector('#modal-poi-detail .modal-container > div > div:last-child');
    if (!reviewsSection) {
        console.error('Reviews section not found');
        return;
    }

    // Проверяем, нет ли уже формы
    if (document.getElementById('review-form')) return;

    const formHTML = `
        <div id="review-form" style="background: #ffffff; border: 2px solid #e5e7eb; padding: 24px; border-radius: 12px; margin-bottom: 20px;">
            <h5 style="margin: 0 0 16px 0; font-size: 1.2rem; color: #2d3748;">Оставить отзыв</h5>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Оценка:</label>
                <div class="star-rating" style="display: flex; gap: 8px; font-size: 2.2rem;">
                    ${[1,2,3,4,5].map(i => `
                        <span class="star" data-rating="${i}" onclick="setRating(${i})" style="color: #d1d5db; cursor: pointer; transition: all 0.2s;">☆</span>
                    `).join('')}
                </div>
                <input type="hidden" id="review-rating-value" value="0">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Комментарий</label>
                <textarea id="review-comment" rows="3" placeholder="Расскажите о вашем опыте..." style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" onclick="closeReviewForm()" style="background: transparent; color: #374151; border: 2px solid #d1d5db; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">Отмена</button>
                <button type="button" onclick="submitReview()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500;">Отправить</button>
            </div>
        </div>
    `;

    reviewsSection.insertAdjacentHTML('afterbegin', formHTML);
}

// Выбор рейтинга
function setRating(rating) {
    document.getElementById('review-rating-value').value = rating;
    document.querySelectorAll('#review-form .star-rating .star').forEach((star, idx) => {
        star.textContent = idx < rating ? '★' : '☆';
        star.style.color = idx < rating ? '#f59e0b' : '#d1d5db';
    });
}

// Закрыть форму
function closeReviewForm() {
    const form = document.getElementById('review-form');
    if (form) form.remove();
}

// Отправить отзыв
async function submitReview() {
    const rating = parseInt(document.getElementById('review-rating-value').value);
    const comment = document.getElementById('review-comment').value;

    if (rating < 1 || rating > 5) {
        notify('Выберите оценку', 'error');
        return;
    }

    try {
        await api.createReview(currentPOIId, rating, comment);
        closeReviewForm();
        closeModal('poi-detail');
        notify('Отзыв добавлен!', 'success');
        // Переоткрываем для обновления
        openPOIDetail(currentPOIId);
    } catch (err) {
        notify(err.message, 'error');
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
        console.log('RVs from API:', rvs);

        app.innerHTML = `
            <div class="page-header">
                <h2>🚐 Мой автодом</h2>
                <button class="btn btn-primary" onclick="openModal('rv')">➕ Добавить</button>
            </div>
            <div class="grid">
                ${rvs.length ? rvs.map(r => `
                    <div class="card rv-card" onclick="openRVEdit(${r.rvId})" style="cursor:pointer;position:relative;">
                        <div style="position:absolute;top:1rem;right:1rem;opacity:0.6;font-size:0.8rem;">
                            ✏️ Клик для редактирования
                        </div>
                        <h3>${r.name || r.model || r.brand || 'Без названия'}</h3>
                        <p>${r.brand || ''} ${r.model || ''}</p>
                        <p>📏 ${r.length ? r.length + 'м' : '?'} | 📐 ${r.height ? r.height + 'м' : '?'}</p>
                    </div>
                `).join('') : '<div class="card">Нет RV</div>'}
            </div>
        `;
    } catch (e) {
        app.innerHTML = `<div class="card">Ошибка: ${e.message}</div>`;
    }
}

// Глобальная переменная для текущего редактируемого RV
let currentEditRVId = null;

// Открыть модалку редактирования
async function openRVEdit(rvId) {
    try {
        const rv = await api.getRV(rvId);
        currentEditRVId = rvId;

        // Заполняем поля
        document.getElementById('edit-rv-id').value = rvId;
        document.getElementById('edit-brand').value = rv.brand || '';
        document.getElementById('edit-model').value = rv.model || '';
        document.getElementById('edit-length').value = rv.length || '';
        document.getElementById('edit-width').value = rv.width || '';
        document.getElementById('edit-height').value = rv.height || '';
        document.getElementById('edit-weight').value = rv.weight || '';

        openModal('rv-edit');
    } catch (err) {
        notify('Ошибка загрузки: ' + err.message, 'error');
    }
}

// Сохранить изменения
async function submitRVEdit(e) {
    e.preventDefault();
    const f = e.target;

    try {
        await api.updateRV(currentEditRVId, {
            brand: f.brand.value,
            model: f.model.value,
            length: f.length.value ? parseFloat(f.length.value) : null,
            width: f.width.value ? parseFloat(f.width.value) : null,
            height: f.height.value ? parseFloat(f.height.value) : null,
            weight: f.weight.value ? parseInt(f.weight.value) : null
        });

        closeModal('rv-edit');
        notify('Автодом обновлён!', 'success');
        go('rv');
    } catch (err) {
        notify('Ошибка: ' + err.message, 'error');
    }
}

// Удалить из модалки редактирования
async function deleteRVFromEdit() {
    if (!confirm('Удалить этот автодом?')) return;

    try {
        await api.deleteRV(currentEditRVId);
        closeModal('rv-edit');
        notify('Автодом удалён', 'success');
        go('rv');
    } catch (err) {
        notify('Ошибка удаления', 'error');
    }
}

async function loadProfile() {
    const app = document.getElementById('app');
    if (!app) return;

    if (!isAuth()) {
        app.innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                <h2>Требуется авторизация</h2>
                <p style="color: var(--gray); margin-bottom: 1.5rem;">Войдите, чтобы просмотреть профиль</p>
                <button class="btn btn-primary" onclick="openModal('login')">Войти</button>
            </div>
        `;
        return;
    }

    try {
        const user = await api.getCurrentUser();
        app.innerHTML = `
            <div class="page-header">
                <h2>👤 Профиль</h2>
            </div>
            <div class="profile-layout">
                <div class="card profile-sidebar">
                    <div class="profile-avatar">
                        <div class="avatar-placeholder">👤</div>
                    </div>
                    <h3 style="text-align: center; margin-bottom: 0.5rem;">${user.firstName} ${user.lastName || ''}</h3>
                    <p style="text-align: center; color: var(--gray); margin-bottom: 1.5rem;">${user.email}</p>
                    <button class="btn btn-danger btn-block" onclick="logout()">
                        <span>🚪</span>
                        <span>Выйти</span>
                    </button>
                </div>
                <div class="profile-content">
                    <div class="card">
                        <h3 style="margin-bottom: 1.5rem;">📋 Личная информация</h3>
                        <div class="profile-info-grid">
                            <div class="info-item">
                                <span class="info-label">Имя</span>
                                <span class="info-value">${user.firstName}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Фамилия</span>
                                <span class="info-value">${user.lastName || 'Не указана'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Email</span>
                                <span class="info-value">${user.email}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Телефон</span>
                                <span class="info-value">${user.phone || 'Не указан'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        app.innerHTML = `
            <div class="card" style="text-align: center; padding: 2rem;">
                <p style="color: var(--danger);">Ошибка загрузки профиля: ${e.message}</p>
                <button class="btn btn-primary" onclick="go('home')" style="margin-top: 1rem;">На главную</button>
            </div>
        `;
    }
}

// ===== MAP =====
function initMap(id, pois, fit) {
    const el = document.getElementById(id);
    if (!el) {
        console.error('Map element not found:', id);
        return;
    }

    if (el._leaflet_id) {
        el.innerHTML = '';
    }

    const map = L.map(id).setView([55.7558, 37.6173], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

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
    console.log('Navigating to:', page);
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

    switch(page) {
        case 'home': loadHome(); break;
        case 'routes': loadRoutes(); break;
        case 'poi': loadPOI(); break;
        case 'rv': loadRV(); break;
        case 'profile': loadProfile(); break;
    }
}


async function submitPOI(e) {
    e.preventDefault();
    const f = e.target;

    try {
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
    } catch (err) {
        console.error('Error creating POI:', err);
        notify('Ошибка: ' + err.message, 'error');
    }
}
async function submitRV(e) {
    e.preventDefault();
    const f = e.target;

    // ОТЛАДКА
    console.log('Form elements:', {
        brand: f.brand,
        model: f.model,
        length: f.length,
        width: f.width,
        height: f.height,
        weight: f.weight
    });

    try {
        await api.createRV({
            
            model: f.model?.value,
            length: f.length?.value ? parseFloat(f.length.value) : null,
            width: f.width?.value ? parseFloat(f.width.value) : null,
            height: f.height?.value ? parseFloat(f.height.value) : null,
            weight: f.weight?.value ? parseInt(f.weight.value) : null
        });
        closeModal('rv');
        notify('RV добавлен!', 'success');
        go('rv');
    } catch (err) {
        console.error('Error creating RV:', err);
        notify('Ошибка: ' + err.message, 'error');
    }
}
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
    const isLoggedIn = isAuth();

    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');

    if (loginBtn) loginBtn.classList.toggle('hidden', isLoggedIn);
    if (registerBtn) registerBtn.classList.toggle('hidden', isLoggedIn);
    if (userMenu) userMenu.classList.toggle('hidden', !isLoggedIn);

    if (isLoggedIn) {
        api.getCurrentUser().then(user => {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) userNameEl.textContent = user.firstName;
        }).catch(() => {
            logout();
        });
    }
}

function logout() {
    authToken = null;
    localStorage.removeItem('token');
    window.location.reload();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');

    // Навигация
    document.querySelectorAll('nav a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            go(e.target.dataset.page);
        });
    });

    // Закрытие модалок по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ['poi', 'rv', 'login', 'register'].forEach(closeModal);
        }
    });

    // Привязка кнопок авторизации
    document.getElementById('loginBtn')?.addEventListener('click', () => openModal('login'));
    document.getElementById('registerBtn')?.addEventListener('click', () => openModal('register'));

    updateAuthUI();
    go('home');
});