# Nana Platform

Jogo de plataforma 2D feito com **Phaser 3** e **Vite**. O fluxo atual começa na cena **Menu** (imagem e música) e, ao pressionar **Espaço**, inicia a cena **Game**.

## Requisitos

- [Node.js](https://nodejs.org)

## Como rodar

```bash
npm install
npm run dev
```

Servidor padrão: `http://localhost:8080`.

## Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm install` | Instala as dependências |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção em `dist` |
| `npm run dev-nolog` | Dev sem envio de dados anônimos (`log.js`) |
| `npm run build-nolog` | Build sem envio de dados anônimos (`log.js`) |

## Estrutura do projeto

| Caminho | Descrição |
|--------|-----------|
| `index.html` | Página base que contém o canvas do jogo |
| `public/assets` | Assets estáticos (sprites, áudio, etc.) |
| `public/style.css` | Estilos globais |
| `src/main.js` | Bootstrap da aplicação |
| `src/game/main.js` | Entrada do jogo Phaser |
| `src/game/scenes` | Cenas do jogo (Menu, Game) |
| `src/game/player` | Lógica do personagem |
| `src/game/world` | Lógica do mundo/cenário |
| `src/game/levels` | Dados de fases (buracos/obstáculos) |

## Assets

- **Sprites e tiles**: `public/assets/sprites`, `public/assets/tiles`
- **Fundo do menu**: `public/assets/bg/menu.png`
- **Música**: `public/assets/audio/music`
- **SFX**: `public/assets/audio/sfx`

Para carregar assets no Phaser:

```js
this.load.image('menu_bg', 'assets/bg/menu.png');
this.load.audio('bgm_menu', 'assets/audio/music/bgm_menu.mp3');
```

## Fluxo do jogo

- **Menu**: exibe imagem de fundo e toca música.
- **Início**: pressione **Espaço** para entrar no jogo.
- **Game**: cena principal com player, obstáculos e efeitos.

## Build de produção

```bash
npm run build
```

O build fica em `dist/` com todos os assets copiados.

## Sobre o log.js

O `log.js` faz uma chamada silenciosa para métricas anônimas do template.  
Se preferir desativar, use `dev-nolog` / `build-nolog` ou remova o `log.js` dos scripts no `package.json`.
