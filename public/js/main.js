(function () {
    'use strict';

    var socket = io();
    var React = require('react');
    var ReactDOM = require('react-dom');

    var PodcastTile = React.createClass({
        render () {
            var style = {
                backgroundImage: 'url(' + this.props.podcast.image +')'
            };

            return (
                <div className="card card-podcast">
                    <div className="card-block">
                        <h4 className="card-title">{this.props.podcast.title}</h4>
                        <h6 className="card-subtitle text-muted">{this.props.podcast.createdAt}</h6>
                    </div>
                    <div style={style} className="cover-image"></div>
                    <div className="card-block text-xs-right">
                        <a href={this.props.podcast.homepage} className="btn"><i className="fa fa-home"></i></a>
                        <a href="#" className="btn btn-primary"><i className="fa fa-comment"></i></a>
                    </div>
                </div>
            )
        }
    });

    var PodcastList = React.createClass({
        getInitialState() {
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
        <PodcastList />
        ,
        document.getElementById('podcasts')
    );
})();
