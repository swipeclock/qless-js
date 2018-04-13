'use strict';


/**
 * All our resource operations
 *
 * A class that allows us to change and manipulate resouce settings
 */

class Resource {
  constructor(client) {
    this.client = client;
  }

  counts(cb) {
    this.client.call('resources', (err, res) => {
      if (!err) res = JSON.parse(res);
      cb(err, res);
    });
  }

  get(key, cb) {
    this.client.call('resource.get', key, (err, res) => {
      if (!err) res = JSON.parse(res);
      cb(err, res);
    });
  }

  set(key, value, cb) {
    this.client.call('resource.set', key, value, cb);
  }

  unset(key, cb) {
    this.client.call('resource.unset', key, cb);
  }

  locks(key, cb) {
    this.client.call('resource.locks', key, cb);
  }
}

module.exports = { Resource };
