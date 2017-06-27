'use strict';

/**
 * Simplest type of worker. Keeps popping off jobs and processing them,
 * one after the other.
 */

// TODO: set jid in the worker for debugging purposes? Python does it

const util = require('../util');
const makeCb = util.makeCb;
const Worker = require('./worker.js').Worker;

class SerialWorker extends Worker {

  constructor(queueName, client, options) {
    super(queueName, client, options);
  }

  // Consider using async.waterfall for this function (as of 7/23/2016 we don't use async in qless)
  run(cb) {
    this.reserve(makeCb(cb, job => {
      // Graceful exit
      if (this.shutdown) {
        return this.client.quit(() => {
          process.exit(0);
        });
      }

      if (!job) {
        this.logger.debug(`Nothing to do, waiting ${this.options.interval}ms`);
        return setTimeout(() => this.run(cb), this.options.interval);
      }

      this.logger.info(`Running a job: ${job}`);

      // TODO: set worker.jid here? Python version does, ruby version apparently does not
      this.perform(job, (performErr) => {
        if (performErr) return cb(performErr); // Only happens with really bad errors, like redis errors
        this.logger.info(`Done with job with jid ${job.jid}`);
        setImmediate(() => this.run(cb));
      });
    }));
  }
}

module.exports = { SerialWorker };
