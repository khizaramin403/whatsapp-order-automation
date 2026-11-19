import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../src");

// Match physical left/right Tailwind classes: ml-, mr-, pl-, pr-, left-, right-, text-left, text-right, etc.
// Negative lookbehind (?<![\w-]) ensures we don't match hyphenated prefixes like slide-in-from-left or data-[side=left]
const PHYSICAL_CLASS_PATTERNS = [
  { pattern: /(?<![\w-])ml-(\d+|px|auto|\[[^\]]+\])/g, suggestion: "ms-$1" },
  { pattern: /(?<![\w-])mr-(\d+|px|auto|\[[^\]]+\])/g, suggestion: "me-$1" },
  { pattern: /(?<![\w-])pl-(\d+|px|\[[^\]]+\])/g, suggestion: "ps-$1" },
  { pattern: /(?<![\w-])pr-(\d+|px|\[[^\]]+\])/g, suggestion: "pe-$1" },
  { pattern: /(?<![\w-])left-(\d+|px|auto|full|\[[^\]]+\])/g, suggestion: "start-$1" },
  { pattern: /(?<![\w-])right-(\d+|px|auto|full|\[[^\]]+\])/g, suggestion: "end-$1" },
  { pattern: /(?<![\w-])text-left\b/g, suggestion: "text-start" },
  { pattern: /(?<![\w-])text-right\b/g, suggestion: "text-end" },
  { pattern: /(?<![\w-])border-l(-\S+)?\b/g, suggestion: "border-s$1" },
  { pattern: /(?<![\w-])border-r(-\S+)?\b/g, suggestion: "border-e$1" },
  { pattern: /(?<![\w-])rounded-l(-\S+)?\b/g, suggestion: "rounded-s$1" },
  { pattern: /(?<![\w-])rounded-r(-\S+)?\b/g, suggestion: "rounded-e$1" },
];

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

let hasErrors = false;
const files = getFiles(srcDir);

console.log(`Scanning ${files.length} files in ${srcDir} for physical left/right Tailwind classes...`);

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    // Only check lines that likely contain class names or styles, skip comments explaining classes
    if (line.includes("//") && line.trim().startsWith("//")) return;
    if (line.includes("Logical Classes Layout Proof") || line.includes("Sample 1:")) return;

    for (const { pattern, suggestion } of PHYSICAL_CLASS_PATTERNS) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        // Skip if match is part of an explanation string
        if (line.includes("ml-, mr-") || line.includes("physical left/right")) continue;
        console.error(
          `\x1b[31m[RTL Warning]\x1b[0m ${path.relative(process.cwd(), filePath)}:${index + 1}`
        );
        console.error(`  Offending class: "${match[0]}" -> Use logical equivalent: "${suggestion}"`);
        console.error(`  Line: ${line.trim()}\n`);
        hasErrors = true;
      }
    }
  });
}

if (hasErrors) {
  console.error("\x1b[31mRTL check failed: physical directional Tailwind classes found.\x1b[0m");
  process.exit(1);
} else {
  console.log("\x1b[32m✔ RTL check passed: all Tailwind classes use logical properties.\x1b[0m");
  process.exit(0);
}
