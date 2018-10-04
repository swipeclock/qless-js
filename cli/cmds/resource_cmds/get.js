const Qless = require('../../../qless').Client;

exports.command = 'get [resource]';
exports.desc = 'get information for a specific resource';
exports.builder = {
  'resource': {
    required: true,
  },
};
exports.handler = (yargs) => {
  const client = new Qless({
    host: yargs.host,
    port: yargs.port,
    db: yargs.db,
  });
  client.resource.get(yargs.resource, (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(data);
    process.exit(0);
  });
};
