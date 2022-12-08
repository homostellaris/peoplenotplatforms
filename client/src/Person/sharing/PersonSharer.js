import Emoji from 'a11y-react-emoji'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import analytics from '../../analytics'
import copyIcon from '../../common/icons/copy.svg'
import './sharing.css'

// TODO: Remove duplication between here and PersonBrowser.
PersonSharer.propTypes = {
  id: PropTypes.string.isRequired
}

function PersonSharer(props) {
  const { id } = props
  const sharingLink = `${document.location.origin}/person/${id}/view`
  const [linkCopied, setLinkCopied] = useState()
  const sharingLinkRef = useRef()

  function copySharingLink(event) {
    sharingLinkRef.current.select()
    document.execCommand('copy')
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <React.Fragment>
      <div className="copy-widget">
        <span className={`copy-widget-text${linkCopied ? ' copied' : ''}`}>
          <input
            readOnly
            ref={sharingLinkRef}
            type="text"
            value={sharingLink}
          />
          <input
            className="copied-message"
            readOnly
            type="text"
            value="Copied!"
          />
        </span>
        <button
          className="copy-button"
          onClick={() => {
            copySharingLink()
            analytics.track('Copied sharing link', { id })
          }}
        >
          <img alt="copy icon" src={copyIcon} />
        </button>
      </div>
      <p>
        <Emoji symbol="☝️" />
        Copy this link and share it with whomever you like.
      </p>
      <p>
        They&apos;ll see a stripped down version of the profile that looks like
        this <Emoji symbol="👇" />
      </p>
      <iframe
        src={sharingLink}
        height="100%"
        width="100%"
        max-width="900px"
        title="People Not Platforms embed"
      ></iframe>
    </React.Fragment>
  )
}

export default PersonSharer
