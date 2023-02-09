import pino from "pino";

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
