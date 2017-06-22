'use strict';

const util = require('../util');
const cp = require('child_process');
const logger = util.logger('worker');
const Worker = require('./worker.js').Worker;
const os = require('os');
const DEFAULT_COUNT = os.cpus().length;

class ForkingWorker extends Worker {

  constructor(queueName, client, options) {
    super(queueName, client, options);

    this.sandboxes = {};
    this.options.count = this.options.count || DEFAULT_COUNT;
  }

  /**
   * Stops all child process threads and tries to exit
   */
  stop() {
    this.shutdown = true;

    Object.keys(this.sandboxes).forEach((key) => {
      this.sandboxes[key].kill();
    });

    this.waitAndExit();
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
        logger.info('Waiting for child processes to end...');
        this.waitAndExit();
      } else {
        logger.info('Exiting ForkingWorker');
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
   */
  spawn(cb) {
    const args = [
      JSON.stringify(this.queueName),
      JSON.stringify(this.client.arguments),
      JSON.stringify(this.options),
    ];

    const child = cp.fork(`${__dirname}/serialEntry`, args, { env: { DEBUG: '*' } }, __dirname);  //@TODO test
    this.sandboxes[child.pid] = child;
    logger.info(`Started worker pid: ${child.pid}`);

    child.on('error', (err) => {
      logger.error(`Error in child process ${child.pid}: ${err}`);
      if (cb) cb(err);
    });

    child.on('exit', (code, signal) => {
      logger.info(`Child process:${child.pid} has closed with code:${code} and signal:${signal}`);

      child.removeAllListeners();
      delete this.sandboxes[child.pid];

      if (!this.shutdown) {
        logger.info('Attempting to respawn worker');
        this.spawn();
      }
    });

    return child;
  }
  
  //TODO implement watchdog
  //timeout
  //cancel
}

module.exports = { ForkingWorker };
