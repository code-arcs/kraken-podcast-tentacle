var express = require('express');
var router = express.Router();

var podcastService = require('../services/podcastService');

router.post('/podcasts', (req, res) => {
    podcastService.add(req.body.url)
        .then(resp => res.send(resp))
        .catch(err => {
            console.error(err);
            res.status(500).send(err.message);
        });
});

router.get('/podcasts/:url', (req, res) => {
    console.log(req.params.url);
    podcastService.get(req.params.url)
        .then(resp => res.send(resp))
        .catch(err => {
            console.error(err);
            res.status(500).send(err.message);
        });
});

module.exports = router;
