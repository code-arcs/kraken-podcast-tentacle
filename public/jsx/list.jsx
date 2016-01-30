var socket = require('socket.io-client')();
var React = require('react');
import { Link } from 'react-router'

class PodcastTile extends React.Component {
    render() {
        var srcSet = [75, 150, 300]
            .map(size => `/podcasts/${this.props.podcast.id}/image/${size} ${size}w`)
            .join(',');

        var cropAfterWords = 20;
        let words = this.props.podcast.description.split(' ');
        var cropDescription = words.filter(w => w.length > 3).length > cropAfterWords;
        if (cropDescription) {
            this.props.podcast.description = words.slice(0, cropAfterWords).join(' ');
        }

        return (
            <Link className="card card-podcast" to={`/${this.props.podcast.id}`}>
                <img src={'/podcasts/' + this.props.podcast.id + '/image'}
                     className="card-podcast__cover-image"
                     srcSet={srcSet}/>
                <p className="card-podcast__podcast-title">{this.props.podcast.title}</p>
                <p className={'card-podcast__podcast-description' + (cropDescription ? ' crop' : '')}>{this.props.podcast.description}</p>
            </Link>
        )
    }
}

class PodcastList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            podcasts: []
        }
    }

    loadPodcasts() {
        $.get('/podcasts', (resp) => {
            this.setState({podcasts: resp});
        });
    }

    bindWebsocket() {
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
    }

    componentDidMount() {
        this.loadPodcasts();
        this.bindWebsocket();
    }

    render() {
        function abc(podcast) {
            return <PodcastTile key={podcast.id} podcast={podcast}/>
        }

        return (
            <div className="podcasts-list">
                {this.state.podcasts.map(abc)}
            </div>
        )
    }
}

export default PodcastList
