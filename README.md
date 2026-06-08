# Café com Bytes | Hub Serverless

Este projeto é um hub estático e serverless projetado para curadoria rigorosa de ferramentas de engenharia de software e design digital. Foi construído visando velocidade extrema, arquitetura escalável e experiência do usuário otimizada.

## 🎯 Visão e Problema
A comunidade de desenvolvimento sofre de "fatiga de ferramentas". O fluxo constante de novas bibliotecas e frameworks torna difícil identificar o que é hype e o que é solução robusta. O Café com Bytes resolve isso aplicando uma taxonomia focada em **dores resolvidas** e **intenções de uso**.

## 🛠 Arquitetura
O ecossistema é operado com zero infraestrutura de servidor (Serverless), sustentado por arquivos estáticos:
- **HTML5:** Semântico e acessível.
- **CSS3:** Design System baseado em variáveis nativas e Glassmorphism, alternando entre Light/Dark mode via `data-theme`.
- **Vanilla JS:** Processamento assíncrono rigoroso (`Promise.all`), extração de metadados visuais via Regex e injeção assíncrona da base de dados.
- **JSON:** A taxonomia e o catálogo de ferramentas estão totalmente desacoplados em `dados.json`, `parceiros.json` e `tags.json`.

## ✨ Diferenciais de UX
- **Busca Client-Side:** O motor de busca roda inteiramente no navegador do usuário.
- **History API e Compartilhamento:** Os modais injetam URLs contextuais (ex: `?recurso=vercel`), garantindo indexação direta e engajamento via Web Share API.
- **Navegação Bento:** Filtros não atuam por hierarquia rígida, mas por agrupamento de intenção em cards de fácil clique.

## 🚀 Estratégia de Crescimento e Rede
O Café com Bytes atua como um nó em uma rede maior de portais editoriais. A estratégia é reter o usuário pela velocidade de carregamento e assertividade do filtro, convertendo esse tráfego via blocos integrados do ecossistema parceiro injetados via `parceiros.json`. Monetização e métricas são carregadas no footer para não obstruir o *First Contentful Paint* (FCP).

## 📄 Licença e Uso
Código estrutural regido pelas regras do Framework de Portais de Curadoria. O banco de dados constitui propriedade editorial.