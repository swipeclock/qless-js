const Qless = require('../../../qless').Client;

exports.command = 'unset [resource]';
exports.desc = 'removes the specific resource';
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
  client.resource.unset(yargs.resource, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log('OK');
    process.exit(0);
  });
};
