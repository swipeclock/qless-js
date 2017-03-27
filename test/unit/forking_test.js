'use strict';

const os = require('os');
const cp = require('child_process');
const process = require('process');
const sinon = require('sinon');

describe('qless.worker.forking', () => {
  describe('stop()', () => {
    it('exposes a stop method that triggers shutdown', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);

      expect(worker.shutdown).to.eql(false);
      worker.stop()
      expect(worker.shutdown).to.eql(true);
    });

    it('kills all sandboxes on stop', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let spyOne = sinon.stub(process, 'kill')
      worker.sandboxes[0] = process;
      worker.stop();
      expect(spyOne).calledOnce
      spyOne.restore()
    });
  });

  describe('waitAndExit()', () => {
    it('does not exit if there are sandboxes', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let killStub = sinon.stub(process, 'kill');
      let exitStub = sinon.stub(process, 'exit');

      worker.stop()

      var clock = sinon.useFakeTimers();

      worker.waitAndExit()
      clock.tick(10000)

      delete worker.sandboxes[0]
      clock.tick(10000)
      expect(process.exit).calledOnce

      clock.restore()
      killStub.restore()
      exitStub.restore()

    });

  });

  describe('run()', () => {
    it('calls spawn for the value of options.count', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient, { count: 2 });
      let stopStub = sinon.stub(worker, 'spawn');
      let exitStub = sinon.stub(process, 'exit');
      worker.run();
      expect(worker.spawn).calledTwice;
      worker.stop();
      stopStub.restore();
      exitStub.restore();
    })

  });

  describe('spawn()', () => {
    it('manages a child process', () => {
      var worker = new qless.ForkingWorker('my_test_queue', qlessClient);
      let exitStub = sinon.stub(process, 'exit');
      let child = worker.spawn()

      // Creates worker
      expect(Object.keys(worker.sandboxes).length).eql(1);

      //Handles worker errors
      child.emit('error', "Something bad happened")

      // Respawn failed workers
      child.kill()
      expect(Object.keys(worker.sandboxes).length).eql(1);

      // Allows workers to exit on shutdown
      worker.shutdown = true;
      child.kill()

    });
  });
//
//     it('add childprocess pid to sandboxes', () => {
//       qlessClient.workerName.should.match(/^[^-]+-.*-[0-9]+$/);
//       qlessClient.workerName.should.include(os.hostname());
//       qlessClient.workerName.should.include(process.pid.toString());
//     });
//
//     it('does not blow up on child process error messages', () => {
//       qlessClient.workerName.should.match(/^[^-]+-.*-[0-9]+$/);
//       qlessClient.workerName.should.include(os.hostname());
//       qlessClient.workerName.should.include(process.pid.toString());
//     });
//
//     it('deletes child process on exit', () => {
//       qlessClient.workerName.should.match(/^[^-]+-.*-[0-9]+$/);
//       qlessClient.workerName.should.include(os.hostname());
//       qlessClient.workerName.should.include(process.pid.toString());
//     });
//
//     it('removes child process listeners on exit', () => {
//       qlessClient.workerName.should.match(/^[^-]+-.*-[0-9]+$/);
//       qlessClient.workerName.should.include(os.hostname());
//       qlessClient.workerName.should.include(process.pid.toString());
//     });
//
//     it('attempts to respawn a child process if not in shutdown mode', () => {
//       qlessClient.workerName.should.match(/^[^-]+-.*-[0-9]+$/);
//       qlessClient.workerName.should.include(os.hostname());
//       qlessClient.workerName.should.include(process.pid.toString());
//     });
//   })

});
