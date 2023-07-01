import { getCellAttributes, storeCell } from "../cell";
import { spawnEnemy } from "../enemy";
import { addBubblingListener } from "../event_handlers";
import { generateNeighbours, revealBranch } from "../generation";
import { gameState, repaintCell, createCellHtml } from "../level";
import { addScore } from "../player";

function openSingleCell(target: HTMLElement) {
    const cell = getCellAttributes(target.dataset.index!);

    if (cell.state.opened) return;

    if (gameState.checkFirstClick()) {
        cell.state.loaded = true;
    } else {
        if (Math.random() <= 0.03) {
            spawnEnemy(cell.globalX, cell.globalY, 'snake');
        }
    }

    const neighbourCount = generateNeighbours(cell);

    if (neighbourCount == 0) {
        Object.values(revealBranch(cell.globalX, cell.globalY)).forEach(repaintCell);
    }
    cell.state.opened = true;
    addScore(neighbourCount < 0 ? -15 : neighbourCount);
    storeCell(cell.globalX, cell.globalY, cell.state);
    target.outerHTML = createCellHtml(cell);
}

addBubblingListener('click', 'cell', openSingleCell);
