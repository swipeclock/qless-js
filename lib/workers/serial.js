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
    this.workerName = client.workerName;

    process.once('unhandledRejection', (reason, p) => {
      const message = `Unhandled Rejection at: Promise ${p} reason: ${JSON.stringify(reason)}`;
      if (this.logger.error) {
        this.logger.error(message);
      }
      process.stderr.write(message);
      process.exit(1);
    });
  }

  // If an IPC channel is available (spawned from forkingworker) communicate job status back to parent
  _sendJobInfo(jobInfo) {
    if (!process.send) {
      return;
    }

    process.send(jobInfo);
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
        this.logger.debug(`Nothing to do, waiting ${this.options.interval}ms`, { workerName: this.workerName });
        return setTimeout(() => this.run(cb), this.options.interval);
      }

      this.logger.info(`Running a job: ${job}`, util.logJobContext(job));
      this._sendJobInfo({ jid: job.jid, expiresAt: job.expiresAt }); // minimize payload sent over IPC

      // TODO: set worker.jid here? Python version does, ruby version apparently does not
      this.perform(job, (performErr) => {
        this._sendJobInfo({ jid: null });
        if (performErr) return cb(performErr, job); // Only happens with really bad errors, like redis errors
        this.logger.info(`Done with job with jid ${job.jid}`, util.logJobContext(job));
        setImmediate(() => this.run(cb));
      });
    }));
  }
}

module.exports = { SerialWorker };
