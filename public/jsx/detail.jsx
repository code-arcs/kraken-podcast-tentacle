var socket = require('socket.io-client')();
var React = require('react');
import { Link } from 'react-router'

class PodcastItem extends React.Component {
    render() {
        return (
            <section className="card">
                <div className="card-block">
                    <h2>{this.props.item.title} &ndash; <date className="small">{new Date(this.props.item.pubDate).toTimeString()}</date></h2>
                    <div dangerouslySetInnerHTML={{__html: this.props.item.description}}></div>
                </div>
            </section>
        )
    }
}

class PodcastDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            podcast: null,
            items: []
        }
    }

    loadPodcast() {
        $.get(`/podcasts/${this.props.params.id}`, (resp) => {
            this.setState({podcast: resp});
        });
    }

    loadPodcastItems() {
        $.get(`/podcasts/${this.props.params.id}/items`, (resp) => {
            this.setState({items: resp});
        });

    }

    componentDidMount() {
        this.loadPodcast();
        this.loadPodcastItems();
    }

    render() {
        if(!this.state.podcast) {
            return null;
        } else {
            return (
                <article className="podcast-detail">
                    <img src={`/podcasts/${this.state.podcast.id}/image/150`} className="podcast-detail__cover img-thumbnail" />
                    <h1>{this.state.podcast.title}</h1>
                    <p>{this.state.podcast.description}</p>
                    <div className="podcast-detail__items">
                        {this.state.items.map((item, idx) => <PodcastItem key={idx} item={item} />)}
                    </div>
                </article>
            )
        }

    }
}

export default PodcastDetail
