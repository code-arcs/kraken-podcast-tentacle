var express = require('express');
var router = express.Router();

var podcastService = require('../services/podcastService');

router.post('/podcasts', (req, res) => {
    podcastService.add(req.body.url)
        .then(res.send)
        .catch(err => {
            console.error(err);
            res.sendStatus(500)
        });
});

router.get('/podcasts/:url', (req, res) => {
    podcastService.get(req.param.url)
        .then(res.send)
        .catch(err => {
            console.error(err);
            res.sendStatus(500)
        });
});

module.exports = router;
