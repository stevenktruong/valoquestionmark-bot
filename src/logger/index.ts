import pino from "pino";

Error.stackTraceLimit = 20;

export default pino({
    base: {
        pid: undefined,
    },
    transport: {
        target: "pino-pretty",
        options: {
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss o",
        },
    },
});
