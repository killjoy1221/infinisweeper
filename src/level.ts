import { getCellAttributes, type CellAttrs } from "./cell"
import { Enemy, enemies } from "./enemy"
import { resetCallbacks } from "./event_handlers"

type GameState = {
    viewport: {
        x: number
        y: number
        w: number
        h: number
        zoom: number
    }
    developerMode: boolean
    focusedCell: CellAttrs | null
    bombRate: number
    getBombRate(): number
    checkFirstClick(): boolean;
}


export const gameState: GameState = {
    viewport: { x: 0, y: 0, w: 0, h: 0, zoom: 1 },
    developerMode: false,
    focusedCell: null,
    bombRate: 0.23,
    getBombRate() {
        if (!localStorage["hasHadFirstClick"]) {
            return -1;
        }
        return this.bombRate
    },
    checkFirstClick() {
        if (!localStorage["hasHadFirstClick"]) {
            localStorage["hasHadFirstClick"] = 1;
            return true;
        }
        return false;
    }
};

function buildLevel(level: HTMLElement) {
    const properties = getGlobalCssProperties(level);
    resizeViewPort(level, properties.width, properties.height);
}

export function getLevel(selector = "level") {
    return document.querySelector(selector)! as HTMLElement;
}

export function getGlobalCssProperties(level: HTMLElement) {
    const css = window.getComputedStyle(level);
    const levelBounds = level.getBoundingClientRect();
    const cellSize = parseFloat(css.getPropertyValue('--cell-size'));
    const cellSpacing = parseFloat(css.getPropertyValue('--level-grid-width')) * 2;
    return {
        width: Math.floor(Math.floor(levelBounds.width) / (cellSize + cellSpacing)),
        height: Math.floor(Math.floor(levelBounds.height) / (cellSize + cellSpacing)),
        scale: parseFloat(css.getPropertyValue('--level-scale') || '1'),
        cellSize,
        cellSpacing
    };
}

export function scrollViewPort(level: HTMLElement, changeX: number, changeY: number) {
    changeX = isNaN(changeX) ? 0 : changeX;
    changeY = isNaN(changeY) ? 0 : changeY;
    gameState.viewport.x += changeX;
    gameState.viewport.y += changeY;
    writeViewportToElement(level);
    document.location.hash = `${gameState.viewport.x};${gameState.viewport.y}`;
    resizeViewPort(level, gameState.viewport.w, gameState.viewport.h);
}

function resizeViewPort(level: HTMLElement, columns: number, rows: number) {
    gameState.viewport.w = columns;
    gameState.viewport.h = rows;
    writeViewportToElement(level);
    level.innerHTML =
        createArray(columns * rows, cellHtml).join('')
        + enemies.map((createEnemyHtml)).join('');
}

function writeViewportToElement(level: HTMLElement) {
    level.classList.toggle('developer-mode', gameState.developerMode);
    level.style.setProperty('--columns', String(gameState.viewport.w));
    level.style.setProperty('--rows', String(gameState.viewport.h));
    level.style.setProperty('--x', String(gameState.viewport.x));
    level.style.setProperty('--y', String(gameState.viewport.y));
}

export function cellHtml(index: number) {
    return createCellHtml(getCellAttributes(index));
}

export function createCellHtml(cell: CellAttrs) {
    return `<cell data-index="${cell.index}"
        data-opened="${cell.state.opened}"
        data-count="${cell.state.count || 0}"
        data-flag="${cell.state.flagged || false}"
        data-loaded="${cell.state.loaded || false}"
        ${(cell.state.opened || gameState.developerMode) && cell.state.bomb ? 'data-bomb="true"' : ''}></cell>`;
}

export function createEnemyHtml(enemy: Enemy) {
    return `<enemy data-index="${enemy.index}" style="--column:${enemy.x};--row:${enemy.y}"></enemy>`;
}

export function repaintCell(index: number) {
    pendingUpdates.add(index)
}

function createArray<T>(len: number, factory: (index: number) => T): T[] {
    const arr = Array(Math.floor(len)).fill(0);
    return arr.map((_, index) => factory(index));
}

const pendingUpdates = new Set<number>();

setInterval(() => {
    const updatedThisFrame = [...pendingUpdates];
    pendingUpdates.clear()

    updatedThisFrame.forEach(index => {
        const element = document.querySelector(`level cell[data-index="${index}"]`);
        if (element) {
            element.outerHTML = createCellHtml(getCellAttributes(index));
        }
    });
}, 150);

resetCallbacks.push(() => buildLevel(document.querySelector('level')!));

document.addEventListener('DOMContentLoaded', () => {
    const pair = document.location.hash.replace('#', '')
        .split(';')
        .map(parseFloat)
        .filter(a => !isNaN(a));

    if (pair.length == 2) {
        gameState.viewport.x = pair[0];
        gameState.viewport.y = pair[1];
    }

    buildLevel(document.querySelector('level')!);
    gameState.focusedCell = getCellAttributes(0);
});
window.addEventListener('resize', () => buildLevel(document.querySelector('level')!));
