import pathRegexes from './pathRegexes'

beforeEach(function() {
  cy.task('resetDatabase')
  cy.login()
  cy.visit('/person/create')
})

it("doesn't allow profile creation when the user is not logged in", function() {
  // TODO: Implement this.
})

it("updates the document title, using the 'name' query param if it exists", function() {
  cy.title().should('eq', 'Create person')
  cy.visit('/person/create?name=Daniel')
  cy.title().should('eq', 'Create Daniel')
})

it('highlights the property currently being edited', function() {
  cy.get('.edit-name').should('have.class', 'currently-being-edited')
  cy.get('.add-profile').click()
  cy.get('.edit-profile-0').should('have.class', 'currently-being-edited')
})

describe('getting to the create person page', function() {
  beforeEach(function() {
    cy.visit('/')
  })

  it('has options for creating a person in the bottom search result', function() {
    cy.get('#the-input').type('Dan')
    cy.get('#create-person').should('have.text', 'Create Dan or someone else.')
  })

  it('has a create person link based on the current search query', function() {
    cy.get('#the-input').type('Dan')
    cy.get('#create-suggested-person').click()
    cy.url().should('contain', `/person/create?name=Dan`)
  })

  it('has a create person link for a new person', function() {
    cy.get('#the-input').type('Dan')
    cy.get('#create-new-person').click()
    cy.url().should('contain', `/person/create`)
  })
})

describe('state on page load', function() {
  it('focuses the input', function() {
    cy.focused().should('have.id', 'the-input')
  })

  it('disables the save button', function() {
    cy.get('.save').should('have.attr', 'disabled')
  })

  it("prompts for the person's name in the input", function() {
    cy.get('#the-input').should(
      'have.attr',
      'placeholder',
      "Enter the person's name"
    )
  })

  it('has an add property buttons in the same order as they appear on the person', function() {
    cy.get('.next')
      .eq(0)
      .should('have.class', 'edit-name')
    cy.get('.next')
      .eq(1)
      .should('have.class', 'add-image')
    cy.get('.next')
      .eq(2)
      .should('have.class', 'add-profile')
  })
})

describe('adding the first profile URL', function() {
  beforeEach(function() {
    cy.get('#the-input').type('Daniel Metcalfe')
    cy.get('.add-profile').click()
  })

  it('clears the input when the next button is clicked', function() {
    cy.get('#the-input').should('have.value', '')
  })

  it('should have add and edit property buttons in the same order as they appear on the person', function() {
    cy.get('.next')
      .eq(0)
      .should('have.class', 'edit-name')
    cy.get('.next')
      .eq(1)
      .should('have.class', 'add-image')
    cy.get('.next')
      .eq(2)
      .should('have.class', 'edit-profiles')
    cy.get('.next')
      .eq(3)
      .should('have.class', 'add-profile')
  })

  it("prompts for the person's first profile URL", function() {
    cy.get('#the-input').should(
      'have.attr',
      'placeholder',
      "Copy-paste the person's profile URL"
    )
  })

  it('enables the save button once the first profile URL is added', function() {
    cy.get('.save').should('have.attr', 'disabled')
    cy.get('#the-input').type('https://twitter.com/mrdanmetcalfe')
    cy.get('.add-profile').click()
    cy.get('.save').should('not.have.attr', 'disabled')
  })
})

describe('adding more information', function() {
  beforeEach(function() {
    cy.get('#the-input').type('Daniel Metcalfe')
    cy.get('.add-profile').click()
    cy.get('#the-input').type('https://twitter.com/mrdanmetcalfe')
  })

  it('allows a second profile URL and image to be added', function() {
    cy.get('.add-profile').click()
    cy.get('#the-input').type('https://danielmetcalfe.rocks/')
    cy.get('.profile')
      .eq('1')
      .find('a')
      .should('have.attr', 'href', 'https://danielmetcalfe.rocks/')

    cy.get('.add-image').click()
    cy.get('#the-input').type(
      'https://www.gravatar.com/avatar/d35e305d07d4e8fe7bf844d17bec5e1e?s=1000'
    )
    cy.get('.image').should(
      'have.css',
      'background-image',
      'url("https://www.gravatar.com/avatar/d35e305d07d4e8fe7bf844d17bec5e1e?s=1000")'
    )
  })

  it('discards blank profiles or images currently being edited when the user decides to edit something else', function() {
    cy.get('.add-profile').click()
    // Leave input blank
    cy.get('.profile').should('have.length', 2)
    cy.get('.add-image').click()
    cy.get('.profile').should('have.length', 1)
    // Leave input blank
    cy.get('.image')
      .should('have.css', 'background-image')
      .and('match', /\/static\/media\/placeholderPersonImage..*.svg/)
  })
})

describe('editing properties that have already been created', function() {
  beforeEach(function() {
    cy.fixture('people/dan.json')
      .as('dan')
      .then(dan => {
        cy.get('#the-input').type(dan.name)
        cy.get('.add-profile').click()
        cy.get('#the-input').type(dan.profiles[0])
        cy.get('.add-profile').click()
        cy.get('#the-input').type(dan.profiles[1])
        cy.get('.add-profile').click()
        cy.get('#the-input').type(dan.profiles[2])
        cy.get('.add-image').click()
      })
  })

  describe('editing profiles that have already been created', function() {
    it('has an edit profiles button that prompts for the profile number to edit', function() {
      cy.get('.edit-profile-0').should('not.exist')
      cy.get('.edit-profile-1').should('not.exist')
      cy.get('.edit-profile-2').should('not.exist')

      cy.get('.edit-profiles').click()

      cy.get('.edit-profile-0')
      cy.get('.edit-profile-1')
      cy.get('.edit-profile-2')
    })
  })
})

describe('saving the person', function() {
  beforeEach(function() {
    cy.fixture('people/dan.json')
      .as('dan')
      .then(dan => {
        cy.get('#the-input').type(dan.name)
        cy.get('.add-profile').click()
        cy.get('#the-input').type(dan.profiles[0])
        cy.get('.add-image').click()
        cy.get('#the-input').type(dan.image)
        cy.get('.add-profile').click()
        cy.get('#the-input').type(dan.profiles[1])
      })
  })

  it('views the person after a successful save', function() {
    cy.get('.save').click()

    cy.url().should('match', pathRegexes.person)
    cy.get('.profile').should('have.length', 2)
    cy.get('.image').should(
      'have.css',
      'background-image',
      `url("${this.dan.image}")`
    )
  })

  describe('blank profile being edited', function() {
    it('discards the blank profile before saving', function() {
      cy.get('.add-profile').click()
      cy.get('.save').click()

      cy.url().should('match', pathRegexes.person)
      cy.get('.profile').should('have.length', 2)
      cy.get('.image').should(
        'have.css',
        'background-image',
        `url("${this.dan.image}")`
      )
    })
  })
})

describe('validating URLs', function() {
  it('gives the input the invalid style', function() {
    cy.get('#the-input')
      .type('Daniel Metcalfe')
      .should('not.have.class', 'invalid')
    cy.get('.add-profile').click()

    cy.get('#the-input')
      .should('not.have.class', 'invalid')
      .type('invalid URL')
      .should('have.class', 'invalid')

    cy.get('#the-input')
      .clear()
      .type('http://example.com')
      .should('not.have.class', 'invalid')
  })
})
