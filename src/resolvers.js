'use babel'

const DEFAULT_ERROR_CODE      = 'General'
const ESLINT_ERROR_CODE_MATCH = /.*?\(([\w-]+)\)$/

export function resolveErrorCode (message={}) {

  if (message.errorCode)
    return message.errorCode

  if (message.linterName === 'ESLint') {
    let code = null
    message.excerpt.replace(ESLINT_ERROR_CODE_MATCH, (_, desc) => code = desc)
    if (code)
      return code
  }

  return DEFAULT_ERROR_CODE
}
