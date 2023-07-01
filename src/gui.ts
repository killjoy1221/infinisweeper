import { addBubblingListener, resetCallbacks } from "./event_handlers";
import { gameState } from "./level";
import { getHighScore, getScore, getStreak } from "./player";

import "./assets/main.css"
import "./panning";
import "./zooming";
import "./input";

const gameAttributes = {
    score: () => String(getScore()),
    high_score: () => String(getHighScore()),
    streak: () => String(getStreak()),
    zoom() {
        return String(gameState.viewport.zoom);
    },
    map_coordinates() {
        return `MapX: ${gameState.viewport.x} MapY: ${gameState.viewport.y}`;
    },
    coordinates() {
        return gameState.focusedCell ? `X: ${gameState.focusedCell.globalX} Y: ${gameState.focusedCell.globalY}` : "";
    }
}

setInterval(() => {
    document.querySelectorAll<HTMLElement>('hud entry[data-game-attribute]').forEach(entry => {
        const attr = entry.dataset.gameAttribute!.toLowerCase().replace(' ', '_') as keyof typeof gameAttributes
        const attribute = gameAttributes[attr];
        if (attribute) {
            entry.innerText = attribute();
        }
    });
}, 150);

addBubblingListener('click', '[data-click]', ({dataset}, ev) => {
    const { click, target } = dataset;
    if (click === "toggle") {
        if (target) {
            document.querySelector(target)!.classList.toggle('hidden');
        }
    } else if (click === "reset") {
        const highScore = getHighScore();
        localStorage.clear();
        localStorage['playerHighScore'] = highScore;
        resetCallbacks.forEach(callback => callback());
    } else if (click === "toggleDarkMode") {
        document.body.classList.toggle('dark-mode');
        localStorage['darkMode'] = document.body.classList.contains('dark-mode');
    } else if (click === "capture") {
        // not implemented
    }
});

document.addEventListener('DOMContentLoaded', () => {
   document.body.classList.toggle('dark-mode', localStorage['darkMode'] == 'true');
});
