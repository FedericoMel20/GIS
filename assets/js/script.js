document.addEventListener('DOMContentLoaded', () => {
  const exploreBtn = document.getElementById('exploreBtn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      alert('Redirecting to Weather and Soil Data section...');
    });
  }

  // Sidebar toggle
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('active');
    });
  }

  // View Map toggle
  const viewBtn = document.getElementById('viewMapBtn');
  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      const mapSection = document.getElementById('map-section');
      const open = mapSection.classList.contains('active');
      if (!open) {
        mapSection.classList.add('active');
        setTimeout(() => { initializeMap(); }, 250);
        viewBtn.textContent = 'Close Map';
      } else {
        mapSection.classList.remove('active');
        viewBtn.textContent = 'View Map';
      }
    });
  }

  // Map initialization function
  function initializeMap() {
    if (window.mapInitialized) return;
    window.mapInitialized = true;

    const map = L.map('map').setView([13.45, -16.58], 8.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const layers = {
      Farms: L.layerGroup().addTo(map),
      'Veterinary Centers': L.layerGroup().addTo(map),
      'Soil Regions': L.layerGroup().addTo(map),
      'Irrigation Zones': L.layerGroup().addTo(map)
    };

    const icons = {
      farm: L.divIcon({ html: '☘️', className: 'emoji-icon', iconSize: [35, 35] }),
      vet: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', iconSize: [35, 35] }),
      fao: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [35, 35] }),
      irrigation: L.divIcon({ html: '💧', className: 'emoji-icon', iconSize: [30, 30] })
    };

    function mapType(raw) {
      if (!raw) return 'farm';
      const t = String(raw).trim().toLowerCase();
      if (t.includes('farm') || t.includes('field') || t.includes('rice') || t.includes('hort')) return 'farm';
      if (t.includes('vet') || t.includes('veter')) return 'vet';
      if (t.includes('fao') || t.includes('office')) return 'fao';
      if (t.includes('irrig') || t.includes('river') || t.includes('belt')) return 'irrigation';
      return 'farm';
    }

    fetch('map.geojson')
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(data => {
        L.geoJSON(data, {
          pointToLayer: (feature, latlng) => {
            const rawType = feature.properties && feature.properties.type;
            const type = mapType(rawType);
            const icon = icons[type] || icons.farm;
            const marker = L.marker(latlng, { icon });
            const props = feature.properties || {};
            const tooltip = `
              <div class="tooltip-custom">
                <div class="tooltip-title">${props.name || 'No name'}</div>
                ${props.image ? `<img src="${props.image}" alt="${props.name}">` : ''}
                <div>📍 ${props.location || 'N/A'}</div>
                <div>☎️ ${props.contact || 'N/A'}</div>
                <small>${props.description || ''}</small>
              </div>
            `;
            marker.bindTooltip(tooltip, { direction: 'top', sticky: true, opacity: 0.95 });
            marker.on('mouseover', () => marker.openTooltip());
            marker.on('mouseout', () => marker.closeTooltip());
            // Fetch and show weather on click
            marker.on('click', () => {
              const [lat, lng] = [latlng.lat, latlng.lng];
              const apiKey = 'cf4bbe8f63c3ac3499b73e5862aeab5b';
              const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

              fetch(url)
                .then(res => res.json())
                .then(data => {
                  const weatherInfo = `
                    <div style="font-size:0.9rem;">
                      <b>🌤️ Weather Info</b><br>
                      🌡️ Temp: ${data.main.temp}°C<br>
                      💧 Humidity: ${data.main.humidity}%<br>
                      🌬️ Wind Speed: ${data.wind.speed} m/s<br>
                      ☁️ Condition: ${data.weather[0].description}
                    </div>
                  `;
                  marker.bindPopup(tooltip + weatherInfo).openPopup();
                })
                .catch(err => console.error("Weather fetch error:", err));

            });


            if (type === 'farm') marker.addTo(layers['Farms']);
            else if (type === 'vet') marker.addTo(layers['Veterinary Centers']);
            else if (type === 'fao') marker.addTo(layers['Farms']);
            else if (type === 'irrigation') marker.addTo(layers['Irrigation Zones']);
            else marker.addTo(layers['Farms']);

            return marker;
          },
          onEachFeature: (feature, layer) => {
            if (feature.geometry && feature.geometry.type === 'Polygon') {
              const props = feature.properties || {};
              if (props.color) {
                layer.setStyle({
                  color: props.color,
                  fillColor: props.color,
                  fillOpacity: props.fillOpacity || 0.35,
                  weight: props.weight || 1
                });
              }
              layer.bindPopup(`<b>${props.name || 'Region'}</b><br>${props.description || ''}`);
              layer.addTo(layers['Soil Regions']);
            }
          }
        });
      })
      .catch(err => {
        console.error('Error loading GeoJSON:', err);
      });

    L.control.layers(null, layers, { collapsed: false }).addTo(map);
  }
});
