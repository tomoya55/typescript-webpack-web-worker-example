import {
    Channel,
    Commands,
    EventKeys,
    Events,
    Message,
    SafeEmitter,
} from "../event";

const eventEmitter = new SafeEmitter<Events>();
const commandEmitter = new SafeEmitter<Commands>();

onmessage = (command: MessageEvent) => {
    commandEmitter.emit(command.data.type, ...command.data.data);
};

const newChannelId: () => Channel = () =>
    Math.floor(Math.random() * 100 + 1).toString();

function registerEvents(emitter: SafeEmitter<Events>, ...events: EventKeys[]) {
    events.forEach(e =>
        emitter.on(e, (...data: any[]) => postMessage({ data, type: e }))
    );
}

registerEvents(
    eventEmitter,
    "openedChannel",
    "receivedMessage",
    "closedChannel"
);

commandEmitter
    .on("openChannel", () => {
        console.log("[worker] Creating a new channel");
        const channel = newChannelId();
        eventEmitter.emit("openedChannel", channel);
    })
    .on("publishMessage", (c: Channel, m: Message) => {
        console.log(`[worker] Published message to ${c}: ${m}`);

        let reply: Message;
        if (m.match("Sounds good")) {
            reply = "bye";
        } else {
            reply = `received: ${m}`;
        }
        eventEmitter.emit("receivedMessage", c, reply);
    })
    .on("closeChannel", (c: Channel) => {
        console.log("Closing a channel");
        eventEmitter.emit("closedChannel", c);
    });
