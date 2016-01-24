(function () {
    'use strict';

    var socket = io();
    var React = require('react');
    var ReactDOM = require('react-dom');

    var PodcastTile = React.createClass({
        render () {
            var style = {
                backgroundImage: 'url(' + this.props.podcast.image + ')'
            };

            return (
                <a className="podcast-tile" href={this.props.podcast.homepage}>
                    <div className="cover" style={style}></div>
                    <div className="title">{this.props.podcast.title}</div>
                </a>
            )
        }
    });

    var PodcastList = React.createClass({
        getInitialState () {
            return {
                podcasts: []
            };
        },

        componentDidMount () {
            var update = function (resp) {
                if (this.isMounted()) {
                    this.setState({podcasts: resp});
                }
            }.bind(this);

            $.get('/podcasts', update);

            socket.on('podcast:added', (podcast) => {
                if (podcast) {
                    let podcasts = [podcast].concat(this.state.podcasts);
                    this.setState({podcasts: podcasts});
                }
            });

            socket.on('podcast:deleted', (id) => {
                if (id) {
                    let podcasts = this.state.podcasts;
                    podcasts = podcasts.filter(podcast => podcast.id !== id);
                    this.setState({podcasts: podcasts});
                }
            });
        },

        render () {
            function abc(podcast) {
                return <PodcastTile key={podcast.id} podcast={podcast}/>
            }

            return <div>{this.state.podcasts.map(abc)}</div>
        }
    });

    ReactDOM.render(
        <PodcastList />,
        document.getElementById('podcasts')
    );
})();
