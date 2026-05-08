import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const providersPath = path.join(rootDir, "data", "providers.json");

const allowedProtocols = new Set(["openai-compatible", "anthropic-compatible"]);
const allowedProviderTypes = new Set(["model-provider", "cloud-platform"]);
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function readProviders() {
  try {
    return JSON.parse(fs.readFileSync(providersPath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read ${path.relative(rootDir, providersPath)}: ${error.message}`);
  }
}

function normalizeIdentity(value) {
  return String(value)
    .trim()
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeDomain(value) {
  return String(value).trim().toLowerCase().replace(/\.+$/g, "");
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";
  url.search = "";
  return url.toString().replace(/\/+$/, "");
}

function isValidDate(value) {
  if (!datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return parsed.toISOString().slice(0, 10) === value;
}

function validateUrl(errors, label, value, { requireHttps = true } = {}) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label} must be a non-empty string.`);
    return null;
  }

  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) {
      errors.push(`${label} must use http or https.`);
    }
    if (requireHttps && url.protocol !== "https:") {
      errors.push(`${label} must use https.`);
    }
    return url;
  } catch {
    errors.push(`${label} must be a valid URL.`);
    return null;
  }
}

function validateProviderShape(errors, provider, index) {
  const prefix = `providers[${index}]`;

  if (!provider || typeof provider !== "object" || Array.isArray(provider)) {
    errors.push(`${prefix} must be an object.`);
    return;
  }

  const allowedKeys = new Set(["id", "name", "providerType", "popularityRank", "aliases", "website", "domains", "endpoints"]);
  for (const key of Object.keys(provider)) {
    if (!allowedKeys.has(key)) errors.push(`${prefix}.${key} is not allowed.`);
  }

  if (typeof provider.id !== "string" || !idPattern.test(provider.id)) {
    errors.push(`${prefix}.id must be kebab-case lowercase ASCII.`);
  }
  if (typeof provider.name !== "string" || provider.name.trim() === "") {
    errors.push(`${prefix}.name must be a non-empty string.`);
  }
  if (!allowedProviderTypes.has(provider.providerType)) {
    errors.push(`${prefix}.providerType must be one of: ${Array.from(allowedProviderTypes).join(", ")}.`);
  }
  if (!Number.isInteger(provider.popularityRank) || provider.popularityRank < 1) {
    errors.push(`${prefix}.popularityRank must be a positive integer.`);
  }
  if (!Array.isArray(provider.aliases)) {
    errors.push(`${prefix}.aliases must be an array.`);
  }
  if (!Array.isArray(provider.domains) || provider.domains.length === 0) {
    errors.push(`${prefix}.domains must be a non-empty array.`);
  }
  if (!Array.isArray(provider.endpoints) || provider.endpoints.length === 0) {
    errors.push(`${prefix}.endpoints must be a non-empty array.`);
  }

  validateUrl(errors, `${prefix}.website`, provider.website);
}

function validateEndpointShape(errors, endpoint, provider, index) {
  const prefix = `${provider.id}.endpoints[${index}]`;

  if (!endpoint || typeof endpoint !== "object" || Array.isArray(endpoint)) {
    errors.push(`${prefix} must be an object.`);
    return;
  }

  const allowedKeys = new Set(["id", "protocol", "baseUrl", "source", "lastVerified", "notes", "notesZh"]);
  for (const key of Object.keys(endpoint)) {
    if (!allowedKeys.has(key)) errors.push(`${prefix}.${key} is not allowed.`);
  }

  if (typeof endpoint.id !== "string" || !idPattern.test(endpoint.id)) {
    errors.push(`${prefix}.id must be kebab-case lowercase ASCII.`);
  }
  if (!allowedProtocols.has(endpoint.protocol)) {
    errors.push(`${prefix}.protocol must be one of: ${Array.from(allowedProtocols).join(", ")}.`);
  }
  validateUrl(errors, `${prefix}.baseUrl`, endpoint.baseUrl);
  validateUrl(errors, `${prefix}.source`, endpoint.source);

  if (typeof endpoint.lastVerified !== "string" || !isValidDate(endpoint.lastVerified)) {
    errors.push(`${prefix}.lastVerified must be a valid YYYY-MM-DD date.`);
  }
  if (typeof endpoint.notes !== "string") {
    errors.push(`${prefix}.notes must be a string.`);
  }
  if (typeof endpoint.notesZh !== "string") {
    errors.push(`${prefix}.notesZh must be a string.`);
  }
}

