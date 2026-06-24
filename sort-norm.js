const fs = require("fs");
const path = require("path");

const TAG_ALIASES = {
  // JavaScript
  js: "javascript",
  javascript: "javascript",
  "vanilla-js": "javascript",
  "vanilla-javascript": "javascript",

  // HTML / CSS
  html5: "html",
  css3: "css",

  // Open Graph / SEO
  "og-tags": "open-graph",
  og: "open-graph",
  "meta-tags": "meta-tags",

  // Common singular forms
  generators: "generator",
  validators: "validator",
  analyzers: "analyzer",
  formatters: "formatter",
  converters: "converter",
  calculators: "calculator",
  previewers: "previewer",

  // UUID
  uuids: "uuid",

  // Dev tools
  "developer-tools": "developer-tools",
  developer: "developer-tools",
  "developer-tool": "developer-tools"
};

function normalizeTag(tag) {
  const key = tag.trim().toLowerCase();
  return TAG_ALIASES[key] || key;
}

function sortObjectKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((obj, key) => {
        obj[key] = sortObjectKeys(value[key]);
        return obj;
      }, {});
  }

  return value;
}

function processData(data) {
  // Sort categories by name
  if (Array.isArray(data.categories)) {
    data.categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Sort tools by name
  if (Array.isArray(data.tools)) {
    data.tools.sort((a, b) => a.name.localeCompare(b.name));

    for (const tool of data.tools) {
      // Normalize, dedupe and sort tags
      if (Array.isArray(tool.tags)) {
        tool.tags = [...new Set(tool.tags.map(normalizeTag))].sort((a, b) => a.localeCompare(b));
      }

      // Sort tech stack
      if (Array.isArray(tool.techStack)) {
        tool.techStack.sort((a, b) => a.localeCompare(b));
      }
    }
  }

  return data;
}

const file = process.argv[2];

if (!file) {
  console.error("Usage: node normalize-tools.js <file.json>");
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));

const output = sortObjectKeys(processData(json));

fs.writeFileSync(file, JSON.stringify(output, null, 2) + "\n", "utf8");

console.log(`✓ Normalized and sorted: ${file}`);
