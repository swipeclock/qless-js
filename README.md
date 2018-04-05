![Status: Incubation](https://img.shields.io/badge/status-incubation-green.svg?style=flat)
![Team: Shared Services](https://img.shields.io/badge/team-shared_services-green.svg?style=flat)
![Product: Keyword Explorer](https://img.shields.io/badge/product-keyword_explorer-blue.svg?style=flat)
![Open Source](https://img.shields.io/badge/open_source-yes-green.svg?style=flat)
![Critical: No](https://img.shields.io/badge/critical-no-green.svg?style=flat)

Requires Node >= 6

History:  This was originally forked as an incomplete port with partial support.  Development was stalled as of October 2016.  This fork attempted to complete the api and PR'd back upstream.  Upstream shortly after decided to rewrite this project based on Promises instead of a callback pattern and has deviated too much from the original design to realistically be able to merge back.  This qless-js client is used heavily in a production environment running ~500,000 jobs daily.  

### Example
#### Example enqueuer
```javascript
// myproject/enqueue.js
'use strict';
const qless = require('qless');
const client = new qless.Client();
client.queue('myqueue').put('MyClass', {foo: 'bar'}, {}, (err, res) => {
  if (err) {
    console.log("error: ", err, err.message);
  } else {
    console.log('success');
    process.exit(0);
  }
});
```

#### Example worker
```javascript
// myproject/worker.js
'use strict';

const qless = require('qless');
qless.klassFinder.setModuleDir(__dirname + '/jobs');
const client = new qless.Client();
const worker = new qless.SerialWorker('myqueue', client);

worker.run((err => {
  console.log("ERROR IN WORKER: ", err);
  // normally won't happen unless a serious (e.g. redis) error
  // NOT triggered when a job [safely] fails
});
```

To enable debugging, run with:

```bash
DEBUG='qless:*' node worker.js
```

#### Example "forking" worker
```javascript
// myproject/worker.js
'use strict';

const qless = require('qless');
const qlessClient = new qless.Client();

// Set job directory in the options arg
const worker = new qless.ForkingWorker(["default", "default2"] , qlessClient, { moduleDir: __dirname + '/jobs' });

worker.run((err => {
  console.log("ERROR IN SPAWNED WORKER: ", err);
  // normally won't happen unless a serious (e.g. redis) error
  // NOT triggered when a job [safely] fails
});
```

#### Example job

```javascript
// myproject/jobs/MyJob.js
module.exports = {
  perform(job, cb) {
    console.log(job.data.foo);
    cb();
    // to fail:
    // cb('my error');
    // job.fail('my error')'; cb();
  }
}
```

#### Example job with co/generators

```javascript
// myproject/jobs/generator2job.js
'use strict';
const co = require('co');

module.exports = function generator2job(generatorFn) {
  return {
    perform(job, cb) {
      co(generatorFn(job)).then(val => cb(), err => cb(err))
    }
  };
};
```

```javascript
// myproject/jobs/MyJob.js
'use strict';

const Promise = require('bluebird');

function *doSomeStuff() {
  console.log("doing some stuff");
  yield Promise.delay(2000);
  console.log("I've done some stuff");
  throw new Error('wombat power!');
  console.log("I've done some more stuff!");
}

function *perform(job) {
  console.log(`Performing job with foo=${job.data.foo}... please wait!`);
  yield doSomeStuff();
  console.log(`I'm out of here! Done with foo=${job.data.foo}`);
};

module.exports = require('./generator2job')(perform);
```

### Updating Qless Lua scripts
This repo contains a compiled version of the qless lua scripts in source
control. It also contains a link to the main qless-core repo as a
submodule. If the upstream qless-core scripts change, you can recompile
the lua scripts with a `npm run build`. You may have to pull the latest
version of the qless-core scripts first by doing a `git pull` in the
`qless-core` directory.
