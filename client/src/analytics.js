import Plausible from 'plausible-tracker'

const plausible = Plausible({
  domain: 'peoplenotplatforms.com'
})

plausible.enableAutoPageviews()
plausible.enableAutoOutboundTracking()

function track(eventName, eventOptions, ...args) {
  plausible.trackEvent(
    eventName,
    {
      props: eventOptions
    },
    ...args
  )
}

export default {
  track
}
