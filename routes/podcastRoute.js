var express = require('express');
var router = express.Router();

var podcastService = require('../services/podcastService');

router.post('/podcast', function(req, res, next) {
  res.send(podcastService.getResult());
});

module.exports = router;
