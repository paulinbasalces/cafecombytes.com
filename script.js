// script.js - Café com Bytes

// Estado global em memória (sem localStorage)
const state = {
  ferramentas: [],
  parceiros: [],
  tagsConfig: {},
  filtroCategoria: "todos",
  termoBusca: "",
  fontScale: 1,
  theme: null
};

// Seletores principais
const el = {
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  clearSearch: document.getElementById("clear-search"),
  googleFallback: document.getElementById("google-search-fallback"),
  filtersBento: document.getElementById("filters-bento"),
  resultsGrid: document.getElementById("results-grid"),
  resultsEmpty: document.getElementById("results-empty"),
  resultsCount: document.getElementById("resultados-contador"),
  statNovas: document.getElementById("stat-novas"),
  statCategorias: document.getElementById("stat-categorias"),
  statAtualizacao: document.getElementById("stat-atualizacao"),
  partnersList: document.getElementById("partners-list"),
  themeToggle: document.querySelector("[data-theme-toggle]"),
  fontScaleToggle: document.querySelector("[data-font-scale-toggle]"),
  footerYear: document.getElementById("footer-year"),
  modalBackdrop: document.getElementById("tool-modal-backdrop"),
  modal: document.getElementById("tool-modal"),
  modalCloseBtn: document.getElementById("modal-close-btn"),
  modalTitle: document.getElementById("tool-modal-title"),
  modalCategory: document.getElementById("modal-category"),
  modalDor: document.getElementById("modal-dor"),
  modalDescricao: document.getElementById("modal-descricao"),
  modalTags: document.getElementById("modal-tags"),
  modalVisitLink: document.getElementById("modal-visit-link"),
  modalShareBtn: document.getElementById("modal-share-btn")
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initFontScale();
  attachEvents();
  fetchAllData();
  updateFooterYear();
  hydrateModalFromUrl();
});

// Tema (dark/light) com prefers-color-scheme e botão de toggle
function initTheme() {
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const html = document.documentElement;
  state.theme = prefersDark ? "dark" : "light";
  html.setAttribute("data-theme", state.theme);
  renderThemeIcon();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", state.theme);
  renderThemeIcon();
}

function renderThemeIcon() {
  if (!el.themeToggle) return;
  if (state.theme === "dark") {
    el.themeToggle.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z"/>
      </svg>
    `;
    el.themeToggle.setAttribute("aria-label", "Alternar para tema claro");
  } else {
    el.themeToggle.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="currentColor"/>
        <g stroke="currentColor" stroke-width="1.5">
          <line x1="12" y1="2" x2="12" y2="5"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
          <line x1="2" y1="12" x2="5" y2="12"/>
          <line x1="19" y1="12" x2="22" y2="12"/>
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
        </g>
      </svg>
    `;
    el.themeToggle.setAttribute("aria-label", "Alternar para tema escuro");
  }
}

// Escala de fonte simples (A+)
function initFontScale() {
  applyFontScale();
}

function toggleFontScale() {
  // Alterna entre 1 (normal) e 1.08 (um pouco maior)
  state.fontScale = state.fontScale === 1 ? 1.08 : 1;
  applyFontScale();
}

function applyFontScale() {
  document.documentElement.style.setProperty("font-size", `${100 * state.fontScale}%`);
  if (el.fontScaleToggle) {
    el.fontScaleToggle.setAttribute(
      "aria-label",
      state.fontScale === 1 ? "Aumentar fonte" : "Reduzir fonte"
    );
  }
}

// Eventos
function attachEvents() {
  if (el.searchForm) {
    el.searchForm.addEventListener("submit", handleSearchSubmit);
  }
  if (el.searchInput) {
    el.searchInput.addEventListener("input", handleSearchInput);
  }
  if (el.clearSearch) {
    el.clearSearch.addEventListener("click", clearSearch);
  }
  if (el.googleFallback) {
    el.googleFallback.addEventListener("click", handleGoogleFallback);
  }
  if (el.filtersBento) {
    el.filtersBento.addEventListener("click", handleFilterClick);
  }
  if (el.themeToggle) {
    el.themeToggle.addEventListener("click", toggleTheme);
  }
  if (el.fontScaleToggle) {
    el.fontScaleToggle.addEventListener("click", toggleFontScale);
  }

  if (el.modalBackdrop) {
    el.modalBackdrop.addEventListener("click", (event) => {
      if (event.target === el.modalBackdrop) {
        closeModal();
      }
    });
  }
  if (el.modalCloseBtn) {
    el.modalCloseBtn.addEventListener("click", () => closeModal());
  }
  if (el.modalShareBtn) {
    el.modalShareBtn.addEventListener("click", handleShareCurrentTool);
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.modalId) {
      const tool = state.ferramentas.find((f) => String(f.id) === String(event.state.modalId));
      if (tool) {
        openToolModal(tool, { pushState: false, fromPopstate: true });
      } else {
        closeModal({ fromPopstate: true });
      }
    } else {
      closeModal({ fromPopstate: true });
    }
  });
}

