var express = require('express');
var router = express.Router();

var podcastService = require('../services/podcastService');

module.exports = function(io) {
    io.on('connection', function(socket) {
        podcastService.changefeed(socket);
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
