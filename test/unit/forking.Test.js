'use strict';

require('../helper')
const os = require('os');
const cp = require('child_process');
const process = require('process');
const sinon = require('sinon');
const EventEmitter = require('events').EventEmitter;

class MockChild extends EventEmitter {

  constructor() {
    super()
    this.pid = 123
  }

}

describe('qless.worker.forking', () => {

  describe('_spawn()', () => {
    it('add workerName to sandbox', (done) => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let child = new MockChild()
      let workerName = qless.ForkingWorker._getWorkerNameFromChild(child)
      let spawnStub = sinon.stub(worker, 'spawn')
      worker.shutdown = true;
      worker._spawn(child, (err, data) => {
        done(err)
      })

      expect(worker.sandboxes[workerName]).to.eql(child)
      expect(spawnStub.notCalled).to.eql(true)
      done()
    })

    it('calls createWorker subscriber', (done) => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let child = new MockChild()
      let workerName = qless.ForkingWorker._getWorkerNameFromChild(child)
      let createWorkerStub = sinon.stub(worker, '_createWorkerSub')
      worker.shutdown = true;
      worker._spawn(child, (err, data) => {
        done(err)
      })

      expect(createWorkerStub.calledOnce).to.eql(true)
      expect(createWorkerStub.calledWith(workerName)).to.eql(true)
      done()

    })

    it('on child emit error it returns err cb', (done) => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let child = new MockChild()
      worker.shutdown = true;
      worker._spawn(child, (err, data) => {
        expect(err).to.eql('BOOM')
        done()
      })

      child.emit('error', 'BOOM')
    })

    it('chil error with no cb does not error', (done) => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let child = new MockChild()
      worker.shutdown = true;
      worker._spawn(child)
      child.emit('error', 'BOOM')
      done()
    })

    it('on child exit it cleans up', (done) => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let child = new MockChild()
      let childStub = sinon.stub(child, 'removeAllListeners');
      let workerName = qless.ForkingWorker._getWorkerNameFromChild(child)
      let watchStub = sinon.stub(worker, '_removeWatchDog')
      let remWorkerSub = sinon.stub(worker, '_removeWorkerSub')
      let spawnStub = sinon.stub(worker, 'spawn')
      worker.shutdown = true;
      worker._spawn(child, (err, data) => {
        done(err)
      })

      child.emit('exit', 0, 'SIGBYEBYE')

      expect(childStub.calledOnce).to.eql(true)
      expect(watchStub.calledOnce).to.eql(true)
      expect(remWorkerSub.calledOnce).to.eql(true)
      expect(spawnStub.notCalled).to.eql(true)
      expect(worker.sandboxes[workerName]).to.eql(undefined)
      done()
    })

    it('on unintended child exit it does trigger a respawn', (done) => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let child = new MockChild()
      let spawnStub = sinon.stub(worker, 'spawn');
      worker._spawn(child, (err, data) => {
        done(err)
      })

      child.emit('exit', 0, 'SIGBYEBYE')

      expect(spawnStub.calledOnce).to.eql(true)
      done()

    })

    it('it handles "new" job messages from the child', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let jobInfo = { jid: '123', expiresAt: '7777777777'}
      let child = new MockChild()
      let workerName = qless.ForkingWorker._getWorkerNameFromChild(child)
      let createWatchStub = sinon.stub(worker, '_createWatchdog');
      let removeWatchStub = sinon.stub(worker, '_removeWatchDog');
      worker._spawn(child, (err, data) => {
        done(err)
      })

      child.emit('message', jobInfo)

      //always updates the ledger
      expect(worker.jobLedger[workerName]).to.eql(jobInfo.jid)

      // if has expires creates a watchdog (new job)
      expect(createWatchStub.calledOnce).to.eql(true)
      expect(createWatchStub.calledWith(workerName, jobInfo.jid, jobInfo.expiresAt)).to.eql(true)

      // Does NOT call remove
      expect(removeWatchStub.notCalled).to.eql(true)

    })

    it('it handles "completed" job messages from the child', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let jobInfo = { jid: null }
      let child = new MockChild()
      let workerName = qless.ForkingWorker._getWorkerNameFromChild(child)
      let createWatchStub = sinon.stub(worker, '_createWatchdog');
      let removeWatchStub = sinon.stub(worker, '_removeWatchDog');
      worker._spawn(child, (err, data) => {
        done(err)
      })

      child.emit('message', jobInfo)

      //always updates the ledger
      expect(worker.jobLedger[workerName]).to.eql(jobInfo.jid)

      // Does NOT call create watchdog (new job)
      expect(createWatchStub.notCalled).to.eql(true)

      // Does call remove
      expect(removeWatchStub.calledOnce).to.eql(true)
      expect(removeWatchStub.calledWith(workerName)).to.eql(true)
    })
  });


  describe('stop()', () => {
    it('exposes a stop method that triggers shutdown', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);

      expect(worker.shutdown).to.eql(false);
      worker.stop(true)
      expect(worker.shutdown).to.eql(true);
    });

    it('kills all sandboxes on stop', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let spyOne = sinon.stub(process, 'kill')
      worker.sandboxes[0] = process;
      worker.stop(true);
      expect(spyOne.calledOnce).to.eql(true)
      spyOne.restore()
    });
  });

  describe('run()', () => {
    it('calls spawn for the value of options.count', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient, {count: 2});
      let stopStub = sinon.stub(worker, 'spawn');
      let exitStub = sinon.stub(process, 'exit');
      worker.run();
      expect(worker.spawn.calledTwice).to.eql(true);
      worker.stop(true);
      stopStub.restore();
      exitStub.restore();
    })

  });

  describe('_getGracePeriod()', () => {

    it('returns a value between 1000 and 3000', () => {
      for (var i = 0; i < 1000; i++) {
        expect(qless.ForkingWorker._getGracePeriod()).to.be.below(3001);
        expect(qless.ForkingWorker._getGracePeriod()).to.be.above(999);
      }
    });
  });

  describe('_getTTL()', () => {
    it('returns a sane ttl for an expiresAt', () => {
      let expiresAt = (new Date().getTime() / 1000) + 60;
      console.log(expiresAt)
      let ttl = qless.ForkingWorker._getTTL(expiresAt);
      expect(ttl).to.be.below(63001);
      expect(ttl).to.be.above(60999);

    });
  });

  describe('_processPubSub()', () => {
    it('on heartbeat removes and add watchdog', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient, {count: 1});
      let removeStub = sinon.stub(worker, '_removeWatchDog');
      let addStub = sinon.stub(worker, '_createWatchdog');

      worker._processPubSub('channel', {event: 'heartbeat', worker: 'test', expires: 1498851214.504});
      expect(removeStub.calledOnce).to.eql(true);
      expect(addStub.calledOnce).to.eql(true);
    });

    it('on lock_lost kills the worker forcefully', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient, {count: 1});
      let killStub = sinon.stub(worker, '_killWorker');

      worker._processPubSub('channel', {event: 'lock_lost', worker: 'test', expires: 1498851214.504});
      expect(killStub.calledOnce).to.eql(true);
      expect(killStub.calledWith('test', true)).to.eql(true);
    });

    it('on cancel kills the worker forcefully', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient, {count: 1});
      let killStub = sinon.stub(worker, '_killWorker');

      worker._processPubSub('channel', {event: 'canceled', worker: 'test', expires: 1498851214.504});
      expect(killStub.calledOnce).to.eql(true);
      expect(killStub.calledWith('test', true)).to.eql(true);
    });

    it('on unkown events it does not explode', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient, {count: 1});
      let removeStub = sinon.stub(worker, '_removeWatchDog');
      let addStub = sinon.stub(worker, '_createWatchdog');
      let killStub = sinon.stub(worker, '_killWorker');

      worker._processPubSub('channel', {event: 'test', worker: 'test', expires: 1498851214.504});
      expect(removeStub.notCalled).to.eql(true);
      expect(addStub.notCalled).to.eql(true);
      expect(killStub.notCalled).to.eql(true)
    });
  });

  describe('_createWatchDog', (done) => {
    it('Will not kill a worker if the failsafe ledger entry is absent', (done) => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient, {count: 1});
      let jid = '123'
      let expiresAt = (new Date().getTime() / 1000) - 5;
      let workerName = 'test'
      let myStub = sinon.stub(worker, '_killWorker');
      worker._createWatchdog(workerName, jid, expiresAt)
      setTimeout(() => {
        expect(myStub.notCalled).to.eql(true);
        myStub.restore()
        done()
      }, 100)

    });

    it('Will kill a worker if timeout elaspes', (done) => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient, {count: 1});
      let jid = '123'
      let expiresAt = (new Date().getTime() / 1000) - 5;
      let workerName = 'test'
      worker.jobLedger[workerName] = jid;
      let myStub = sinon.stub(worker, '_killWorker');
      worker._createWatchdog(workerName, jid, expiresAt)
      setTimeout(() => {
        expect(myStub.calledOnce).to.eql(true);
        myStub.restore()
        done()
      }, 100)

    });
  });

  describe('_removeWatchDog', () => {

    it('return if workerName is not found in watchdogs struct', (done) => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient, {count: 1});
      worker._removeWatchDog('test')
      done()
    });

    it('calls clearTimeout if setTimeout found', (done) => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient, {count: 1});
      worker.watchdogs['test'] = setTimeout(() => {
        done("BOOM")
      }, 100);
      worker._removeWatchDog('test');
      setTimeout(() => {
        done()
      }, 200);
    });
  });
});