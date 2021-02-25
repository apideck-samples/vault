import { IConnection } from 'types/Connection'

export const authorizationVariablesRequired = (connection: IConnection): string | null => {
  const {
    name,
    form_fields: formFields,
    settings_required_for_authorization: requiredAuthVariables
  } = connection

  if (!requiredAuthVariables) return null

  const labels = requiredAuthVariables.map((item) => {
    const field = formFields.find((formField) => {
      if (formField.id === item && !formField?.value) {
        return formField?.label
      } else {
        return null
      }
    })
    return field?.label
  })

  if (labels.filter(Boolean).flat().length === 0) return null
  return `${name} requires ${labels.join(', ')} to be set before authorizing.`
}
