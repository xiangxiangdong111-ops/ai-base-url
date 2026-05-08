const translations = {
  en: {
    documentTitle: "AI Base URL Directory",
    eyebrow: "Verified endpoint list",
    languageSwitcher: "Language switcher",
    openGithub: "Open GitHub repository",
    loadingProviders: "Loading providers...",
    filterTitle: "Refine",
    protocolFilter: "Protocol filter",
    providerTypeFilter: "Provider type filter",
    tabAll: "All",
    protocolAll: "All protocols",
    typeTabAll: "All types",
    resetFilters: "Reset",
    searchLabel: "Search",
    searchPlaceholder: "Provider, alias, domain, or base URL",
    baseUrlRegistry: "Base URL list",
    columnProvider: "Provider",
    columnProtocol: "Protocol",
    columnNotes: "Endpoint Notes",
    columnVerified: "Verified",
    columnSource: "Source",
    columnCopy: "Copy URL",
    noMatches: "No matches.",
    shownCount: "{shown} / {total}",
    aliases: "Aliases",
    officialSource: "Official",
    copy: "Copy",
    copied: "Copied",
    failedLoad: "Failed to load provider list data",
    cannotLoadProviders: "Cannot load providers.json: {status}",
    protocolOpenAI: "OpenAI",
    protocolAnthropic: "Anthropic",
    endpointCount: "{count} endpoints",
    groupModelProviders: "Model Providers",
    groupCloudPlatforms: "Cloud Platforms",
    providerTypeModelProvider: "Model API",
    providerTypeCloudPlatform: "Cloud"
  },
  "zh-CN": {
    documentTitle: "AI Base URL 列表",
    eyebrow: "可信 API endpoint 列表",
    languageSwitcher: "语言切换",
    openGithub: "打开 GitHub 仓库",
    loadingProviders: "正在加载平台...",
    filterTitle: "检索条件",
    protocolFilter: "协议筛选",
    providerTypeFilter: "平台类型筛选",
    tabAll: "全部",
    protocolAll: "全部协议",
    typeTabAll: "全部类型",
    resetFilters: "重置",
    searchLabel: "搜索",
    searchPlaceholder: "平台、别名、域名或 Base URL",
    baseUrlRegistry: "Base URL 列表",
    columnProvider: "平台",
    columnProtocol: "协议",
    columnNotes: "端点说明",
    columnVerified: "验证日期",
    columnSource: "来源",
    columnCopy: "复制 URL",
    noMatches: "无匹配",
    shownCount: "{shown} / {total}",
    aliases: "别名",
    officialSource: "官方",
    copy: "复制",
    copied: "已复制",
    failedLoad: "加载平台列表数据失败",
    cannotLoadProviders: "无法加载 providers.json：{status}",
    protocolOpenAI: "OpenAI",
    protocolAnthropic: "Anthropic",
    endpointCount: "{count} 条 endpoint",
    groupModelProviders: "模型厂商",
    groupCloudPlatforms: "云平台",
    providerTypeModelProvider: "模型 API",
    providerTypeCloudPlatform: "云平台"
  }
};

const state = {
  providers: [],
  protocol: "all",
  providerGroup: "all",
  query: "",
  locale: initialLocale(),
  loadError: null
};

const providerGroupOrder = {
  "model-provider": 0,
  "cloud-platform": 1
};

const rowsEl = document.querySelector("#provider-rows");
const countEl = document.querySelector("#registry-count");
const searchEl = document.querySelector("#search-input");
const protocolFilterEl = document.querySelector("#protocol-filter");
const providerGroupFilterEl = document.querySelector("#provider-group-filter");
const resetFiltersEl = document.querySelector("#reset-filters");
const languageButtons = Array.from(document.querySelectorAll(".language-button"));

