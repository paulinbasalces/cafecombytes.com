(() => {
  const state = {
    tools: [],
    partners: [],
    tagStyles: {},
    searchTerm: "",
    activeCategory: "todas",
    activeJourney: "todos",
    activeToolId: null,
    modalPreviousFocus: null,
    theme: "light",
    fontScale: "normal"
  };

  const selectors = {
    root: document.documentElement,
    body: document.body,
    searchForm: document.getElementById("searchForm"),
    searchInput: document.getElementById("buscaFerramenta"),
    clearSearchButton: document.getElementById("clearSearchButton"),
    googleFallbackButton: document.getElementById("googleFallbackButton"),
    themeToggle: document.querySelector("[data-theme-toggle]"),
    fontToggle: document.querySelector("[data-font-toggle]"),
    journeyFilters: document.getElementById("journeyFilters"),
    categoryFilters: document.getElementById("categoryFilters"),
    cardsGrid: document.getElementById("cardsGrid"),
    resultsCount: document.getElementById("resultsCount"),
    collectionTitle: document.getElementById("collectionTitle"),
    collectionLead: document.getElementById("collectionLead"),
    emptyState: document.getElementById("emptyState"),
    partnersList: document.getElementById("partnersList"),
    modal: document.getElementById("toolModal"),
    modalTitle: document.getElementById("toolModalTitle"),
    modalBody: document.getElementById("toolModalBody"),
    modalCloseButtons: document.querySelectorAll("[data-close-modal]")
  };

  const copyMap = {
    todos: {
      title: "Toda a coleção editorial",
      lead: "Uma visão ampla da curadoria para navegar por dor, contexto e utilidade real."
    },
    organizar: {
      title: "Ferramentas para organizar melhor o trabalho",
      lead: "Quando o problema central é excesso de fricção, desordem operacional ou falta de clareza no fluxo."
    },
    pesquisar: {
      title: "Ferramentas para pesquisar e entender melhor",
      lead: "Para momentos em que o principal não é produzir rápido, mas compreender, comparar e ganhar contexto."
    },
    criar: {
      title: "Ferramentas para criar e publicar",
      lead: "Quando você precisa sair da ideia e transformar algo em texto, visual, vídeo ou página com velocidade."
    },
    alinhar: {
      title: "Ferramentas para alinhar com outras pessoas",
      lead: "Úteis quando a dor está em explicar, revisar, apresentar, mostrar contexto ou destravar colaboração."
    }
  };

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function normalizeText(value) {
    return (value || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function escapeHtml(value) {
    return (value || "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slugify(value) {
    return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function parseNameAndTags(rawName) {
    const name = rawName || "";
    const matches = [...name.matchAll(/\[(.*?)\]/g)].map(match => match[1].trim()).filter(Boolean);
    const cleanName = name.replace(/\s*\[(.*?)\]/g, "").trim();
    return {
      cleanName,
      extractedTags: matches
    };
  }

  function uniqueArray(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  function toolToSearchBlob(tool) {
    return normalizeText([
      tool.nome,
      tool.nome_limpo,
      tool.categoria,
      tool.dor_resolvida,
      tool.descricao,
      tool.melhor_para,
      tool.cenario,
      tool.cuidado,
      tool.momento_da_jornada,
      tool.nivel_de_urgencia,
      ...(tool.tags || []),
      ...(tool.tags_extraidas || [])
    ].join(" "));
  }

  function decorateTool(tool) {
    const parsed = parseNameAndTags(tool.nome);
    const explicitTags = Array.isArray(tool.tags) ? tool.tags : [];
    const mergedTags = uniqueArray([...parsed.extractedTags, ...explicitTags]);

    return {
      ...tool,
      nome_limpo: parsed.cleanName || tool.nome,
      categoria_slug: slugify(tool.categoria || "sem-categoria"),
      jornada_slug: slugify(tool.momento_da_jornada || "todos"),
      tags_extraidas: parsed.extractedTags,
      tags_unificadas: mergedTags,
      search_blob: ""
    };
  }

  function resolveJourneyBucket(value) {
    const normalized = normalizeText(value);

    if (["planejamento", "estruturação", "infraestrutura", "organizacao", "organizacao", "acompanhamento", "escala operacional", "operacao"].includes(normalized)) {
      return "organizar";
    }

    if (["descoberta", "compreensao", "exploracao", "pesquisa"].includes(normalized)) {
      return "pesquisar";
    }

    if (["execucao", "producao", "publicacao", "entrega", "arranque", "ajuste rapido", "design de solucao", "lancamento"].includes(normalized)) {
      return "criar";
    }

    if (["alinhamento", "comunicacao", "refinamento", "suporte"].includes(normalized)) {
      return "alinhar";
    }

    return "todos";
  }

  function buildTagBadge(tag) {
    const config = state.tagStyles[tag] || state.tagStyles["*"] || {};
    const style = [
      config.textColor ? `color:${config.textColor}` : "",
      config.backgroundColor ? `background:${config.backgroundColor}` : "",
      config.borderColor ? `border-color:${config.borderColor}` : ""
    ].filter(Boolean).join(";");

    return `
      <span class="${escapeHtml(config.className || "tag-badge tag-badge--default")}" style="${escapeHtml(style)}">
        ${escapeHtml(config.label || tag)}
      </span>
    `;
  }

  function buildToolCard(tool) {
    const tagsMarkup = tool.tags_unificadas.length
      ? `<div class="tag-list">${tool.tags_unificadas.map(buildTagBadge).join("")}</div>`
      : "";

    const safeUrl = tool.url && tool.url !== "#" ? tool.url : "";
    const externalAction = safeUrl
      ? `<a class="btn btn-primary" href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">Abrir ferramenta</a>`
      : `<button class="btn btn-primary" type="button" data-open-modal="${escapeHtml(String(tool.id))}">Ver detalhes</button>`;

    return `
      <article class="tool-card" data-tool-id="${escapeHtml(String(tool.id))}">
        <div class="tool-header">
          <div class="tool-title-group">
            <span class="tool-category">${escapeHtml(tool.categoria || "Categoria")}</span>
            <h3 class="tool-name">${escapeHtml(tool.nome_limpo || tool.nome)}</h3>
          </div>
          <span class="tool-emoji" aria-hidden="true">${escapeHtml(tool.emoji || "☕")}</span>
        </div>

        <p class="tool-dor">${escapeHtml(tool.dor_resolvida || "")}</p>
        <p class="tool-description">${escapeHtml(tool.descricao || "")}</p>

        <div class="tool-meta">
          <div class="tool-meta-block">
            <span class="tool-meta-label">Melhor para</span>
            <p>${escapeHtml(tool.melhor_para || "Leitura rápida e escolha mais consciente.")}</p>
          </div>
          <div class="tool-meta-block">
            <span class="tool-meta-label">Cenário</span>
            <p>${escapeHtml(tool.cenario || "Quando existe uma tarefa concreta a resolver agora.")}</p>
          </div>
          <div class="tool-meta-block">
            <span class="tool-meta-label">Momento</span>
            <p>${escapeHtml(tool.momento_da_jornada || "Uso geral")}</p>
          </div>
        </div>

        ${tagsMarkup}

        <div class="card-actions">
          <button class="btn btn-secondary" type="button" data-open-modal="${escapeHtml(String(tool.id))}">
            Entender melhor
          </button>
          ${externalAction}
        </div>
      </article>
    `;
  }

  function renderTools(tools) {
    if (!selectors.cardsGrid) return;

    if (!tools.length) {
      selectors.cardsGrid.innerHTML = "";
      if (selectors.emptyState) selectors.emptyState.hidden = false;
      updateResultsCount(0);
      return;
    }

    if (selectors.emptyState) selectors.emptyState.hidden = true;
    selectors.cardsGrid.innerHTML = tools.map(buildToolCard).join("");
    updateResultsCount(tools.length);
  }

  function updateResultsCount(total) {
    if (selectors.resultsCount) {
      selectors.resultsCount.textContent = `${total} resultado${total === 1 ? "" : "s"}`;
    }
  }

  function updateCollectionCopy() {
    const selected = copyMap[state.activeJourney] || copyMap.todos;
    if (selectors.collectionTitle) selectors.collectionTitle.textContent = selected.title;
    if (selectors.collectionLead) selectors.collectionLead.textContent = selected.lead;
  }

  function getFilteredTools() {
    return state.tools.filter(tool => {
      const byJourney = state.activeJourney === "todos"
        ? true
        : tool.journey_bucket === state.activeJourney;

      const byCategory = state.activeCategory === "todas"
        ? true
        : slugify(tool.categoria) === state.activeCategory;

      const bySearch = !state.searchTerm
        ? true
        : tool.search_blob.includes(normalizeText(state.searchTerm));

      return byJourney && byCategory && bySearch;
    });
  }

  function renderCategoryFilters() {
    if (!selectors.categoryFilters) return;

    const categories = uniqueArray(state.tools.map(tool => tool.categoria).filter(Boolean));
    const baseButton = `
      <button class="chip ${state.activeCategory === "todas" ? "is-active" : ""}" type="button" data-filter-type="categoria" data-filter-value="todas">
        Todas as categorias
      </button>
    `;

    const categoryButtons = categories.map(category => {
      const value = slugify(category);
      const active = state.activeCategory === value ? "is-active" : "";
      return `
        <button class="chip ${active}" type="button" data-filter-type="categoria" data-filter-value="${escapeHtml(value)}">
          ${escapeHtml(category)}
        </button>
      `;
    }).join("");

    selectors.categoryFilters.innerHTML = baseButton + categoryButtons;
  }

  function syncFilterButtons() {
    document.querySelectorAll("[data-filter-type='jornada']").forEach(button => {
      const isActive = button.getAttribute("data-filter-value") === state.activeJourney;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    document.querySelectorAll("[data-filter-type='categoria']").forEach(button => {
      const isActive = button.getAttribute("data-filter-value") === state.activeCategory;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function renderPartners() {
    if (!selectors.partnersList) return;

    selectors.partnersList.innerHTML = state.partners.map(partner => `
      <li class="partner-item">
        <a href="${escapeHtml(partner.url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(partner.nome)}
        </a>
        <span class="partner-copy">${escapeHtml(partner.destaque_rodape || partner.descricao || "")}</span>
      </li>
    `).join("");
  }

  function renderAll() {
    updateCollectionCopy();
    renderCategoryFilters();
    syncFilterButtons();
    renderTools(getFilteredTools());
  }

  function setTheme(nextTheme) {
    state.theme = nextTheme === "dark" ? "dark" : "light";
    selectors.root.setAttribute("data-theme", state.theme);

    if (selectors.themeToggle) {
      selectors.themeToggle.setAttribute(
        "aria-label",
        state.theme === "dark" ? "Alternar para tema claro" : "Alternar para tema escuro"
      );
    }
  }

  function initTheme() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }

  function toggleTheme() {
    setTheme(state.theme === "dark" ? "light" : "dark");
  }

  function toggleFontScale() {
    state.fontScale = state.fontScale === "large" ? "normal" : "large";
    selectors.root.setAttribute("data-font-scale", state.fontScale);

    if (selectors.fontToggle) {
      selectors.fontToggle.setAttribute(
        "aria-label",
        state.fontScale === "large" ? "Reduzir tamanho da fonte" : "Aumentar tamanho da fonte"
      );
      selectors.fontToggle.textContent = state.fontScale === "large" ? "A-" : "A";
    }
  }

  function getToolById(id) {
    return state.tools.find(tool => String(tool.id) === String(id)) || null;
  }

  function buildModalContent(tool) {
    const tagMarkup = tool.tags_unificadas.length
      ? `<div class="tag-list">${tool.tags_unificadas.map(buildTagBadge).join("")}</div>`
      : "";

    const safeUrl = tool.url && tool.url !== "#"
      ? `<a class="btn btn-primary" href="${escapeHtml(tool.url)}" target="_blank" rel="noopener noreferrer">Abrir ferramenta</a>`
      : "";

    return `
      <div class="modal-header">
        <span class="tool-category">${escapeHtml(tool.categoria || "Categoria")}</span>
        <h2 id="toolModalTitle">${escapeHtml(tool.nome_limpo || tool.nome)}</h2>
        <p class="modal-dor">${escapeHtml(tool.dor_resolvida || "")}</p>
      </div>

      <div class="modal-body" id="toolModalDescription">
        <div class="modal-column">
          <h3>Descrição</h3>
          <p>${escapeHtml(tool.descricao || "")}</p>
        </div>

        <div class="modal-meta-row">
          <div class="modal-meta-box">
            <span class="meta-label">Melhor para</span>
            <p>${escapeHtml(tool.melhor_para || "Quem quer escolher com mais contexto.")}</p>
          </div>
          <div class="modal-meta-box">
            <span class="meta-label">Cenário</span>
            <p>${escapeHtml(tool.cenario || "Quando existe uma dor clara a resolver no momento.")}</p>
          </div>
        </div>

        <div class="modal-meta-row">
          <div class="modal-meta-box">
            <span class="meta-label">Cuidado</span>
            <p>${escapeHtml(tool.cuidado || "Avalie se a ferramenta resolve o problema atual antes de adotá-la.")}</p>
          </div>
          <div class="modal-meta-box">
            <span class="meta-label">Momento da jornada</span>
            <p>${escapeHtml(tool.momento_da_jornada || "Uso geral")}</p>
          </div>
        </div>

        <div class="modal-column">
          <h3>Nível de urgência</h3>
          <p>${escapeHtml(tool.nivel_de_urgencia || "Média")}</p>
        </div>

        ${tagMarkup ? `<div class="modal-column"><h3>Tags</h3>${tagMarkup}</div>` : ""}
      </div>

      <div class="modal-footer">
        ${safeUrl}
        <button class="btn btn-secondary" type="button" data-share-tool="${escapeHtml(String(tool.id))}">
          Compartilhar
        </button>
        <button class="btn btn-ghost" type="button" data-close-modal>
          Fechar
        </button>
      </div>
    `;
  }

  function getModalFocusableElements() {
    if (!selectors.modal) return [];
    return [...selectors.modal.querySelectorAll(focusableSelector)].filter(el => !el.hasAttribute("hidden"));
  }

  function trapModalFocus(event) {
    if (!selectors.modal || selectors.modal.hidden || event.key !== "Tab") return;

    const focusable = getModalFocusableElements();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function updateUrlForModal(id) {
    const url = new URL(window.location.href);
    url.searchParams.set("modal", String(id));
    window.history.pushState({ modal: String(id) }, "", url);
  }

  function clearModalFromUrl(mode = "replace") {
    const url = new URL(window.location.href);
    url.searchParams.delete("modal");
    if (mode === "push") {
      window.history.pushState({}, "", url);
    } else {
      window.history.replaceState({}, "", url);
    }
  }

  function openModal(id, trigger = null, pushHistory = true) {
    const tool = getToolById(id);
    if (!tool || !selectors.modal || !selectors.modalBody) return;

    state.activeToolId = String(id);
    state.modalPreviousFocus = trigger || document.activeElement || null;
    selectors.modalBody.innerHTML = buildModalContent(tool);
    selectors.modal.hidden = false;
    selectors.modal.setAttribute("aria-hidden", "false");
    selectors.body.classList.add("modal-open");

    const title = selectors.modalBody.querySelector("#toolModalTitle");
    const description = selectors.modalBody.querySelector("#toolModalDescription");

    if (title) {
      selectors.modal.setAttribute("aria-labelledby", "toolModalTitle");
      selectors.modalTitle = title;
    }

    if (description) {
      selectors.modal.setAttribute("aria-describedby", "toolModalDescription");
    }

    if (pushHistory) {
      updateUrlForModal(id);
    }

    const focusable = getModalFocusableElements();
    if (focusable.length) {
      focusable[0].focus();
    }
  }

  function closeModal({ skipHistoryReplace = false } = {}) {
    if (!selectors.modal || selectors.modal.hidden) return;

    selectors.modal.hidden = true;
    selectors.modal.setAttribute("aria-hidden", "true");
    selectors.body.classList.remove("modal-open");
    selectors.modalBody.innerHTML = "";
    state.activeToolId = null;

    if (!skipHistoryReplace) {
      clearModalFromUrl("replace");
    }

    if (state.modalPreviousFocus && typeof state.modalPreviousFocus.focus === "function") {
      state.modalPreviousFocus.focus();
    }
  }

  async function shareTool(id) {
    const tool = getToolById(id);
    if (!tool) return;

    const shareData = {
      title: `${tool.nome_limpo || tool.nome} — Café Com Bytes`,
      text: tool.dor_resolvida || tool.descricao || "Ferramenta útil descoberta no Café Com Bytes.",
      url: tool.url && tool.url !== "#" ? tool.url : window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      window.alert("Link copiado para a área de transferência.");
    } catch (error) {
      window.alert("Não foi possível compartilhar agora.");
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    state.searchTerm = selectors.searchInput ? selectors.searchInput.value.trim() : "";
    renderAll();
  }

  function handleClearSearch() {
    state.searchTerm = "";
    if (selectors.searchInput) selectors.searchInput.value = "";
    renderAll();
    selectors.searchInput?.focus();
  }

  function handleGoogleFallback() {
    const query = selectors.searchInput?.value.trim() || "ferramentas úteis produtividade design IA";
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleDocumentClick(event) {
    const journeyButton = event.target.closest("[data-filter-type='jornada']");
    if (journeyButton) {
      state.activeJourney = journeyButton.getAttribute("data-filter-value") || "todos";
      renderAll();
      return;
    }

    const categoryButton = event.target.closest("[data-filter-type='categoria']");
    if (categoryButton) {
      state.activeCategory = categoryButton.getAttribute("data-filter-value") || "todas";
      renderAll();
      return;
    }

    const openButton = event.target.closest("[data-open-modal]");
    if (openButton) {
      openModal(openButton.getAttribute("data-open-modal"), openButton, true);
      return;
    }

    const closeButton = event.target.closest("[data-close-modal]");
    if (closeButton) {
      closeModal();
      return;
    }

    const shareButton = event.target.closest("[data-share-tool]");
    if (shareButton) {
      shareTool(shareButton.getAttribute("data-share-tool"));
      return;
    }

    if (event.target === selectors.modal) {
      closeModal();
    }
  }

  function handleDocumentKeydown(event) {
    if (event.key === "Escape" && selectors.modal && !selectors.modal.hidden) {
      event.preventDefault();
      closeModal();
      return;
    }

    trapModalFocus(event);
  }

  function handlePopState() {
    const params = new URLSearchParams(window.location.search);
    const modalId = params.get("modal");

    if (modalId) {
      openModal(modalId, null, false);
      return;
    }

    closeModal({ skipHistoryReplace: true });
  }

  function bootFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const modalId = params.get("modal");
    if (modalId) {
      openModal(modalId, null, false);
    }
  }

  async function loadData() {
    const [toolsRaw, partnersRaw, tagsRaw] = await Promise.all([
      fetch("./dados.json").then(response => {
        if (!response.ok) throw new Error("Falha ao carregar dados.json");
        return response.json();
      }),
      fetch("./parceiros.json").then(response => {
        if (!response.ok) throw new Error("Falha ao carregar parceiros.json");
        return response.json();
      }),
      fetch("./tags.json").then(response => {
        if (!response.ok) throw new Error("Falha ao carregar tags.json");
        return response.json();
      })
    ]);

    state.tagStyles = tagsRaw || {};
    state.partners = Array.isArray(partnersRaw) ? partnersRaw : [];
    state.tools = (Array.isArray(toolsRaw) ? toolsRaw : []).map(decorateTool).map(tool => {
      const journeyBucket = resolveJourneyBucket(tool.momento_da_jornada);
      return {
        ...tool,
        journey_bucket: journeyBucket,
        search_blob: toolToSearchBlob({ ...tool, journey_bucket: journeyBucket })
      };
    });
  }

  function bindEvents() {
    selectors.searchForm?.addEventListener("submit", handleSearchSubmit);
    selectors.clearSearchButton?.addEventListener("click", handleClearSearch);
    selectors.googleFallbackButton?.addEventListener("click", handleGoogleFallback);
    selectors.themeToggle?.addEventListener("click", toggleTheme);
    selectors.fontToggle?.addEventListener("click", toggleFontScale);

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeydown);
    window.addEventListener("popstate", handlePopState);
  }

  function renderErrorState() {
    if (selectors.cardsGrid) {
      selectors.cardsGrid.innerHTML = `
        <div class="empty-state glass-panel">
          <h3>Não foi possível carregar a curadoria.</h3>
          <p>Atualize a página ou verifique se os arquivos dados.json, parceiros.json e tags.json estão no mesmo diretório do portal.</p>
        </div>
      `;
    }

    if (selectors.emptyState) {
      selectors.emptyState.hidden = true;
    }
  }

  async function init() {
    initTheme();
    bindEvents();

    try {
      await loadData();
      renderPartners();
      renderAll();
      bootFromUrl();
    } catch (error) {
      renderErrorState();
      console.error(error);
    }
  }

  init();
})();