// Busca
function handleSearchSubmit(event) {
  event.preventDefault();
  if (!el.searchInput) return;
  state.termoBusca = el.searchInput.value.trim();
  renderResultadosFiltrados();
}

function handleSearchInput() {
  if (!el.searchInput) return;
  state.termoBusca = el.searchInput.value.trim();
  renderResultadosFiltrados();
}

function clearSearch() {
  if (!el.searchInput) return;
  el.searchInput.value = "";
  state.termoBusca = "";
  renderResultadosFiltrados();
}

// Fallback: buscar no Google
function handleGoogleFallback() {
  const term = (el.searchInput && el.searchInput.value.trim()) || "";
  const query = term || "ferramentas online gratuitas produtividade";
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// Filtro por categoria via Bento Grid
function handleFilterClick(event) {
  const card = event.target.closest(".filter-card");
  if (!card || !el.filtersBento) return;
  const categoria = card.getAttribute("data-category") || "todos";
  state.filtroCategoria = categoria;

  // Atualiza classes visuais
  const cards = el.filtersBento.querySelectorAll(".filter-card");
  cards.forEach((c) => c.classList.remove("is-active"));
  card.classList.add("is-active");

  renderResultadosFiltrados();
}

// Fetch paralelo das fontes de dados
async function fetchAllData() {
  try {
    const [dadosResp, parceirosResp, tagsResp] = await Promise.all([
      fetch("dados.json"),
      fetch("parceiros.json"),
      fetch("tags.json")
    ]);

    if (!dadosResp.ok) throw new Error("Erro ao carregar dados.json");
    if (!parceirosResp.ok) throw new Error("Erro ao carregar parceiros.json");
    if (!tagsResp.ok) throw new Error("Erro ao carregar tags.json");

    const [dados, parceiros, tagsConfig] = await Promise.all([
      dadosResp.json(),
      parceirosResp.json(),
      tagsResp.json()
    ]);

    state.ferramentas = Array.isArray(dados) ? dados : [];
    state.parceiros = Array.isArray(parceiros) ? parceiros : [];
    state.tagsConfig = typeof tagsConfig === "object" && tagsConfig !== null ? tagsConfig : {};

    renderResultadosFiltrados();
    renderParceiros();
    atualizarHeroStats();
  } catch (error) {
    console.error("[Café com Bytes] Erro ao carregar dados:", error);
    if (el.resultsCount) {
      el.resultsCount.textContent = "Não foi possível carregar a curadoria agora. Tente recarregar a página em alguns instantes.";
    }
  }
}

// Aplica filtros atuais e renderiza cards
function renderResultadosFiltrados() {
  if (!el.resultsGrid || !el.resultsEmpty || !el.resultsCount) return;

  const termo = state.termoBusca.toLowerCase();
  const cat = state.filtroCategoria;

  const filtrados = state.ferramentas.filter((item) => {
    if (cat !== "todos" && item.categoria !== cat) return false;

    if (!termo) return true;

    const campos = [
      item.nome || "",
      item.descricao || "",
      item.dor_resolvida || "",
      item.categoria || ""
    ]
      .join(" ")
      .toLowerCase();

    return campos.includes(termo);
  });

  // Limpa grade
  el.resultsGrid.innerHTML = "";

  if (!filtrados.length) {
    el.resultsEmpty.hidden = false;
    el.resultsGrid.appendChild(el.resultsEmpty);
    el.resultsCount.textContent = "0 ferramentas encontradas. Ajuste a busca ou filtre menos.";
    return;
  }

  el.resultsEmpty.hidden = true;
  const fragment = document.createDocumentFragment();

  filtrados.forEach((item) => {
    const card = buildResultCard(item);
    fragment.appendChild(card);
  });

  el.resultsGrid.appendChild(fragment);

  const total = filtrados.length;
  el.resultsCount.textContent =
    total === 1 ? "1 ferramenta encontrada." : `${total} ferramentas encontradas.`;
}

// Cria card de resultado
function buildResultCard(item) {
  const { nome = "", categoria = "", emoji = "🛠️", dor_resolvida = "", descricao = "", url = "#" } = item;
  const card = document.createElement("article");
  card.className = "result-card";
  card.setAttribute("tabindex", "0");

  const { cleanName, tags } = extractTagsFromName(nome);

  const header = document.createElement("header");
  header.className = "result-header";

  const titleGroup = document.createElement("div");
  titleGroup.className = "result-title-group";

  const titleLine = document.createElement("div");
  titleLine.style.display = "flex";
  titleLine.style.alignItems = "center";
  titleLine.style.gap = "0.5rem";

  const emojiSpan = document.createElement("span");
  emojiSpan.className = "result-emoji";
  emojiSpan.textContent = emoji;

  const nameEl = document.createElement("h3");
  nameEl.className = "result-name";
  nameEl.textContent = cleanName || "Ferramenta sem nome";

  titleLine.appendChild(emojiSpan);
  titleLine.appendChild(nameEl);

  const categoryEl = document.createElement("p");
  categoryEl.className = "result-category";
  categoryEl.textContent = categoria ? categoria : "Categoria diversa";

  titleGroup.appendChild(titleLine);
  titleGroup.appendChild(categoryEl);

  const quickActions = document.createElement("div");
  quickActions.className = "result-actions";

  const openBtn = document.createElement("button");
  openBtn.type = "button";
  openBtn.className = "btn btn-compact btn-outline";
  openBtn.textContent = "Abrir";
  openBtn.addEventListener("click", () => openToolModal(item));

  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.className = "btn btn-compact btn-ghost";
  shareBtn.textContent = "Compartilhar";
  shareBtn.addEventListener("click", () => shareTool(item));

  quickActions.appendChild(openBtn);
  quickActions.appendChild(shareBtn);

  header.appendChild(titleGroup);
  header.appendChild(quickActions);

  const dorEl = document.createElement("p");
  dorEl.className = "result-dor";
  dorEl.textContent = dor_resolvida || "Resumo não informado pela curadoria.";

  const descEl = document.createElement("p");
  descEl.className = "result-desc";
  descEl.textContent = descricao || "Descrição breve ainda não catalogada.";

  const footer = document.createElement("footer");
  footer.className = "result-footer";

  const tagsContainer = document.createElement("div");
  tagsContainer.className = "result-tags";

  tags.forEach((tagText) => {
    const tagEl = buildTagPill(tagText);
    tagsContainer.appendChild(tagEl);
  });

  const visitLink = document.createElement("a");
  visitLink.href = url || "#";
  visitLink.target = "_blank";
  visitLink.rel = "noopener noreferrer";
  visitLink.className = "btn btn-compact btn-primary";
  visitLink.textContent = "Visitar site oficial";

  footer.appendChild(tagsContainer);
  footer.appendChild(visitLink);

  card.appendChild(header);
  card.appendChild(dorEl);
  card.appendChild(descEl);
  card.appendChild(footer);

  // Acessibilidade: abrir modal ao pressionar Enter no card
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      openToolModal(item);
    }
  });

  return card;
}

