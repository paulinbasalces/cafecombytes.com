document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const searchInput = document.getElementById('search-input');
  const btnClear = document.getElementById('clear-search');
  const btnGoogle = document.getElementById('google-search');
  const grid = document.getElementById('cards-grid');
  const status = document.getElementById('status-results');
  const filters = document.querySelectorAll('.bento-menu button');
  const modal = document.getElementById('item-modal');
  const partnersContainer = document.getElementById('partners-container');

  let portalData = [];
  let portalTags = {};

  // Toggle de Tema com Persistência
  const savedTheme = localStorage.getItem('theme-preference') || 'dark';
  root.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme-preference', next);
  });

  // Fetch Desacoplado Obrigatório
  Promise.all([
    fetch('dados.json').then(res => res.ok ? res.json() : []),
    fetch('parceiros.json').then(res => res.ok ? res.json() : []),
    fetch('tags.json').then(res => res.ok ? res.json() : {})
  ]).then(([dados, parceiros, tags]) => {
    portalData = dados;
    portalTags = tags;
    renderCards(portalData);
    renderPartners(parceiros);
    checkUrlForModal();
  }).catch(err => {
    status.textContent = "Erro na sincronização dos clusters de dados.";
    console.error("Falha na execução de Promise.all:", err);
  });

  // Extração de Tags via Regex e Tratamento Semântico
  function parseTitleAndTags(rawName) {
    const regex = /\[(.*?)\]/g;
    let tags = [];
    let match;
    while ((match = regex.exec(rawName)) !== null) {
      tags.push(match[1]);
    }
    const cleanName = rawName.replace(regex, '').trim();
    return { cleanName, tags };
  }

  function renderCards(data) {
    grid.innerHTML = '';
    status.textContent = `${data.length} recursos catalogados prontos para uso.`;
    
    if (data.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Nenhum recurso encontrado para esta intenção de busca.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    data.forEach(item => {
      const { cleanName, tags } = parseTitleAndTags(item.nome);
      const card = document.createElement('article');
      card.className = 'card';
      card.tabIndex = 0;
      card.setAttribute('role', 'listitem');

      const tagsHtml = tags.map(t => {
        const style = portalTags[t] || { fundo: 'var(--surface-border)', cor_texto: 'inherit', borda: 'transparent' };
        return `<span class="dynamic-badge" style="background:${style.fundo}; color:${style.cor_texto}; border:1px solid ${style.borda}">${t}</span>`;
      }).join('');

      card.innerHTML = `
        <div class="card-header">
          <span class="emoji" aria-hidden="true">${item.emoji}</span>
          <h3 class="card-title">${cleanName}</h3>
        </div>
        <p>${item.descricao}</p>
        <div class="tags-container">${tagsHtml}</div>
      `;

      const executeModal = () => openModal(item, cleanName);
      card.addEventListener('click', executeModal);
      card.addEventListener('keypress', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); executeModal(); } });
      
      fragment.appendChild(card);
    });

    grid.appendChild(fragment);
  }

  function renderPartners(parceiros) {
    if (!parceiros || !parceiros.length) {
      document.querySelector('.partners-wrapper').style.display = 'none';
      return;
    }
    partnersContainer.innerHTML = parceiros.map(p => `
      <div class="partner-item">
        <a href="${p.url}" target="_blank" rel="noopener noreferrer" title="${p.descricao}">${p.nome}</a>
      </div>
    `).join('');
  }

  // Mecanismo de Busca Local
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = portalData.filter(item =>
      item.nome.toLowerCase().includes(query) ||
      item.descricao.toLowerCase().includes(query) ||
      item.categoria.toLowerCase().includes(query) ||
      item.dor_resolvida.toLowerCase().includes(query)
    );
    renderCards(filtered);
    resetBentoMenu();
  });

  btnClear.addEventListener('click', () => {
    searchInput.value = '';
    renderCards(portalData);
    resetBentoMenu();
  });

  // Delegação para Busca Externa
  btnGoogle.addEventListener('click', () => {
    const q = searchInput.value.trim();
    if(q) {
      window.open(`https://google.com/search?q=site:cafecombytes.com ${encodeURIComponent(q)}`, '_blank');
    }
  });

  // Filtros Bento com Controle de Estado
  function resetBentoMenu() {
    filters.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    filters[0].classList.add('active');
    filters[0].setAttribute('aria-pressed', 'true');
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      searchInput.value = '';
      filters.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      
      const cat = btn.getAttribute('data-filter');
      if (cat === 'all') {
        renderCards(portalData);
      } else {
        renderCards(portalData.filter(item => item.categoria.toLowerCase() === cat.toLowerCase()));
      }
    });
  });

  // Modal com History API
  function openModal(item, cleanName) {
    document.getElementById('modal-title').textContent = cleanName;
    document.getElementById('modal-desc').textContent = item.descricao;
    document.getElementById('modal-pain').textContent = item.dor_resolvida;
    document.getElementById('modal-link').href = item.url;
    
    modal.showModal();
    document.body.style.overflow = 'hidden'; // Evita rolagem de fundo

    // Push State para URL compartilhável
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('recurso', item.id);
    window.history.pushState({ id: item.id }, '', newUrl);
  }

  function closeModal() {
    modal.close();
    document.body.style.overflow = '';
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('recurso');
    window.history.pushState({}, '', newUrl);
  }

  document.getElementById('close-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });

  window.addEventListener('popstate', () => {
    if (modal.open) closeModal();
    checkUrlForModal();
  });

  function checkUrlForModal() {
    const params = new URLSearchParams(window.location.search);
    const recursoId = params.get('recurso');
    if (recursoId && portalData.length) {
      const target = portalData.find(i => i.id === recursoId);
      if (target) {
        const { cleanName } = parseTitleAndTags(target.nome);
        openModal(target, cleanName);
      }
    }
  }

  // Web Share API
  document.getElementById('share-btn').addEventListener('click', async () => {
    const shareData = {
      title: document.getElementById('modal-title').textContent + ' | Café com Bytes',
      text: 'Confira esta ferramenta para desenvolvimento que encontrei:',
      url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Compartilhamento cancelado ou falhou.', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = document.getElementById('share-btn');
        const originalText = btn.textContent;
        btn.textContent = 'URL Copiada!';
        setTimeout(() => btn.textContent = originalText, 2000);
      });
    }
  });
});