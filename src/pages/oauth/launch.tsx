import { useEffect, useState } from 'react'

import { Button } from '@apideck/components'
import { LaunchStartMessage } from 'types/OAuthGrantHandoff'
import {
  OAUTH_LAUNCH_READY,
  OAUTH_LAUNCH_START,
  READY_REPEAT_INTERVAL_MS,
  probeSessionStorage,
  storeGrant
} from 'utils/oauthGrantHandoff'

/**
 * COOP-free popup landing page for the forward OAuth grant handoff (vault leg).
 *
 * The widget opens this page in the popup while the `window.opener` link is still
 * alive, hands over a single-use grant + the authorize URL via `postMessage`, and
 * this page stashes the grant in tab `sessionStorage` before navigating to the
 * provider. After the provider round-trip, `oauth/callback` self-confirms in-tab
 * with `{ confirm_token, grant }` — no backwards `postMessage` needed.
 *
 * Anti-phishing: if there is no opener or `sessionStorage` is unavailable, the page
 * renders a loud error BEFORE posting ready or navigating (pre-consent).
 *
 * The grant never appears in any URL — it travels only over the live opener
 * handshake and then only through `sessionStorage`. Source identity is checked
 * (`event.source === window.opener`); there is no `event.origin` allowlist.
 */
const LaunchPage = () => {
  const [launchError, setLaunchError] = useState(false)

  useEffect(() => {
    // Anti-phishing gate (pre-consent): refuse loudly without an opener or storage.
    if (!window.opener) {
      setLaunchError(true)
      return
    }
    if (!probeSessionStorage()) {
      setLaunchError(true)
      return
    }

    const serviceId = new URLSearchParams(window.location.search).get('service_id')

    const postReady = () => window.opener.postMessage({ type: OAUTH_LAUNCH_READY }, '*')
    postReady()
    const readyTimer = setInterval(postReady, READY_REPEAT_INTERVAL_MS)

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window.opener) return
      if (event.data?.type !== OAUTH_LAUNCH_START) return

      const { grant, authorizeUrl } = event.data as LaunchStartMessage
      if (serviceId) {
        storeGrant(serviceId, grant)
      }
      clearInterval(readyTimer)
      window.removeEventListener('message', handleMessage)
      window.location.assign(authorizeUrl)
    }

    window.addEventListener('message', handleMessage)

    return () => {
      clearInterval(readyTimer)
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  if (launchError) {
    return (
      <div className="flex flex-col justify-between">
        <p className="mb-4">
          This window can&apos;t complete the connection. Please close it and try again.
        </p>
        <Button
          text="Close window"
          size="larger"
          className="w-full"
          onClick={() => window.close()}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-between">
      <p>Connecting…</p>
    </div>
  )
}

export default LaunchPage
