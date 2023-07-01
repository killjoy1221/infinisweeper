import { addBubblingListener } from "./event_handlers";
import { getGlobalCssProperties, getLevel, scrollViewPort } from "./level";

(() => {
    let dragging = false;
    let panning = false;
    let startX: number, startY: number, startTime: number;

    addBubblingListener('mousedown', 'level', (target, startEv) => {
        startX = startEv.clientX;
        startY = startEv.clientY;
        startTime = startEv.timeStamp;

        dragging = true;
        panning = false;
    });

    window.addEventListener('mousemove', ev => {
        if (!dragging) return;
        if (ev.timeStamp - startTime < 100) return;
        panning = true;

        const level = getLevel()!;
        const properties = getGlobalCssProperties(level);
        const cellSize = properties.cellSize + properties.cellSpacing;

        const changeX = Math.round((ev.clientX - startX) / cellSize);
        const changeY = Math.round((ev.clientY - startY) / cellSize);

        document.body.style.setProperty('--level-dragging-x', (changeX * cellSize) + 'px');
        document.body.style.setProperty('--level-dragging-y', (changeY * cellSize) + 'px');
    });

    window.addEventListener("mouseup", (ev) => {
        dragging = false;

        if (!panning) return;
        panning = false;
        ev.preventDefault();

        applyPan(ev)
    })

    function applyPan(ev: MouseEvent) {
        const level = getLevel();
        const properties = getGlobalCssProperties(level);
        const cellSize = (properties.cellSize + properties.cellSpacing) * properties.scale;

        const changeX = Math.round(-(ev.clientX - startX) / cellSize);
        const changeY = Math.round(-(ev.clientY - startY) / cellSize);

        level.classList.add('repainting');
        requestAnimationFrame(() => {
            document.body.style.setProperty('--level-dragging-x', "0");
            document.body.style.setProperty('--level-dragging-y', "0");
            scrollViewPort(level, changeX, changeY);
            requestAnimationFrame(() => level.classList.remove('repainting'));
        });
    }
})();
