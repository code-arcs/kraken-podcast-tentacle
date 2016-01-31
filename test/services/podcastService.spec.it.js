'use strict';
const expect = require('expect.js');
const r = require('rethinkdb');
const fs = require('fs');
const path = require('path');
const nock = require('nock');

const Config = require('../../services/configService');
const podcastService = require('../../services/podcastService');
let conn;

Date.now = () => 1337;

describe('PodcastService', function () {
    this.timeout(10000);

    var fixture = [
        {
            title: 'innoQ Podcast',
            createdAt: 1337,
            image: {
                local: 'f77c34fea086478bebc2283ddec89c734b3696b0',
                remote: 'https://www.innoq.com/assets/podcast-18e30963d3c60ccbe32ff4000b28ceb6.jpg'
            },
            url: 'https://www.innoq.com/de/podcast.rss',
            language: 'de-de',
            homepage: 'https://www.innoq.com/de/podcast/'
        },
        {
            title: 'Radio Nukular',
            createdAt: 1337,
            image: {
                local: '9d722cc644bd359e0c5bf4edb382b9986671ae3f',
                remote: 'http://www.radionukular.de/wp-content/cache/podlove/a6/254a04dc16fb278bd3eedf4cafb27f/radio-nukular_original.jpg'
            },
            url: 'http://www.radionukular.de/feed/nukularfeed',
            language: 'de-de',
            homepage: 'http://www.radionukular.de'
        }
    ];

    before(() => {
        mockHanselminutesRequests();
        mochRadioNukularRequests();
    });

    after(() => {
        nock.cleanAll();
    });

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
            .then(resp => expectToContain(resp, fixture[0]))
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
            .then(resp => expectToContain(resp, fixture[0]))
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

    it('parses feed items.', done => {
        podcastService.add(fixture[0].url)
            .then(() => podcastService.getAll())
            .then(pc => podcastService.getItems(pc[0].id))
            .then(items => {
                expect(items.length).not.to.be(0);

                items.forEach(item => {
                    expect(item).to.have.property('title');
                    expect(item).to.have.property('pubDate');
                    expect(item).to.have.property('link');
                    expect(item).to.have.property('description');
                    expect(item).to.have.property('duration');
                });

                expect(items[0].title).to.be('Redis in der Praxis');
                expect(items[0].pubDate).to.be('Thu, 07 Jan 2016 00:00:00 +0100');
                expect(items[0].duration).to.be(2435);
                expect(items[0].description).to.match(/^<p>In dieser Episode unterhalten sich Lucas Dohmen und Stefan Tilkov(.*)/);

                expect(items[1].title).to.be('REST und HTTP');
                expect(items[1].pubDate).to.be('Mon, 10 Aug 2015 00:00:00 +0200');
                expect(items[1].duration).to.be(3188);

                done();
            })
            .catch(done);
    });

    it('transforms durations to seconds.', () => {
        const duration = podcastService.__getDurationInSeconds;

        expect(duration(1337)).to.be(1337);
        expect(duration('1337')).to.be(1337);
        expect(duration('00:00:50')).to.be(50);
        expect(duration('00:01:50')).to.be(110);
        expect(duration('02:09:07')).to.be(7747);
    });

    // === Helper Functions ================
    function expectToContain(resp, fixture) {
        Object.keys(resp).forEach(key => {
            if (fixture.hasOwnProperty(key)) {
                expect(resp[key]).to.eql(fixture[key]);
            }
        });
    }

    function mockHanselminutesRequests() {
        let xml = fs.readFileSync(path.resolve(`${__dirname}/../fixtures/innoq.xml`));
        let cover = fs.readFileSync(path.resolve(`${__dirname}/../fixtures/innoq.jpg`));

        nock('https://www.innoq.com')
            .persist()
            .get('/de/podcast.rss')
            .reply(200, xml);

        nock('https://www.innoq.com')
            .persist()
            .get('/assets/podcast-18e30963d3c60ccbe32ff4000b28ceb6.jpg')
            .reply(200, cover);
    }

    function mochRadioNukularRequests() {
        let xml = fs.readFileSync(path.resolve(`${__dirname}/../fixtures/radionukular.xml`));
        let cover = fs.readFileSync(path.resolve(`${__dirname}/../fixtures/radionukular.jpg`));

        nock('http://www.radionukular.de')
            .persist()
            .get('/feed/nukularfeed')
            .reply(200, xml);

        nock('http://www.radionukular.de')
            .persist()
            .get('/wp-content/cache/podlove/aa/fcf7cd74af66374837ecec4ef6486d/radio-nukular_original.jpg')
            .reply(200, cover);
    }
});