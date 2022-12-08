import Emoji from 'a11y-react-emoji'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import analytics from '../../analytics'
import copyIcon from '../../common/icons/copy.svg'
import './sharing.css'

// TODO: Remove duplication between here and PersonBrowser.
PersonEmbedder.propTypes = {
  id: PropTypes.string.isRequired
}

function PersonEmbedder(props) {
  const { id } = props
  const sharingLink = `${document.location.origin}/person/${id}/view`
  const [linkCopied, setLinkCopied] = useState()
  const sharingLinkRef = useRef()

  function copySharingLink(event) {
    const embedMarkup = sharingLinkRef.current.textContent
    const textArea = document.createElement('textarea')
    textArea.textContent = embedMarkup
    document.body.append(textArea)
    textArea.select()
    document.execCommand('copy')
    textArea.remove()
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <>
      <div className="copy-widget">
        <span className={`copy-widget-text${linkCopied ? ' copied' : ''}`}>
          <input readOnly type="text" value="Copy embed markup" />
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
      <pre>
        <code ref={sharingLinkRef}>{`<iframe
  src="${sharingLink}"
  height="231px"
  width="600px"
  title="People Not Platforms embed"
></iframe>`}</code>
      </pre>
      <p>
        <Emoji symbol="☝️" />
        Copy this HTML markup and embed it wherever you like.
      </p>
      <p>
        It will display a stripped down version of the profile that looks like
        this <Emoji symbol="👇" />
      </p>
      <iframe
        src={sharingLink}
        height="231px"
        width="600px"
        title="People Not Platforms embed"
      ></iframe>
    </>
  )
}

export default PersonEmbedder
