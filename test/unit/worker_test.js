'use strict';

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
      worker.stop()
      expect(worker.shutdown).to.eql(true);
    });
  });


});
