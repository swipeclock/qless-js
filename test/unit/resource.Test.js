'use strict';

require('../helper')
const sinon = require('sinon')

describe('qless.Resource', () => {
  const queue = qlessClient.queue('resource_test_queue');

  it('can manage and view resources', function *() {
    // get empty resouce
    let getResource = yield qlessClient.resource.getAsync('foo');
    expect(getResource).to.eql(null);

    // get empty resouce counts
    let getCounts = yield qlessClient.resource.countsAsync();
    expect(getCounts).to.eql({});

    // get empty resource locks
    let getLocks = yield qlessClient.resource.locksAsync('foo');
    expect(getLocks).to.eql(0);

    // set new resource
    let setResource = yield qlessClient.resource.setAsync('foo', 1);
    expect(setResource).to.eql('foo');

    // get new resource
    getResource = yield qlessClient.resource.getAsync('foo');
    let attrs = _.pick(getResource, ['rid', 'pending', 'locks', 'max']);
    attrs.should.eql({
      'rid': 'foo',
      'pending': {},
      'locks': {},
      'max': 1
    });

    // get resource counts
    getCounts = yield qlessClient.resource.countsAsync();
    expect(getCounts).to.eql({
      'foo': {
        'pending': 0,
        'locks': 0,
        'max': 1
      }
    });

    // create new job with resource
    yield queue.putAsync('resource_test_job_1', {key1: 'val1'}, { 'resources': ['foo'] });
    yield queue.putAsync('resource_test_job_2', {key1: 'val1'}, { 'resources': ['foo'] });

    // get resource counts
    getCounts = yield qlessClient.resource.countsAsync()
    expect(getCounts).to.eql({
      'foo': {
        'pending': 1,
        'locks': 1,
        'max': 1
      }
    });

    // get empty resource locks
    getLocks = yield qlessClient.resource.locksAsync('foo');
    expect(getLocks).to.eql(1);

    // unset resource
    let unsetResouce = yield qlessClient.resource.unsetAsync('foo');
    expect(unsetResouce).to.eql(1);

    // get empty resouce
    getResource = yield qlessClient.resource.getAsync('foo');
    expect(getResource).to.eql(null);

    // get empty resouce counts
    getCounts = yield qlessClient.resource.countsAsync();
    expect(getCounts).to.eql({});
  })
});
