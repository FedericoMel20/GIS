// --- Sidebar Toggle ---
document.getElementById('menu-toggle').addEventListener('click', function() {
  document.querySelector('.sidebar').classList.toggle('active');
});

// --- Explore Button ---
document.getElementById("exploreBtn").addEventListener("click", () => {
  alert("Redirecting to Weather and Soil Data section...");
  // Later we’ll make this link open the weather data section dynamically
});

// --- Example: Add Interactive Map Popups ---
const map = L.map("map").setView([13.4531, -16.5775], 8);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Example marker for Farafenni Agro Farm
const farafenniMarker = L.marker([13.564, -15.598]).addTo(map);

// Example popup content structure
const popupContent = `
  <div class="popup-content">
    <h3>Farafenni Agro Farm</h3>
    <img src="assets/images/farafenni_farm.jpg" alt="Farafenni Agro Farm">
    <p><strong>📍 Location:</strong> Farafenni</p>
    <p><strong>📞 Contact:</strong> +220 7803311</p>
    <p>Pioneer in sustainable crop rotation techniques.</p>
  </div>
`;

// Bind the popup to the marker
farafenniMarker.bindPopup(popupContent);
