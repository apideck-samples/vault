import { IConfirmResponse } from 'types/OAuthCsrf'

/**
 * Wire contract for the OAuth grant-handoff flow (vault leg).
 *
 * This file mirrors the vault-core wire contract, which is the source of truth
 * for the message shapes (vault-core `src/types/OAuthGrantHandoff.ts`). Keep the
 * `oauth_launch_ready` / `oauth_launch_start` shapes in sync with that file.
 *
 * Invariants:
 * - The grant is single-use, session-bound, and NEVER carried in any URL.
 * - The grant travels only over the live opener `postMessage` handshake into the
 *   launch page and then only through tab `sessionStorage`.
 * - The grant confirm is unauthenticated (the grant is the auth).
 */

// Launch page → widget: the launch page has loaded and is ready to receive the grant.
export interface LaunchReadyMessage {
  type: 'oauth_launch_ready'
}

// Widget → launch page: hand over the grant and the authorize URL to continue with.
export interface LaunchStartMessage {
  type: 'oauth_launch_start'
  grant: string
  authorizeUrl: string
}

// Response shape of the unauthenticated grant confirm. Reuses the legacy confirm
// response shape (`types/OAuthCsrf.ts`) to avoid drift.
export type IGrantConfirmResponse = IConfirmResponse
