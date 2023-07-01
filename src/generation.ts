import { CellAttrs, CellData, getIndex, getOrCreateCellData, storeCell } from "./cell";
import { gameState, repaintCell } from "./level";
import { addScore } from "./player";

const neighbourMatrix = [
    [-1, -1], [0, -1], [1, -1],
    [-1,  0],          [1,  0],
    [-1,  1], [0,  1], [1,  1]
] as const;

export function generateNeighbours(cell: CellAttrs) {
    return generateCellNeighbours(cell.globalX, cell.globalY, cell.state);
}

export function generateCellNeighbours(x: number, y: number, cell: CellData) {
    cell.count = neighbourMatrix
        .map(offset => [x + offset[0], y + offset[1]])
        .filter(offset => countOrCreateNeighbour(offset[0], offset[1]))
        .length;

    if (cell.bomb) {
        return -1;
    }
    return cell.count;
}

function countOrCreateNeighbour(x: number, y: number) {
    return generateBomb(x, y, getOrCreateCellData(x, y));
}

function generateBomb(x: number, y: number, properties: CellData) {
    if (!properties.loaded) {
        properties.loaded = true;
        if (!properties.opened) {
          properties.bomb = Math.random() <= gameState.getBombRate();
        }
        storeCell(x, y, properties);
        repaintCell(getIndex(x, y));
    }
    return !!properties.bomb;
}

export function revealBranch(startX: number, startY: number, recurseLimit: number = 8, affectedIndices: Set<number> = new Set()) {
    recurseLimit -= 1;
    if (recurseLimit <= 0) return affectedIndices;

    countOrCreateNeighbour(startX, startY);

    forEachNeighbours(startX, startY, (x, y) => {
        const index = getIndex(x, y);
        if (!affectedIndices.has(index)) {
            affectedIndices.add(index);
            const cell = getOrCreateCellData(x, y);
            const neighbourCount = generateCellNeighbours(x, y, cell);
            if (!cell.opened && neighbourCount >= 0) {
                cell.opened = true;
                addScore(neighbourCount < 0 ? -15 : neighbourCount);
                storeCell(x, y, cell);
                if (neighbourCount == 0) {
                    revealBranch(x, y, recurseLimit, affectedIndices);
                }
            }
        }
    });

    return affectedIndices;
}

export function forEachNeighbours(x: number, y: number, action: (x: number, y: number) => void) {
    neighbourMatrix
        .map(offset => [x + offset[0], y + offset[1]])
        .forEach(offset => action(offset[0], offset[1]));
}
