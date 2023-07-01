import { gameState } from "./level";

(() => {
    window.addEventListener('wheel', ev => {
        const delta = ev.deltaY < 0 ? 1 : -1;
        gameState.viewport.zoom = Math.max(1, gameState.viewport.zoom + delta);
        document.body.style.setProperty('--level-scale', String(gameState.viewport.zoom));
    });
})();
