const BASE_URL = Cypress.config('baseUrl')

before(function() {
  cy.task('resetDatabase')
})

describe('landing on the home page.', function() {
  before(function() {
    cy.visit('/')
  })

  it('displays the slogan', function() {
    cy.get('.name').should('have.text', 'Follow people, not platforms')
  })

  it('displays the logo.', function() {
    cy.get('.image')
  })

  it('displays a search box.', function() {
    cy.get('.Search input')
  })

  it('focuses the search box.', function() {
    cy.get('.Search input').focused()
  })

  it.skip("displays a 'learn more' button in the content area", () => {})

  it('does not display a home icon button', function() {
    cy.get('#home').should('not.exist')
  })
})

describe('every page other than the home page', function() {
  before(function() {
    cy.visit('/person/create')
  })

  it('should display a home icon button', function() {
    cy.get('#home')
      .find('img')
      .should('have.attr', 'src')
      .and('contains', 'home')
  })
})

describe('searching for a publisher profile.', function() {
  beforeEach(function() {
    cy.task('createPerson').as('person')
    cy.visit('/')
  })

  it('displays search results when text is entered into the search input.', function() {
    cy.get('.Search input')
      .type('Si')
      .should('have.value', 'Si')
    cy.get('.SearchResult').should('not.have.length', 0)
  })

  it('displays no more than 5 results at a time.', function() {
    cy.task('createPerson').as('person')
    cy.task('createPerson').as('person')
    cy.task('createPerson').as('person')
    cy.task('createPerson').as('person')
    cy.task('createPerson').as('person')
    cy.task('createPerson').as('person')
    cy.get('.Search input')
      .type('Si')
      .should('have.value', 'Si')
    cy.get('.SearchResult').should('have.length', 5)
  })

  it('displays mini person images in the search results', function() {
    cy.get('#the-input').type('Si')
    cy.get('.SearchResult')
      .first()
      .find('img')
      .should('have.attr', 'src', this.person.image)
  })

  // TODO: Use PayPal dropdown component?
  it.skip('allows the user to select a search result with the keyboard.', function() {
    cy.get('.Search input')
      .type('Si')
      .type('{downarrow}')
    cy.focused().should('have.text', 'Siobhan Wilson')
    cy.get('.SearchResult')
      .first()
      .click() // TODO: Find out how to simulate user pressing {enter}
    cy.location('pathname').should('eq', '/person/1')
  })

  it('closes the search results when one is selected', function() {
    cy.get('.Search input').type('Si') // TODO: Use #the-input selector instead
    cy.get('.SearchResult')
      .first()
      .click()
    cy.get('.SearchResults').should('have.length', 0)
  })

  it('stops displaying search results when text is cleared from the search input.', function() {
    cy.get('.Search input')
      .type('Si')
      .should('have.value', 'Si')
    cy.get('.Search input')
      .clear()
      .should('have.value', '')
    cy.get('.SearchResult').should('have.length', 0)
  })

  it.skip('closes the search results when the search input loses focus', function() {})

  it("navigates to the person's profile when a search result is clicked", function() {
    cy.get('#the-input').type('Si')
    cy.get('.SearchResult')
      .first()
      .click()
    cy.url().should('match', /.+\/person\/\d+/)
  })
})

