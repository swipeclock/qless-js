const Qless = require('../../../qless').Client;

exports.command = 'unpause [queue]';
exports.desc = 'unpause a queue';
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
  q.unpause((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log('OK');
    process.exit(0);
  });
};
