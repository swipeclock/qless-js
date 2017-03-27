'use strict';

const qless = require('../../qless');

let queueName = process.argv[2] || JSON.stringify(['default']);
let clientArgs = process.argv[3] || JSON.stringify({ '0': {} });
let options = process.argv[4] || JSON.stringify({});

queueName = JSON.parse(queueName);
clientArgs = JSON.parse(clientArgs)[0];
options = JSON.parse(options);


const client = new qless.Client(clientArgs);
const worker = new qless.SerialWorker(queueName, client, options);


worker.run((err, res) => {
  console.log(res);
  console.log(err);
});
