import PropTypes from 'prop-types'
import React from 'react'
import analytics from '../analytics'
import MailIcon from '../common/MailIcon'
import PlatformIcon from './PlatformIcon'
import usePlatformName from './usePlatformName'

ValidProfile.propTypes = {
  className: PropTypes.string,
  renderLinks: PropTypes.bool,
  url: PropTypes.object.isRequired
}

ValidProfile.defaultProps = {
  renderLinks: true
}

function ValidProfile(props) {
  const platformName = usePlatformName(props.url)
  const email = props.url.protocol === 'mailto:'

  const profileIcon = email ? <MailIcon /> : <PlatformIcon url={props.url} />

  return props.renderLinks ? (
    <>
      <a
        href={props.url.href}
        onClick={trackAction(props.url.href, platformName)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {profileIcon}
      </a>
    </>
  ) : (
    profileIcon
  )
}

function trackAction(url, platformName) {
  return () => {
    analytics.track('Clicked profile', {
      url,
      platformName
    })
  }
}

export default ValidProfile
