const Qless = require('../../../qless').Client;

exports.command = 'locks [resource]';
exports.desc = 'gets lock information for a specific resource';
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
  client.resource.locks(yargs.resource, (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(data);
    process.exit(0);
  });
};
