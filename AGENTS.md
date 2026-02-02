# AGENTS.md

## Visão geral
- Projeto: **Nana Platform**, jogo de plataforma 2D feito com **Phaser 3** e **Vite**.
- Fluxo atual: **Menu** (imagem + música) → tecla **Espaço** inicia **Game** → ao vencer avança para o próximo nível.
- Entrada web: `index.html` → `src/main.js` → `src/game/main.js`.

## Como rodar
- Instalar dependências: `npm install`
- Dev server: `npm run dev` (padrão `http://localhost:8080`)
- Sem métricas do template: `npm run dev-nolog`
- Build: `npm run build` ou `npm run build-nolog`

## Estrutura essencial
- `src/game/main.js`: configuração do Phaser (resolução 1280x720, scale FIT, Arcade Physics).
- `src/game/scenes/Menu.js`: menu com background + BGM; inicia o jogo no **Espaço**.
- `src/game/scenes/Game.js`: mundo, player, câmera, BGM, zona de morte e colisões.
- `src/game/world/World.js`: céu, nuvens animadas, chão com buracos, obstáculos.
- `src/game/player/Player.js`: movimento, hitbox, animações, coyote time e SFX.
- `src/game/levels/level1.js`: dados do nível (buracos + obstáculos).
- `src/game/levels/level2.js`: dados do nível 2 (buracos + obstáculos).
- `public/assets/*`: sprites, tiles e áudio.
- `public/assets/bg/level*.png`: imagens de intro por nível (overlay com fade de 2s no início de cada level).

## Controles e mecânicas
- Setas: **←/→** andar, **↓** agachar, **↑** pular.
- **Coyote time**: 120ms para pular após sair do chão.
- Buracos desativam colisão do chão; queda ativa **game over**.

## Convenções e notas
- Assets devem ficar em `public/assets` e ser carregados no `preload`.
- Novos níveis: crie arquivo em `src/game/levels` e atualize a cena `Game`.
- Física Arcade com debug ligado (ver `src/game/main.js`).
- Evite alterar `log.js` sem necessidade; use `dev-nolog`/`build-nolog` quando preferir.
