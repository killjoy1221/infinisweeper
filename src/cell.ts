import { addBubblingListener } from "./event_handlers";
import { revealBranch } from "./generation";
import { gameState, repaintCell } from "./level";

import "./cell/flag_cell"
import "./cell/flag_neighbours"
import "./cell/reveal_cell"
import "./cell/reveal_neighbours"

export type CellData = {
    opened: boolean
    bomb: boolean;
    loaded: boolean;
    count?: number
    flagged?: boolean
}

export type CellAttrs = {
    index: number
    x: number
    y: number
    globalX: number
    globalY: number
    state: CellData
}

const defaultNewCell = JSON.stringify({
    opened: false,
    bomb: false,
    loaded: false
});

export function getOrCreateCellData(x: number, y: number): CellData {
    const key = `cell%${x}%${y}`;
    return JSON.parse(localStorage[key] || defaultNewCell);
}

export function storeCell(x: number, y: number, state: CellData) {
    localStorage[`cell%${x}%${y}`] = JSON.stringify(state);
}

export function getIndex(x: number, y: number): number {
    return (x - gameState.viewport.x) + ((y - gameState.viewport.y) * gameState.viewport.w);
}

export function getCellAttributes(index: string | number): CellAttrs {
    if (typeof index === 'string') {
        index = parseInt(index);
    }
    const x = Math.floor(index % gameState.viewport.w);
    const y = Math.floor(index / gameState.viewport.w);
    const globalX = x + gameState.viewport.x;
    const globalY = y + gameState.viewport.y;
    return {
        index,
        x, y,
        globalX,
        globalY,
        state: getOrCreateCellData(globalX, globalY)
    };
}

export function openBranch(target: HTMLElement) {
    const cell = getCellAttributes(target.dataset.index!);
    const level = target.parentNode;
    if (gameState.checkFirstClick()) {
        cell.state.loaded = true;
    }

    cell.state.opened = true;
    storeCell(cell.globalX, cell.globalY, cell.state);
    revealBranch(cell.globalX, cell.globalY).forEach(repaintCell);
}

addBubblingListener('mousemove', 'cell', target => {
    gameState.focusedCell = getCellAttributes(target.dataset.index!);
});
