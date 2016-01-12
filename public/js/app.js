(function () {
    var socket = io();
    updateTiles();

    socket.on('podcast:changed', function(podcastInfo) {
        var tile = createTile(podcastInfo);
        $('.podcasts.view .tiles').append(tile);
    });

    $('#form-add-podcast').on('submit', function (ev) {
        ev.preventDefault();
        var feedUrl = $('.input-podcast-url', this).val();

        $.post('/podcasts', {url: feedUrl})
            .fail(function(error) {
                console.log(error);
            })
    });

    function updateTiles() {
        $.get('/podcasts')
            .done(update);

        function update(resp) {
            var elements = resp.map(function(podcast) {
                var tile = createTile(podcast);
                $('.podcasts.view .tiles').append(tile);
            });
        }
    }

    function createTile(podcast) {
        var $cover = $('<div/>').addClass('cover').css({backgroundImage: 'url(' + podcast.image + ')'});
        var $title = $('<div/>').addClass('title').text(podcast.title);

        return $('<a/>').addClass('podcast-tile')
            .attr('href', podcast.homepage)
            .append($cover)
            .append($title);
    }
})();
