import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const providersPath = path.join(rootDir, "data", "providers.json");
const docsDataPath = path.join(rootDir, "docs", "providers.json");
const checkMode = process.argv.includes("--check");

function readProviders() {
  return JSON.parse(fs.readFileSync(providersPath, "utf8"));
}

function normalizeForDocs(providers) {
  return `${JSON.stringify(providers, null, 2)}\n`;
}

function assertFileMatches(filePath, expected) {
  const relative = path.relative(rootDir, filePath);
  if (!fs.existsSync(filePath)) {
    console.error(`${relative} does not exist. Run npm run generate.`);
    process.exit(1);
  }

  const actual = fs.readFileSync(filePath, "utf8");
  if (actual !== expected) {
    console.error(`${relative} is out of date. Run npm run generate.`);
    process.exit(1);
  }
}

function main() {
  const providers = readProviders();
  const docsData = normalizeForDocs(providers);

  if (checkMode) {
    assertFileMatches(docsDataPath, docsData);
    console.log("docs/providers.json is up to date.");
    return;
  }

  fs.mkdirSync(path.dirname(docsDataPath), { recursive: true });
  fs.writeFileSync(docsDataPath, docsData);
  console.log("Generated docs/providers.json from data/providers.json.");
}

main();