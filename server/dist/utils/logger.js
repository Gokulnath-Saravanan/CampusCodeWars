"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = {
    info: (message, ...args) => {
        if (process.env.NODE_ENV !== 'test') {
            // Using console.log for development logging
            // eslint-disable-next-line no-console
            console.log(message, ...args);
        }
    },
    error: (message, ...args) => {
        if (process.env.NODE_ENV !== 'test') {
            // Using console.error for development error logging
            // eslint-disable-next-line no-console
            console.error(message, ...args);
        }
    },
};
exports.default = logger;
