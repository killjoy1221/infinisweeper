import { getCellAttributes, getIndex, storeCell } from "./cell";
import { resetCallbacks } from "./event_handlers";
import { generateNeighbours } from "./generation";
import { createEnemyHtml, repaintCell } from "./level";

enum DirectionEnum {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

type BaseEnemy = {
    x: number
    y: number
}

type InitializedEnemy = BaseEnemy & {
    direction: DirectionEnum;
    health: number;
}

export type Enemy = InitializedEnemy & {
    index: number;
    type: keyof typeof enemyTypes;
    dead: boolean;
    dirty: boolean;
}

type EnemyType = {
    initialize(enemy: BaseEnemy): InitializedEnemy
    update(enemy: Enemy): void
}

type Direction = {
    readonly vector: readonly [number, number],
    rotate(forwards: boolean): DirectionEnum;
}

function initDirection(vector: readonly [number, number], prev: DirectionEnum, next: DirectionEnum): Direction{
    return {
        vector,
        rotate(forwards: boolean) {
            return forwards ? next : prev;
        }
    };
}
const directions: Record<DirectionEnum, Direction> = {
    [DirectionEnum.UP]: initDirection([0, -1], DirectionEnum.LEFT, DirectionEnum.RIGHT),
    [DirectionEnum.DOWN]: initDirection([0, 1], DirectionEnum.RIGHT, DirectionEnum.LEFT),
    [DirectionEnum.LEFT]: initDirection([-1, 0], DirectionEnum.DOWN, DirectionEnum.UP),
    [DirectionEnum.RIGHT]: initDirection([1, 0], DirectionEnum.UP, DirectionEnum.DOWN),
};

const enemyTypes = {
    snake: {
        initialize: (enemy) => ({
            ...enemy,
            health: 5 + Math.floor(Math.random() * 50),
            direction: Math.floor(Math.random() * 4) as DirectionEnum,
        }),
        update(enemy) {
            if (Math.random() < 0.2) {
                enemy.direction = directions[enemy.direction].rotate(Math.random() > 0.5);
            }
            const vector = directions[enemy.direction].vector;
    
            moveEnemy(enemy, vector[0], vector[1]);
    
            const index = getIndex(enemy.x, enemy.y);
            const cell = getCellAttributes(index);
            let count = generateNeighbours(cell);
            if (count >= 0) {
                cell.state.count = count;
            } else if (enemy.health-- <= 0) {
                enemy.dead = true;
            }
            enemy.dirty = true;
    
            cell.state.opened = true;
            cell.state.loaded = true;
            storeCell(cell.globalX, cell.globalY, cell.state);
            repaintCell(index);
        }
    }
} satisfies Record<string, EnemyType>;

export const enemies: Enemy[] = JSON.parse(localStorage['enemies'] || '[]');

export function spawnEnemy(x: number, y: number, type: keyof typeof enemyTypes) {
    const enemy: Enemy = {
        ...enemyTypes[type].initialize({ x, y }),
        type,
        index: getIndex(x, y),
        dead: false,
        dirty: false,
    };
    enemies.push(enemy);
    localStorage['enemies'] = JSON.stringify(enemies);
    const level = document.querySelector('level')!;
    level.insertAdjacentHTML('beforeend', createEnemyHtml(enemy))
}

function moveEnemy(enemy: Enemy, changeX: number, changeY: number): void {
    const element = document.querySelector(`enemy[data-index="${enemy.index}"]`)!;
    enemy.x += changeX;
    enemy.y += changeY;
    enemy.dirty = true;
    element.outerHTML = createEnemyHtml(enemy);
}

function filterInplace<T>(array: T[], predicate: (value: T) => boolean) {
    for (let i = 0; i < array.length; i++) {
        const value = array[i];
        if (!predicate(value)) {
            array.splice(i, 1);
            i--;
        }
    }
}


setInterval(() => {
    if (enemies.length) {
        let dirty = false;
        filterInplace(enemies, enemy => {
            enemyTypes[enemy.type].update(enemy);
            dirty ||= enemy.dirty;
            enemy.dirty = false;
            if (enemy.dead) {
                const element = document.querySelector(`enemy[data-index="${enemy.index}"]`);
                if (element) {
                    element.remove();
                }
                return false;
            }
            return true;
        });

        if (dirty) {
            localStorage['enemies'] = JSON.stringify(enemies);
        }
    }
}, 100);

resetCallbacks.push(() => {
    enemies.splice(0)
});
