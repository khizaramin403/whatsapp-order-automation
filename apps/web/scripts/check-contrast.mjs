// Contrast check script according to DESIGN.md Section 7.2 & 7.15
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

function luminance([r, g, b]) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(hex1, hex2) {
  const lum1 = luminance(hexToRgb(hex1));
  const lum2 = luminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const pairs = [
  // Soft white / white surfaces (Page, Cards, Topbar)
  { name: 'Heading/Main Text on Soft White', fg: '#10202D', bg: '#F7F7F7', type: 'text' },
  { name: 'Heading/Main Text on White', fg: '#10202D', bg: '#FFFFFF', type: 'text' },
  { name: 'Secondary Text (Slate) on Soft White', fg: '#4A5865', bg: '#F7F7F7', type: 'text' },
  { name: 'Secondary Text (Slate) on White', fg: '#4A5865', bg: '#FFFFFF', type: 'text' },
  { name: 'Labels/Captions (Muted) on Soft White', fg: '#5F6C79', bg: '#F7F7F7', type: 'text' },
  { name: 'Labels/Captions (Muted) on White', fg: '#5F6C79', bg: '#FFFFFF', type: 'text' },
  { name: 'Gold Text on Soft White', fg: '#7D6228', bg: '#F7F7F7', type: 'text' },
  { name: 'Gold Text on White', fg: '#7D6228', bg: '#FFFFFF', type: 'text' },
  { name: 'Input Placeholder on White', fg: '#66737F', bg: '#FFFFFF', type: 'text' },
  { name: 'Focus Ring (Navy) on Soft White', fg: '#10202D', bg: '#F7F7F7', type: 'ring' },
  { name: 'Focus Ring (Navy) on White', fg: '#10202D', bg: '#FFFFFF', type: 'ring' },

  // Dark Sidebar surfaces (#10202D, #1B2D3B)
  { name: 'Sidebar Active/Heading Text on Midnight', fg: '#F7F7F7', bg: '#10202D', type: 'text' },
  { name: 'Sidebar Active Text on Midnight 800', fg: '#F7F7F7', bg: '#1B2D3B', type: 'text' },
  { name: 'Sidebar Inactive Text on Midnight', fg: '#A9B4BE', bg: '#10202D', type: 'text' },
  { name: 'Sidebar Inactive Text on Midnight 800', fg: '#A9B4BE', bg: '#1B2D3B', type: 'text' },
  { name: 'Sidebar Group Label (#7F8C98) on Midnight', fg: '#7F8C98', bg: '#10202D', type: 'text' },
  { name: 'Sidebar Active Gold Icon on Midnight 800', fg: '#C7A667', bg: '#1B2D3B', type: 'icon' },
  { name: 'Sidebar Focus Ring (Gold) on Midnight', fg: '#C7A667', bg: '#10202D', type: 'ring' },
  { name: 'Sidebar Focus Ring (Gold) on Midnight 800', fg: '#C7A667', bg: '#1B2D3B', type: 'ring' },
  { name: 'New Orders Badge Text (#10202D on Gold #C7A667)', fg: '#10202D', bg: '#C7A667', type: 'text' },

  // Tooltip (#0B1620)
  { name: 'Tooltip Text (#F7F7F7 on #0B1620)', fg: '#F7F7F7', bg: '#0B1620', type: 'text' },

  // Avatars Fallback
  { name: 'Avatar Fallback Light (#7D6228 on #F4ECDC)', fg: '#7D6228', bg: '#F4ECDC', type: 'text' },
  { name: 'Avatar Fallback Dark (#E8D9B5 on #22394B)', fg: '#E8D9B5', bg: '#22394B', type: 'text' },

  // Buttons
  { name: 'Primary Button (#F7F7F7 on #10202D)', fg: '#F7F7F7', bg: '#10202D', type: 'text' },
  { name: 'Accent Button (#10202D on #C7A667)', fg: '#10202D', bg: '#C7A667', type: 'text' },
  { name: 'Destructive Button (White on #B3392F)', fg: '#FFFFFF', bg: '#B3392F', type: 'text' },
  { name: 'Secondary Button (#10202D on White)', fg: '#10202D', bg: '#FFFFFF', type: 'text' },

  // Status Pairs (Fill & Text)
  { name: 'Status Success Text on Fill (#1F5C42 on #E6F2EC)', fg: '#1F5C42', bg: '#E6F2EC', type: 'text' },
  { name: 'Status Warning Text on Fill (#7A4E0B on #FBF0DA)', fg: '#7A4E0B', bg: '#FBF0DA', type: 'text' },
  { name: 'Status Danger Text on Fill (#8E2A22 on #F8E4E1)', fg: '#8E2A22', bg: '#F8E4E1', type: 'text' },
  { name: 'Status Info Text on Fill (#1F4C73 on #E3EDF5)', fg: '#1F4C73', bg: '#E3EDF5', type: 'text' },
  { name: 'Status Gold Text on Fill (#7D6228 on #F4ECDC)', fg: '#7D6228', bg: '#F4ECDC', type: 'text' },
  { name: 'Status Midnight Text on Fill (#10202D on #E3E8EE)', fg: '#10202D', bg: '#E3E8EE', type: 'text' },
  { name: 'Status Neutral Text on Fill (#3A4651 on #ECEEF1)', fg: '#3A4651', bg: '#ECEEF1', type: 'text' },

  // Login Brand Panel
  { name: 'Login Brand Statement (#F7F7F7 on #10202D)', fg: '#F7F7F7', bg: '#10202D', type: 'text' },
  { name: 'Login Brand Supporting (#A9B4BE on #10202D)', fg: '#A9B4BE', bg: '#10202D', type: 'text' },
  { name: 'Login Placeholder Copy (#5F6C79 on #10202D)', fg: '#5F6C79', bg: '#10202D', type: 'text' }
];

console.log('| Pair Name | Foreground | Background | Ratio | Target | Status |');
console.log('|---|---|---|---|---|---|');
let failCount = 0;
for (const p of pairs) {
  const r = contrast(p.fg, p.bg);
  const target = p.type === 'text' ? 4.5 : 3.0;
  const pass = r >= target;
  if (!pass) failCount++;
  console.log(`| ${p.name} | ${p.fg} | ${p.bg} | ${r.toFixed(2)}:1 | ${target}:1 | ${pass ? 'PASS' : 'FAIL'} |`);
}
console.log(`\nTotal checked: ${pairs.length}, Failures: ${failCount}`);
