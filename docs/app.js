const translations = {
  en: {
    documentTitle: "AI Base URL Directory",
    eyebrow: "Verified endpoint list",
    languageSwitcher: "Language switcher",
    openGithub: "Open GitHub repository",
    loadingProviders: "Loading providers...",
    protocolFilter: "Protocol filter",
    tabAll: "All",
    searchLabel: "Search",
    searchPlaceholder: "Provider, alias, domain, or base URL",
    baseUrlRegistry: "Base URL list",
    columnProvider: "Provider",
    columnProtocol: "Protocol",
    columnVerified: "Verified",
    columnSource: "Source",
    columnCopy: "Copy",
    noMatches: "No matches.",
    shownCount: "{shown} / {total}",
    aliases: "Aliases",
    docs: "docs",
    copy: "Copy",
    copied: "Copied",
    failedLoad: "Failed to load provider list data",
    cannotLoadProviders: "Cannot load providers.json: {status}",
    protocolOpenAI: "OpenAI",
    protocolAnthropic: "Anthropic"
  },
  "zh-CN": {
    documentTitle: "AI Base URL 列表",
    eyebrow: "可信 API endpoint 列表",
    languageSwitcher: "语言切换",
    openGithub: "打开 GitHub 仓库",
    loadingProviders: "正在加载平台...",
    protocolFilter: "协议筛选",
    tabAll: "全部",
    searchLabel: "搜索",
    searchPlaceholder: "平台、别名、域名或 Base URL",
    baseUrlRegistry: "Base URL 列表",
    columnProvider: "平台",
    columnProtocol: "协议",
    columnVerified: "验证日期",
    columnSource: "来源",
    columnCopy: "复制",
    noMatches: "无匹配",
    shownCount: "{shown} / {total}",
    aliases: "别名",
    docs: "文档",
    copy: "复制",
    copied: "已复制",
    failedLoad: "加载平台列表数据失败",
    cannotLoadProviders: "无法加载 providers.json：{status}",
    protocolOpenAI: "OpenAI",
    protocolAnthropic: "Anthropic"
  }
};

const state = {
  providers: [],
  protocol: "all",
  query: "",
  locale: initialLocale(),
  loadError: null
};

const rowsEl = document.querySelector("#provider-rows");
const countEl = document.querySelector("#registry-count");
const searchEl = document.querySelector("#search-input");
const tabs = Array.from(document.querySelectorAll(".tab"));
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

function endpointRecords() {
  return state.providers.flatMap((provider) =>
    (provider.endpoints || []).map((endpoint) => ({ provider, endpoint }))
  );
}

function providerSearchText(provider, endpoint) {
  return [
    provider.id,
    provider.name,
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
    const matchesQuery = !state.query || providerSearchText(provider, endpoint).includes(state.query);
    return matchesProtocol && matchesQuery;
  });
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

  if (state.loadError) {
    rowsEl.innerHTML = `<tr><td class="empty-row" colspan="6">${state.loadError}</td></tr>`;
    countEl.textContent = t("failedLoad");
    return;
  }

  countEl.textContent = t("loadingProviders");
  renderRows();
}

function renderRows() {
  const records = filteredRecords();
  rowsEl.innerHTML = "";

  if (records.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "empty-row";
    cell.colSpan = 6;
    cell.textContent = t("noMatches");
    row.append(cell);
    rowsEl.append(row);
  } else {
    for (const { provider, endpoint } of records) {
      const row = document.createElement("tr");
      const aliases = provider.aliases?.length ? provider.aliases.slice(0, 3).join(", ") : "";

      row.innerHTML = `
        <td><span class="provider-name"></span><span class="aliases"></span></td>
        <td><span class="protocol-pill ${endpoint.protocol}"></span></td>
        <td><span class="code-text"></span></td>
        <td></td>
        <td><a target="_blank" rel="noreferrer"></a></td>
        <td><button class="copy-button" type="button"></button></td>
      `;

      row.querySelector(".provider-name").textContent = provider.name;
      row.querySelector(".aliases").textContent = aliases ? `${t("aliases")}: ${aliases}` : "";
      row.querySelector(".protocol-pill").textContent = protocolLabel(endpoint.protocol);
      row.querySelector(".code-text").textContent = endpoint.baseUrl;
      row.children[3].textContent = endpoint.lastVerified;
      row.querySelector("a").href = endpoint.source;
      row.querySelector("a").textContent = t("docs");
      row.querySelector(".copy-button").textContent = t("copy");
      row.querySelector(".copy-button").addEventListener("click", async (event) => {
        await navigator.clipboard.writeText(endpoint.baseUrl);
        event.currentTarget.textContent = t("copied");
        setTimeout(() => {
          event.currentTarget.textContent = t("copy");
        }, 1200);
      });

      rowsEl.append(row);
    }
  }

  countEl.textContent = t("shownCount", {
    shown: records.length,
    total: endpointRecords().length
  });
}

async function loadProviders() {
  const response = await fetch("providers.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(t("cannotLoadProviders", { status: response.status }));
  }
  state.providers = await response.json();
  renderRows();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.protocol = tab.dataset.protocol;
    tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    renderRows();
  });
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
  rowsEl.innerHTML = `<tr><td class="empty-row" colspan="6">${error.message}</td></tr>`;
  countEl.textContent = t("failedLoad");
});
