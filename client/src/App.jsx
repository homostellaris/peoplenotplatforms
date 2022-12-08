import { createBrowserHistory } from 'history'
import React from 'react'
import { CookiesProvider } from 'react-cookie'; // TODO: Decide if this is still necessary
import { Route, Router, Switch } from 'react-router-dom'
import About from './About'
import Attributions from './Attributions'
import Contact from './Contact'
import Home from './Home'
import PersonSite from './Person/PersonSite'
import PersonViewer from './Person/PersonViewer'
import Privacy from './Privacy'

const history = createBrowserHistory()

function App(props) {
  return (
    <CookiesProvider>
      <Router history={history}>
        <Switch>
          <Route path={'/about'} component={About} />
          <Route path={'/attributions'} component={Attributions} />
          <Route path={'/contact'} component={Contact} />
          <Route path={'/home'} component={Home} />
          <Route path={'/person/:id/view'}>
            {({ match }) => {
              const id = match === null ? null : match.params.id
              return <PersonViewer id={id} />
            }}
          </Route>
          <Route path={'/privacy'} component={Privacy} />
          <Route>
            <PersonSite />
          </Route>
        </Switch>
      </Router>
    </CookiesProvider>
  )
}

export default App
