const appState = {
  tools: [],
  partners: [],
  tagStyles: {},
  activeCategory: "todos",
  activeJourney: "todos",
  query: "",
  currentTool: null,
  theme: null,
  fontScale: "normal",
  lastTriggerElement: null,
  focusableSelectors: [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(","),
  uiStorage: createSafeStorage()
};

const dom = {
  html: document.documentElement,
  body: document.body,
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("buscaFerramenta"),
  clearSearchButton: document.getElementById("clearSearchButton"),
  googleFallbackButton: document.getElementById("googleFallbackButton"),
  cardsGrid: document.getElementById("cardsGrid"),
  emptyState: document.getElementById("emptyState"),
  resultCount: document.getElementById("resultCount"),
  journeyFilters: document.getElementById("journeyFilters"),
  categoryFilters: document.getElementById("categoryFilters"),
  partnersList: document.getElementById("partnersList"),
  themeToggle: document.querySelector("[data-theme-toggle]"),
  fontToggle: document.querySelector("[data-font-toggle]"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  modalPanel: document.getElementById("toolModal"),
  modalClose: document.getElementById("modalClose"),
  modalTitle: document.getElementById("modalTitle"),
  modalCategory: document.getElementById("modalCategory"),
  modalDor: document.getElementById("modalDor"),
  modalDescription: document.getElementById("modalDescription"),
  modalBestFor: document.getElementById("modalBestFor"),
  modalScenario: document.getElementById("modalScenario"),
  modalCuidado: document.getElementById("modalCuidado"),
  modalJourney: document.getElementById("modalJourney"),
  modalUrgency: document.getElementById("modalUrgency"),
  modalTags: document.getElementById("modalTags"),
  modalVisitLink: document.getElementById("modalVisitLink"),
  modalShare: document.getElementById("modalShare")
};

document.addEventListener("DOMContentLoaded", () => {
  ensureModalAccessibilityAttributes();
  setupTheme();
  setupFontScale();
  bindEvents();
  loadData();
});

function createSafeStorage() {
  const memoryStore = new Map();

  return {
    get(key) {
      try {
        const value = window.localStorage.getItem(key);
        return value !== null ? value : memoryStore.get(key) || null;
      } catch (error) {
        return memoryStore.get(key) || null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        memoryStore.set(key, value);
        return false;
      }
      memoryStore.set(key, value);
      return true;
    }
  };
}

function ensureModalAccessibilityAttributes() {
  if (dom.modalBackdrop) {
    dom.modalBackdrop.setAttribute("aria-hidden", "true");
    dom.modalBackdrop.hidden = true;
  }

  if (dom.modalPanel && !dom.modalPanel.hasAttribute("tabindex")) {
    dom.modalPanel.setAttribute("tabindex", "-1");
  }

  dom.body.classList.remove("modal-open");
}

function setupTheme() {
  const savedTheme = appState.uiStorage.get("ccb-theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  appState.theme = savedTheme || (systemPrefersDark ? "dark" : "light");
  dom.html.setAttribute("data-theme", appState.theme);
}

function toggleTheme() {
  appState.theme = appState.theme === "dark" ? "light" : "dark";
  dom.html.setAttribute("data-theme", appState.theme);
  appState.uiStorage.set("ccb-theme", appState.theme);
}

function setupFontScale() {
  const savedScale = appState.uiStorage.get("ccb-font-scale");
  appState.fontScale = savedScale === "large" ? "large" : "normal";
  dom.html.setAttribute("data-font-scale", appState.fontScale);
}

function toggleFontScale() {
  appState.fontScale = appState.fontScale === "normal" ? "large" : "normal";
  dom.html.setAttribute("data-font-scale", appState.fontScale);
  appState.uiStorage.set("ccb-font-scale", appState.fontScale);
}

function bindEvents() {
  if (dom.themeToggle) {
    dom.themeToggle.addEventListener("click", toggleTheme);
  }

  if (dom.fontToggle) {
    dom.fontToggle.addEventListener("click", toggleFontScale);
  }

  if (dom.searchForm) {
    dom.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      appState.query = dom.searchInput.value.trim().toLowerCase();
      renderTools();
    });
  }

  if (dom.searchInput) {
    dom.searchInput.addEventListener("input", () => {
      appState.query = dom.searchInput.value.trim().toLowerCase();
      renderTools();
    });
  }

  if (dom.clearSearchButton) {
    dom.clearSearchButton.addEventListener("click", () => {
      if (dom.searchInput) {
        dom.searchInput.value = "";
        dom.searchInput.focus();
      }
      appState.query = "";
      renderTools();
    });
  }

  if (dom.googleFallbackButton) {
    dom.googleFallbackButton.addEventListener("click", () => {
      const fallbackTerm = dom.searchInput && dom.searchInput.value.trim()
        ? dom.searchInput.value.trim()
        : "ferramentas úteis produtividade IA design estudo";
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(fallbackTerm)}`;
      window.open(googleUrl, "_blank", "noopener,noreferrer");
    });
  }

  if (dom.journeyFilters) {
    dom.journeyFilters.addEventListener("click", handleFilterClick);
  }

  if (dom.categoryFilters) {
    dom.categoryFilters.addEventListener("click", handleFilterClick);
  }

  if (dom.modalClose) {
    dom.modalClose.addEventListener("click", () => {
      closeModal({ updateHistory: true, returnFocus: true });
    });
  }

  if (dom.modalBackdrop) {
    dom.modalBackdrop.addEventListener("click", (event) => {
      if (event.target === dom.modalBackdrop) {
        closeModal({ updateHistory: true, returnFocus: true });
      }
    });
  }

  if (dom.modalPanel) {
    dom.modalPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  if (dom.modalShare) {
    dom.modalShare.addEventListener("click", shareCurrentTool);
  }

  window.addEventListener("keydown", handleGlobalKeydown);
  window.addEventListener("popstate", syncModalWithUrl);
}

function handleGlobalKeydown(event) {
  const modalIsOpen = Boolean(dom.modalBackdrop && !dom.modalBackdrop.hidden);

  if (event.key === "Escape" && modalIsOpen) {
    event.preventDefault();
    closeModal({ updateHistory: true, returnFocus: true });
    return;
  }

  if (event.key === "Tab" && modalIsOpen) {
    trapFocusInsideModal(event);
  }
}

function trapFocusInsideModal(event) {
  if (!dom.modalPanel) return;

  const focusableElements = getModalFocusableElements();
  if (!focusableElements.length) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function getModalFocusableElements() {
  if (!dom.modalPanel) return [];

  return Array.from(dom.modalPanel.querySelectorAll(appState.focusableSelectors)).filter((element) => {
    const isHiddenByAttribute = element.hidden || element.getAttribute("aria-hidden") === "true";
    const isInvisible = element.offsetParent === null && getComputedStyle(element).position !== "fixed";
    return !isHiddenByAttribute && !isInvisible;
  });
}

async function loadData() {
  try {
    const [toolsResponse, partnersResponse, tagsResponse] = await Promise.all([
      fetch("dados.json"),
      fetch("parceiros.json"),
      fetch("tags.json")
    ]);

    if (!toolsResponse.ok || !partnersResponse.ok || !tagsResponse.ok) {
      throw new Error("Falha ao carregar os arquivos JSON do portal.");
    }

    const [tools, partners, tagStyles] = await Promise.all([
      toolsResponse.json(),
      partnersResponse.json(),
      tagsResponse.json()
    ]);

    appState.tools = Array.isArray(tools) ? tools : [];
    appState.partners = Array.isArray(partners) ? partners : [];
    appState.tagStyles = tagStyles || {};

    renderPartners();
    renderTools();
    syncModalWithUrl();
  } catch (error) {
    if (dom.resultCount) {
      dom.resultCount.textContent = "Não foi possível carregar a curadoria no momento.";
    }

    if (dom.cardsGrid) {
      dom.cardsGrid.innerHTML = "";
    }

    if (dom.emptyState) {
      dom.emptyState.hidden = false;
    }
  }
}

function handleFilterClick(event) {
  const trigger = event.target.closest("[data-filter-type]");
  if (!trigger) return;

  const filterType = trigger.dataset.filterType;
  const filterValue = trigger.dataset.filterValue;

  if (filterType === "categoria") {
    appState.activeCategory = filterValue;
    updateActiveState(dom.categoryFilters, trigger, ".chip");
  }

  if (filterType === "jornada") {
    appState.activeJourney = filterValue;
    updateActiveState(dom.journeyFilters, trigger, ".bento-card");
  }

  renderTools();
}

function updateActiveState(parent, activeButton, selector) {
  if (!parent) return;
  parent.querySelectorAll(selector).forEach((item) => item.classList.remove("is-active"));
  activeButton.classList.add("is-active");
}

function renderPartners() {
  if (!dom.partnersList) return;

  dom.partnersList.innerHTML = "";

  appState.partners.forEach((partner) => {
    const item = document.createElement("li");
    item.className = "partner-item";

    const link = document.createElement("a");
    link.href = partner.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = partner.nome;

    const description = document.createElement("p");
    description.className = "partner-copy";
    description.textContent = partner.descricao;

    item.appendChild(link);
    item.appendChild(description);
    dom.partnersList.appendChild(item);
  });
}

function renderTools() {
  if (!dom.cardsGrid) return;

  const filteredTools = getFilteredTools();
  dom.cardsGrid.innerHTML = "";

  if (dom.resultCount) {
    dom.resultCount.textContent = `${filteredTools.length} ferramenta${filteredTools.length === 1 ? "" : "s"} encontrada${filteredTools.length === 1 ? "" : "s"} para o recorte atual.`;
  }

  if (!filteredTools.length) {
    if (dom.emptyState) {
      dom.emptyState.hidden = false;
    }
    return;
  }

  if (dom.emptyState) {
    dom.emptyState.hidden = true;
  }

  filteredTools.forEach((tool) => {
    const card = createToolCard(tool);
    dom.cardsGrid.appendChild(card);
  });
}

function getFilteredTools() {
  return appState.tools.filter((tool) => {
    const matchesCategory = appState.activeCategory === "todos" || tool.categoria === appState.activeCategory;
    const matchesJourney = matchesJourneyFilter(tool);
    const matchesQuery = matchesSearch(tool);
    return matchesCategory && matchesJourney && matchesQuery;
  });
}

function matchesJourneyFilter(tool) {
  if (appState.activeJourney === "todos") return true;

  const bundle = [
    tool.categoria,
    tool.descricao,
    tool.dor_resolvida,
    tool.melhor_para,
    tool.cenario,
    tool.momento_da_jornada,
    tool.nivel_de_urgencia,
    ...(tool.tags || [])
  ].join(" ").toLowerCase();

  const maps = {
    organizar: ["organização", "produtividade", "planejamento", "tarefas", "coordenação", "rotina", "execução"],
    escrever: ["escrita", "texto", "rascunho", "revisão", "síntese"],
    pesquisar: ["pesquisa", "fontes", "referências", "investigação", "estudo"],
    conteudo: ["criadores", "visual", "vídeo", "imagem", "marketing", "publicação", "apresentações"],
    estudar: ["estudo", "pesquisa", "conhecimento", "referências", "aprendizado"],
    ia: ["ia", "aceleração", "produtividade", "rascunho"],
    automatizar: ["automação", "integrações", "fluxos", "otimização"],
    equipe: ["equipe", "colaborativo", "reuniões", "trabalho remoto", "comunicação"],
    simples: ["rápido", "grátis", "sem cadastro", "simples", "sem login"],
    agora: ["alto", "rápido", "resolução imediata", "urgência", "executar", "agora"]
  };

  const keywords = maps[appState.activeJourney] || [];
  return keywords.some((keyword) => bundle.includes(keyword));
}

function matchesSearch(tool) {
  if (!appState.query) return true;

  const extracted = extractTitleTags(tool.nome);
  const searchable = [
    tool.nome,
    extracted.cleanTitle,
    tool.categoria,
    tool.dor_resolvida,
    tool.descricao,
    tool.melhor_para,
    tool.cuidado,
    tool.cenario,
    tool.momento_da_jornada,
    tool.nivel_de_urgencia,
    ...(tool.tags || []),
    ...extracted.tags
  ].join(" ").toLowerCase();

  return searchable.includes(appState.query);
}

function createToolCard(tool) {
  const article = document.createElement("article");
  article.className = "tool-card";

  const parsed = extractTitleTags(tool.nome);
  const allTags = mergeTags(parsed.tags, tool.tags || []);

  const header = document.createElement("div");
  header.className = "tool-header";

  const titleGroup = document.createElement("div");
  titleGroup.className = "tool-title-group";

  const category = document.createElement("span");
  category.className = "tool-category";
  category.textContent = tool.categoria;

  const title = document.createElement("h3");
  title.className = "tool-name";
  title.textContent = parsed.cleanTitle;

  const dor = document.createElement("p");
  dor.className = "tool-dor";
  dor.textContent = tool.dor_resolvida;

  titleGroup.appendChild(category);
  titleGroup.appendChild(title);
  titleGroup.appendChild(dor);

  const emoji = document.createElement("div");
  emoji.className = "tool-emoji";
  emoji.textContent = tool.emoji || "☕";

  header.appendChild(titleGroup);
  header.appendChild(emoji);

  const description = document.createElement("p");
  description.className = "tool-description";
  description.textContent = tool.descricao;

  const meta = document.createElement("div");
  meta.className = "tool-meta";
  meta.appendChild(createMetaBlock("Melhor para", tool.melhor_para || "Uso geral"));
  meta.appendChild(createMetaBlock("Cuidado", tool.cuidado || "Verifique limites, planos e encaixe no seu fluxo."));
  meta.appendChild(createMetaBlock("Cenário", tool.cenario || "Quando você precisa resolver algo com rapidez e clareza."));

  const tags = document.createElement("div");
  tags.className = "tag-list";
  allTags.forEach((tag) => {
    tags.appendChild(createTagBadge(tag));
  });

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "btn btn-secondary";
  openButton.textContent = "Ver contexto";
  openButton.setAttribute("aria-haspopup", "dialog");
  openButton.setAttribute("aria-label", `Ver contexto da ferramenta ${parsed.cleanTitle}`);
  openButton.addEventListener("click", (event) => {
    appState.lastTriggerElement = event.currentTarget;
    openModal(tool, { pushHistory: true, focusModal: true });
  });

  const visitLink = document.createElement("a");
  visitLink.className = "btn btn-primary";
  visitLink.href = tool.url || "#";
  visitLink.target = "_blank";
  visitLink.rel = "noopener noreferrer";
  visitLink.textContent = "Abrir site oficial";

  actions.appendChild(openButton);
  actions.appendChild(visitLink);

  article.appendChild(header);
  article.appendChild(description);
  article.appendChild(meta);
  article.appendChild(tags);
  article.appendChild(actions);

  return article;
}

function createMetaBlock(label, value) {
  const block = document.createElement("div");
  block.className = "tool-meta-block";

  const span = document.createElement("span");
  span.className = "tool-meta-label";
  span.textContent = label;

  const text = document.createElement("p");
  text.textContent = value;

  block.appendChild(span);
  block.appendChild(text);

  return block;
}

function extractTitleTags(title) {
  const safeTitle = typeof title === "string" ? title : "";
  const regex = /\[(.*?)\]/g;
  const tags = [];
  let match;

  while ((match = regex.exec(safeTitle)) !== null) {
    if (match[1]) {
      tags.push(match[1].trim());
    }
  }

  const cleanTitle = safeTitle.replace(regex, "").replace(/\s{2,}/g, " ").trim();
  return { cleanTitle, tags };
}

function mergeTags(tagsFromTitle, tagsFromField) {
  return [...new Set([...(tagsFromTitle || []), ...(tagsFromField || [])])];
}

function createTagBadge(tagName) {
  const badge = document.createElement("span");
  badge.className = "tag-badge";
  badge.textContent = `[${tagName}]`;

  const stylePreset = appState.tagStyles[tagName] || appState.tagStyles["*"];
  if (stylePreset) {
    badge.style.color = stylePreset.textColor;
    badge.style.backgroundColor = stylePreset.backgroundColor;
    badge.style.borderColor = stylePreset.borderColor;
    if (stylePreset.className) {
      badge.classList.add(stylePreset.className);
    }
  }

  return badge;
}

function openModal(tool, options = {}) {
  const { pushHistory = true, focusModal = true } = options;

  if (!dom.modalBackdrop || !dom.modalPanel) return;

  appState.currentTool = tool;

  const parsed = extractTitleTags(tool.nome);
  const allTags = mergeTags(parsed.tags, tool.tags || []);

  dom.modalCategory.textContent = tool.categoria || "Ferramenta";
  dom.modalTitle.textContent = parsed.cleanTitle || "Detalhes da ferramenta";
  dom.modalDor.textContent = tool.dor_resolvida || "";
  dom.modalDescription.textContent = tool.descricao || "";
  dom.modalBestFor.textContent = tool.melhor_para || "Uso geral";
  dom.modalScenario.textContent = tool.cenario || "Quando você precisa resolver algo com rapidez e clareza.";
  dom.modalCuidado.textContent = tool.cuidado || "Confira limites, planos, idioma e compatibilidade com seu fluxo.";
  dom.modalJourney.textContent = tool.momento_da_jornada || "Exploração";
  dom.modalUrgency.textContent = tool.nivel_de_urgencia || "Média";
  dom.modalVisitLink.href = tool.url || "#";

  dom.modalTags.innerHTML = "";
  allTags.forEach((tag) => {
    dom.modalTags.appendChild(createTagBadge(tag));
  });

  dom.modalBackdrop.hidden = false;
  dom.modalBackdrop.setAttribute("aria-hidden", "false");
  dom.body.classList.add("modal-open");

  if (pushHistory) {
    const url = new URL(window.location.href);
    url.searchParams.set("modal", String(tool.id));
    window.history.pushState({ modal: String(tool.id) }, "", url.toString());
  }

  if (focusModal) {
    requestAnimationFrame(() => {
      if (dom.modalClose) {
        dom.modalClose.focus();
      } else {
        dom.modalPanel.focus();
      }
    });
  }
}

function closeModal(options = {}) {
  const { updateHistory = true, returnFocus = true } = options;

  hideModalOnly(returnFocus);

  if (!updateHistory) return;

  const url = new URL(window.location.href);
  if (url.searchParams.has("modal")) {
    url.searchParams.delete("modal");
    window.history.replaceState({}, "", url.toString());
  }
}

function hideModalOnly(returnFocus = true) {
  if (!dom.modalBackdrop) return;

  dom.modalBackdrop.hidden = true;
  dom.modalBackdrop.setAttribute("aria-hidden", "true");
  dom.body.classList.remove("modal-open");

  const focusTarget = appState.lastTriggerElement;
  appState.currentTool = null;

  if (returnFocus && focusTarget && typeof focusTarget.focus === "function") {
    requestAnimationFrame(() => {
      focusTarget.focus();
    });
  }
}

function syncModalWithUrl() {
  const params = new URLSearchParams(window.location.search);
  const modalId = params.get("modal");

  if (!modalId) {
    hideModalOnly(false);
    return;
  }

  if (!appState.tools.length) {
    return;
  }

  const matchedTool = appState.tools.find((tool) => String(tool.id) === String(modalId));

  if (!matchedTool) {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("modal");
    window.history.replaceState({}, "", cleanUrl.toString());
    hideModalOnly(false);
    return;
  }

  const alreadyOpenSameTool =
    appState.currentTool &&
    String(appState.currentTool.id) === String(matchedTool.id) &&
    dom.modalBackdrop &&
    !dom.modalBackdrop.hidden;

  if (alreadyOpenSameTool) {
    return;
  }

  openModal(matchedTool, { pushHistory: false, focusModal: true });
}

async function shareCurrentTool() {
  if (!appState.currentTool) return;

  const parsed = extractTitleTags(appState.currentTool.nome);
  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.set("modal", String(appState.currentTool.id));

  const payload = {
    title: `${parsed.cleanTitle} — Café Com Bytes`,
    text: `${parsed.cleanTitle}: ${appState.currentTool.dor_resolvida || "Ferramenta recomendada no Café Com Bytes."}`,
    url: shareUrl.toString()
  };

  if (navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch (error) {
      copyShareUrl(payload.url);
      return;
    }
  }

  copyShareUrl(payload.url);
}

function copyShareUrl(url) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      window.alert("Link copiado para a área de transferência.");
    }).catch(() => {
      window.prompt("Copie o link abaixo:", url);
    });
    return;
  }

  window.prompt("Copie o link abaixo:", url);
}
