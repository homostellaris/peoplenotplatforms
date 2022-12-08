import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import analytics from '../analytics'
import Save from '../common/Save'
import Person from './Person'
import PersonBuilder from './PersonBuilder'

PersonEditor.propTypes = {
  id: PropTypes.string
}

function PersonEditor(props) {
  const { id } = props

  const [personName, setPersonName] = useState()
  useEffect(() => {
    document.title = `Edit ${personName || 'person'}`
  })

  const getPersonResult = useQuery(GET_PERSON, { variables: { id } })
  const [editPerson, editPersonResult] = useMutation(EDIT_PERSON)

  if (getPersonResult.error) return <p>ERROR</p>
  if (getPersonResult.loading) return <Person name="Loading..." />
  // TODO: Try mutation onCompleted callback instead?
  if (editPersonResult.data) {
    const id = editPersonResult.data.editPerson.id
    analytics.track('Edited person', { id })
    return <Redirect to={`/person/${id}`} />
  }

  !personName && setPersonName(getPersonResult.data.person.name)

  return (
    <PersonBuilder
      person={getPersonResult.data.person}
      propertyBeingEdited="image"
    >
      {(getPerson, isValid) => (
        <Save
          disabled={!isValid}
          onClick={async e => {
            // TODO: Find a better solution for this.
            // Mutation fails because person has __typename property from the query that was used to retrieve it.
            // This property is not in the GraphQL schema so Apollo throws an error.
            //
            // https://github.com/apollographql/apollo-client/issues/1913
            const person = await getPerson()
            delete person.__typename
            editPerson({
              variables: { id, person }
            })
          }}
        />
      )}
    </PersonBuilder>
  )
}

const EDIT_PERSON = gql`
  mutation EditPerson($id: ID!, $person: PersonInput!) {
    editPerson(id: $id, person: $person) {
      id
      name
      image
      profiles
    }
  }
`

const GET_PERSON = gql`
  query GetPerson($id: ID!) {
    person(id: $id) {
      name
      image
      profiles
    }
  }
`

export default PersonEditor
