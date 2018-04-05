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

// -- Resource apis
//   QlessAPI['resource.set'] = function(now, rid, max)
//   return Qless.resource(rid):set(max)
//   end
//
//   QlessAPI['resource.get'] = function(now, rid)
//   local data = Qless.resource(rid):data()
//   if not data then
//   return nil
//   end
//   return cjson.encode(data)
//   end
//
//   QlessAPI['resource.unset'] = function(now, rid)
//   return Qless.resource(rid):unset()
//   end
//
//   QlessAPI['resource.locks'] = function(now, rid)
//   return Qless.resource(rid):locks()
//   end
//
//   QlessAPI['resources'] = function(now, rid)
//   return cjson.encode(QlessResource:counts(now, rid))
//   end

  // Test if necessary
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
