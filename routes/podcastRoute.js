var express = require('express');
var router = express.Router();

var podcastService = require('../services/podcastService');

module.exports = function (io) {
    io.on('connection', function (socket) {
        podcastService.changefeed(socket)
            .then(function (cursor) {
                cursor.each(function (err, item) {
                    if (err) console.error(err);
                    if(!item.new_val) {
                        socket.emit('podcast:deleted', item.old_val.id);
                    } else {
                        socket.emit('podcast:added', item.new_val);
                    }
                });
            })
            .error(function (err) {
                console.log("Error:", err);
            });
    });

    router.post('/podcasts', (req, res) => {
        podcastService.add(req.body.url)
            .then(resp => res.send(resp))
            .catch(err => {
                console.error(err);
                res.status(500).send(err.message);
            });
    });

    router.get('/podcasts/:id', (req, res) => {
        podcastService.get(req.params.id)
            .then(resp => res.send(resp))
            .catch(err => {
                console.error(err);
                res.status(500).send(err.message);
            });
    });

    router.get('/podcasts', (req, res) => {
        podcastService.getAll()
            .then(resp => res.send(resp))
            .catch(err => {
                console.error(err);
                res.status(500).send(err.message);
            });
    });

    return router;
};
