const Qless = require('../../../qless').Client;

exports.command = 'set [resource] [max]';
exports.desc = 'creates or updates the resource';
exports.builder = {
  'resource': {
    alias: 'r',
    required: true,
  },
  'max': {
    alias: 'm',
    required: true,
  },
};
exports.handler = (yargs) => {
  const client = new Qless({
    host: yargs.host,
    port: yargs.port,
    db: yargs.db,
  });
  client.resource.set(yargs.resource, yargs.max, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log('OK');
    process.exit(0);
  });
};
