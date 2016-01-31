'use strict';
const nconf = require('nconf');

module.exports = (function () {
    nconf.argv().env('__');

    const NODE_ENV = (nconf.get('NODE_ENV') || '').toLowerCase();

    if (NODE_ENV === 'development') {
        console.log('Loading config for:', 'development');
        nconf.add('development', {type: 'literal', store: require('../config/development')});
    }

    if (NODE_ENV === 'test') {
        console.log('Loading config for:', 'testing');
        nconf.add('testing', {type: 'literal', store: require('../config/testing')});
    }

    nconf.defaults(require('../config/production'));

    return nconf;
})();