// Extração de tags dentro de colchetes do título
function extractTagsFromName(nome) {
  const tags = [];
  if (!nome) return { cleanName: "", tags };

  const cleanName = nome.replace(/\[(.*?)\]/g, (match, inner) => {
    if (inner) {
      tags.push(inner.trim());
    }
    return "";
  }).trim();

  return { cleanName, tags };
}

// Monta badge baseado em tags.json
function buildTagPill(tagText) {
  const span = document.createElement("span");
  span.className = "tag-pill";
  span.textContent = tagText;

  const config = state.tagsConfig[tagText] || state.tagsConfig["*"] || null;
  if (config) {
    if (config.textColor) span.style.color = config.textColor;
    if (config.backgroundColor) span.style.backgroundColor = config.backgroundColor;
    if (config.borderColor) span.style.borderColor = config.borderColor;
    if (config.className) span.classList.add(config.className);
  }

  return span;
}

// Hero stats
function atualizarHeroStats() {
  if (!state.ferramentas.length) return;

  const total = state.ferramentas.length;
  const categoriasSet = new Set(state.ferramentas.map((f) => f.categoria || "outras"));
  const categorias = categoriasSet.size;

  if (el.statNovas) {
    el.statNovas.textContent = `${total}`;
  }
  if (el.statCategorias) {
    el.statCategorias.textContent = `${categorias}`;
  }
  if (el.statAtualizacao) {
    const now = new Date();
    const formatado = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    el.statAtualizacao.textContent = formatado;
  }
}

