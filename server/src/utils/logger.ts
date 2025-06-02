type LogArgs = string | number | boolean | object | null | undefined;

const logger = {
  info: (message: string, ...args: LogArgs[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      // Using console.log for development logging
      // eslint-disable-next-line no-console
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: LogArgs[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      // Using console.error for development error logging
      // eslint-disable-next-line no-console
      console.error(message, ...args);
    }
  },
};

export default logger; 