import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Person from './Person'

class PeopleBrowser extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchResults: []
    }
  }

  render () {
    const { id } = this.props

    if (id) {
      const GET_PERSON = gql`
        query getPerson($id: ID!) {
          person(id: $id) {
            name
            photo
            profiles {
              id
              platform
              url
            }
          }
        }
      `

      return (
        <Query query={GET_PERSON} variables={{ id }}>
          {({ data, loading, error }) => {
            if (error) return <p>ERROR</p>
            if (loading) {
              return <Person title='Loading...' />
            }

            const { person: { name, photo, profiles } } = data
            return <Person name={name} photo={photo} profiles={profiles} />
          }}
        </Query>
      )
    } else {
      return <Person />
    }
  }
}

PeopleBrowser.propTypes = {
  id: PropTypes.string
}

PeopleBrowser.defaultProps = {
  id: undefined
}

export default PeopleBrowser
