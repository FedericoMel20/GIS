document.getElementById('menu-toggle').addEventListener('click', function() {
  document.querySelector('.sidebar').classList.toggle('active');
});

document.getElementById("exploreBtn").addEventListener("click", () => {
  alert("Redirecting to Weather and Soil Data section...");
  // Later we’ll make this link open the weather data section dynamically
});
