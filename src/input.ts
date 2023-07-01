import { getLevel, scrollViewPort } from "./level";

const keys =  {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
    W: "w",
    A: "a",
    S: "s",
    D: "d",
    SHIFT: "shift"
};
const heldKeys: Record<string, boolean> = {};

window.addEventListener('keydown', ev => heldKeys[ev.key] = true);
window.addEventListener('keyup', ev => heldKeys[ev.key] = false);

setInterval(() => {
    let yChange = 0;
    let xChange = 0;

    if (heldKeys[keys.UP] || heldKeys[keys.W]) yChange--;
    if (heldKeys[keys.DOWN] || heldKeys[keys.S]) yChange++;
    if (heldKeys[keys.LEFT] || heldKeys[keys.A]) xChange--;
    if (heldKeys[keys.RIGHT] || heldKeys[keys.D]) xChange++;

    if (xChange != 0 || yChange != 0) {
        if (heldKeys[keys.SHIFT]) {
            xChange *= 4;
            yChange *= 4;
        }
        scrollViewPort(getLevel(), xChange, yChange);
        xChange = 0;
        yChange = 0;
    }
}, 150);
