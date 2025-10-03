function getRadarConfig() {
  let w = window.innerWidth; 
  let h = window.innerHeight;

  if (w >= 1200) {
    // Desktop
    return { width: 1450, height: 1000, scale: 0.6 };
  } else if (w >= 768) {
    // Tablet
    return { width: 1450, height: 1000, scale: 0.45 };
  } else {
    // Mobile
    return { width: 1450, height: 1000, scale: 0.2 };
  }
}

function radar_visualization(config) {
 
}