function initialLocale() {
  const savedLocale = localStorage.getItem("ai-base-url-locale");
  if (savedLocale && translations[savedLocale]) {
    return savedLocale;
  }
  return navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

function t(key, values = {}) {
  const copy = translations[state.locale] || translations.en;
  const value = key.split(".").reduce((current, part) => current?.[part], copy) ?? key;
  return String(value).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function providerMeta(provider) {
  return {
    group: provider.providerType || "model-provider",
    popularity: Number.isInteger(provider.popularityRank) ? provider.popularityRank : 999
  };
}

function compareProviders(left, right) {
  const leftMeta = providerMeta(left);
  const rightMeta = providerMeta(right);
  const groupDelta = (providerGroupOrder[leftMeta.group] ?? 99) - (providerGroupOrder[rightMeta.group] ?? 99);
  if (groupDelta !== 0) {
    return groupDelta;
  }

  const popularityDelta = leftMeta.popularity - rightMeta.popularity;
  if (popularityDelta !== 0) {
    return popularityDelta;
  }

  return left.name.localeCompare(right.name, "en", { sensitivity: "base" });
}

function providerGroupLabel(group) {
  if (group === "cloud-platform") {
    return t("groupCloudPlatforms");
  }
  return t("groupModelProviders");
}

function providerTypeLabel(group) {
  if (group === "cloud-platform") {
    return t("providerTypeCloudPlatform");
  }
  return t("providerTypeModelProvider");
}

function endpointRecords() {
  return state.providers.flatMap((provider) =>
    (provider.endpoints || []).map((endpoint) => ({ provider, endpoint }))
  );
}

function providerSearchText(provider, endpoint) {
  const meta = providerMeta(provider);
  return [
    provider.id,
    provider.name,
    providerGroupLabel(meta.group),
    providerTypeLabel(meta.group),
    ...(provider.aliases || []),
    ...(provider.domains || []),
    provider.website,
    endpoint.protocol,
    endpoint.baseUrl,
    endpoint.source,
    endpoint.notes
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filteredRecords() {
  return endpointRecords().filter(({ provider, endpoint }) => {
    const matchesProtocol = state.protocol === "all" || endpoint.protocol === state.protocol;
    const matchesProviderGroup = state.providerGroup === "all" || providerMeta(provider).group === state.providerGroup;
    const matchesQuery = !state.query || providerSearchText(provider, endpoint).includes(state.query);
    return matchesProtocol && matchesProviderGroup && matchesQuery;
  });
}

function groupedRecords() {
  const groups = [];
  for (const record of filteredRecords()) {
    const currentGroup = groups[groups.length - 1];
    if (currentGroup && currentGroup.provider.id === record.provider.id) {
      currentGroup.records.push(record);
      continue;
    }
    groups.push({ provider: record.provider, records: [record] });
  }
  return groups;
}

function protocolLabel(protocol) {
  if (protocol === "openai-compatible") {
    return t("protocolOpenAI");
  }
  if (protocol === "anthropic-compatible") {
    return t("protocolAnthropic");
  }
  return protocol;
}

function endpointNote(endpoint) {
  if (state.locale === "zh-CN") {
    return endpoint.notesZh || endpoint.notes || "-";
  }
  return endpoint.notes || endpoint.notesZh || "-";
}

function applyTranslations() {
  document.documentElement.lang = state.locale;
  document.title = t("documentTitle");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });

  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === state.locale);
  });

  syncFilterControls();

  if (state.loadError) {
    rowsEl.innerHTML = `<tr><td class="empty-row" colspan="7">${state.loadError}</td></tr>`;
    countEl.textContent = t("failedLoad");
    return;
  }

  countEl.textContent = t("loadingProviders");
  renderRows();
}

