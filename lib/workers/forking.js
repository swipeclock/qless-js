'use strict';

const cp = require('child_process');
const Worker = require('./worker.js').Worker;
const os = require('os');
const DEFAULT_COUNT = os.cpus().length;

class ForkingWorker extends Worker {

  constructor(queueName, client, options) {
    super(queueName, client, options);

    this.sandboxes = {};
    this.watchdogs = {};
    this.jobLedger = {};
    this.options.count = this.options.count || DEFAULT_COUNT;
  }

  /**
   * Creates a specific channel the master to listen for its workers
   *
   * @param workerName
   * @private
   */
  _createWorkerSub(workerName) {
    const channel = `ql:w:${workerName}`;
    this.logger.info(`subsribing to worker channel:${channel}`, { channel });
    this.client.sub.subscribe(`ql:w:${workerName}`);
    this.client.sub.on('message', this._processPubSub.bind(this));
  }

  /**
   * Deletes a worker from the masters subscriptions
   *
   * @param workerName
   * @private
   */
  _removeWorkerSub(workerName) {
    const channel = `ql:w:${workerName}`;
    this.logger.info(`unsubsribing from worker channel:${channel}`, { channel });
    this.client.sub.unsubscribe(`ql:w:${workerName}`);
  }

  /**
   * Takes actions against child processes for redis events
   *
   * @param channel
   * @param message
   * @private
   */
  _processPubSub(channel, message) {
    try {
      message = JSON.parse(message);
    } catch (e) {
      // @TODO fix track publish to encode like everything else
    }

    switch (message.event) {
      case 'heartbeat':
        this.logger.debug(`received heartbeat for worker:${message.worker} jid:${message.jid}`, { jid: message.jid, channel });
        this._removeWatchDog(message.worker);
        this._createWatchdog(message.worker, message.jid, message.expires);
        break;
      case 'lock_lost':
      case 'canceled':
        this.logger.info(`canceled or lock_lost for worker:${message.worker} jid:${message.jid}`, { jid: message.jid, channel });
        this._killWorker(message.worker, 'SIGKILL');
        break;
      default:
        this.logger.debug('no processing rules exist for received event');
        break;
    }
  }

  /**
   * Stops all child process threads and tries to exit.
   * Default code is to use a SIGTERM to give the workers
   * a chance to gracefully exit any currently processing jobs
   */
  stop(code = 'SIGTERM') {
    this.shutdown = true;
    this.logger.info('Setting master shutdown to true');

    Object.keys(this.sandboxes).forEach((workerName) => {
      this._killWorker(workerName, code);
    });

    this.waitAndExit();
  }

  /**
   * Kills a worker either gracefully or forcefully
   *
   * @param workerName
   * @param code
   * @private
   */
  _killWorker(workerName, code = 'SIGINT') {
    this.logger.info(`Sending kill to worker:${workerName} with signal:${code}`);
    if (workerName in this.sandboxes) {
      this.sandboxes[workerName].kill(code);
    }
  }

  /**
   * Blocks forkingworking from exciting until all child processes
   * have been cleaned up
   */
  waitAndExit() {
    // Waits indefinitely for child procs to end.  May want to
    // timeout at some point
    setTimeout(() => {
      if (Object.keys(this.sandboxes).length) {
        this.logger.info('Waiting for child processes to end...');
        this.waitAndExit();
      } else {
        this.logger.info('Exiting ForkingWorker');
        process.exit(0);
      }
    }, 1000);
  }

  /**
   * Start the forkerworker management and forks child processes
   */
  run(cb) {
    for (let i = 0; i < this.options.count; i++) {
      this.spawn(cb);
    }
  }

  /**
   * Spawns child processes in separate threads and subscribes to events
   * for management
   *
   * @param cb
   * @returns {*}
   */
  spawn(cb) {
    const args = [
      JSON.stringify(this.queueName),
      JSON.stringify(this.client.arguments),
      JSON.stringify(this.options),
    ];
    const child = cp.fork(`${__dirname}/serialEntry`, args, { env: process.env }, __dirname);
    this._spawn(child, cb);
  }


  /**
   * mainly to make tests not a nightmare to write
   *
   * @param child
   * @private
   */
  _spawn(child, cb) {
    const workerName = ForkingWorker._getWorkerNameFromChild(child);
    this.sandboxes[workerName] = child;
    this._createWorkerSub(workerName);
    this.logger.info(`Started worker: ${workerName}`, { workerName });

    child.on('error', (err) => {
      this.logger.error(`Error in child process ${workerName}: ${err}`);
      if (cb) cb(err);
    });

    child.on('exit', (code, signal) => {
      this.logger.info(`Child worker:${workerName} has closed with code:${code} and signal:${signal}`);

      child.removeAllListeners();
      delete this.sandboxes[workerName];

      this._removeWatchDog(workerName);

      this._removeWorkerSub(workerName);

      if (!this.shutdown) {
        this.logger.info('Attempting to respawn worker');
        this.spawn(cb);
      }
    });

    child.on('message', (jobInfo) => {
      this.logger.debug(`child worker:${workerName} is working on ${jobInfo.jid}`, { jid: jobInfo.jid });
      this.jobLedger[workerName] = jobInfo.jid;

      if (jobInfo.expiresAt) {
        this._createWatchdog(workerName, jobInfo.jid, jobInfo.expiresAt);
        return;
      }

      if (jobInfo.jid === null) {
        this._removeWatchDog(workerName);
      }
    });

    return child;
  }

  /**
   * Delays worker termination by the TTL of the job
   *
   * @param workerName
   * @param jid
   * @param expiresAt
   * @private
   */
  _createWatchdog(workerName, jid, expiresAt) {
    const ttl = ForkingWorker._getTTL(expiresAt);
    this.logger.debug(`create watchdog for worker:${workerName} with jid:${jid} with ttlMs:${ttl}`, { jid });
    this.watchdogs[workerName] = setTimeout((
    ) => {
      console.log(`watchdog barking for worker:${workerName} with jid:${jid}`, { jid });
      if (this.jobLedger[workerName] !== jid) {
        // This should never happen
        this.logger.info(`watchdog jid mismatch:  watchdogJid:${jid} ledgerJid:${this.jobLedger[workerName]}`, { jid });
        return;
      }

      this._killWorker(workerName, 'SIGKILL');
    }, ttl);
  }

  /**
   * Stop the watchdog from terminating the worker process
   *
   * @param workerName
   * @private
   */
  _removeWatchDog(workerName) {
    if (!this.watchdogs[workerName]) {
      return;
    }

    this.logger.debug(`clearing watchdog for worker:${workerName}`);
    clearTimeout(this.watchdogs[workerName]);
  }

  /**
   * Helper to get the ttl for use in the watchdog setTimeout()
   *
   * @param expiresAt
   * @returns {*}
   * @private
   */
  static _getTTL(expiresAt) {
    const ttlMs = (expiresAt - ((new Date).getTime() / 1000)) * 1000;

    return ttlMs + ForkingWorker._getGracePeriod();
  }

  /**
   * Helper to get a random grace period to minimize race conditions
   *
   * @param min
   * @param max
   * @returns {number}
   * @private
   */
  static _getGracePeriod(min = 1000, max = 3000) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Helper to turn a pid into workerName based on qless-js naming conventions
   *
   * @param child
   * @returns {string}
   * @private
   */
  static _getWorkerNameFromChild(child) {
    return [os.hostname(), process.env.HOST, child.pid.toString()].join('-');
  }
}

module.exports = { ForkingWorker };
