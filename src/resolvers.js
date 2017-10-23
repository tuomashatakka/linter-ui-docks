'use babel'

const DEFAULT_LOCATION        = ''
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

export function resolveFilename (message={}) {
  let { location } = message

  if (location) {
    let pos = resolvePosition(message)
    return location.file + ' ' + pos.x + ', ' + pos.y
  }
  return DEFAULT_LOCATION
}

export function resolvePosition (message={}) {
  let { location } = message

  if (!location || !location.position)
    return
  let { start } = location.position
  let length = location.position.toDelta()

  if (location.position.isSingleLine())
    length = `${length.column}`
  else
    length = `${length.row}, ${length.column}`

  return {
    x: start.column,
    y: start.row,
    length
  }
}
