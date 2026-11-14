# Roteiro São Luís

App mobile (web app) com 10 pontos turísticos de São Luís – MA no mapa, para avaliar com estrelas e votar no melhor lugar.

## Telas
- **Mapa**: os 10 pontos com marcadores; toque num marcador ou num atalho para ver os detalhes.
- **Lugares**: lista com categoria e sua nota.
- **Ranking**: pódio e classificação (nota em estrelas + 2 pontos de bônus para o lugar votado como melhor).

## Como rodar
Não precisa instalar nada. Na pasta do projeto:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000` no navegador (ou no celular, pelo IP do computador na mesma rede).
No celular, use "Adicionar à tela inicial" para abrir como app.

## Arquivos
- `data.js` — os 10 pontos (nome, coordenadas, descrição, cor, ícone)
- `app.js` — mapa, votação e ranking
- `styles.css` — visual
- `index.html` — estrutura

As avaliações ficam salvas no próprio aparelho (localStorage). Para juntar os votos de todos os usuários num ranking único, o próximo passo é ligar o app a um backend.
