import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import analytics from '../analytics'
import Save from '../common/Save'
import PersonBuilder from './PersonBuilder'

PersonCreator.propTypes = {
  id: PropTypes.string,
  person: PropTypes.object
}

function PersonCreator(props) {
  useEffect(() => {
    document.title = `Create ${props.person.name || 'person'}`
  })
  const [createPerson, { data }] = useMutation(CREATE_PERSON)

  if (data) {
    const id = data.createPerson.id
    analytics.track('Created person', { id })
    return <Redirect to={`/person/${id}`} />
  }

  return (
    <PersonBuilder person={props.person}>
      {(getPerson, isValid) => (
        <Save
          disabled={!isValid}
          onClick={async e => {
            await createPerson({
              variables: { person: await getPerson() }
            })
          }}
        />
      )}
    </PersonBuilder>
  )
}

const CREATE_PERSON = gql`
  mutation CreatePerson($person: PersonInput!) {
    createPerson(person: $person) {
      id
      name
    }
  }
`

export default PersonCreator
