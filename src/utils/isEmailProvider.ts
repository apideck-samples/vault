export const isEmailProvider = (domain: string) => {
  if (/@gmail.com\s*$/.test(domain)) return true
  if (/@outlook.com\s*$/.test(domain)) return true
  if (/@aol.com\s*$/.test(domain)) return true
  if (/@hotmail.com\s*$/.test(domain)) return true
  if (/@icloud.com\s*$/.test(domain)) return true
  if (/@yahoo.com\s*$/.test(domain)) return true
  if (/@inbox.com\s*$/.test(domain)) return true
  if (/@hey.com\s*$/.test(domain)) return true
  if (/@msn.com\s*$/.test(domain)) return true
  if (/@live.com\s*$/.test(domain)) return true
  if (/@test.com\s*$/.test(domain)) return true

  return false
}
