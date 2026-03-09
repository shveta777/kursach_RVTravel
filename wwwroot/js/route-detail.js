// Загрузка деталей маршрута
async function loadRouteDetail(routeId) {
    console.log('Loading route:', routeId);

    try {
        const route = await api.getRoute(routeId);
        console.log('Route data:', route);

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="route-detail-layout">
                <div class="route-info card">
                    <div class="route-detail-header">
                        <h2>${route.title}</h2>
                       
                    </div>
                    <p>${route.description || 'No description'}</p>
                    <div class="route-author-info">
                        <span>Author: ${route.userName || 'Unknown'}</span>
                        <span>Created: ${new Date(route.createdAt).toLocaleDateString()}</span>
                        <span>Points: ${route.points?.length || 0}</span>
                    </div>
                    <button class="btn btn-outline" onclick="go('routes')">Back</button>
                </div>

                <div class="route-map-container card">
                    <div id="route-detail-map" style="height: 500px;"></div>
                </div>

                <div class="route-points card">
                    <h3>Route Points</h3>
                    <div class="points-timeline">
                        ${route.points?.map((p, i) => `
                            <div class="point-item ${p.isStopover ? 'stopover' : ''}">
                                <div class="point-number">${i + 1}</div>
                                <div class="point-info">
                                    <p>${p.address || 'Point ' + (i + 1)}</p>
                                    <small>${p.latitude?.toFixed(6)}, ${p.longitude?.toFixed(6)}</small>
                                    
                                </div>
                            </div>
                        `).join('') || '<p>No points</p>'}
                    </div>
                </div>
            </div>
        `;

        console.log('Calling initRouteMap...'); // Отладка
        await initRouteMap(route.points);
        console.log('initRouteMap done'); // Отладка

    } catch (e) {
        console.error('Error in loadRouteDetail:', e);
        alert('Error loading route: ' + e.message);
        go('routes');
    }
}

// Получаем маршрут по дорогам через OSRM
async function getRouteFromOSRM(points) {
    console.log('getRouteFromOSRM called with', points.length, 'points'); // Отладка

    const coords = points.map(p => `${p.longitude},${p.latitude}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    console.log('Fetching OSRM:', url); // Отладка

    const response = await fetch(url);
    const data = await response.json();

    console.log('OSRM response:', data); // Отладка

    if (data.code !== 'Ok') {
        throw new Error('OSRM failed: ' + data.message);
    }

    const coords2 = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    console.log('Converted coords:', coords2.length, 'points'); // Отладка

    return coords2;
}

// Initialize map with route points (по дорогам)
async function initRouteMap(points) {
    console.log('initRouteMap called'); // Отладка

    if (!points || points.length === 0) {
        console.log('No points, using default view'); // Отладка
        const map = L.map('route-detail-map').setView([55.7558, 37.6173], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap'
        }).addTo(map);
        return;
    }

    const map = L.map('route-detail-map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap'
    }).addTo(map);

    try {
        console.log('Trying OSRM...'); // Отладка
        const routeCoords = await getRouteFromOSRM(points);

        console.log('Drawing polyline with', routeCoords.length, 'points'); // Отладка
        L.polyline(routeCoords, { color: '#667eea', weight: 4, opacity: 0.8 }).addTo(map);

        points.forEach((p, i) => {
            L.marker([p.latitude, p.longitude]).addTo(map)
                .bindPopup(`<b>Point ${i + 1}</b><br>${p.address || ''}`);
        });

        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
        console.log('OSRM route drawn successfully'); // Отладка

    } catch (e) {
        console.error('OSRM failed, using fallback:', e); // Отладка

        const latlngs = points.map(p => [p.latitude, p.longitude]);

        points.forEach((p, i) => {
            L.marker([p.latitude, p.longitude]).addTo(map)
                .bindPopup(`<b>Point ${i + 1}</b><br>${p.address || ''}`);
        });

        L.polyline(latlngs, { color: 'red', weight: 4 }).addTo(map); // Красный цвет для отладки
        map.fitBounds(latlngs, { padding: [50, 50] });
    }
}