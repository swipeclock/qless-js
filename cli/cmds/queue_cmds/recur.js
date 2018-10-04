const Qless = require('../../../qless').Client;

exports.command = 'recur';
exports.desc = 'place a recurring job on a queue';
exports.builder = {
  'klass': {
    alias: 'k',
    required: true,
  },
  'jid': {
    alias: 'j',
    required: true,
    default: null,
  },
  'queue': {
    alias: 'q',
    required: true,
    default: 'default',
  },
  'data': {
    alias: 'd',
    default: '{}',
  },
  'interval': {
    alias: 'i',
    required: true,
  },
};
exports.handler = (yargs) => {
  const client = new Qless({
    host: yargs.host,
    port: yargs.port,
    db: yargs.db,
  });

  client.workerName = yargs.worker;

  const q = client.queue(yargs.queue);
  q.recur(
    yargs.klass,
    JSON.parse(yargs.data),
    yargs.interval,
    (err, data) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      console.log(data);
      process.exit(0);
    }
  );
};
