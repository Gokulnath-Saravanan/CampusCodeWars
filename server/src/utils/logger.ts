const logger = {
  info: (message: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(message, ...args);
    }
  },
};

export default logger; 