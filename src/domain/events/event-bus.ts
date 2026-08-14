import { EventEmitter } from "events";
import { Event } from "./domain-event";

class EventBus {
    private emitter = new EventEmitter();

    publish(event: Event): void {
        this.emitter.emit(event.name, event)
    }

    subscribe<T extends Event> (
        name : string,
        handler : (event : T) => Promise<void> | void
    ): void {
        this.emitter.on(name, async (event : T) => {
            try {
                await handler(event)
            } catch (err){
                console.error(`Erro no listener de "${name}":`, err);
            }
        })
    }
}

export const eventBus = new EventBus();

