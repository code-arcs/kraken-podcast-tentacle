var DOMParser = require('xmldom').DOMParser;
var xpath = require('xpath');
var request = require('request-promise');
var util = require('util');
var Q = require('q');
var mime = require('mime');
select = xpath.useNamespaces({"itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd"});

var podcastRepository = require('../repositories/podcastRepository');

module.exports = {
    add: add,
    changefeed: podcastRepository.changefeed,
    truncate: podcastRepository.truncate,
    get: podcastRepository.findById,
    getAll: podcastRepository.findAll
};

function add(feedUrl) {
    return getFeedContent(feedUrl)
        .then(resp => createPodcastEntity(resp, feedUrl))
        .then(entity => podcastRepository.save(entity))
        .catch(err => console.error(err));
}


function getFeedContent(feedUrl) {
    return request(feedUrl)
        .then(resp => content = new DOMParser().parseFromString(resp));
}

function createPodcastEntity(xml, feedUrl) {
    var image;

    return getImage(xml)
        .then(_img => image = _img)
        .then(() => {
            return {
                title: getValue(xml, '//title'),
                image: image,
                url: feedUrl,
                homepage: getValue(xml, '//link')
            };
        });
}

function getImage(xml) {
    var deferred = Q.defer();
    var imageUrl = getValue(xml, '//image/url') || getAttribute(xml, '//itunes:image', 'href');
    var options = {
        method: 'GET',
        url: imageUrl,
        encoding: null
    };

    request(options, function callback(error, response, body) {
        var data;
        if (!error && response.statusCode == 200) {
            data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
        }
        deferred.resolve(data);
    });

    return deferred.promise;
}

function getAttribute(node, path, attr, idx) {
    var value;
    var xpath = select(path + '/@' + attr, node)[idx || 0];
    if (xpath) {
        value = xpath.value;
    }
    return value;
}

function getValue(node, path, idx) {
    var value;
    var xpath = select(path + '/text()', node)[idx || 0];
    if (xpath) {
        value = xpath.toString();
    }
    return value;
}
