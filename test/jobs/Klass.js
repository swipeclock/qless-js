'use strict';

/**
 * Basic qless client object for interacting with qless.
 */



class Klass {
  /**
   * Parameters are passed through to redis.createClient()
   */
  constructor() { }

  static myStatic() {
    return "hi"
  }
  

  /**
   * Args: command, arg1, arg1, ..., cb
   */
  call() {
    // convert arguments to real array
    const args = Array.prototype.slice.call(arguments, 0);
    const cb = args.pop();

    // Add "time" between command and rest of args
    const time = new Date().getTime() / 1000.0;
    args.splice(1, 0, time);
    this._lua.call(args, cb);
  }

  /**
   * Get a Queue object for the given queue name
   */
  queue(names) {
    // Note: As with the Python ForkingWorker, all workers under one process
    // have the same workerName. Dan says: "They do occasionally step on each others'
    // toes (one process loses its lock on a job when the other pops it off, then both
    // are notified that the lock is lost and second one drops it). The upside to this
    // design decision is that we have fewer unique worker names and they're not
    // constantly changing. In practice, this happens infrequently and negligibly
    // impacts the delivery of useful work." See https://github.com/seomoz/qless-js/pull/4
    if (typeof(names) === 'string') {
      return new queue.Queue(names, this, this.workerName);
    }

    return _.uniq(names).map((name) => {
      return new queue.Queue(name, this, this.workerName);
    });
  }

  quit(cb) {
    return this.redis.quit(cb);
  }
}

module.exports = Klass;
