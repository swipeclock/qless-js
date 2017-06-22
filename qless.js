'use strict';

/**
 * Main qless module, includes everything you need
 * to use qless externally.
 */

module.exports = {
  errors: require('./lib/errors'),
  Client: require('./lib/client').Client,
  SerialWorker: require('./lib/workers/serial').SerialWorker,
  ForkingWorker: require('./lib/workers/forking').ForkingWorker
};
