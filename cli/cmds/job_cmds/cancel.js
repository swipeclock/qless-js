const Qless = require('../../../qless').Client;

exports.command = 'cancel [jid]';
exports.desc = 'cancel a qless job';
exports.builder = {
  'jid': {
    alias: 'j',
    required: true,
  },
};
exports.handler = (yargs) => {
  const client = new Qless({
    host: yargs.host,
    port: yargs.port,
    db: yargs.db,
  });

  client.jobs.get(yargs.jid, (err, job) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    if (!job) {
      console.log(`Job ${yargs.jid} not found`);
      process.exit(0);
    }

    job.cancel((jerr, data) => {
      if (jerr) {
        console.error(jerr);
        process.exit(1);
      }

      console.log(data);
      process.exit(0);
    });
  });
};
