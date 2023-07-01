
export const resetCallbacks: (() => void)[] = [];

type ListenerCallback<K extends keyof DocumentEventMap> = (target: HTMLElement, event: DocumentEventMap[K]) => void;

export function addBubblingListener<K extends keyof DocumentEventMap>(event: K, selector: string, callback: ListenerCallback<K>) {
    document.addEventListener(event, ev => {
        const element = ev.target as Element
        let target = element.closest<HTMLElement>(selector);
        if (target) callback(target, ev);
    });
}
