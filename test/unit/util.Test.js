'use strict';

require('../helper.js')
const Klass = require('../jobs/Klass.js')
const expect = require('expect.js');

describe('util', () => {

  it('allows for logging override', function() {
    const util = require('../../lib/util')
    util.setLogger('test')
    expect(util.logger('test')).to.eql('test')
  })

});
