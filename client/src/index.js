import React from 'react'
import ReactDOM from 'react-dom'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

import App from './app/App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

const port = process.env.PORT || 4000

const client = new ApolloClient({
  uri: `http://localhost:${port}/graphql`
})

// TODO: Use Helmet to avoid DOM nesting error.
ReactDOM.render(
  <ApolloProvider client={client}>
    <head>
      <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,800" rel="stylesheet"></link>
    </head>
    <App/>
  </ApolloProvider>,
  document.getElementById('root')
)
registerServiceWorker()
