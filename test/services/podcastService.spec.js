var expect = require('expect.js');
var Q = require('q');

var podcastService = require('../../services/podcastService');

describe('PodcastService', function () {
    var fixture = {
        title: 'Hanselminutes',
        image: 'http://www.pwop.com/itunes_hanselminutes.jpg',
        url: 'http://feeds.podtrac.com/9dPm65vdpLL1',
        homepage: 'http://www.hanselminutes.com'
    };

    beforeEach((done) => {
        podcastService.truncate()
            .then(() => done())
            .catch(done)
    });

    it('grabs podcast xml rss feed.', done => {
        podcastService.add(fixture.url)
            .then(resp => expect(resp).to.eql(fixture))
            .then(() => done())
            .catch(done);
    });

    it('throws error, when trying to add same url twice.', done => {
        podcastService.add(fixture.url)
            .then(() => podcastService.add(fixture.url))
            .then(done)
            .catch(err => {
                expect(err).to.eql(new Error('Entity already exists!'));
                done();
            });
    });

    it('returns podcast info for given url.', done => {
        podcastService.add(fixture.url)
            .then(() => podcastService.get(fixture.url))
            .then(resp => expect(resp).to.eql(fixture))
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
    })
});