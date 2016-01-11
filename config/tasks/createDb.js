var r = require('rethinkdb');

var Config = require('../../services/configService');

r.connect(Config.get('db'))
    .then(_conn => conn = _conn)
    .then(() => r.tableCreate(Config.get('db:table')).run(conn))
    .then(() => r.table(Config.get('db:table')).indexCreate('url').run(conn))
    .then(() => {
        console.log('Table created.');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
