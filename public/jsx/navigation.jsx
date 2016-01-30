import React from 'react'
import { Link } from 'react-router'

class PodcastNav extends React.Component {
    render () {
        return (
            <nav className="navbar navbar-fixed-top navbar-light bg-faded">
                <Link className="navbar-brand" to='/'>Podcasts</Link>
                <form className="form-inline pull-xs-right">
                    <button className="btn btn-success-outline" type="submit"><i className="fa fa-plus"></i></button>
                    <input className="form-control" type="text" placeholder="Search in Podcasts..." />
                    <button className="btn btn-success-outline" type="submit"><i className="fa fa-search"></i></button>
                </form>
            </nav>
        )
    }
}

export default PodcastNav