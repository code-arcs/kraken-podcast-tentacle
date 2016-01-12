var fs = require('fs');
var path = require('path');
var r = require('rethinkdb');

var Config = require('../services/configService');
var conn;
r.connect(Config.get('db'))
    .then(_conn => {
        conn = _conn;
    });

module.exports = {
    save: save,
    truncate: truncate,
    findById: findById,
    findAll: findAll
};

function save(newEntity) {
    if(!newEntity.createdAt) {
        newEntity.createdAt = r.now();
    } else {
        newEntity.updatedAt = r.now();
    }

    return r.table(Config.get('db:table')).getAll(newEntity.url, {index: 'url'}).run(conn)
        .then(cursor => cursor.toArray())
        .then(results => {
            if (results.some(result => result.url === newEntity.url)) {
                throw new Error('Entity already exists!')
            }
        })
        .then(() => {
            return r.table(Config.get('db:table'))
                .insert(newEntity, {returnChanges: true})
                .run(conn)
        })
        .then(res => {
            return res.changes[0].new_val;
        })
        .catch(err => console.error(err));
}

/**
 * Removes all entries from the Database file.
 */
function truncate() {
    return r.table(Config.get('db:table'))
        .delete({durability: "soft", returnChanges: false})
        .run(conn);
}

function findById(id) {
    return r.table(Config.get('db:table'))
        .get(id)
        .run(conn);
}

function findAll() {
    return r.table(Config.get('db:table'))
        .orderBy('createdAt')
        .run(conn)
        .then(cursor => cursor.toArray());
}