function renderRows() {
  const records = filteredRecords();
  const groups = groupedRecords();
  rowsEl.innerHTML = "";

  if (records.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "empty-row";
    cell.colSpan = 7;
    cell.textContent = t("noMatches");
    row.append(cell);
    rowsEl.append(row);
  } else {
    let activeSection = "";
    for (const group of groups) {
      const section = providerMeta(group.provider).group;
      if (section !== activeSection) {
        activeSection = section;
        const sectionRow = document.createElement("tr");
        sectionRow.className = "section-row";
        const sectionCell = document.createElement("td");
        sectionCell.colSpan = 7;
        sectionCell.textContent = providerGroupLabel(section);
        sectionRow.append(sectionCell);
        rowsEl.append(sectionRow);
      }

      group.records.forEach(({ provider, endpoint }, index) => {
        const row = document.createElement("tr");
        row.className = "provider-row";
        if (index === 0) {
          row.classList.add("group-start");
        }
        if (index === group.records.length - 1) {
          row.classList.add("group-end");
        }

        if (index === 0) {
          const aliases = provider.aliases?.length ? provider.aliases.slice(0, 4).join(", ") : "";
          const meta = providerMeta(provider);
          const providerCell = document.createElement("td");
          providerCell.className = "provider-cell";
          providerCell.rowSpan = group.records.length;
          providerCell.innerHTML = `
            <div class="provider-summary">
              <div>
                <div class="provider-heading">
                  <span class="provider-name"></span>
                  <span class="provider-badge"></span>
                </div>
                <span class="aliases"></span>
              </div>
              <span class="provider-count"></span>
            </div>
          `;
          providerCell.querySelector(".provider-name").textContent = provider.name;
          providerCell.querySelector(".provider-badge").textContent = providerTypeLabel(meta.group);
          providerCell.querySelector(".provider-badge").classList.add(`is-${meta.group}`);
          providerCell.querySelector(".aliases").textContent = aliases ? `${t("aliases")}: ${aliases}` : "";
          providerCell.querySelector(".provider-count").textContent = t("endpointCount", {
            count: group.records.length
          });
          row.append(providerCell);
        }

        const protocolCell = document.createElement("td");
        const protocolPill = document.createElement("span");
        protocolPill.className = `protocol-pill ${endpoint.protocol}`;
        protocolPill.textContent = protocolLabel(endpoint.protocol);
        protocolCell.append(protocolPill);

        const baseUrlCell = document.createElement("td");
        const baseUrlText = document.createElement("span");
        baseUrlText.className = "code-text";
        baseUrlText.textContent = endpoint.baseUrl;
        baseUrlCell.append(baseUrlText);

        const notesCell = document.createElement("td");
        const notesWrap = document.createElement("div");
        const notesText = document.createElement("span");
        const notesTooltip = document.createElement("span");
        const fullNote = endpointNote(endpoint);
        notesWrap.className = "note-wrap";
        notesWrap.tabIndex = 0;
        notesText.className = "note-text";
        notesTooltip.className = "note-tooltip";
        notesText.textContent = fullNote;
        notesTooltip.textContent = fullNote;
        notesWrap.addEventListener("mouseenter", () => notesWrap.classList.add("is-active"));
        notesWrap.addEventListener("mouseleave", () => notesWrap.classList.remove("is-active"));
        notesWrap.addEventListener("focus", () => notesWrap.classList.add("is-active"));
        notesWrap.addEventListener("blur", () => notesWrap.classList.remove("is-active"));
        notesWrap.append(notesText, notesTooltip);
        notesCell.append(notesWrap);

        const verifiedCell = document.createElement("td");
        verifiedCell.className = "verified-cell";
        verifiedCell.textContent = endpoint.lastVerified;

        const sourceCell = document.createElement("td");
        sourceCell.className = "source-cell";
        const sourceLink = document.createElement("a");
        sourceLink.className = "source-link";
        sourceLink.href = endpoint.source;
        sourceLink.target = "_blank";
        sourceLink.rel = "noreferrer";
        sourceLink.textContent = t("officialSource");
        sourceCell.append(sourceLink);

        const copyCell = document.createElement("td");
        copyCell.className = "copy-cell";
        const copyButton = document.createElement("button");
        copyButton.className = "copy-button";
        copyButton.type = "button";
        copyButton.textContent = t("copy");
        copyButton.addEventListener("click", async (event) => {
          await navigator.clipboard.writeText(endpoint.baseUrl);
          event.currentTarget.textContent = t("copied");
          setTimeout(() => {
            event.currentTarget.textContent = t("copy");
          }, 1200);
        });
        copyCell.append(copyButton);

        row.append(protocolCell, baseUrlCell, notesCell, verifiedCell, sourceCell, copyCell);
        rowsEl.append(row);
      });
    }
  }

  countEl.textContent = t("shownCount", {
    shown: records.length,
    total: endpointRecords().length
  });

  syncFilterControls();
}

function syncFilterControls() {
  protocolFilterEl.value = state.protocol;
  providerGroupFilterEl.value = state.providerGroup;
  resetFiltersEl.disabled = state.protocol === "all" && state.providerGroup === "all" && !state.query;
}

async function loadProviders() {
  const response = await fetch("providers.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(t("cannotLoadProviders", { status: response.status }));
  }
  state.providers = (await response.json()).slice().sort(compareProviders);
  renderRows();
}

protocolFilterEl.addEventListener("change", () => {
  state.protocol = protocolFilterEl.value;
  renderRows();
});

providerGroupFilterEl.addEventListener("change", () => {
  state.providerGroup = providerGroupFilterEl.value;
  renderRows();
});

resetFiltersEl.addEventListener("click", () => {
  state.protocol = "all";
  state.providerGroup = "all";
  state.query = "";
  searchEl.value = "";
  renderRows();
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.locale = button.dataset.lang;
    localStorage.setItem("ai-base-url-locale", state.locale);
    applyTranslations();
  });
});

searchEl.addEventListener("input", () => {
  state.query = searchEl.value.trim().toLowerCase();
  renderRows();
});

applyTranslations();

loadProviders().catch((error) => {
  state.loadError = error.message;
  rowsEl.innerHTML = `<tr><td class="empty-row" colspan="7">${error.message}</td></tr>`;
  countEl.textContent = t("failedLoad");
});
