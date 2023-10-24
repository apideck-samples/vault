export const extractLastAttribute = (path: string, isCustomField = false) => {
  if (isCustomField) {
    const splitByEqual = path
      ?.split('===')[0]
      ?.split('@[')[1]
      ?.replace("'", '')
      ?.replace("'", '')
      ?.replace(']', '')
    const fieldId = path?.split('===')[1]?.split(')')[0]?.replace("'", '')?.replace("'", '')
    const label = splitByEqual?.charAt(0) + splitByEqual?.slice(1)

    if (!label) return path

    return `${label}: ${fieldId}`
  }

  const pathItems = path?.split('[')?.map((item) => item?.replace(/[\]$'"]/g, ''))
  return pathItems?.length ? pathItems[pathItems.length - 1] : path
}
