const Qless = require('../../../qless').Client;

exports.command = 'fail [jid] [worker]';
exports.desc = 'fail a qless job';
exports.builder = {
  'jid': {
    alias: 'j',
    required: true,
  },
  'worker': {
    alias: 'w',
    required: true,
    default: 'cli-default',
  },
  'group': {
    alias: 'g',
    required: true,
    default: 'default',
  },
  'message': {
    alias: 'm',
    required: true,
    default: 'failed',
  },
};
exports.handler = (yargs) => {
  const client = new Qless({
    host: yargs.host,
    port: yargs.port,
    db: yargs.db,
  });

  client.workerName = yargs.worker;

  client.jobs.get(yargs.jid, (err, job) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    if (!job) {
      console.log(`Job ${yargs.jid} not found`);
      process.exit(0);
    }

    job.fail(yargs.group, yargs.message, (jerr, data) => {
      if (jerr) {
        console.error(jerr);
        process.exit(1);
      }

      console.log(data);
      process.exit(0);
    });
  });
};
