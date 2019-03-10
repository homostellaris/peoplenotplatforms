import React from 'react'
import PropTypes from 'prop-types'

import CreatePerson from '../../people/CreatePerson'
import Person from '../../people/Person'

import SearchResult from './SearchResult'
import './SearchResults.css'

function SearchResults (props) {
  const {
    query,
    results: {
      data, loading, error
    }
  } = props

  return (
    <ul className="SearchResults">
      {loading && <li>Loading...</li>}
      {error && <li>Error :(</li>}
      {data && data.people &&
        <React.Fragment>
          {data.people.map((person) => (
            <SearchResult key={person.id}>
              <Person {...person}/>
            </SearchResult>
          ))
          }
          <CreatePerson personName={query}/>
        </React.Fragment>
      }
    </ul>
  )
}

SearchResults.propTypes = {
  query: PropTypes.string,
  results: PropTypes.shape({})
}

SearchResults.defaultProps = {
  results: {}
}

export default SearchResults
