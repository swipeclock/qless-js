const Qless = require('../../../qless').Client;

exports.command = 'pop [worker] [queue] [count]';
exports.desc = 'pop a job from a queue';
exports.builder = {
  'worker': {
    alias: 'w',
    required: true,
    default: 'cli-default',
  },
  'queue': {
    alias: 'q',
    required: true,
    default: 'default',
  },
  'count': {
    alias: 'c',
    default: 1,
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
  q.multipop(yargs.count, (err, jobs) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(jobs);
    process.exit(0);
  });
};
