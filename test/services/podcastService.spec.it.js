var expect = require('expect.js');
var Q = require('q');
var r = require('rethinkdb');

var Config = require('../../services/configService');
var podcastService = require('../../services/podcastService');
var conn;

describe('PodcastService', function () {
    this.timeout(10000);

    var fixture = [
        {
            title: 'Hanselminutes',
            image: 'http://www.pwop.com/itunes_hanselminutes.jpg',
            url: 'http://feeds.podtrac.com/9dPm65vdpLL1',
            homepage: 'http://www.hanselminutes.com'
        },
        {
            title: 'Radio Nukular',
            image: 'http://www.radionukular.de/wp-content/cache/podlove/a6/254a04dc16fb278bd3eedf4cafb27f/radio-nukular_original.jpg',
            url: 'http://www.radionukular.de/feed/nukularfeed/',
            homepage: 'http://www.radionukular.de'
        }
    ];

    beforeEach(done => {
        r.connect(Config.get('db'))
            .then(_conn => conn = _conn)
            .then(() => r.tableCreate(Config.get('db:table')).run(conn))
            .then(() => r.table(Config.get('db:table')).indexCreate('url').run(conn))
            .then(() => podcastService.truncate())
            .then(() => done())
            .catch(done);
    });

    afterEach(done => {
        r.tableDrop(Config.get('db:table')).run(conn)
            .then(() => done())
            .catch(done);
    });

    it('grabs podcast xml rss feed.', done => {
        podcastService.add(fixture[0].url)
            .then(resp => {
                delete resp.id;
                expect(resp).to.eql(fixture[0])
            })
            .then(() => done())
            .catch(done);
    });

    it('throws error, when trying to add same url twice.', done => {
        podcastService.add(fixture[0].url)
            .then(() => podcastService.add(fixture[0].url))
            .then(done)
            .catch(err => {
                expect(err).to.eql(new Error('Entity already exists!'));
                done();
            });
    });

    it('returns podcast info for given url.', done => {
        podcastService.add(fixture[0].url)
            .then((resp) => podcastService.get(resp.id))
            .then(resp => {
                delete resp.id;
                expect(resp).to.eql(fixture[0])
            })
            .then(() => done())
            .catch(done);
    });

    it('does not crash when no podcast has been added yet.', done => {
        podcastService.get('asd')
            .then(done)
            .catch(err => {
                expect(err).to.eql(new Error('No entity with given url asd found!'));
                done();
            });
    });

    it('returns all podcasts.', done => {
        podcastService.add(fixture[0].url)
            .then(() => podcastService.add(fixture[1].url))
            .then(() => podcastService.getAll())
            .then(resp => {
                expect(resp.length).to.be(2);
            })
            .then(() => done())
            .catch(done);
    });
});