import EventEmitter from "events";

type EventsOf<T> = keyof T & string;

type ListenerFunc<T, E extends EventsOf<T>> = T[E] extends (
    ...args: any[]
) => void
    ? T[E]
    : never;

type ListenerArgs<T, E extends EventsOf<T>> = T[E] extends (
    ...args: infer A
) => void
    ? A
    : never;

export class SafeEmitter<T> {
    private emitter = new EventEmitter();
    public emit<E extends EventsOf<T>>(event: E, ...data: ListenerArgs<T, E>) {
        this.emitter.emit(event, ...data);
        return this;
    }

    public on<E extends EventsOf<T>>(event: E, listener: ListenerFunc<T, E>) {
        this.emitter.on(event, listener);
        return this;
    }
}

export type Channel = string;
export type Message = string;

export type Commands = {
    openChannel: () => void;
    publishMessage: (c: Channel, m: Message) => void;
    closeChannel: (c: Channel) => void;
};
export type CommandKeys = keyof Commands;

export type Events = {
    openedChannel: (c: Channel) => void;
    receivedMessage: (c: Channel, m: Message) => void;
    closedChannel: (c: Channel) => void;
};

export type EventKeys = keyof Events;
