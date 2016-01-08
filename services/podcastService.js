var DOMParser = require('xmldom').DOMParser;
var xpath = require('xpath');
var request = require('request-promise');
var Q = require('q');
select = xpath.useNamespaces({"itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd"});

module.exports = function (feedUrl) {
    var content;

    return {
        getImage: () => getRssDocument().then(() => _getAttribute('//itunes:image', 'href')),
        getTitle: () => getRssDocument().then(() => _getValue('//title')),
        getLink: () => getRssDocument().then(() => _getValue('//link'))
    };


    function getRssDocument() {
        var deferred;

        if (!content) {
            return request(feedUrl)
                .then(resp => content = new DOMParser().parseFromString(resp));
        } else {
            deferred = Q.defer();
            deferred.resolve(content);
            return deferred.promise;
        }
    }

    function _getAttribute(path, attr, idx) {
        var value;
        var xpath = select(path + '/@' + attr, content)[idx || 0];
        if (xpath) {
            value = xpath.value;
        }
        return value;
    }

    function _getValue(path, idx) {
        var value;
        var xpath = select(path + '/text()', content)[idx || 0];
        if (xpath) {
            value = xpath.toString();
        }
        return value;
    }
};



