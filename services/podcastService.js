'use strict';
let DOMParser = require('xmldom').DOMParser;
let xpath = require('xpath');
let request = require('request-promise');
let util = require('util');
let fs = require('fs');
let sha1 = require('sha1');
let Q = require('q');
let gm = require('gm');
let mime = require('mime');
let select = xpath.useNamespaces({"itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd"});

let Config = require('../services/configService');
let podcastRepository = require('../repositories/podcastRepository');


module.exports = {
    changefeed: podcastRepository.changefeed,
    truncate: podcastRepository.truncate,
    getAll: podcastRepository.findAll,

    add(feedUrl) {
        return getFeedContent(feedUrl)
            .then(resp => createPodcastEntity(resp, feedUrl))
            .then(entity => podcastRepository.save(entity))
            .catch(err => console.error(err));
    },

    getImage(podcastId, imageSize) {
        return podcastRepository.findById(podcastId)
            .then(podcast => {
                let cacheDir = Config.get('cache:dir');
                if (podcast.image.local && imageSize) {
                    return cacheDir + '/' + podcast.image.local + '-' + imageSize + '.png';
                } else {
                    return cacheDir + '/' + podcast.image.local + '.png';
                }
            })
    },

    getItems(podcastId) {
        return podcastRepository.findById(podcastId)
            .then(podcast => {
                request(podcast.url)
            })
            .then(resp => new DOMParser().parseFromString(resp))
            .then(xml => select('/item', xml))
            .then(items => {
                console.log(items);
            });
    },

    get(id) {
        return podcastRepository.findById(id);
    }
};


function getFeedContent(feedUrl) {
    return request(feedUrl)
        .then(resp => new DOMParser().parseFromString(resp));
}

function createPodcastEntity(xml, feedUrl) {
    let deferred = Q.defer();
    let podcast = {
        title: getValue(xml, '//title'),
        image: getValue(xml, '//image/url') || getAttribute(xml, '//itunes:image', 'href'),
        url: feedUrl,
        description: getValue(xml, '//description'),
        language: getValue(xml, '//language'),
        homepage: getValue(xml, '//link')
    };

    getAndCropImage(podcast.image)
        .then((hash) => {
            podcast.image = {
                local: hash,
                remote: podcast.image
            };
            deferred.resolve(podcast)
        });

    return deferred.promise;

}

function getAndCropImage(url) {
    if (url.indexOf('http') === -1) {
        url = 'http:' + url;
    }
    let deferred = Q.defer();
    const coverImagePath = `./cache/`;
    const coverImage = sha1(url);

    request(url)
        .pipe(fs.createWriteStream(`${coverImagePath}/${coverImage}.png`))
        .on('close', function () {
            Q.all([
                resize(coverImagePath, coverImage, 300),
                resize(coverImagePath, coverImage, 150),
                resize(coverImagePath, coverImage, 75)
            ]).then(() => deferred.resolve(coverImage))
        });

    return deferred.promise;
}

function resize(coverImagePath, coverImage, width) {
    var deferred = Q.defer();

    gm(`${coverImagePath}/${coverImage}.png`)
        .resize(width)
        .setFormat('png')
        .write(`${coverImagePath}/${coverImage}-${width}.png`, (err) => {
            if (err) console.error(err);
            deferred.resolve(coverImage);
        });

    return deferred.promise;
}


function getAttribute(node, path, attr, idx) {
    let value;
    let xpath = select(path + '/@' + attr, node)[idx || 0];
    if (xpath) {
        value = xpath.value;
    }
    return value;
}

function getValue(node, path, idx) {
    let value;
    let xpath = select(path + '/text()', node)[idx || 0];
    if (xpath) {
        value = xpath.toString();
    }
    return value;
}
