import { getCellAttributes, storeCell } from "../cell";
import { addBubblingListener } from "../event_handlers";
import { generateNeighbours } from "../generation";
import { createCellHtml } from "../level";
import { addScore } from "../player";

function flagCell(target: HTMLElement) {
    const cell = getCellAttributes(target.dataset.index!);

    if (cell.state.opened) {
        return;
    }

    generateNeighbours(cell);

    let score = 15;

    if (!cell.state.bomb) {
        score = -score;
    }
    if (cell.state.flagged) {
        score = -score;
    }

    addScore(score);
    cell.state.flagged = !cell.state.flagged;

    storeCell(cell.globalX, cell.globalY, cell.state);
    target.outerHTML = createCellHtml(cell);
}

addBubblingListener('contextmenu', 'cell', (target, ev) => {
    flagCell(target);
    ev.preventDefault();
});
