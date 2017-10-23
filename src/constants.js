'use babel'
import { resolveErrorCode, resolveFilename } from './resolvers'

export const GROUP_BY = {
  filename: groupMessagesByFile,
  severity: groupMessagesByType,
  error:    groupMessagesByErrorCode,
}

export const ORDER_BY = {
  filename: sortMessagesBy(resolveFilename),
  severity: sortMessagesBy(resolveErrorCode),
  error:    sortMessagesBy(resolveErrorCode),
}

const ICON_DEFAULT = 'icon-file-code'

export const SEVERITY = [
  'info',
  'warning',
  'error',
]

export const ICON_SEVERITY  = {
  // error:    'icon-flame',
  error:    'icon-issue-opened',
  warning:  'icon-alert',
  info:     'icon-info',
  log:      'icon-megaphone',
  logging:  'icon-unverified',
  debug:    'icon-terminal',
  default:  'icon-stop',
}

export const MATCH_SEVERITY = {
  '.js': {
    log: /console statement|console\.(log|info|warn|error|debug)/g,
  },
  '.py': {
    log: /print[\s(]/g,
  },
}

export function iconForKey (key) {
  return ICON_SEVERITY[key] || ICON_DEFAULT
}

export function groupMessages (key, messages) {
  let fn = GROUP_BY[key]
  return fn ? fn(messages) : { all: messages }
}

export function orderItems (key, messages) {
  return messages.sort(ORDER_BY[key])
}

function sortMessagesBy (fn) {
  return (a, b) => {
    let af = fn(a)
    let bf = fn(b)
    if (af > bf)
      return 1
    if (af < bf)
      return -1
    return 0
  }
}

function groupMessagesBy (key) {
  return messages => messages.reduce((grp, message) => ({
    ...grp,
    [message[key]]: [ ...(grp[message[key]] || []), message ]
  }), {})
}

const groupMessagesByError = groupMessagesBy('error')

const groupMessagesBySeverity = groupMessagesBy('severity')

function groupMessagesByFile (messages=[]) {
  const groups = {}

  for (let message of messages) {
    if (!message.location)
      continue
    if (!groups[message.location.file])
      groups[message.location.file] = []
    groups[message.location.file].push(message)
  }
  return groups
}

function groupMessagesByType (messages=[]) {
  const groups = SEVERITY.reduce((f, c) => ({ ...f, [c]: []}), {})
  return Object.assign(groups, groupMessagesBySeverity(messages))
}

function groupMessagesByErrorCode (messages=[]) {
  const resolveError = message => {
    message.error = message.errorCode || resolveErrorCode(message)
    return message
  }
  return groupMessagesByError(messages.map(resolveError))
}
