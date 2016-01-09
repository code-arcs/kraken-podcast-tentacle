var nconf = require('nconf');

nconf._get = nconf.get;
nconf.get = function(key, def, cb) {
    if(typeof def === 'function'){
        cb = def;
        def = '';
    }

    return nconf._get(key, cb) || def;
};

module.exports = (function() {
    nconf.argv().env();

    if(nconf.get('NODE_ENV', '').toLowerCase() === 'development') {
        nconf.add('development', { type: 'literal', store: require('../config/development')});
    }

    if(nconf.get('NODE_ENV', '').toLowerCase() === 'test') {
        nconf.add('testing', { type: 'literal', store: require('../config/testing')});
    }

    nconf.defaults(require('../config/production'));

    return nconf;
})();
