---
github_issue_url: https://github.com/apideck-io/unify/issues/9546
status: draft
related_research: thoughts/shared/research/GH-9546.md
---

# OAuth CSRF Fix — Two-Phase Confirmation Flow

**Related Issue**: [GH-9546](https://github.com/apideck-io/unify/issues/9546)

---

## Pattern Decisions

- **Query param parsing**: Follow existing `createOAuthErrorFromQuery` pattern in `src/utils/oauthError.tsx` — distinguish `confirm_token` from error params via `error_type` check
- **API calls**: Axios client from `src/lib/axios.ts` with session auth headers (same pattern as `ConnectionForm.tsx:229-233`)
- **Error toasts**: `useToast` from `@apideck/components` (same pattern as `ConnectionForm.tsx:339-350`)
- **URL cleanup**: `router.replace` with shallow routing (same pattern as redirect handling in `[provider].tsx:70-82`)
- **Utilities identified**: `useSession` (`src/utils/useSession.tsx`), `client` (`src/lib/axios.ts`), `mutate` from SWR

---

## Overview

Implement a two-phase OAuth confirmation flow to fix a CSRF vulnerability. After OAuth completes, Unify now appends a `confirm_token` to the callback redirect URL. The vault must:
1. **Popup flow (callback page)**: Extract `confirm_token` and relay it to the popup opener via `postMessage`
2. **Redirect flow (connection page)**: Extract `confirm_token` and call `POST /vault/oauth/confirm` to confirm the authorization

Both flows must remain backward-compatible when `confirm_token` is absent.

## Current State Analysis

- **Callback page** (`src/pages/oauth/callback.tsx`): `getServerSideProps` treats ANY query params as an error (line 34: `hasError: query && Object.keys(query).length > 0`). The `useEffect` at line 10-16 either sets the error or calls `window.close()`. No postMessage logic exists.
- **Connection page** (`src/pages/integrations/[unified-api]/[provider].tsx`): After OAuth redirect, the page simply re-renders and SWR re-fetches the connection. No confirm flow exists.
- **ConnectionForm** (`src/components/Connection/ConnectionForm.tsx`): Manages OAuth error display (line 179-181 via `createOAuthErrorFromQuery`), auth headers (line 229-233), and SWR mutation (line 264-265). No confirm flow exists.
- **OAuth error util** (`src/utils/oauthError.tsx`): `createOAuthErrorFromQuery` checks for `error_type` specifically (line 19), so `confirm_token` alone won't trigger an error — but `getServerSideProps` in the callback page uses a broader check.

### Key Discoveries:

- `callback.tsx:34` — `hasError` is `true` when ANY query params exist, so `confirm_token` alone incorrectly triggers the error path. Must change to check for actual error params.
- `oauthError.tsx:19` — `createOAuthErrorFromQuery` already returns `null` when no `error_type` present, so ConnectionForm won't incorrectly show errors when only `confirm_token` is in the URL.
- `ConnectionForm.tsx:229-233` — Auth headers pattern to reuse for the confirm API call.
- `ConnectionForm.tsx:264-265` — SWR `mutate` pattern for revalidation after confirm.
- `[provider].tsx:100` — ConnectionForm is passed `connection`, `token`, and `jwt` props. We need to also forward `confirmToken`.

## Desired End State

After implementation:
1. When `confirm_token` is in the callback page URL: postMessage `{ type: 'oauth-confirm', confirmToken }` to `window.opener`, then close
2. When `confirm_token` is in the connection page URL: call `POST /vault/oauth/confirm`, revalidate SWR, clear the param from URL
3. When `confirm_token` is absent: both pages behave exactly as before (backward compatible)
4. Error cases show appropriate toast messages

### Verification:
- **Automated**: All existing tests pass, new tests pass, typecheck passes, lint passes
- **Manual**: Test popup flow (confirm_token in callback → postMessage sent → window closes), test redirect flow (confirm_token in connection page → confirm API called → connection refreshed → URL cleaned), test backward compat (no confirm_token → same behavior as before)

## What We're NOT Doing

- Changing the OAuth initiation flow (redirect_uri construction stays the same)
- Origin validation on postMessage (pre-existing issue, separate concern)
- Popup-based flow in vault itself (vault uses redirect-based only; popup flow is vault-core's responsibility — vault just relays the token)
- Modifying the Unify confirm endpoint (that's the unify repo's concern)

## Implementation Approach

Three-phase approach following TDD: first update the callback page (smallest, most self-contained change), then update the connection page (redirect flow), then write tests for both. The callback page change is purely client-side (postMessage + close). The connection page change involves an API call and SWR revalidation.

---

## Phase 1: Update Callback Page — postMessage confirm_token (TDD - RED then GREEN)

### Overview

Update `/oauth/callback` to distinguish `confirm_token` from error params and relay the token to the popup opener via postMessage.

### Session Startup Protocol
1. Verify working directory: `pwd`
2. Check previous phase committed (if not Phase 1): `git log -1 --oneline`
3. Read progress JSON: `thoughts/shared/progress/2026-03-02-GH-9546-oauth-csrf-fix-status.json`
4. Confirm current phase matches JSON `current_phase`

### Changes Required:

#### 1. Write callback page test (TDD - RED)

**File**: `__tests__/unit/pages/oauth/callback.test.tsx` (NEW)
**Change**: Create test file for callback page behavior

**Key Implementation Notes**:
- Mock `window.opener` and `window.close` and `window.opener.postMessage`
- Test cases:
  1. When `confirm_token` present and `window.opener` exists → calls `postMessage` with `{ type: 'oauth-confirm', confirmToken: '<value>' }` then `window.close()`
  2. When `confirm_token` present but no `window.opener` → just calls `window.close()`
  3. When no `confirm_token` and no error params → calls `window.close()` (backward compat)
  4. When error params present (with or without `confirm_token`) → shows error alert, does NOT postMessage
- Follow existing test patterns: use `render` from `__tests__/testUtils/testing-utils`, mock `next/router`
- Expected: all tests FAIL initially (implementation not done yet)

#### 2. Update `getServerSideProps` error detection

**File**: `src/pages/oauth/callback.tsx` (line 33-35)
**Change**: Change `hasError` logic to check for actual error params instead of "any query params exist"

**Key Implementation Notes**:
- Extract `confirm_token` from query separately
- `hasError` should check for `error_type` or `error` or `error_description` in query — not just "has keys"
- Pass both `hasError` and `confirmToken` as props to the component
- Backward compat: if no `confirm_token` and no error params → `hasError: false, confirmToken: null`

**Code Sketch**:
```typescript
export const getServerSideProps = async ({ query }: any): Promise<any> => {
  const { confirm_token: confirmToken, ...rest } = query
  const hasError = Boolean(rest.error_type || rest.error || rest.error_description)
  return { props: { hasError, confirmToken: confirmToken || null, query } }
}
```

#### 3. Update CallbackPage component for postMessage

**File**: `src/pages/oauth/callback.tsx` (lines 7-16)
**Change**: Add `confirmToken` prop, postMessage to opener before closing

**Key Implementation Notes**:
- Accept `confirmToken` as a prop (string | null)
- In the `useEffect`: if `confirmToken` exists AND no error → postMessage to opener (if it exists), then close
- If no `confirmToken` and no error → just close (existing behavior)
- Error path unchanged: show `OAuthErrorAlert`
- postMessage format: `{ type: 'oauth-confirm', confirmToken }`
- Target origin: `'*'` (origin validation is out of scope, same as research notes)

**Code Sketch**:
```typescript
const CallbackPage = ({ hasError, confirmToken, query }: { hasError: boolean; confirmToken: string | null; query: any }) => {
  // ... existing state ...
  useEffect(() => {
    if (hasError) {
      setOAuthError(createOAuthErrorFromQuery(query))
    } else {
      if (confirmToken && window.opener) {
        window.opener.postMessage({ type: 'oauth-confirm', confirmToken }, '*')
      }
      window.close()
    }
  }, [hasError, confirmToken, query])
  // ... existing JSX ...
}
```

### Success Criteria:

#### Automated Verification:
- Tests pass: `yarn test __tests__/unit/pages/oauth/callback.test.tsx`
- Type checking passes: `yarn typecheck`
- Linting passes: `yarn lint`
- All existing tests still pass: `yarn test`

#### Manual Verification:
- Navigate to `/oauth/callback?confirm_token=test-uuid` → window attempts to close (no error shown)
- Navigate to `/oauth/callback?error_type=SomeError&error_message=msg` → error alert displayed
- Navigate to `/oauth/callback` (no params) → window attempts to close

### Session Completion
1. All changes committed: `git add <files> && git commit -m "Phase 1: Update callback page to relay confirm_token via postMessage"`
2. Update progress JSON: set phase 1 to "complete", increment current_phase
3. Verify clean state: `git status` shows clean working tree

---

## Phase 2: Update Connection Page — Redirect Flow Confirm (TDD - RED then GREEN)

### Overview

Update the connection detail page to extract `confirm_token` from URL params after OAuth redirect, call the confirm endpoint, revalidate the connection, and clean up the URL.

### Session Startup Protocol
1. Verify working directory: `pwd`
2. Check previous phase committed: `git log -1 --oneline`
3. Read progress JSON: `thoughts/shared/progress/2026-03-02-GH-9546-oauth-csrf-fix-status.json`
4. Confirm current phase matches JSON `current_phase`

### Changes Required:

#### 1. Write ConnectionForm confirm test (TDD - RED)

**File**: `__tests__/unit/components/Connection/ConnectionForm.test.tsx` (MODIFY)
**Change**: Add new test describe block for OAuth confirm flow

**Key Implementation Notes**:
- Add a new `describe('OAuth Confirm Flow', ...)` block
- Override the router mock to include `confirm_token` in query
- Mock `client.post` for the confirm endpoint
- Test cases:
  1. When `confirmToken` prop present → calls `POST /vault/oauth/confirm` with correct headers and body
  2. When confirm succeeds → SWR revalidation triggered, `confirm_token` removed from URL
  3. When confirm fails with 403 → shows "could not be confirmed" error toast
  4. When confirm fails with 404 → shows "expired" error toast
  5. When no `confirmToken` → no confirm call made (backward compat)
- Expected: new tests FAIL initially

#### 2. Pass `confirmToken` from provider page to ConnectionForm

**File**: `src/pages/integrations/[unified-api]/[provider].tsx` (line 100)
**Change**: Extract `confirm_token` from `query` and pass as prop to ConnectionForm

**Key Implementation Notes**:
- Read `confirm_token` from `router.query` (already destructured as `query` at line 32)
- Pass `confirmToken={query.confirm_token as string | undefined}` to `<ConnectionForm>`
- No changes to `getServerSideProps` needed — `confirm_token` comes through as a regular query param

**Code Sketch**:
```tsx
<ConnectionForm
  connection={connection}
  token={session || token}
  jwt={session?.jwt || jwt}
  confirmToken={query.confirm_token as string | undefined}
/>
```

#### 3. Update ConnectionForm to accept and handle `confirmToken`

**File**: `src/components/Connection/ConnectionForm.tsx`
**Change**: Add `confirmToken` to IProps, add useEffect to call confirm endpoint

**Key Implementation Notes**:
- Add `confirmToken?: string` to `IProps` interface (line 37-41)
- Add a new `useEffect` that runs when `confirmToken` is truthy:
  1. Call `POST /vault/oauth/confirm` using the existing `client` and `headers` (line 229-233)
  2. Body: `{ confirm_token: confirmToken }`
  3. On success: call `mutate(\`/vault/connections/${unifiedApi}/${serviceId}\`)` and `mutate('/vault/connections')` to revalidate
  4. On success: clean URL with `router.replace(\`/integrations/${unifiedApi}/${serviceId}\`, undefined, { shallow: true })` to remove `confirm_token` from URL
  5. On error 401: `setSessionExpired(true)` (existing pattern)
  6. On error 403 (consumer mismatch): `addToast` — "OAuth authorization could not be confirmed. Please try again."
  7. On error 404 (expired/not found): `addToast` — "OAuth confirmation expired. Please authorize again."
  8. On other errors: `addToast` with generic message
- Place the `useEffect` after the existing `useEffect` for `oauthError` (after line 181)
- Dependencies: `[confirmToken]` — only run once when present
- **Note**: The existing `headers` object (line 229-233) is sufficient for the confirm call. Do NOT add `X-APIDECK-AUTH-TYPE: JWT` per-request — it's already set as a default on the Axios client instance (`lib/axios.ts:6`)

**Code Sketch**:
```typescript
useEffect(() => {
  if (!confirmToken) return

  const confirmOAuth = async () => {
    try {
      await client.post('/vault/oauth/confirm', { confirm_token: confirmToken }, { headers })
      mutate(`/vault/connections/${unifiedApi}/${serviceId}`)
      mutate('/vault/connections')
      router.replace(`/integrations/${unifiedApi}/${serviceId}`, undefined, { shallow: true })
    } catch (error) {
      if (error?.response?.status === 401) {
        setSessionExpired(true)
      } else if (error?.response?.status === 403) {
        addToast({
          title: 'OAuth authorization could not be confirmed',
          description: 'Please try again.',
          type: 'error',
          autoClose: true
        })
      } else if (error?.response?.status === 404) {
        addToast({
          title: 'OAuth confirmation expired',
          description: 'Please authorize again.',
          type: 'error',
          autoClose: true
        })
      } else {
        addToast({
          title: 'OAuth confirmation failed',
          description: 'Could not confirm authorization. Please try again.',
          type: 'error',
          autoClose: true
        })
      }
    }
  }

  confirmOAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [confirmToken])
```

### Success Criteria:

#### Automated Verification:
- New tests pass: `yarn test __tests__/unit/components/Connection/ConnectionForm.test.tsx`
- Type checking passes: `yarn typecheck`
- Linting passes: `yarn lint`
- All tests pass: `yarn test`

#### Manual Verification:
- Navigate to `/integrations/crm/salesforce?confirm_token=test-uuid` → confirm API called, URL cleaned to `/integrations/crm/salesforce`
- Navigate to `/integrations/crm/salesforce` (no confirm_token) → page works as before, no confirm call
- Simulate confirm failure → error toast appears

### Session Completion
1. All changes committed: `git add <files> && git commit -m "Phase 2: Add OAuth confirm flow to connection page redirect flow"`
2. Update progress JSON: set phase 2 to "complete", increment current_phase
3. Verify clean state: `git status` shows clean working tree

---

## Phase 3: Verify and Refactor (TDD - REFACTOR)

### Overview

Run full test suite, verify all flows work together, and clean up any code quality issues.

### Session Startup Protocol
1. Verify working directory: `pwd`
2. Check previous phase committed: `git log -1 --oneline`
3. Read progress JSON: `thoughts/shared/progress/2026-03-02-GH-9546-oauth-csrf-fix-status.json`
4. Confirm current phase matches JSON `current_phase`

### Changes Required:

#### 1. Full test suite verification

- Run `yarn test` — all tests must pass
- Run `yarn typecheck` — no type errors
- Run `yarn lint` — no lint errors (fix any with `yarn lint:fix`)

#### 2. Code review and refactor

- **`getServerSideProps` redirect collision** (`[provider].tsx:137-158`): When `redirectToAppUrl`, `jwt`, and `token.applicationId` are ALL present alongside `confirm_token`, the server-side 301 redirect fires before the client sees `confirm_token`. This is acceptable — in the detect-and-remediate model, tokens are already stored at callback time, and the pending record expires via TTL. No code change needed, but verify this interaction is benign.
- Verify `confirm_token` param handling doesn't interfere with other query param usage (e.g., `redirectAfterAuthUrl`, `error_type`)
- Ensure no duplicate SWR mutations
- Check that the confirm `useEffect` doesn't run on re-renders unnecessarily
- Verify error handling is consistent with existing patterns (401 → session expired, 403/404 → specific toasts, other → generic toast)

#### 3. Edge case verification

- Confirm the callback page handles the case where `confirm_token` AND error params are both present (error should take priority)
- Confirm the connection page handles the case where `confirm_token` is present but session/jwt is missing (should not crash)

### Success Criteria:

#### Automated Verification:
- `yarn test` — all tests pass
- `yarn typecheck` — clean
- `yarn lint` — clean

#### Manual Verification:
- Full popup flow: callback page with `confirm_token` → postMessage sent → window closes
- Full redirect flow: connection page with `confirm_token` → confirm API called → connection refreshed → URL cleaned
- Backward compat: both pages work without `confirm_token`
- Error scenarios: expired token (404), consumer mismatch (403), network error

### Session Completion
1. All changes committed: `git add <files> && git commit -m "Phase 3: Verify and refactor OAuth CSRF fix"`
2. Update progress JSON: set phase 3 to "complete", mark plan as complete
3. Verify clean state: `git status` shows clean working tree

---

## Testing Strategy

**IMPORTANT: Follow Test-Driven Development (TDD) for all code**

### TDD Approach:

1. **Phase 1**: Write callback page tests (RED) → implement callback changes (GREEN) — in same phase since the component is small
2. **Phase 2**: Write ConnectionForm confirm tests (RED) → implement confirm flow (GREEN) — in same phase
3. **Phase 3**: Run full suite, refactor if needed (REFACTOR)

### Unit Tests:

- **Callback page** (`__tests__/unit/pages/oauth/callback.test.tsx`):
  - postMessage sent when `confirm_token` and `window.opener` exist
  - window.close called after postMessage
  - window.close called without postMessage when no opener
  - Error alert shown for error params (not for `confirm_token` alone)
  - Backward compat: no confirm_token → just closes

- **ConnectionForm** (`__tests__/unit/components/Connection/ConnectionForm.test.tsx`):
  - Confirm API called with correct headers/body when `confirmToken` prop present
  - SWR revalidation after successful confirm
  - URL cleaned after successful confirm
  - 403 error → "could not be confirmed" toast
  - 404 error → "expired" toast
  - No confirm call when `confirmToken` is absent

### Manual Testing Steps:

1. Open vault with a connection that uses OAuth authorization_code flow
2. Initiate OAuth → verify redirect flow works with `confirm_token` in URL
3. Verify the confirm API is called (check Network tab)
4. Verify `confirm_token` is removed from URL after confirm
5. Test with expired/invalid `confirm_token` → verify error toast
6. Test without `confirm_token` → verify backward compatibility

## Performance Considerations

- The confirm API call is a single POST, no performance impact
- The `useEffect` for confirm runs only once on mount when `confirmToken` is present
- No additional re-renders or SWR polling introduced

## References

- Related research: `thoughts/shared/research/GH-9546.md`
- Callback page: `src/pages/oauth/callback.tsx`
- Connection page: `src/pages/integrations/[unified-api]/[provider].tsx`
- ConnectionForm: `src/components/Connection/ConnectionForm.tsx`
- OAuth error util: `src/utils/oauthError.tsx`
- Auth headers pattern: `src/components/Connection/ConnectionForm.tsx:229-233`
- SWR mutation pattern: `src/components/Connection/ConnectionForm.tsx:264-265`
- Axios client: `src/lib/axios.ts`
