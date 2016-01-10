var fs = require('fs');
var path = require('path');
var Q = require('q');
var uuid = require('node-uuid');

var Config = require('../services/configService');
var dbFile = Config.get('db');

module.exports = {
    save: save,
    truncate: truncate,
    findById: findById,
    findAll: findAll
};

function save(newEntity) {
    var deferred = Q.defer();

    fs.readFile(dbFile, 'utf8', (err, data) => {
        if(err) {
            deferred.reject(new Error(err));
            return;
        }

        var content = data ? JSON.parse(data) : [];
        var entityExists = content.some(persistedEntity => persistedEntity.url === newEntity.url);

        if(!entityExists) {
            newEntity.id = uuid.v4();
            content.push(newEntity);
        } else {
            deferred.reject(new Error('Entity already exists!'));
            return;
        }

        fs.writeFile(dbFile, JSON.stringify(content), (err) => {
            if(err) {
                deferred.reject(new Error(err));
                return;
            }

            deferred.resolve(newEntity);
        })
    });

    return deferred.promise;
}

/**
 * Removes all entries from the Database file.
 */
function truncate() {
    var deferred = Q.defer();

    fs.writeFile(dbFile, '', function(err) {
        if(err) {
            deferred.reject(new Error('Could not truncate:', err))
        }
        deferred.resolve();
    });

    return deferred.promise;
}

function findById(id) {
    var deferred = Q.defer();

    fs.readFile(dbFile, 'utf8', (err, data) => {
        if(err) {
            deferred.reject(new Error(err));
            return;
        }

        if(data) {
            var content = JSON.parse(data);

            if(content && content.filter !== undefined) {
                var entity = content.filter(persistedEntity => persistedEntity.id === id)[0];
                if(entity) {
                    deferred.resolve(entity);
                }
            }
        }

        deferred.reject(new Error(`No entity with given id ${id} found!`));
    });

    return deferred.promise;
}

function findAll() {
    var deferred = Q.defer();

    fs.readFile(dbFile, 'utf8', (err, data) => {
        if(err) {
            deferred.reject(new Error(err));
            return;
        }

        if(data) {
            deferred.resolve(JSON.parse(data));
        }

        deferred.reject(new Error('No entities found!'));
    });

    return deferred.promise;
}
