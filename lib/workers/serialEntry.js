'use strict';

const qless = require('../../qless');
const util = require('../util');

let queueName = process.argv[2] || JSON.stringify(['default']);
let clientArgs = process.argv[3] || JSON.stringify({ '0': {} });
let options = process.argv[4] || JSON.stringify({});

queueName = JSON.parse(queueName);
clientArgs = JSON.parse(clientArgs)[0];
options = JSON.parse(options);

// Since a node 'fork' isn't a true fork provide a way to run code before starting the SerialWorker
if (options.childBootstrap) {
  eval(options.childBootstrap); // eslint-disable-line
}

console.log(JSON.stringify(options));
const client = new qless.Client(clientArgs);
const worker = new qless.SerialWorker(queueName, client, options);

worker.run((err, job) => {
  if (err) {
    worker.logger.error(err, util.logJobContext(job));
  }
});
