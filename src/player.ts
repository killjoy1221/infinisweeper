import { gameState } from "./level";

let bufferedScore = 0;

export function getScore(): number {
    return parseInt(localStorage["playerScore"] || '0');
}

export function getHighScore(): number {
    return parseInt(localStorage["playerHighScore"] || '0');
}

export function getStreak(): number {
    return parseInt(localStorage["playerStreak"] || '0');
}

export function addScore(amount: number) {
    const score = getScore() + amount;
    if (score > getHighScore()) {
        localStorage["playerHighScore"] = score;
    }
    localStorage["playerScore"] = score;
    bufferedScore += amount;
    if (amount > 0) {
        localStorage["playerStreak"] = getStreak() + 1;
    } else if (amount < 0) {
        localStorage["playerStreak"] = 0;
    }

    return score;
}

function spawnParticle(content: string, rect: DOMRect) {
    document.body.insertAdjacentHTML('beforeend', `<particle style="top:${rect.top + rect.height / 2}px;left:${rect.left + rect.width / 2}px">${content}</particle>`);
    const particle = document.body.lastElementChild!;
    const animationDuration = parseInt(window.getComputedStyle(particle).getPropertyValue('--particle-animation-duration'));
    setTimeout(() => particle.remove(), animationDuration * 1000);
    return particle;
}

setInterval(() => {
    if (bufferedScore != 0 && gameState.focusedCell) {
        const hoveredCell = document.body.querySelector(`cell[data-index="${gameState.focusedCell.index}"]`)!;
        const rect = hoveredCell.getBoundingClientRect();
        const particle = spawnParticle((bufferedScore > 0 ? '+' : '') + bufferedScore, rect);
        if (bufferedScore < 0) {
            particle.classList.add('red');
        }
        bufferedScore = 0;
    }
}, 150);