describe('creating a publisher profile.', function() {
  beforeEach(function() {
    cy.visit('/person/create')
  })

  describe('getting to the create person page', function() {
    beforeEach(function() {
      cy.visit('/')
    })

    it('Has options for creating a person in the bottom search result', function() {
      cy.get('#the-input').type('Siob')
      cy.get('li')
        .last()
        .should('have.id', 'create-person')
      cy.get('#create-person').should(
        'have.text',
        'Create Siob or someone else.'
      )
    })

    it('has a create person link based on the current search query', function() {
      cy.get('#the-input').type('Siob')
      cy.get('#create-suggested-person').click()
      cy.url().should('eq', `${BASE_URL}/person/create?name=Siob`)
    })

    it('has a create person link for a new person', function() {
      cy.get('#the-input').type('Siob')
      cy.get('#create-new-person').click()
      cy.url().should('eq', `${BASE_URL}/person/create`)
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

    it('should have add property buttons in the same order as they appear on the person', function() {
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

  describe('validating URLs', function() {
    it('gives the input the invalid style', function() {
      cy.get('#the-input')
        .type('Siobhan Wilson')
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

  describe('adding the first profile URL', function() {
    beforeEach(function() {
      cy.get('#the-input').type('Siobhan Wilson')
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
      cy.get('#the-input').type('https://twitter.com/siobhanisback')
      cy.get('.add-profile').click()
      cy.get('.save').should('not.have.attr', 'disabled')
    })
  })

  describe('adding more information', function() {
    beforeEach(function() {
      cy.get('#the-input').type('Siobhan Wilson')
      cy.get('.add-profile').click()
      cy.get('#the-input').type('https://twitter.com/siobhanisback')
    })

    it('allows a second profile URL and image to be added', function() {
      cy.get('.add-profile').click()
      cy.get('#the-input').type(
        'https://www.youtube.com/user/siobhanwilsonmusic'
      )
      cy.get('.profile')
        .eq('1')
        .find('a')
        .should(
          'have.attr',
          'href',
          'https://www.youtube.com/user/siobhanwilsonmusic'
        )

      cy.get('.add-image').click()
      cy.get('#the-input').type(
        'https://pbs.twimg.com/profile_images/1102783358973677569/qEt61Ej8_400x400.jpg'
      )
      cy.get('.person img').should(
        'have.attr',
        'src',
        'https://pbs.twimg.com/profile_images/1102783358973677569/qEt61Ej8_400x400.jpg'
      )
    })

    it('discards blank profiles or images currently being edited when the user decides to edit something else', function() {
      cy.get('.add-profile').click()
      // Leave input blank
      cy.get('.profile').should('have.length', 2)
      cy.get('.add-image').click()
      cy.get('.profile').should('have.length', 1)
      // Leave input blank
      cy.get('.person img')
        .should('have.attr', 'src')
        .and('match', /\/static\/media\/placeholderPersonImage..*.svg/)
    })
  })

  describe('editing properties that have already been created', function() {
    beforeEach(function() {
      cy.fixture('siobhan.json')
        .as('siobhan')
        .then(siobhan => {
          cy.get('#the-input').type(siobhan.name)
          cy.get('.add-profile').click()
          cy.get('#the-input').type(siobhan.profiles[0])
          cy.get('.add-profile').click()
          cy.get('#the-input').type(siobhan.profiles[1])
          cy.get('.add-profile').click()
          cy.get('#the-input').type(siobhan.profiles[2])
          cy.get('.add-image').click()
        })
    })

    describe('editing profiles that have already been created', function() {
      it.only('should have an edit profile button that prompts for the profile number to edit', function() {
        cy.get('.edit-profile-1').should('not.exist')
        cy.get('.edit-profile-2').should('not.exist')
        cy.get('.edit-profile-3').should('not.exist')

        cy.get('.edit-profiles').click()

        cy.get('.edit-profile-1')
        cy.get('.edit-profile-2')
        cy.get('.edit-profile-3')
      })
    })
  })

  describe('saving the person', function() {
    beforeEach(function() {
      cy.fixture('siobhan.json')
        .as('siobhan')
        .then(siobhan => {
          cy.get('#the-input').type(siobhan.name)
          cy.get('.add-profile').click()
          cy.get('#the-input').type(siobhan.profiles[0])
          cy.get('.add-image').click()
          cy.get('#the-input').type(siobhan.image)
          cy.get('.add-profile').click()
          cy.get('#the-input').type(siobhan.profiles[1])
        })
    })

    it('save successfully and view the person', function() {
      cy.get('.save').click()

      cy.url().should('match', /\/person\/\w+/)
      cy.get('.profile').should('have.length', 2)
      cy.get('.person img')
        .should('have.attr', 'src')
        .and('eq', this.siobhan.image)
    })

    describe('and there is a blank profile being edited', function() {
      it('save successfully and view the person', function() {
        cy.get('.add-profile').click()
        cy.get('.save').click()

        cy.url().should('match', /\/person\/\w+/)
        cy.get('.profile').should('have.length', 2)
        cy.get('.person img')
          .should('have.attr', 'src')
          .and('eq', this.siobhan.image)
      })
    })
  })
})

describe('viewing a publisher profile.', function() {
  it('has an edit button below the input', function() {
    cy.task('createPerson')
      .as('person')
      .then(person => {
        cy.visit(`/person/${person._id}`)
      })

    cy.get('#edit-person')
      .should('have.attr', 'value', 'Edit Siobhan Wilson')
      .click()
    cy.url().should('match', /\/person\/\w+\/edit/)
  })

  describe('that has all optional fields', function() {
    beforeEach(function() {
      cy.task('createPerson')
        .as('person')
        .then(person => {
          cy.visit(`/person/${person._id}`)
        })
    })

    it("shows the person's profile image.", function() {
      cy.get('.image img')
        .should('have.attr', 'src')
        .and('eq', this.person.image)
    })

    it("shows links to the publisher's profiles", function() {
      cy.get('.profile').should('have.length', 3)
      cy.get('.profile a')
        .first()
        .should('have.attr', 'href')
        .and('eq', 'https://twitter.com/siobhanisback')
      cy.get('.profile a')
        .eq(1)
        .should('have.attr', 'href')
        .and('eq', 'https://www.youtube.com/user/siobhanwilsonmusic')
      cy.get('.profile a')
        .eq(2)
        .should('have.attr', 'href')
        .and('eq', 'https://www.facebook.com/siobhanwilsonmusic')
    })

    it("masks the publisher's image to create a circular frame", function() {
      cy.get('.image img')
        .should('have.css', 'border-radius')
        .should('equal', '50%')
    })

    it("displays a 'return home' button at the bottom of the page", function() {
      cy.get('.HomeLink')
        .should('have.length', 1)
        .click()
      cy.location('pathname').should('eq', '/')
    })
  })

  describe('that has no profile image', function() {
    beforeEach(function() {
      cy.fixture('siobhan.json')
        .then(siobhan => {
          delete siobhan.image
          return cy.task('createPerson', siobhan)
        })
        .then(person => {
          cy.visit(`/person/${person._id}`)
        })
    })

    it('fallsback to the placeholder profile image', function() {
      cy.get('.image img')
        .should('have.attr', 'src')
        .and('contains', 'placeholderPersonImage')
    })
  })
})

describe('editing a publisher profile', function() {
  beforeEach(function() {
    cy.task('createPerson')
      .as('person')
      .then(person => {
        cy.visit(`/person/${person._id}/edit`)
      })
  })

  it('should display the publisher profile in its current state', function() {
    cy.get('.name').should('have.text', this.person.name)
    cy.get('.image img').should('have.attr', 'src', this.person.image)
    cy.get('#profile-0 a').should('have.attr', 'href', this.person.profiles[0])
    cy.get('#profile-1 a').should('have.attr', 'href', this.person.profiles[1])
    cy.get('#profile-2 a').should('have.attr', 'href', this.person.profiles[2])
  })

  it('should have edit buttons for existing fields', function() {
    cy.get('.edit-name')
    cy.get('.edit-image')
    cy.get('.edit-profile-0')
    cy.get('.edit-profile-1')
    cy.get('.edit-profile-2')
    cy.get('.next').should('have.length', 6) // Including add profile button.
  })

  it('should disable the edit button for the field currently being edited', function() {
    cy.get('.edit-image').should('have.attr', 'disabled')
  })

  it('should have an add profile button', function() {
    cy.get('.add-profile')
  })

  it('should have a save button', function() {
    cy.get('.save')
  })

  it('should initally be editing the profile image because this would be common', function() {
    cy.get('#the-input').should('have.attr', 'value', this.person.image)
  })

  describe('editing a profile and saving the changes', function() {
    it('should view person with their profile changed', function() {
      cy.get('.edit-profile-0').click()
      cy.get('#the-input')
        .clear()
        .type('https://twitter.com/siobhansnewprofile')
      cy.get('.save').click()

      cy.url().should('match', /.+\/person\/\d+/)
      cy.get('.name').should('have.text', this.person.name)
      cy.get('.image img').should('have.attr', 'src', this.person.image)
      cy.get('.profile-0 a').should(
        'have.attr',
        'href',
        'https://twitter.com/siobhansnewprofile'
      )
      cy.get('.profile-1 a').should(
        'have.attr',
        'href',
        this.person.profiles[1]
      )
      cy.get('.profile-2 a').should(
        'have.attr',
        'href',
        this.person.profiles[2]
      )
      cy.get('.profile-3 a').should('not.exist')
    })
  })
})
