// pino 浏览器端 mock
const noop = () => {};

const createLogger = () => {
  const logger = {
    trace: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    fatal: noop,
    silent: noop,
    child: () => createLogger(),
    level: 'silent',
    isLevelEnabled: () => false,
    bindings: () => ({}),
    flush: noop,
    levels: {
      values: {
        trace: 10,
        debug: 20,
        info: 30,
        warn: 40,
        error: 50,
        fatal: 60,
        silent: Infinity
      },
      labels: {
        10: 'trace',
        20: 'debug',
        30: 'info',
        40: 'warn',
        50: 'error',
        60: 'fatal'
      }
    }
  };
  return logger;
};

const pino = createLogger;
pino.default = pino;
pino.pino = pino;
pino.destination = () => ({});
pino.transport = () => ({});
pino.multistream = () => ({});
pino.stdSerializers = {};
pino.stdTimeFunctions = {};
pino.symbols = {};
pino.levels = createLogger().levels;

module.exports = pino;
module.exports.default = pino;


