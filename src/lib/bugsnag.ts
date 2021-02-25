import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'

if (process.env.NEXT_PUBLIC_BUGSNAG_API_KEY) {
  Bugsnag.start({
    apiKey: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY,
    plugins: [new BugsnagPluginReact()],
    enabledReleaseStages: ['production'],
    logger: null
  })
}

export default Bugsnag