// Parceiros
function renderParceiros() {
  if (!el.partnersList) return;
  el.partnersList.innerHTML = "";

  if (!state.parceiros.length) {
    const li = document.createElement("li");
    li.textContent = "Nenhum parceiro cadastrado ainda.";
    el.partnersList.appendChild(li);
    return;
  }

  const fragment = document.createDocumentFragment();

  state.parceiros.forEach((p) => {
    const li = document.createElement("li");
    li.className = "partner-item";

    const a = document.createElement("a");
    a.href = p.url || "#";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = p.nome || p.url || "Parceiro sem nome";

    li.appendChild(a);

    if (p.descricao) {
      const span = document.createElement("span");
      span.style.display = "block";
      span.style.fontSize = "0.75rem";
      span.style.color = "var(--color-text-faint)";
      span.textContent = p.descricao;
      li.appendChild(span);
    }

    fragment.appendChild(li);
  });

  el.partnersList.appendChild(fragment);
}

// Modal de detalhes
function openToolModal(item, options = {}) {
  if (!el.modalBackdrop || !el.modal || !item) return;
  const opts = { pushState: true, fromPopstate: false, ...options };

  const { nome = "", categoria = "", dor_resolvida = "", descricao = "", url = "#" } = item;
  const { cleanName, tags } = extractTagsFromName(nome);

  el.modalTitle.textContent = cleanName || "Ferramenta";
  el.modalCategory.textContent = categoria || "Categoria diversa";
  el.modalDor.textContent = dor_resolvida || "";
  el.modalDescricao.textContent = descricao || "";
  el.modalTags.innerHTML = "";

  tags.forEach((t) => {
    const tagEl = buildTagPill(t);
    el.modalTags.appendChild(tagEl);
  });

  el.modalVisitLink.href = url || "#";

  el.modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";

  if (opts.pushState) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("modal", String(item.id));
    window.history.pushState({ modalId: String(item.id) }, "", newUrl.toString());
  }
}

function closeModal(options = {}) {
  const opts = { fromPopstate: false, ...options };

  if (!el.modalBackdrop) return;
  if (el.modalBackdrop.hidden) return;

  el.modalBackdrop.hidden = true;
  document.body.style.overflow = "";

  if (!opts.fromPopstate) {
    const url = new URL(window.location.href);
    if (url.searchParams.has("modal")) {
      url.searchParams.delete("modal");
      window.history.pushState({}, "", url.toString());
    }
  }
}

function hydrateModalFromUrl() {
  const url = new URL(window.location.href);
  const modalId = url.searchParams.get("modal");
  if (!modalId || !state.ferramentas.length) return;

  const tool = state.ferramentas.find((f) => String(f.id) === String(modalId));
  if (tool) {
    openToolModal(tool, { pushState: false });
  }
}

// Compartilhamento
function shareTool(item) {
  const url = buildToolShareUrl(item);
  const title = item.nome || "Ferramenta";
  const text = `Descobri essa ferramenta no Café com Bytes: ${title}`;

  if (navigator.share) {
    navigator
      .share({ title, text, url })
      .catch((error) => {
        console.warn("Share cancelado ou não suportado:", error);
      });
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Link copiado para a área de transferência.");
      })
      .catch(() => {
        window.prompt("Copie o link abaixo:", url);
      });
  } else {
    window.prompt("Copie o link abaixo:", url);
  }
}

function buildToolShareUrl(item) {
  const baseUrl = window.location.origin + window.location.pathname;
  const url = new URL(baseUrl);
  if (item && item.id != null) {
    url.searchParams.set("modal", String(item.id));
  }
  return url.toString();
}

function handleShareCurrentTool() {
  const currentId = getCurrentModalIdFromUrl();
  if (!currentId) return;

  const tool = state.ferramentas.find((f) => String(f.id) === String(currentId));
  if (!tool) return;

  shareTool(tool);
}

function getCurrentModalIdFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get("modal");
}

// Footer
function updateFooterYear() {
  if (!el.footerYear) return;
  const year = new Date().getFullYear();
  el.footerYear.textContent = String(year);
}
