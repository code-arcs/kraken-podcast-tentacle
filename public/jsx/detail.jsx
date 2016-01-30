var socket = require('socket.io-client')();
var React = require('react');
import { Link } from 'react-router'

class PodcastDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    loadPodcast() {
        $.get(`/podcasts/${this.props.params.id}`, (resp) => {
            this.setState(resp);
        });
    }

    componentDidMount() {
        this.loadPodcast();
    }

    render() {
        return (
            <div className="podcast-detail">
                <img src={`/podcasts/${this.state.id}/image/150`} className="podcast-detail__cover img-thumbnail" />
                <h2>{this.state.title}</h2>
                <p>{this.state.description}</p>
            </div>
        )
    }
}

export default PodcastDetail
