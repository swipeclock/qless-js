const Qless = require('../../../qless').Client;

exports.command = 'counts';
exports.desc = 'get count stats for all resources';
exports.builder = {};
exports.handler = (yargs) => {
  const client = new Qless({
    host: yargs.host,
    port: yargs.port,
    db: yargs.db,
  });
  client.resource.counts((err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(JSON.stringify(data));
    process.exit(0);
  });
};
