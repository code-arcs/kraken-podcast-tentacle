(function() {
    $.get('/podcasts')
        .done(function(resp) {

            var elements = resp.map(function(podcast) {

                var $cover = $('<div/>').addClass('cover').css({backgroundImage: 'url(' + podcast.image + ')'});
                var $title = $('<div/>').addClass('title').text(podcast.title);

                return $('<a/>').addClass('podcast-tile')
                    .attr('href', podcast.homepage)
                    .append($cover)
                    .append($title);
            });


            $('.podcasts.view').append(elements);
        });
})();
