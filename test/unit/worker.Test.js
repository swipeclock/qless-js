'use strict';

require('../helper')
const os = require('os');
const cp = require('child_process');
const process = require('process');
const sinon = require('sinon');
const Worker = require('../../lib/workers/worker').Worker;
const makeCb = require('../../lib/util').makeCb;

describe('qless.worker.worker', () => {
  describe('stop()', () => {
    it('exposes a stop method that triggers shutdown', () => {
      var worker = new Worker('my_test_queue', qlessClient);

      expect(worker.shutdown).to.eql(false);
      worker.stop();
      expect(worker.shutdown).to.eql(true);
    });

    describe('reserve()', () => {
      it('get empty job from multiple empty queues', function (done) {
        var worker = new Worker(['my_test_queue', 'my_other_test_queue'], qlessClient);
        worker.reserve((err, job) => {
          expect(err).to.eql(null);
          expect(job).to.eql(null);
          done()
        })
      });

      it('gets a job from a single queue in array', function (done) {
        var worker = new Worker(['my_test_queue'], qlessClient);
        worker.queue[0].pop = (cb) => {
          return cb(null, 'do work')
        };

        worker.reserve((err, job) => {
          if (err) {
            done(err)
          }

          expect(job).to.not.eql(null);
          expect(job).to.eql('do work');
          done()
        })
      });

      it('gets a job from multiple queue in array', function (done) {
        var worker = new Worker(['my_test_queue', 'my_other_test_queue'], qlessClient);
        worker.queue[0].pop = (cb) => {
          return cb(null, null)
        };
        worker.queue[1].pop = (cb) => {
          return cb(null, 'do other work')
        };

        worker.reserve((err, job) => {
          if (err) {
            done(err)
          }

          expect(job).to.not.eql(null);
          expect(job).to.eql('do other work');
          done()
        })
      })
    });
  });
});
