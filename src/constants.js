'use babel'


export const GROUP_BY = {
  filename: groupMessagesByFile,
  severity: groupMessagesByType,
}

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
    log: /print[\s\(]/g,
  },
}


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
  const groups = {}

  for (let message of messages) {
    groups[message.severity] = [ ...(groups[message.severity] || []), message ]
  }
  return groups
}
