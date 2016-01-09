var DOMParser = require('xmldom').DOMParser;
var xpath = require('xpath');
var request = require('request-promise');
var Q = require('q');
select = xpath.useNamespaces({"itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd"});

var podcastRepository = require('../repositories/podcastRepository');

module.exports = {
    add: add,
    truncate: podcastRepository.truncate,
    get: podcastRepository.findByUrl
};

function add(feedUrl) {
    var entity = {
        url: feedUrl
    };

    return getFeedContent(feedUrl)
        .then(resp => createPodcastEntity(resp, feedUrl))
        .then(entity => podcastRepository.save(entity));
}

function getFeedContent(feedUrl) {
    return request(feedUrl)
        .then(resp => content = new DOMParser().parseFromString(resp));
}

function createPodcastEntity(xml, feedUrl) {
    return {
        title: getValue(xml, '//title'),
        image: getAttribute(xml, '//itunes:image', 'href'),
        url: feedUrl,
        homepage: getValue(xml, '//link')
    };
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


