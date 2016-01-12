(function () {
    updateTiles();

    $('#form-add-podcast').on('submit', function (ev) {
        ev.preventDefault();
        var feedUrl = $('.input-podcast-url', this).val();

        $.post('/podcasts', {url: feedUrl})
            .done(updateTiles)
            .fail(function(error) {
                console.log(error);
            })
    });

    function updateTiles() {
        $.get('/podcasts')
            .done(update);

        function update(resp) {
            var elements = resp.map(function (podcast) {
                var $cover = $('<div/>').addClass('cover').css({backgroundImage: 'url(' + podcast.image + ')'});
                var $title = $('<div/>').addClass('title').text(podcast.title);

                return $('<a/>').addClass('podcast-tile')
                    .attr('href', podcast.homepage)
                    .append($cover)
                    .append($title);
            });

            $('.podcasts.view .tiles').empty().append(elements);
        }
    }
})();
