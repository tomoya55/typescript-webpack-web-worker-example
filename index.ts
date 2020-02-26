import { newWorkerViaBlob } from "./common/worker";
import {
    Channel,
    CommandKeys,
    Commands,
    Events,
    Message,
    SafeEmitter,
} from "./event";

const eventEmitter = new SafeEmitter<Events>();
const commandEmitter = new SafeEmitter<Commands>();

const worker = newWorkerViaBlob("bundle/worker.js");
worker.onmessage = (e: MessageEvent) => {
    eventEmitter.emit(e.data.type, ...e.data.data);
};

function registerCommands(
    emitter: SafeEmitter<Commands>,
    ...events: CommandKeys[]
) {
    events.forEach(e =>
        emitter.on(e, (...data: any[]) => worker.postMessage({ data, type: e }))
    );
}

registerCommands(
    commandEmitter,
    "openChannel",
    "publishMessage",
    "closeChannel"
);

eventEmitter
    .on("openedChannel", (c: Channel) =>
        commandEmitter.emit("publishMessage", c, "How's a life as worker?")
    )
    .on("receivedMessage", (c: Channel, m: Message) => {
        console.log(`[main] Received message on channel ${c}: ${m}`);
        if (m.match(/bye/i)) {
            commandEmitter.emit("closeChannel", c);
        } else {
            commandEmitter.emit("publishMessage", c, "Sounds good");
        }
    })
    .on("closedChannel", (c: Channel) =>
        console.log(`[main] Conversation over on channel ${c}`)
    );

commandEmitter.emit("openChannel");
