// One-off generator for placeholder product imagery (runs at dev time, not in the app).
// Produces elegant 4:5 SVGs (1200x1500) in public/products/.
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "products");
fs.mkdirSync(outDir, { recursive: true });

const products = [
  ["rice-water-cleanser", "Rice Water", "Gentle Cleanser", ["#F3E9DC", "#DCC7AE", "#B99A5F"]],
  ["jasmine-dew-serum", "Jasmine Dew", "Hydrating Serum", ["#EFF3EC", "#C7D3C0", "#7C8B76"]],
  ["moringa-recovery-cream", "Moringa", "Recovery Cream", ["#F0EAE2", "#D3C2B4", "#8A7360"]],
  ["palm-sugar-enzyme-mask", "Palm Sugar", "Enzyme Mask", ["#F5EBE0", "#E0C9B1", "#B08A80"]],
  ["frangipani-silk-spf", "Frangipani Silk", "Sheer SPF 40", ["#F2EEE8", "#D8CFC2", "#A89B8C"]],
  ["lemongrass-toner", "Lemongrass", "Balancing Toner", ["#EDF2E6", "#BFCDB4", "#7C8B76"]],
  ["angkor-dawn-edp", "№ 1", "Angkor Dawn", ["#F6E7D8", "#E3B78E", "#B99A5F"]],
  ["mekong-dusk-edp", "№ 2", "Mekong Dusk", ["#E8D9D6", "#C99A9C", "#8D5A5F"]],
  ["rice-and-rain-edp", "№ 3", "Rice & Rain", ["#E6E9E2", "#AEBDA8", "#6E7D68"]],
  ["discovery-set", "Discovery", "Three Rituals", ["#F1EBE4", "#CBB9A5", "#8A7360"]],
  ["frangipani-candle", "Frangipani", "& Smoke Candle", ["#EFE7DC", "#D6C2AB", "#9A7B5F"]],
  ["jasmine-body-mist", "Jasmine", "Hair & Body Mist", ["#F0EDE7", "#CFC9BE", "#98908A"]],
];

const svg = ([slug, line1, line2, [a, b, c]]) => {
  const num = slug.replace(/-/g, " ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500" role="img" aria-label="${line1} ${line2}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="55%" stop-color="${b}"/>
      <stop offset="100%" stop-color="${c}"/>
    </linearGradient>
    <linearGradient id="bottle" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.92)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.55)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1500" fill="url(#bg)"/>
  <circle cx="960" cy="270" r="330" fill="rgba(255,255,255,0.16)"/>
  <circle cx="180" cy="1290" r="260" fill="rgba(28,31,38,0.06)"/>
  <g transform="translate(600 760)">
    <rect x="-150" y="-320" width="300" height="640" rx="26" fill="url(#bottle)" stroke="rgba(28,31,38,0.16)" stroke-width="3"/>
    <rect x="-62" y="-436" width="124" height="120" rx="14" fill="rgba(28,31,38,0.82)"/>
    <rect x="-110" y="-140" width="220" height="280" rx="10" fill="rgba(247,243,238,0.94)" stroke="rgba(28,31,38,0.12)" stroke-width="2"/>
    <text x="0" y="-58" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="52" fill="#1C1F26">${line1}</text>
    <text x="0" y="6" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" font-style="italic" fill="#4A4F5A">${line2}</text>
    <line x1="-62" y1="52" x2="62" y2="52" stroke="#B99A5F" stroke-width="2"/>
    <text x="0" y="102" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="10" fill="#4A4F5A">AURELIA</text>
  </g>
  <text x="600" y="1408" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" letter-spacing="14" fill="rgba(28,31,38,0.55)">RITUALS FOR SKIN AND SENSES</text>
</svg>
`;
};

for (const p of products) {
  fs.writeFileSync(path.join(outDir, `${p[0]}.svg`), svg(p));
}
console.log(`Wrote ${products.length} placeholder SVGs to ${outDir}`);
