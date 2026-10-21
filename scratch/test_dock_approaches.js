// Test script to compare dock approaches
const fs = require('fs');

console.log('Testing dock calculation logic...');

const desktop = {
  nav: { left: 14, top: 10, width: 105.5, height: 21.6 },
  hero: { left: 14, top: 117, width: 580, height: 95.6 }
};

const mobile = {
  nav: { left: 18, top: 22.2, width: 93.8, height: 19.6 },
  hero: { left: 14, top: 147.9, width: 362, height: 59.7 }
};

for (const [mode, data] of Object.entries({ desktop, mobile })) {
  const deltaX = data.hero.left - data.nav.left;
  const deltaY = data.hero.top - data.nav.top;
  const scale = data.hero.width / data.nav.width;
  console.log(`--- ${mode.toUpperCase()} ---`);
  console.log(`deltaX: ${deltaX.toFixed(1)}px, deltaY: ${deltaY.toFixed(1)}px, scale: ${scale.toFixed(2)}`);
  
  // At scrollY = 0
  console.log(`scrollY = 0: y=${deltaY.toFixed(1)}, scale=${scale.toFixed(2)}`);
  // At scrollY = deltaY / 2
  const halfY = deltaY / 2;
  const p = halfY / deltaY;
  const curY = deltaY - halfY;
  const curScale = 1 + (scale - 1) * (1 - p);
  console.log(`scrollY = ${halfY.toFixed(1)}: y=${curY.toFixed(1)}, scale=${curScale.toFixed(2)}`);
  // At scrollY = deltaY
  console.log(`scrollY = ${deltaY.toFixed(1)}: y=0, scale=1.00 (DOCKED)`);
}
