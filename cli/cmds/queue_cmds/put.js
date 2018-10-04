const Qless = require('../../../qless').Client;

exports.command = 'put';
exports.desc = 'place a job on a queue';
exports.builder = {
  'klass': {
    alias: 'k',
    required: true,
  },
  'jid': {
    alias: 'j',
    required: false,
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
  'resources': {
    default: '[]',
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
  q.put(
    yargs.klass,
    JSON.parse(yargs.data),
    {
      'resources': JSON.parse(yargs.resources),
      'jid': yargs.jid,
    },
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
