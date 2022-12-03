import pathRegexes from './pathRegexes'

describe('Authorisation', function() {
  beforeEach(function() {
    cy.task('resetDatabase')
  })

  context('When the user is not logged in', function() {
    it('does not allow them to edit anyone', function() {
      cy.task('createPersonApi').then(person => {
        cy.visit(`/person/${person.id}`)
      })

      cy.get('#edit-person').should('have.attr', 'disabled')
      cy.get('#edit-person').should(
        'have.attr',
        'title',
        'You cannot edit this person because you did not create them.'
      )

      cy.request('POST', '/graphql', {
        operationName: 'EditPerson',
        variables: {
          id: '5f9e096d9a46eab82fe724f3',
          person: {
            name: 'Daniel Metcalfey',
            profiles: [
              'https://danielmetcalfe.rocks/',
              'https://stackoverflow.com/story/mrdanielmetcalfe',
              'https://github.com/moderatemisbehaviour',
              'https://twitter.com/mrdanmetcalfe',
              'https://medium.com/@moderatemisbehaviour',
              'https://uk.linkedin.com/in/mrdanielmetcalfe',
              'mailto:mrdanielmetcalfe@gmail.com'
            ],
            image:
              'https://www.gravatar.com/avatar/d35e305d07d4e8fe7bf844d17bec5e1e?s=1000'
          }
        },
        query:
          'mutation EditPerson($id: ID!, $person: PersonInput!) {\n  editPerson(id: $id, person: $person) {\n    id\n    name\n    image\n    profiles\n    __typename\n  }\n}\n'
      })
        .its('body.errors')
        .its('0')
        .its('extensions.code')
        .should('eq', 'UNAUTHENTICATED')
    })
  })

  context('When the user is logged in', function() {
    context('but did not create the person', function() {
      it('does not allow them to edit', function() {
        cy.fixture('users/dave.json')
          .login()
          .fixture('users/dan.json')
          .then(dan => {
            cy.task('createUser', dan)
          })
          .then(dan => {
            cy.task('createPersonApi', { userId: dan.id })
          })
          .then(person => {
            cy.visit(`/person/${person.id}`)

            cy.get('#edit-person').should('have.attr', 'disabled')
            cy.get('#edit-person').should(
              'have.attr',
              'title',
              'You cannot edit this person because you did not create them.'
            )

            cy.request('POST', '/graphql', {
              operationName: 'EditPerson',
              variables: {
                id: person.id,
                person: {
                  name: 'Daniel Metcalfey',
                  profiles: [
                    'https://danielmetcalfe.rocks/',
                    'https://stackoverflow.com/story/mrdanielmetcalfe',
                    'https://github.com/moderatemisbehaviour',
                    'https://twitter.com/mrdanmetcalfe',
                    'https://medium.com/@moderatemisbehaviour',
                    'https://uk.linkedin.com/in/mrdanielmetcalfe',
                    'mailto:mrdanielmetcalfe@gmail.com'
                  ],
                  image:
                    'https://www.gravatar.com/avatar/d35e305d07d4e8fe7bf844d17bec5e1e?s=1000'
                }
              },
              query:
                'mutation EditPerson($id: ID!, $person: PersonInput!) {\n  editPerson(id: $id, person: $person) {\n    id\n    name\n    image\n    profiles\n    __typename\n  }\n}\n'
            })
              .its('body.errors')
              .its('0')
              .its('extensions.code')
              .should('eq', 'FORBIDDEN')
          })
      })
    })

    context('they created the person', function() {
      it('allows them to edit', function() {
        cy.login()
          .as('user')
          .then(user => {
            cy.task('createPersonApi', { userId: user.id })
          })
          .then(person => {
            cy.visit(`/person/${person.id}`)
          })
        cy.get('#edit-person').should('not.have.attr', 'disabled')
        cy.get('#edit-person').should(
          'not.have.attr',
          'title',
          'You cannot edit this person because you did not create them.'
        )
      })
    })
  })
})

describe('the state on page load', function() {
  beforeEach(function() {
    cy.task('resetDatabase')
    cy.task('createPersonApi')
      .as('person')
      .then(person => {
        cy.visit(`/person/${person.id}/edit`)
      })
  })

  it("updates the document title using the person's name", function() {
    cy.title().should('eq', `Edit ${this.person.name}`)
  })

  it('displays the person in their current state', function() {
    cy.get('.name').should('have.text', this.person.name)
    cy.get('.image').should(
      'have.css',
      'background-image',
      `url("${this.person.image}")`
    )
    cy.get('.profile-0 a').should('have.attr', 'href', this.person.profiles[0])
    cy.get('.profile-1 a').should('have.attr', 'href', this.person.profiles[1])
    cy.get('.profile-2 a').should('have.attr', 'href', this.person.profiles[2])
  })

  it('has edit buttons for existing properties', function() {
    cy.get('.edit-name')
    cy.get('.edit-image')
    cy.get('.edit-profiles')
  })

  it('disables the edit button for the property currently being edited', function() {
    cy.get('.edit-image').should('have.attr', 'disabled')
    cy.get('.edit-profiles')
      .click()
      .should('have.attr', 'disabled')
  })

  it('has an add profile button', function() {
    cy.get('.add-profile')
  })

  it('has a save button', function() {
    cy.get('.save')
  })

  it('starts by editing the profile image because this would be common', function() {
    cy.get('#the-input').should('have.attr', 'value', this.person.image)
  })
})

describe('editing properties and saving', function() {
  beforeEach(function() {
    cy.task('resetDatabase')
    cy.login()
      .then(user => {
        cy.task('createPersonApi', { userId: user.id })
      })
      .then(person => {
        cy.visit(`/person/${person.id}/edit`)
      })
  })

  describe('editing name and existing profiles', function() {
    it('views the updated person after saving', function() {
      const newName = 'Daniel Metcalfe 2.0'
      const newTwitterProfileUrl = 'https://twitter.com/dansnewprofile'

      cy.get('.edit-name').click()
      cy.get('#the-input')
        .clear()
        .type(newName)

      cy.get('.edit-profiles').click()
      cy.get('.edit-profile-3').click()
      cy.get('#the-input')
        .clear()
        .type(newTwitterProfileUrl)
      cy.get('.save').click()

      cy.url().should('match', pathRegexes.person)

      cy.get('.name').should('have.text', newName)
      cy.get('.profile-3 a').should('have.attr', 'href', newTwitterProfileUrl)
    })
  })

  describe('adding profiles', function() {
    describe('when a blank profile is being edited', function() {
      it('discards the blank profile before saving', function() {
        cy.get('.add-profile').click()
        cy.get('.save').click()

        cy.url().should('match', pathRegexes.person)
        cy.get('.profile').should('have.length', 7)
      })
    })

    describe('adding a blank profile then editing another one', function() {
      it('discards the blank profile before saving', function() {
        cy.get('.add-profile').click()
        cy.get('.edit-profile-2').click()

        cy.get('.save').click()
        cy.url().should('match', pathRegexes.person)
        cy.get('.profile').should('have.length', 7)
      })
    })

    describe('adding a blank profile then attempting to add another one', function() {
      it('does not allow another profile to be added whilst one is invalid', function() {
        cy.get('.add-profile').click()
        cy.get('.add-profile').should('have.attr', 'disabled')
        cy.get('#the-input').type('invalid profile URL')
        cy.get('.add-profile').should('have.attr', 'disabled')
        cy.get('#the-input')
          .clear()
          .type('https://google.com')

        cy.get('.save').click()
        cy.url().should('match', pathRegexes.person)
        cy.get('.profile').should('have.length', 8)
      })
    })
  })
})
