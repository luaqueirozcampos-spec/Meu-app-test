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

## Fotos
Todas as fotos vêm do Wikimedia Commons, com licenças livres:

- **Centro Histórico**: Prburley (CC BY 4.0), [fonte](https://commons.wikimedia.org/wiki/File:Rua_Portugal_S%C3%A3o_Lu%C3%ADs_Maranh%C3%A3o_2025-6049.jpg)
- **Palácio dos Leões**: Marcus Guimarães (CC BY 2.0), [fonte](https://commons.wikimedia.org/wiki/File:SaoLuis-PalacioLeoes.jpg)
- **Catedral da Sé**: MTur Destinos (Public domain), [fonte](https://commons.wikimedia.org/wiki/File:DouglasJunior_Catedral_da_S%C3%A9_s%C3%A3oLuis_MA_(40156114344).jpg)
- **Teatro Arthur Azevedo**: Marcus Soares (CC BY-SA 3.0), [fonte](https://commons.wikimedia.org/wiki/File:Teatro_Arthur_Azevedo.JPG)
- **Rua Portugal**: MTur Destinos (Public domain), [fonte](https://commons.wikimedia.org/wiki/File:DouglasJunior_Rua_do_Portugal_S%C3%A3o_Luis_MA_(39970771905).jpg)
- **Fonte do Ribeirão**: Prburley (CC BY 4.0), [fonte](https://commons.wikimedia.org/wiki/File:Fonte_do_Ribeir%C3%A3o_S%C3%A3o_Lu%C3%ADs_Maranh%C3%A3o_2025-8896.jpg)
- **Convento das Mercês**: Artur Oliveira Silva (CC BY-SA 4.0), [fonte](https://commons.wikimedia.org/wiki/File:Convento_das_Merc%C3%AAs.jpg)
- **Lagoa da Jansen**: Lyssuel Calvet (CC BY 2.0), [fonte](https://commons.wikimedia.org/wiki/File:Lagoa_da_Jansen_-_S%C3%A3o_Lu%C3%ADs_-_Maranh%C3%A3o_-_Brasil_-_Lagoon_of_the_Jansen_-_S%C3%A3o_Lu%C3%ADs_-_Maranh%C3%A3o_-_Brazil_(3870641863).jpg)
- **Praia do Calhau**: MTur Destinos (Public domain), [fonte](https://commons.wikimedia.org/wiki/File:DouglasJunior_Praia_do_Calhau_S%C3%A3o_Luis_MA_(25992414547).jpg)
- **Espigão Costeiro**: Ajmcbarreto (CC BY-SA 4.0), [fonte](https://commons.wikimedia.org/wiki/File:Espig%C3%A3o_Costeiro_-_01.jpg)

## Arquivos
- `data.js` — os 10 pontos (nome, coordenadas, descrição, cor, ícone)
- `app.js` — mapa, votação e ranking
- `styles.css` — visual
- `index.html` — estrutura
- `img/` — fotos dos pontos

As avaliações ficam salvas no próprio aparelho (localStorage). Para juntar os votos de todos os usuários num ranking único, o próximo passo é ligar o app a um backend.
