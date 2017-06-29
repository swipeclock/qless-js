'use strict';

process.env.NODE_ENV = 'test';

// Misc Utils
const _ = require('lodash');
const bluebird = require('bluebird');
const co = require('co');

// Testing Stuff
var mocha = require('mocha')
var coMocha = require('co-mocha')
const chai = require('chai');
const expect = require('expect.js');
chai.should();

// Redis and Qless
const qless = require('../qless');
const redisInfo = { db: 11 };
const qlessClient = new qless.Client({host: '192.168.60.10', port: 6379, db: 0, allowPaths: true});
bluebird.promisifyAll(require('../lib/jobs'));
bluebird.promisifyAll(require('../lib/queue'));
bluebird.promisifyAll(require('../lib/job'));
bluebird.promisifyAll(require('../lib/config'));
bluebird.promisifyAll(require('../lib/client'));
bluebird.promisifyAll(qlessClient.redis);


beforeEach(function *() {
  yield qlessClient.redis.flushdbAsync();
  yield qlessClient.redis.scriptAsync('flush');
});

afterEach(function () {
});

// Set all to be globals
global.chai = chai;
global.expect = chai.expect;
global._ = _;
global.qless = qless;
global.qlessClient = qlessClient;
global.bluebird = bluebird;
global.co = co;
