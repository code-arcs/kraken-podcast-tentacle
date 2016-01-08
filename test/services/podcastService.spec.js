var expect = require('expect.js');
var Q = require('q');

var podcastService = require('../../services/podcastService');

describe('PodcastService', function () {
    var fixture = {
        url: 'http://feeds.podtrac.com/9dPm65vdpLL1',
        image: 'http://www.pwop.com/itunes_hanselminutes.jpg',
        title: 'Hanselminutes',
        link: 'http://www.hanselminutes.com'
    };

    it('responds the podcast\'s image', (done) => {
        return podcastService(fixture.url).getImage()
            .then(image => expect(image).to.be(fixture.image))
            .then(() => done())
            .catch(done);
    });

    it('responds the podcast\'s title.', (done) => {
        return podcastService(fixture.url).getTitle()
            .then(title => expect(title).to.be(fixture.title))
            .then(() => done())
            .catch(done);
    });

    it('responds the podcast\'s link.', (done) => {
        return podcastService(fixture.url).getLink()
            .then(link => expect(link).to.be(fixture.link))
            .then(() => done())
            .catch(done);
    });
});