# Café com Bytes

> Hub cyber futurista de curadoria de ferramentas online, projetado como um portal leve, transparente e focado em produtividade real.

## Visão geral

O Café com Bytes nasceu de uma constatação simples: a maior parte do tempo gasto na adoção de novas ferramentas não está no teste em si, mas na busca – abas demais, termos vagos demais, resultados genéricos demais.

Este repositório abriga o código do portal `cafecombytes.com`, pensado como um agregador de links de ferramentas amplamente buscadas na internet, organizado por contexto de uso e não por jargão técnico.

Como Product Manager, a minha narrativa aqui é menos sobre “features” e mais sobre decisões de produto: o que escolhemos **não** fazer é tão importante quanto o que entrou no MVP.

## Objetivo do produto

- Ser o primeiro lugar onde uma pessoa curiosa pode ir quando pensa:  
  “Deve existir uma ferramenta pra isso…”
- Priorizar **descoberta rápida** sobre profundidade infinita de catálogo.
- Reduzir o atrito entre intenção e clique, com:
  - busca local simples,
  - filtros em Bento Grid por contexto,
  - cards com linguagem clara de “dor que a ferramenta resolve”.

Não queremos competir com buscadores ou diretórios gigantescos. Queremos ser um mapa opinativo e enxuto.

## Público-alvo

1. Criadores de conteúdo (texto, imagem, vídeo, áudio) que vivem testando ferramentas novas.
2. Pessoas em transição de carreira ou estudo, que precisam aumentar produtividade sem um stack complexo.
3. Generalistas digitais que fazem “de tudo um pouco” e querem atalhos confiáveis.

Persona base: alguém que abre 10 abas por curiosidade, mas só tem 20 minutos entre uma tarefa e outra para testar algo novo.

## Decisões de produto

### 1. Arquitetura estática e serverless

Optamos por uma arquitetura puramente estática (HTML, CSS, JS, JSON):

- Deploy simples em qualquer CDN.
- Custos previsíveis e baixos.
- Extremamente rápido para o usuário final.
- Menos superfície de ataque (sem backend customizado).

Toda a curadoria vive em arquivos JSON (`dados.json`, `parceiros.json`, `tags.json`), consumidos via `fetch` e renderizados no cliente.

### 2. Curadoria em vez de catálogo exaustivo

O portal lista um conjunto **selecionado** de ferramentas, não um índice completo da internet. Isso libera o time para:

- dizer explicitamente “isso aqui é bom o suficiente para testar hoje”;
- remover sem dó o que envelheceu mal;
- aceitar que não vamos cobrir todos os nichos.

O botão “Buscar no Google” é o escape hatch honesto: se a curadoria não resolveu, abrimos o caminho de volta para a web ampla, sem aprisionar o usuário.

### 3. Experiência visual: cyber café futurista

A estética mistura:

- **Glassmorphism** (painéis translúcidos com `backdrop-filter`) para dar a sensação de HUD de ficção científica;
- paleta **neon em fundo escuro** (ciano, magenta, roxo) cuidadosamente evitendo preto e branco puros para manter conforto visual;
- tipografia com cara de interface: Orbitron para títulos (HUD / display) e Space Grotesk para corpo (legibilidade em blocos densos).

A ideia é passar a sensação de “terminal de bordo” acessível, não de painel corporativo sisudo.

### 4. Navegação por contexto (Bento Grid)

O menu de filtros usa um layout estilo Bento Grid:

- blocos maiores para modos de descoberta (“Tudo ao mesmo tempo”);
- blocos médios para grandes áreas de uso (escrita, imagem, vídeo, áudio, produtividade, estudos);
- microdescritivos orientados à dor, não ao tipo de arquivo.

Isso deixa claro **por que** alguém clicaria em uma categoria, não apenas o nome técnico dela.

### 5. Cartões explicando “dor resolvida”

Cada ferramenta é descrita em três camadas:

1. **Nome com tags em colchetes**  
   Ex.: `Photopea [Gratuito] [Sem Login]`
2. **“dor_resolvida”** – uma frase curta que responde “pra que eu usaria isso hoje?”
3. **Descrição** – um resumo neutro, mas opinativo, sobre o encaixe da ferramenta no dia a dia.

As tags entre colchetes são extraídas via regex no frontend e exibidas como badges, com cores configuráveis em `tags.json`.

### 6. Transparência editorial

O site inclui:

- `sobre.html`: explica critérios de seleção, atualização e independência editorial.
- `privacidade.html`: deixa claro que não há coleta ativa de dados pessoais pelo portal em si e que serviços de terceiros (como Google Ads) têm políticas próprias.

A intenção é que qualquer pessoa lendo duas páginas saiba exatamente:
- o que o portal faz,
- o que não faz,
- e quem mais pode estar processando dados durante a navegação.

## Decisões técnicas

### Frontend

- HTML semântico (header, main, section, article, footer).
- CSS com:
  - design system simples (tipografia fluida, escala de espaçamento em 4px, tema light/dark via `data-theme`);
  - Glassmorphism com bordas suaves, sombras em camadas e transparências calibradas;
  - responsividade mobile‑first (grade colapsa para uma coluna, filtros em pilha vertical, cards fluidos).
- JavaScript vanilla:
  - `Promise.all` para carregar `dados.json`, `parceiros.json`, `tags.json`;
  - busca local em memória (sem roundtrip para servidor);
  - filtro por categoria (Bento Grid);
  - modal de detalhes de ferramenta, controlado via History API e parâmetro `?modal=`;
  - Web Share API / fallback de cópia de link para compartilhamento rápido.

### SEO e rastreio responsável

- `robots.txt`:
  - bloqueia especificamente URLs com `?q=` (busca interna) e `?modal=` (estado de UI), evitando que esses parâmetros criem ruído em mecanismos de busca;
  - referencia `sitemap.xml` na raiz.
- `sitemap.xml`:
  - lista `index`, `sobre` e `privacidade` com `lastmod` e prioridades básicas.

Não se pretende competir por todas as palavras-chave de ferramentas, mas garantir que os pilares editoriais sejam facilmente descobertos.

## Roadmap (alto nível)

- **Curto prazo**
  - Mais categorias contextuais (por exemplo, “freelancers”, “marketing local”, “estudo para concursos”).
  - Marcação de ferramentas instáveis (“beta”, “experimental”) de forma mais evidente no UI.
- **Médio prazo**
  - Versões temáticas do portal (ex.: foco apenas em estudos, apenas em criadores de conteúdo).
  - Integrações mais profundas com portais parceiros da rede.
- **Longo prazo**
  - Mecanismos de feedback leve (voto “funcionou / não funcionou” sem login).
  - Curadorias sazonais (ex.: “stack mínimo para começar um side project em 7 dias”).

## Como contribuir

Mesmo que este projeto tenha nascido como uma curadoria editorial, o código é intencionalmente simples para facilitar ajustes:

- ajustes de texto podem ser feitos diretamente em `dados.json`, `sobre.html` e `privacidade.html`;
- mudanças visuais podem ser concentradas em `style.css`;
- novas interações ou filtros podem ser implementados em `script.js`.

Pull requests que melhorem a clareza da experiência, a acessibilidade ou a transparência editorial são especialmente bem‑vindos.

---

_Por: Paulin Basalces, Product Manager_  
“Se a pessoa entendeu em 30 segundos o que o portal faz, o design de produto está no caminho certo.”
