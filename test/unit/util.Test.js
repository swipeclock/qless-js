'use strict';

require('../helper.js')
const Klass = require('../jobs/Klass.js')
const expect = require('expect.js');

describe('util', () => {

  it('allows for logging override', function() {
    const util = require('../../lib/util')
    util.setLogger('test')
    expect(util.logger('test')).to.eql('test')
  })

  it('returns expected log context from job', function() {
    const util = require('../../lib/util')
    const job = {
      'expiresAt': 123,
      'jid': 'foojid',
      'klassName': 'fooklass',
      'originalRetries': 456,
      'priority': 789,
      'queueName': 'fooqueue',
      'retriesLeft': 999,
      'tags': [ 'foobar' ],
      'workerName': 'fooworker',
      'resources': [ 'foo', 'bar' ],
      'idontexist': 'uh oh!'
    };

    const expected = {
      'expiresAt': 123,
      'jid': 'foojid',
      'klassName': 'fooklass',
      'originalRetries': 456,
      'priority': 789,
      'queueName': 'fooqueue',
      'retriesLeft': 999,
      'tags': [ 'foobar' ],
      'workerName': 'fooworker',
      'resources': [ 'foo', 'bar' ]
    };

    let ctx = util.logJobContext(job)
    expect(ctx).to.eql(expected)
  })

});
