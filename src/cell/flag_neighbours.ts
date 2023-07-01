import { Space } from ".";
import { getOrCreateCellData, storeCell, getIndex, getCellAttributes } from "../cell";
import { addBubblingListener } from "../event_handlers";
import { generateNeighbours, forEachNeighbours, generateCellNeighbours } from "../generation";
import { repaintCell } from "../level";
import { addScore } from "../player";


function flagNeighbours(target: HTMLElement) {
    const cell = getCellAttributes(target.dataset.index!);

    if (!cell.state.opened) {
        return;
    }

    const bombCount = generateNeighbours(cell);

    let unrevealedSpaces = 0;
    const bombs: Space[] = [];

    forEachNeighbours(cell.globalX, cell.globalY, (x, y) => {
        const neighbour = getOrCreateCellData(x, y);
        generateCellNeighbours(x, y, neighbour);

        if (!neighbour.opened) {
            unrevealedSpaces++;

            if (neighbour.bomb && !neighbour.flagged) {
                bombs.push({x, y, neighbour });
            }
        }
    });

    if (unrevealedSpaces <= bombCount) {
        bombs.forEach(space => {
            space.neighbour.flagged = true;
            addScore(15);
            storeCell(space.x, space.y, space.neighbour);
            repaintCell(getIndex(space.x, space.y));
        });
    }
}

addBubblingListener('contextmenu', 'cell[data-opened=true]', (target, ev) => {
    flagNeighbours(target);
    ev.preventDefault();
});
