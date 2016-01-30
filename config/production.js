var path = require('path');

module.exports = {
    server: {
        port: 3001
    },
    cache : {
        dir: './cache'
    },
    db: {
        port: 28015,
        host: 'localhost',
        table: 'podcasts'
    }
};
