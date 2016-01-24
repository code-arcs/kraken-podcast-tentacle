var r = require('rethinkdb');

var Config = require('../../services/configService');
r.connect(Config.get('db'))
    .then(_conn => conn = _conn)
    .then(() => r.tableDrop(Config.get('db:table')).run(conn))
    .then(() => {
        console.log('Table dropped.');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(0);
    });
