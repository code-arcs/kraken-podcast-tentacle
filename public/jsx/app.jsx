import React from 'react'
import { render } from 'react-dom'
import { browserHistory, Router, Route, Link, IndexRoute } from 'react-router'

import PodcastNav from './navigation.jsx'
import PodcastsList from './list.jsx'
import PodcastDetail from './detail.jsx'

class App extends React.Component {
    render() {
        return (
            <div>
                <PodcastNav/>
                {this.props.children}
            </div>
        )
    }
}

render((
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={PodcastsList}/>
            <Route path=":id" component={PodcastDetail}/>
        </Route>
    </Router>
), document.getElementById('app'));