// Single seam for full-page navigations, so tests can spy on the target URL
export const navigateTo = (url: string): void => {
  window.location.href = url
}
