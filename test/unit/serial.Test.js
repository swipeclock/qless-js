'use strict';

require('../helper')
const os = require('os');
const cp = require('child_process');
const process = require('process');
const sinon = require('sinon');
const SerialWorker = require('../../lib/workers/serial').SerialWorker;
const makeCb = require('../../lib/util').makeCb;

describe('qless.worker.serial', () => {
  describe('errors', () => {
    it('exits on any unhandledRejection', function(done) {
      var worker = new SerialWorker('my_test_queue', qlessClient);
      let exitStub = sinon.stub(process, 'exit');
      process.emit('unhandledRejection', 'message', {'foo':'bar'})
      setTimeout(() => {
        expect(exitStub.called).to.eql(true);
        exitStub.restore();
        done()
      }, 100)
    })
  })
});
