# Café Com Bytes

Curadoria editorial premium de ferramentas úteis para quem trabalha, estuda, cria, pesquisa e decide no ambiente digital.

## A história do produto

Café Com Bytes nasceu de um problema muito simples de descrever e muito caro em tempo: a internet está cheia de ferramentas, mas a maior parte das listas ajuda pouco na hora de escolher. Há diretórios demais, promessas demais e contexto de menos.

A intenção deste projeto nunca foi criar “mais uma listona”. A ambição foi construir um portal estático, rápido e editorialmente inteligente, capaz de transformar descoberta em decisão melhor informada. Em vez de tratar ferramentas como inventário, Café Com Bytes trata cada item como uma recomendação contextual.

O nome resolve bem o posicionamento do produto:

- **Café** representa pausa inteligente, clareza mental, ritual, escolha humana e calor editorial.
- **Bytes** representa tecnologia, repertório digital, produtividade e agilidade.

Juntos, eles formam uma metáfora simples: aqui, ferramentas não são despejadas. Elas são servidas.

## Problema que estamos resolvendo

O usuário típico deste portal está cercado por excesso:

- excesso de opções,
- excesso de comparações superficiais,
- excesso de “top 100 ferramentas” sem contexto real de uso.

Esse usuário não quer gastar energia testando quinze possibilidades para descobrir que precisava de duas. Ele quer um atalho confiável entre a dor e o clique.

## A tese de produto

A tese central do Café Com Bytes é que **curadoria útil vale mais do que volume bruto**.

Por isso, o portal:

1. organiza descoberta por **situações humanas**, não só por categorias técnicas;
2. mostra **cenário, cuidado, melhor uso e urgência** em cada card;
3. mantém uma arquitetura 100% estática para garantir velocidade, simplicidade operacional e longevidade do projeto;
4. adota uma linguagem editorial clara, sem hype e sem cara de startup genérica.

## Decisões de experiência

### 1. Navegação por intenção
A home foi estruturada para permitir entrada por contexto, com filtros como:

- Quero organizar meu trabalho
- Quero escrever melhor
- Quero pesquisar mais rápido
- Quero criar conteúdo
- Quero ganhar tempo com IA
- Quero automatizar tarefas
- Quero resolver algo agora

Essa escolha evita que a experiência dependa só de taxonomia técnica. O usuário nem sempre sabe que precisa de uma “ferramenta de automação”; ele sabe que quer parar de repetir a mesma tarefa.

### 2. Curadoria com contexto
Cada ferramenta carrega campos como:

- `dor_resolvida`
- `melhor_para`
- `cuidado`
- `cenario`
- `momento_da_jornada`
- `nivel_de_urgencia`

Isso aumenta a utilidade editorial do portal e reduz o risco de clique cego.

### 3. Estética de cafeteria editorial digital
A identidade visual busca um encontro entre:

- cafeteria contemporânea,
- estúdio digital,
- mesa de trabalho organizada.

A interface usa glassmorphism com disciplina: blur, transparência, bordas suaves e sombras em camadas aparecem em painéis, cards e modais para reforçar profundidade e foco, sem transformar tudo em efeito visual.

### 4. Produto estático por escolha estratégica
A arquitetura em HTML, CSS, JS e JSON não é limitação; é parte da estratégia.

Ela oferece:

- deploy simples,
- manutenção leve,
- performance alta,
- menor complexidade operacional,
- facilidade de expansão para novos portais da rede.

## Estrutura do projeto

- `index.html` — home do portal
- `style.css` — design system, temas e componentes
- `script.js` — carregamento de dados, filtros, busca, modal, tema e acessibilidade
- `dados.json` — base curatorial principal
- `parceiros.json` — ecossistema da rede
- `tags.json` — configuração visual das badges
- `sobre.html` — metodologia editorial
- `privacidade.html` — política de privacidade
- `robots.txt` — diretrizes de rastreamento
- `sitemap.xml` — rotas principais do projeto

## Como pensar a evolução do produto

O portal foi desenhado para crescer em camadas:

### Curto prazo
- ampliar a curadoria em categorias adjacentes;
- enriquecer cenários de uso;
- adicionar mais filtros editoriais.

### Médio prazo
- criar coleções temáticas por perfil;
- destacar trilhas como “comece aqui” para diferentes tipos de usuário;
- expandir integração conceitual com outros portais da rede.

### Longo prazo
- transformar a curadoria em um sistema editorial maior, com ecossistema distribuído de hubs especializados e interoperáveis.

## Considerações finais

O valor do Café Com Bytes não está em ser completo. Está em continuar útil. Em um ambiente digital cheio de excesso, o melhor produto nem sempre é o que mostra mais; muitas vezes é o que ajuda a escolher melhor.

---

**Paulin Basalces**  
Product Manager

“Café Com Bytes existe para reduzir o custo cognitivo de encontrar ferramentas úteis na internet. Menos estoque. Mais critério.”
