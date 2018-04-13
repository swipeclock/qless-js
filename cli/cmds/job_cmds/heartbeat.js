const Qless = require('../../../qless').Client;

exports.command = 'heartbeat [jid] [worker]';
exports.desc = 'heartbeat a qless job';
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

    job.heartbeat((jerr, data) => {
      if (jerr) {
        console.error(jerr);
        process.exit(1);
      }

      console.log(data);
      process.exit(0);
    });
  });
};
