var r = require('rethinkdb');
var Q = require('q');

var Config = require('../../services/configService');
var PodcastService = require('../../services/podcastService');
var podcasts = [
    'https://www.innoq.com/de/podcast.rss',     // InnoQ Podcast
    'http://feeds.podtrac.com/9dPm65vdpLL1',    // Hanselminutes
    'https://simplecast.fm/podcasts/279/rss',   // Full Stack Radio
    'https://fivejs.codeschool.com/feed.rss',   // 5 Minutes of JS
    'http://feeds.feedburner.com/se-radio'      // SE Radio
];

r.connect(Config.get('db'))
    .then(_conn => conn = _conn)
    .then(() => {
        var promises = podcasts.map(podcast => PodcastService.add(podcast));
        return Q.all(promises);
    })
    .then(() => {
        console.log('Data inserted.');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
