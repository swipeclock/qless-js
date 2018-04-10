const Qless = require('../../../qless').Client;

exports.command = 'pause [queue]';
exports.desc = 'get count stats for all queues';
exports.builder = {
  'queue': {
    alias: 'q',
    required: true,
    default: 'default',
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
  q.pause((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log('OK');
    process.exit(0);
  });
};
