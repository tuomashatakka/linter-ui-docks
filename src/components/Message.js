'use babel'

import React from 'react'
import prop from 'prop-types'
import { extname } from 'path'
import { ICON_SEVERITY, MATCH_SEVERITY } from '../constants'
import Location from './Location'


const Message = ({ location, severity, linterName, excerpt }) => {

  Message.propTypes = {
    linterName: prop.string,
    location: prop.object,
    severity: prop.string,
    excerpt: prop.string,
  }

  let type = resolveType({ excerpt, severity, location })
  let className = `message linter-message list-item text-${severity} linter-${linterName}`
  let iconClass = ICON_SEVERITY[type]

  return <li className={className} onClick={openCallback(location)}>

    <span  className={`title icon ${iconClass}`}>{linterName}</span>
    <span className='severity'>{type}</span>
    <Location {...location} />

    <output className='details text-subtle'>
      {excerpt}
    </output>

  </li>
}


function openCallback ({ file, position }) {
  return () => {
    atom.workspace
      .open(file)
      .then(item => {

        let range = item.getVisibleRowRange()
        let row   = position.start.row - parseInt((range[1] - range[0]) / 2)

        item.setFirstVisibleScreenRow(row)

        if (Math.abs(position.toDelta().row) < 3)
          item.setSelectedBufferRange(position)

        else {
          item.setCursorBufferPosition(position.start)
          item.selectToEndOfWord()
        }
      })
  }
}


function resolveType ({ severity, excerpt, location }) {
  let { file } = location
  let matchers = MATCH_SEVERITY[extname(file)] || {}
  let fn = Object.keys(matchers).map(key => [ key, matchers[key] ])

  while (fn.length) {
    let [ key, regx ] = fn.shift()
    if (excerpt.search(regx) > -1)
      return key
  }
  return severity
}



export default Message
