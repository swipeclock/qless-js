'use strict';

require('../helper')
const os = require('os');
const cp = require('child_process');
const process = require('process');
const sinon = require('sinon');
const Worker = require('../../lib/workers/worker').Worker;

describe('qless.worker.worker', () => {
  describe('stop()', () => {
    it('exposes a stop method that triggers shutdown', () => {
      var worker = new Worker('my_test_queue', qlessClient);

      expect(worker.shutdown).to.eql(false);
      worker.stop();
      expect(worker.shutdown).to.eql(true);
    });

    it('get empty job from multiple empty queues', function (done) {
      var worker = new Worker(['my_test_queue', 'my_other_test_queue'], qlessClient);
      worker.reserve((err, job) => {
        expect(err).to.eql(null);
        expect(job).to.eql(null);
        done()
      })
    })
    
  });


});