function validateUniqueIndexes(errors, providers) {
  const identityIndex = new Map();
  const domainIndex = new Map();
  const baseUrlIndex = new Map();
  const providerIdIndex = new Map();

  for (const provider of providers) {
    if (!provider || typeof provider !== "object") continue;

    if (typeof provider.id === "string") {
      if (providerIdIndex.has(provider.id)) {
        errors.push(`Duplicate provider id "${provider.id}" also used by ${providerIdIndex.get(provider.id)}.`);
      } else {
        providerIdIndex.set(provider.id, provider.id);
      }
    }

    const identities = [provider.id, provider.name, ...(Array.isArray(provider.aliases) ? provider.aliases : [])];
    for (const identity of identities) {
      const normalized = normalizeIdentity(identity);
      if (!normalized) continue;

      const existing = identityIndex.get(normalized);
      if (existing && existing !== provider.id) {
        errors.push(`Duplicate provider identity "${identity}" maps to "${normalized}", already used by ${existing}.`);
      } else {
        identityIndex.set(normalized, provider.id);
      }
    }

    if (Array.isArray(provider.domains)) {
      for (const domain of provider.domains) {
        const normalized = normalizeDomain(domain);
        if (!normalized) {
          errors.push(`${provider.id}.domains contains an empty domain.`);
          continue;
        }

        const existing = domainIndex.get(normalized);
        if (existing && existing !== provider.id) {
          errors.push(`Duplicate domain "${normalized}" used by both ${existing} and ${provider.id}.`);
        } else {
          domainIndex.set(normalized, provider.id);
        }
      }
    }

    const endpointIds = new Set();
    if (Array.isArray(provider.endpoints)) {
      for (const endpoint of provider.endpoints) {
        if (!endpoint || typeof endpoint !== "object") continue;

        if (typeof endpoint.id === "string") {
          if (endpointIds.has(endpoint.id)) {
            errors.push(`Duplicate endpoint id "${endpoint.id}" inside ${provider.id}.`);
          }
          endpointIds.add(endpoint.id);
        }

        if (typeof endpoint.baseUrl === "string") {
          try {
            const normalized = normalizeUrl(endpoint.baseUrl);
            const existing = baseUrlIndex.get(normalized);
            if (existing && existing.providerId !== provider.id) {
              errors.push(`Duplicate baseUrl "${normalized}" used by both ${existing.providerId} and ${provider.id}.`);
            } else if (existing) {
              errors.push(`Duplicate baseUrl "${normalized}" appears more than once in ${provider.id}.`);
            } else {
              baseUrlIndex.set(normalized, { providerId: provider.id, endpointId: endpoint.id });
            }
          } catch {
            // Shape validation already reports the invalid URL.
          }
        }
      }
    }
  }
}

function main() {
  const errors = [];
  const providers = readProviders();

  if (!Array.isArray(providers)) {
    errors.push("data/providers.json must contain an array.");
  } else {
    providers.forEach((provider, index) => {
      validateProviderShape(errors, provider, index);
      if (provider && Array.isArray(provider.endpoints)) {
        provider.endpoints.forEach((endpoint, endpointIndex) => validateEndpointShape(errors, endpoint, provider, endpointIndex));
      }
    });
    validateUniqueIndexes(errors, providers);
  }

  if (errors.length > 0) {
    console.error("Registry validation failed:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Registry validation passed (${providers.length} providers).`);
}

main();
